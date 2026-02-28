// modules/cart/cart.service.js
import prisma from "../../config/prisma.js";

/**
 * Get cart items for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Cart items with product details
 */
export const getCart = async (userId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          isActive: true,
        },
      },
      customizations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return cartItems;
};

/**
 * Add item to cart
 * @param {object} data - Cart item data
 * @param {string} data.userId - User ID
 * @param {string} data.productId - Product ID
 * @param {number} data.quantity - Quantity
 * @param {Array} data.customizations - Customizations array
 * @returns {Promise<object>} Created cart item
 */
export const addToCart = async (data) => {
  const { userId, productId, quantity = 1, customizations = [], note } = data;

  // Validate inputs
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Get product details
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      components: {
        include: { component: true },
      },
      extras: {
        include: { extra: true },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.isActive) {
    throw new Error("Product is not available");
  }

  // Calculate prices
  let basePrice = product.basePrice;
  let finalPrice = basePrice;

  // Process customizations
  const processedCustomizations = [];

  for (const customization of customizations) {
    const { type, referenceId } = customization;

    if (type === "EXTRA") {
      // Validate extra exists for this product
      const productExtra = product.extras.find((pe) => pe.extraId === referenceId);
      if (!productExtra) {
        throw new Error(`Extra ${referenceId} is not available for this product`);
      }
      finalPrice = parseFloat(finalPrice) + parseFloat(productExtra.extra.price);
      processedCustomizations.push({
        type: "EXTRA",
        referenceId,
        nameSnapshot: productExtra.extra.name,
        priceImpact: productExtra.extra.price,
      });
    } else if (type === "REMOVED_COMPONENT") {
      // Validate component exists for this product and is removable
      const productComponent = product.components.find(
        (pc) => pc.componentId === referenceId
      );
      if (!productComponent) {
        throw new Error(`Component ${referenceId} is not available for this product`);
      }
      if (!productComponent.isRemovable) {
        throw new Error(`Component ${productComponent.component.name} cannot be removed`);
      }
      finalPrice = parseFloat(finalPrice) - parseFloat(productComponent.component.costImpact);
      processedCustomizations.push({
        type: "REMOVED_COMPONENT",
        referenceId,
        nameSnapshot: productComponent.component.name,
        priceImpact: -productComponent.component.costImpact,
      });
    }
  }

  // Create cart item with customizations
  const cartItem = await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity,
      basePriceSnapshot: basePrice,
      finalPriceSnapshot: finalPrice,
      note: note?.trim() || null,
      customizations: processedCustomizations.length
        ? {
            create: processedCustomizations,
          }
        : undefined,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
      customizations: true,
    },
  });

  return cartItem;
};

/**
 * Update cart item quantity and/or note
 * @param {string} cartItemId - Cart item ID
 * @param {string} userId - User ID
 * @param {object} updates - Updates to apply
 * @param {number} updates.quantity - New quantity
 * @param {string} [updates.note] - Optional note
 * @returns {Promise<object>} Updated cart item
 */
export const updateCartItemQuantity = async (cartItemId, userId, updates) => {
  const { quantity, note } = updates;

  if (quantity !== undefined && quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Verify cart item belongs to user
  const existingItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId },
  });

  if (!existingItem) {
    throw new Error("Cart item not found");
  }

  const data = {};
  if (quantity !== undefined) data.quantity = quantity;
  if (note !== undefined) data.note = note?.trim() || null;

  const cartItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
      customizations: true,
    },
  });

  return cartItem;
};

/**
 * Remove item from cart
 * @param {string} cartItemId - Cart item ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} Deleted cart item
 */
export const removeFromCart = async (cartItemId, userId) => {
  // Verify cart item belongs to user
  const existingItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId },
  });

  if (!existingItem) {
    throw new Error("Cart item not found");
  }

  // Delete customizations first (child records) to satisfy FK constraint
  await prisma.cartItemCustomization.deleteMany({
    where: { cartItemId },
  });
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return { message: "Item removed from cart" };
};

/**
 * Clear cart for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Success message
 */
export const clearCart = async (userId) => {
  // Delete customizations first (child records) to satisfy FK constraint
  await prisma.cartItemCustomization.deleteMany({
    where: {
      cartItem: { userId },
    },
  });
  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  return { message: "Cart cleared successfully" };
};

/**
 * Get cart totals
 * @param {string} userId - User ID
 * @returns {Promise<object>} Cart totals
 */
export const getCartTotals = async (userId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      customizations: true,
    },
  });

  let totalAmount = 0;
  let itemCount = 0;

  for (const item of cartItems) {
    const itemTotal = parseFloat(item.finalPriceSnapshot) * item.quantity;
    totalAmount += itemTotal;
    itemCount += item.quantity;
  }

  return {
    totalAmount: totalAmount.toFixed(2),
    itemCount,
    uniqueItems: cartItems.length,
  };
};

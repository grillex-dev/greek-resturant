// modules/cart/cart.service.js
import prisma from "../../config/prisma.js";

/**
 * Get cart items - Supports both userId and sessionId
 */
export const getCart = async (identifier) => {
  const { userId, sessionId } = identifier;

  const where = userId ? { userId } : { sessionId };

  const cartItems = await prisma.cartItem.findMany({
    where,
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
 * Add item to cart - Supports both authenticated and guest users
 */
export const addToCart = async (data) => {
  const { userId, sessionId, productId, quantity = 1, customizations = [], note, size } = data;  // NEW: size

  // At least one identifier is required
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required");
  }

  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      components: { include: { component: true } },
      extras: { include: { extra: true } },
      sizes: true,  // NEW
    },
  });

  if (!product) throw new Error("Product not found");
  if (!product.isActive) throw new Error("Product is not available");

  let basePrice = parseFloat(product.basePrice);
  let finalPrice = basePrice;
  const processedCustomizations = [];

  // Handle size pricing  // NEW
  let sizeModifier = 0;
  if (size) {
    const validSizes = ["SMALL", "MEDIUM", "LARGE", "EXTRA_LARGE"];
    if (!validSizes.includes(size)) {
      throw new Error("Invalid size");
    }

    if (product.sizes.length > 0) {
      const productSize = product.sizes.find((ps) => ps.size === size);
      if (!productSize) {
        throw new Error("Size not available for this product");
      }
      sizeModifier = parseFloat(productSize.priceModifier);
      finalPrice = parseFloat(finalPrice) + sizeModifier;
    }
  }

  for (const cust of customizations) {
    const { type, referenceId } = cust;

    if (type === "EXTRA") {
      const productExtra = product.extras.find((pe) => pe.extraId === referenceId);
      if (!productExtra) throw new Error(`Extra not available for this product`);

      finalPrice = parseFloat(finalPrice) + parseFloat(productExtra.extra.price);
      processedCustomizations.push({
        type: "EXTRA",
        referenceId,
        nameSnapshot: productExtra.extra.name,
        priceImpact: productExtra.extra.price,
      });
    } 
    else if (type === "REMOVED_COMPONENT") {
      const productComponent = product.components.find((pc) => pc.componentId === referenceId);
      if (!productComponent) throw new Error(`Component not available for this product`);
      if (!productComponent.isRemovable) throw new Error(`Component cannot be removed`);

      finalPrice = parseFloat(finalPrice) - parseFloat(productComponent.component.costImpact);
      processedCustomizations.push({
        type: "REMOVED_COMPONENT",
        referenceId,
        nameSnapshot: productComponent.component.name,
        priceImpact: -productComponent.component.costImpact,
      });
    }
  }

  const cartItem = await prisma.cartItem.create({
    data: {
      userId: userId || null,
      sessionId: sessionId || null,
      productId,
      quantity,
      size: size || null,  // NEW
      basePriceSnapshot: basePrice,
      finalPriceSnapshot: finalPrice,
      note: note?.trim() || null,
      customizations: processedCustomizations.length
        ? { create: processedCustomizations }
        : undefined,
    },
    include: {
      product: { select: { id: true, name: true, imageUrl: true } },
      customizations: true,
    },
  });

  return cartItem;
};

/**
 * Update cart item - Supports both userId and sessionId
 */
export const updateCartItemQuantity = async (cartItemId, identifier, updates) => {
  const { userId, sessionId } = identifier;
  const { quantity, note, size } = updates;  // NEW: size

  if (quantity !== undefined && quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const where = userId ? { id: cartItemId, userId } : { id: cartItemId, sessionId };

  const existingItem = await prisma.cartItem.findFirst({ where });

  if (!existingItem) throw new Error("Cart item not found");

  // If size is being updated, recalculate price
  const updateData = {
    quantity: quantity !== undefined ? quantity : undefined,
    note: note !== undefined ? (note?.trim() || null) : undefined,
    size: size !== undefined ? (size || null) : undefined,  // NEW
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

  const cartItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: updateData,
    include: {
      product: { 
        select: { id: true, name: true, imageUrl: true },
        include: { sizes: true }  // NEW
      },
      customizations: true,
    },
  });

  return cartItem;
};

/**
 * Remove from cart - Supports both user and guest
 */
export const removeFromCart = async (cartItemId, identifier) => {
  const { userId, sessionId } = identifier;

  const where = userId ? { id: cartItemId, userId } : { id: cartItemId, sessionId };

  const existingItem = await prisma.cartItem.findFirst({ where });
  if (!existingItem) throw new Error("Cart item not found");

  await prisma.cartItemCustomization.deleteMany({ where: { cartItemId } });
  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return { message: "Item removed from cart" };
};

/**
 * Clear cart - Supports both user and guest
 */
export const clearCart = async (identifier) => {
  const { userId, sessionId } = identifier;

  const where = userId ? { userId } : { sessionId };

  await prisma.cartItemCustomization.deleteMany({
    where: { cartItem: where },
  });

  await prisma.cartItem.deleteMany({ where });

  return { message: "Cart cleared successfully" };
};

/**
 * Get cart totals - Supports both user and guest
 */
export const getCartTotals = async (identifier) => {
  const { userId, sessionId } = identifier;

  const where = userId ? { userId } : { sessionId };

  const cartItems = await prisma.cartItem.findMany({
    where,
    include: { customizations: true },
  });

  let totalAmount = 0;
  let itemCount = 0;

  for (const item of cartItems) {
    totalAmount += parseFloat(item.finalPriceSnapshot) * item.quantity;
    itemCount += item.quantity;
  }

  return {
    totalAmount: totalAmount.toFixed(2),
    itemCount,
    uniqueItems: cartItems.length,
  };
};
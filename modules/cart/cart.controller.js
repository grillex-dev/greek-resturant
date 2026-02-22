// modules/cart/cart.controller.js
import * as cartService from "./cart.service.js";

/**
 * Get cart items
 * GET /api/cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await cartService.getCart(userId);
    const totals = await cartService.getCartTotals(userId);

    return res.status(200).json({
      success: true,
      data: {
        items: cartItems,
        totals,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Add item to cart
 * POST /api/cart
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity, customizations } = req.body;

    const cartItem = await cartService.addToCart({
      userId,
      productId,
      quantity,
      customizations,
    });

    return res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cartItem,
    });
  } catch (error) {
    if (
      error.message === "User ID is required" ||
      error.message === "Product ID is required" ||
      error.message === "Quantity must be at least 1"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Product is not available" ||
      error.message.includes("is not available for this product") ||
      error.message.includes("cannot be removed")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/:id
 */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await cartService.updateCartItemQuantity(id, userId, quantity);

    return res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: cartItem,
    });
  } catch (error) {
    if (error.message === "Quantity must be at least 1") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Cart item not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/:id
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await cartService.removeFromCart(id, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message === "Cart item not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await cartService.clearCart(userId);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get cart totals
 * GET /api/cart/totals
 */
export const getCartTotals = async (req, res) => {
  try {
    const userId = req.userId;

    const totals = await cartService.getCartTotals(userId);

    return res.status(200).json({
      success: true,
      data: totals,
    });
  } catch (error) {
    console.error("Get cart totals error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

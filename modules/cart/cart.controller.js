// modules/cart/cart.controller.js
import * as cartService from "./cart.service.js";

/**
 * Get cart items
 * GET /api/cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.userId || null;
    const sessionId = req.sessionId || null;

    const cartItems = await cartService.getCart({ userId, sessionId });
    const totals = await cartService.getCartTotals({ userId, sessionId });

    return res.status(200).json({
      success: true,
      data: { items: cartItems, totals },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Add item to cart - Works for guests too
 * POST /api/cart
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId || null;
    const sessionId = req.sessionId || null;
    const { productId, quantity, customizations, note, size } = req.body;

    const cartItem = await cartService.addToCart({
      userId,
      sessionId,
      productId,
      quantity,
      customizations,
      note,
      size, 
    });

    return res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cartItem,
    });
  } catch (error) {
    const status = error.message.includes("required") || 
                   error.message.includes("at least 1") ||
                   error.message.includes("Invalid size") ? 400 : 
                   error.message.includes("not found") ? 404 : 500;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * Update cart item quantity
 * PUT /api/cart/:id
 */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.userId || null;
    const sessionId = req.sessionId || null;
    const { id } = req.params;
    // ADDED: size extracted from body
    const { quantity, note, size } = req.body;

    // Passed size to service for price recalculation
    const cartItem = await cartService.updateCartItemQuantity(
      id, 
      { userId, sessionId }, 
      { quantity, note, size }
    );

    return res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: cartItem,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
};
/**
 * Remove item from cart
 * DELETE /api/cart/:id
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId || null;
    const sessionId = req.sessionId || null;
    const { id } = req.params;

    const result = await cartService.removeFromCart(id, { userId, sessionId });

    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(error.message === "Cart item not found" ? 404 : 500)
              .json({ success: false, message: error.message });
  }
};
/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId || null;
    const sessionId = req.sessionId || null;

    const result = await cartService.clearCart({ userId, sessionId });

    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get cart totals
 * GET /api/cart/totals
 */
export const getCartTotals = async (req, res) => {
  try {
    // FIX: You were only passing userId, but the service expects an object { userId, sessionId }
    const userId = req.userId || null;
    const sessionId = req.sessionId || null;

    const totals = await cartService.getCartTotals({ userId, sessionId });

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

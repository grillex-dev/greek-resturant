// modules/orders/order.controller.js
import * as orderService from "./order.service.js";
import * as cartService from "../cart/cart.service.js";

/**
 * Get user orders
 * GET /api/orders
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, limit, offset } = req.query;

    const orders = await orderService.getUserOrders(userId, {
      status,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get single order (Customer)
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await orderService.getOrderById(id, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Create order (Checkout)
 * POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { restaurantId, fulfillmentType, fulfillmentDetails } = req.body;

    // Get cart items
    const cartItems = await cartService.getCart(userId);
    const cartTotals = await cartService.getCartTotals(userId);

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const order = await orderService.createOrder({
      userId,
      restaurantId,
      fulfillmentType,
      fulfillmentDetails,
      cartItems,
      totalAmount: cartTotals.totalAmount,
    });

    // Clear cart after successful order creation
    await cartService.clearCart(userId);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    if (
      error.message === "User ID is required" ||
      error.message === "Restaurant ID is required" ||
      error.message === "Valid fulfillment type is required" ||
      error.message === "Cart is empty" ||
      error.message === "Delivery address and phone number are required" ||
      error.message === "Pickup time is required"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * Get all orders (Admin)
 * GET /api/orders/admin/all
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, fulfillmentType, dateFrom, dateTo, limit, offset } = req.query;

    const orders = await orderService.getAllOrders({
      status,
      fulfillmentType,
      dateFrom,
      dateTo,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get single order (Admin - no user restriction)
 * GET /api/orders/admin/:id
 */
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update order status (Admin)
 * PATCH /api/orders/admin/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const order = await orderService.updateOrderStatus(id, status);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Invalid status" ||
      error.message.includes("Cannot transition from")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Confirm order (Admin)
 * POST /api/orders/admin/:id/confirm
 */
export const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderService.confirmOrder(id);

    return res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      data: order,
    });
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Cannot transition from")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Confirm order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Reject/Cancel order (Admin)
 * POST /api/orders/admin/:id/reject
 */
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await orderService.rejectOrder(id, reason);

    return res.status(200).json({
      success: true,
      message: "Order rejected/cancelled successfully",
      data: order,
    });
  } catch (error) {
    if (error.message === "Order not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Cannot transition from")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Reject order error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get order statistics (Admin)
 * GET /api/orders/admin/stats
 */
export const getOrderStats = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const stats = await orderService.getOrderStats(restaurantId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

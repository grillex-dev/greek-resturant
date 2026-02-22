// modules/orders/order.service.js
import prisma from "../../config/prisma.js";

/**
 * Get orders for a user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} User orders
 */
export const getUserOrders = async (userId, options = {}) => {
  const { status, limit = 20, offset = 0 } = options;

  const where = { userId };
  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          customizations: true,
        },
      },
      fulfillment: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return orders;
};

/**
 * Get single order by ID
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (optional, for customer orders)
 * @returns {Promise<object>} Order details
 */
export const getOrderById = async (orderId, userId = null) => {
  const where = { id: orderId };
  if (userId) {
    where.userId = userId;
  }

  const order = await prisma.order.findFirst({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          customizations: true,
        },
      },
      fulfillment: true,
    },
  });

  return order;
};

/**
 * Get all orders (Admin)
 * @param {object} filters - Filter options
 * @returns {Promise<Array>} All orders
 */
export const getAllOrders = async (filters = {}) => {
  const { status, fulfillmentType, dateFrom, dateTo, limit = 50, offset = 0 } = filters;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (fulfillmentType) {
    where.fulfillmentType = fulfillmentType;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo);
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          customizations: true,
        },
      },
      fulfillment: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return orders;
};

/**
 * Create order from cart
 * @param {object} data - Order data
 * @returns {Promise<object>} Created order
 */
export const createOrder = async (data) => {
  const {
    userId,
    restaurantId,
    fulfillmentType,
    fulfillmentDetails,
    cartItems,
    totalAmount,
  } = data;

  // Validate inputs
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!restaurantId) {
    throw new Error("Restaurant ID is required");
  }

  if (!fulfillmentType || !["DELIVERY", "PICKUP", "DINE_IN"].includes(fulfillmentType)) {
    throw new Error("Valid fulfillment type is required");
  }

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Validate fulfillment details based on type
  if (fulfillmentType === "DELIVERY") {
    if (!fulfillmentDetails?.street || !fulfillmentDetails?.phoneNumber) {
      throw new Error("Delivery address and phone number are required");
    }
  } else if (fulfillmentType === "PICKUP") {
    if (!fulfillmentDetails?.pickupTime) {
      throw new Error("Pickup time is required");
    }
  } else if (fulfillmentType === "DINE_IN") {
    if (!fulfillmentDetails?.tableId) {
      throw new Error("Table selection is required for dine-in");
    }
    if (!fulfillmentDetails?.reservationTime) {
      throw new Error("Reservation time is required");
    }
  }

  // Create order with items
  const order = await prisma.order.create({
    data: {
      userId,
      restaurantId,
      fulfillmentType,
      totalAmount: parseFloat(totalAmount),
      status: "PENDING",
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          productNameSnapshot: item.product.name,
          quantity: item.quantity,
          basePriceSnapshot: item.basePriceSnapshot,
          finalPriceSnapshot: item.finalPriceSnapshot,
          customizations: item.customizations?.length
            ? {
                create: item.customizations.map((customization) => ({
                  type: customization.type,
                  referenceId: customization.referenceId,
                  nameSnapshot: customization.nameSnapshot,
                  priceImpact: customization.priceImpact,
                })),
              }
            : undefined,
        })),
      },
      fulfillment: fulfillmentDetails
        ? {
            create: {
              contactName: fulfillmentDetails.contactName,
              phoneNumber: fulfillmentDetails.phoneNumber,
              street: fulfillmentDetails.street,
              building: fulfillmentDetails.building,
              state: fulfillmentDetails.state,
              locationNote: fulfillmentDetails.locationNote,
              pickupTime: fulfillmentDetails.pickupTime
                ? new Date(fulfillmentDetails.pickupTime)
                : null,
              reservationTime: fulfillmentDetails.reservationTime
                ? new Date(fulfillmentDetails.reservationTime)
                : null,
              tableId: fulfillmentDetails.tableId,
            },
          }
        : undefined,
    },
    include: {
      items: {
        include: {
          customizations: true,
        },
      },
      fulfillment: true,
    },
  });

  return order;
};

/**
 * Update order status (Admin)
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<object>} Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }

  // Check if order exists
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error("Order not found");
  }

  // Validate status transitions
  const validTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["OUT_FOR_DELIVERY", "COMPLETED"],
    OUT_FOR_DELIVERY: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[existingOrder.status].includes(status)) {
    throw new Error(`Cannot transition from ${existingOrder.status} to ${status}`);
  }

  const updateData = { status };

  // Set paidAt when order is completed
  if (status === "COMPLETED" && !existingOrder.paidAt) {
    updateData.paidAt = new Date();
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          customizations: true,
        },
      },
      fulfillment: true,
    },
  });

  return order;
};

/**
 * Confirm order (Admin) - Alias for updating to CONFIRMED status
 * @param {string} orderId - Order ID
 * @returns {Promise<object>} Updated order
 */
export const confirmOrder = async (orderId) => {
  return await updateOrderStatus(orderId, "CONFIRMED");
};

/**
 * Reject/Cancel order (Admin)
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason (optional)
 * @returns {Promise<object>} Updated order
 */
export const rejectOrder = async (orderId, reason = null) => {
  return await updateOrderStatus(orderId, "CANCELLED");
};

/**
 * Get order statistics (Admin)
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<object>} Order statistics
 */
export const getOrderStats = async (restaurantId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, todayOrders, pendingOrders, completedOrders, cancelledOrders] = await Promise.all([
    prisma.order.count({ where: { restaurantId } }),
    prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: today },
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: "COMPLETED",
      },
    }),
    prisma.order.count({
      where: {
        restaurantId,
        status: "CANCELLED",
      },
    }),
  ]);

  // Calculate revenue
  const revenue = await prisma.order.aggregate({
    where: {
      restaurantId,
      status: "COMPLETED",
    },
    _sum: {
      totalAmount: true,
    },
  });

  return {
    totalOrders,
    todayOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue: revenue._sum.totalAmount || 0,
  };
};

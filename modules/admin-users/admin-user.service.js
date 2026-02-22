// modules/admin-users/admin-user.service.js
import prisma from "../../config/prisma.js";

/**
 * Get all users (Admin)
 * @param {object} filters - Filter options
 * @returns {Promise<Array>} List of users
 */
export const getAllUsers = async (filters = {}) => {
  const { role, search, limit = 50, offset = 0 } = filters;

  const where = {};

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return users;
};

/**
 * Get single user by ID (Admin)
 * @param {string} userId - User ID
 * @returns {Promise<object>} User details
 */
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  return user;
};

/**
 * Update user role (Admin)
 * @param {string} userId - User ID
 * @param {string} role - New role (CUSTOMER, ADMIN)
 * @returns {Promise<object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  // Validate role
  if (!role || !["CUSTOMER", "ADMIN"].includes(role)) {
    throw new Error("Invalid role. Must be CUSTOMER or ADMIN");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Delete user (Admin)
 * @param {string} userId - User ID
 * @returns {Promise<object>} Deleted user
 */
export const deleteUser = async (userId) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"],
          },
        },
      },
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Check if user has active orders
  if (existingUser.orders.length > 0) {
    throw new Error("Cannot delete user with active orders");
  }

  // Delete user's cart items first
  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  // Delete user
  const user = await prisma.user.delete({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
};

/**
 * Get user statistics (Admin)
 * @returns {Promise<object>} User statistics
 */
export const getUserStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, todayUsers, adminCount, customerCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: today },
      },
    }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  return {
    totalUsers,
    todayUsers,
    adminCount,
    customerCount,
  };
};

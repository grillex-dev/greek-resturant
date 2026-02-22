// modules/users/user.service.js
import prisma from "../../config/prisma.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<object>} User profile
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} data - Updated profile data
 * @returns {Promise<object>} Updated user
 */
export const updateUserProfile = async (userId, data) => {
  const { name, email } = data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const updateData = {};

  if (name !== undefined) {
    if (name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
    updateData.name = name.trim();
  }

  if (email !== undefined) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Check if email is already taken by another user
    const emailExists = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: userId },
      },
    });

    if (emailExists) {
      throw new Error("Email is already in use");
    }

    updateData.email = email.toLowerCase();
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Success message
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  // Validate inputs
  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("Cannot change password for OAuth users");
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};

/**
 * Get user order history
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<Array>} User orders
 */
export const getUserOrderHistory = async (userId, options = {}) => {
  const { limit = 20, offset = 0 } = options;

  const orders = await prisma.order.findMany({
    where: { userId },
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

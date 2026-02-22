// modules/users/user.controller.js
import * as userService from "./user.service.js";

/**
 * Get user profile
 * GET /api/users/profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;

    const user = await userService.updateUserProfile(userId, { name, email });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Name cannot be empty" ||
      error.message === "Invalid email format"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Email is already in use") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Change password
 * PUT /api/users/password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const result = await userService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Current password and new password are required" ||
      error.message === "New password must be at least 6 characters long"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Cannot change password for OAuth users" ||
      error.message === "Current password is incorrect"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user order history
 * GET /api/users/orders
 */
export const getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit, offset } = req.query;

    const orders = await userService.getUserOrderHistory(userId, {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get user order history error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

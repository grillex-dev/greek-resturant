// modules/admin-users/admin-user.controller.js
import * as adminUserService from "./admin-user.service.js";

/**
 * Get all users (Admin)
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, limit, offset } = req.query;

    const users = await adminUserService.getAllUsers({
      role,
      search,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get single user (Admin)
 * GET /api/admin/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminUserService.getUserById(id);

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
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update user role (Admin)
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await adminUserService.updateUserRole(id, role);

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Invalid role. Must be CUSTOMER or ADMIN") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update user role error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete user (Admin)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminUserService.deleteUser(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Cannot delete user with active orders") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user statistics (Admin)
 * GET /api/admin/users/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const stats = await adminUserService.getUserStats();

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// modules/categories/category.controller.js
import * as categoryService from "./category.service.js";

/**
 * Get all categories for a restaurant
 * GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const categories = await categoryService.getCategories(restaurantId);

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get single category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Create new category (Admin only)
 * POST /api/categories
 */
export const createCategory = async (req, res) => {
  try {
    const { name, restaurantId } = req.body;

    const category = await categoryService.createCategory(name, restaurantId);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    if (
      error.message === "Category name is required" ||
      error.message === "Restaurant ID is required"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Category with this name already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update category (Admin only)
 * PUT /api/categories/:id
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await categoryService.updateCategory(id, name);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    if (error.message === "Category name is required") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Category not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Category with this name already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete category (Admin only)
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await categoryService.deleteCategory(id);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error.message === "Category not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Cannot delete category with existing products") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete category error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

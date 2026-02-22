// modules/products/product.controller.js
import * as productService from "./product.service.js";

/**
 * Get all products
 * GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const { restaurantId, categoryId, search, isActive } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const filters = {
      restaurantId,
      categoryId,
      search,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    };

    const products = await productService.getProducts(filters);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get single product
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Create new product (Admin only)
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    if (
      error.message === "Product name is required" ||
      error.message === "Valid base price is required" ||
      error.message === "Category ID is required" ||
      error.message === "Restaurant ID is required"
    ) {
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

    console.error("Create product error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update product (Admin only)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    if (
      error.message === "Product not found" ||
      error.message === "Category not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Product name cannot be empty" ||
      error.message === "Invalid base price"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update product error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete product (Admin only)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);

    const message = product.softDeleted
      ? "Product marked as inactive (has order history)"
      : "Product deleted successfully";

    return res.status(200).json({
      success: true,
      message,
      data: product,
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Toggle product status (Admin only)
 * PATCH /api/products/:id/toggle
 */
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.toggleProductStatus(id);

    return res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
      data: product,
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Toggle product status error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

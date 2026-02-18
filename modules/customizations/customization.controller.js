// modules/customizations/customization.controller.js
import * as customizationService from "./customization.service.js";

// ============================================
// EXTRAS CONTROLLERS
// ============================================

/**
 * Get all extras
 * GET /api/customizations/extras
 */
export const getExtras = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const extras = await customizationService.getExtras(restaurantId);

    return res.status(200).json({
      success: true,
      data: extras,
    });
  } catch (error) {
    console.error("Get extras error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Create extra (Admin)
 * POST /api/customizations/extras
 */
export const createExtra = async (req, res) => {
  try {
    const extra = await customizationService.createExtra(req.body);

    return res.status(201).json({
      success: true,
      message: "Extra created successfully",
      data: extra,
    });
  } catch (error) {
    if (
      error.message === "Extra name is required" ||
      error.message === "Valid price is required" ||
      error.message === "Restaurant ID is required"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create extra error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update extra (Admin)
 * PUT /api/customizations/extras/:id
 */
export const updateExtra = async (req, res) => {
  try {
    const { id } = req.params;
    const extra = await customizationService.updateExtra(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Extra updated successfully",
      data: extra,
    });
  } catch (error) {
    if (error.message === "Extra not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Extra name cannot be empty" ||
      error.message === "Invalid price"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update extra error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete extra (Admin)
 * DELETE /api/customizations/extras/:id
 */
export const deleteExtra = async (req, res) => {
  try {
    const { id } = req.params;

    await customizationService.deleteExtra(id);

    return res.status(200).json({
      success: true,
      message: "Extra deleted successfully",
    });
  } catch (error) {
    if (error.message === "Extra not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Cannot delete extra that is used in products") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete extra error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ============================================
// COMPONENTS CONTROLLERS
// ============================================

/**
 * Get all components
 * GET /api/customizations/components
 */
export const getComponents = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const components = await customizationService.getComponents(restaurantId);

    return res.status(200).json({
      success: true,
      data: components,
    });
  } catch (error) {
    console.error("Get components error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Create component (Admin)
 * POST /api/customizations/components
 */
export const createComponent = async (req, res) => {
  try {
    const component = await customizationService.createComponent(req.body);

    return res.status(201).json({
      success: true,
      message: "Component created successfully",
      data: component,
    });
  } catch (error) {
    if (
      error.message === "Component name is required" ||
      error.message === "Valid cost impact is required" ||
      error.message === "Restaurant ID is required"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create component error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update component (Admin)
 * PUT /api/customizations/components/:id
 */
export const updateComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const component = await customizationService.updateComponent(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Component updated successfully",
      data: component,
    });
  } catch (error) {
    if (error.message === "Component not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Component name cannot be empty" ||
      error.message === "Invalid cost impact"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update component error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete component (Admin)
 * DELETE /api/customizations/components/:id
 */
export const deleteComponent = async (req, res) => {
  try {
    const { id } = req.params;

    await customizationService.deleteComponent(id);

    return res.status(200).json({
      success: true,
      message: "Component deleted successfully",
    });
  } catch (error) {
    if (error.message === "Component not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Cannot delete component that is used in products") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete component error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

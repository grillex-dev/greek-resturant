// modules/restaurant/restaurant.controller.js
import * as restaurantService from "./restaurant.service.js";

/**
 * Get restaurant by ID
 * GET /api/restaurants/:id
 */
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await restaurantService.getRestaurantById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Get restaurant error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get restaurant public info
 * GET /api/restaurants/:id/public
 */
export const getRestaurantPublicInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await restaurantService.getRestaurantPublicInfo(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Get restaurant public info error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Create restaurant (Admin)
 * POST /api/restaurants
 */
export const createRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantService.createRestaurant(req.body);

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    if (error.message === "Restaurant name is required") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create restaurant error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update restaurant (Admin)
 * PUT /api/restaurants/:id
 */
export const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.updateRestaurant(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    if (error.message === "Restaurant not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Restaurant name cannot be empty") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update restaurant error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete restaurant (Admin)
 * DELETE /api/restaurants/:id
 */
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    await restaurantService.deleteRestaurant(id);

    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    if (error.message === "Restaurant not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Cannot delete restaurant with active orders") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete restaurant error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

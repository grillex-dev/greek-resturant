// modules/tables/table.controller.js
import * as tableService from "./table.service.js";

/**
 * Get all tables
 * GET /api/tables
 */
export const getTables = async (req, res) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const tables = await tableService.getTables(restaurantId);

    return res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("Get tables error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get single table
 * GET /api/tables/:id
 */
export const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await tableService.getTableById(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error("Get table error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Create new table (Admin only)
 * POST /api/tables
 */
export const createTable = async (req, res) => {
  try {
    const table = await tableService.createTable(req.body);

    return res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    if (
      error.message === "Table number is required" ||
      error.message === "Restaurant ID is required"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Table with this number already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create table error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update table (Admin only)
 * PUT /api/tables/:id
 */
export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await tableService.updateTable(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    if (error.message === "Table not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Table number cannot be empty" ||
      error.message === "Table with this number already exists"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update table error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete table (Admin only)
 * DELETE /api/tables/:id
 */
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    await tableService.deleteTable(id);

    return res.status(200).json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    if (error.message === "Table not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === "Cannot delete table with active orders") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete table error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Check table availability
 * GET /api/tables/:id/availability
 */
export const checkTableAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateTime } = req.query;

    if (!dateTime) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required",
      });
    }

    const isAvailable = await tableService.checkTableAvailability(id, dateTime);

    return res.status(200).json({
      success: true,
      data: {
        isAvailable,
        tableId: id,
        dateTime,
      },
    });
  } catch (error) {
    if (error.message === "Table not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Check table availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get available tables for a time slot
 * GET /api/tables/available
 */
export const getAvailableTables = async (req, res) => {
  try {
    const { restaurantId, dateTime, partySize } = req.query;

    if (!restaurantId || !dateTime) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID and dateTime are required",
      });
    }

    const tables = await tableService.getAvailableTables(
      restaurantId,
      dateTime,
      partySize
    );

    return res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("Get available tables error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

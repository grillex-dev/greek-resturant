// modules/tables/table.service.js
import prisma from "../../config/prisma.js";

/**
 * Get all tables for a restaurant
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Array>} List of tables
 */
export const getTables = async (restaurantId) => {
  const tables = await prisma.table.findMany({
    where: { restaurantId },
    orderBy: { tableNumber: "asc" },
  });

  return tables;
};

/**
 * Get single table by ID
 * @param {string} id - Table ID
 * @returns {Promise<object>} Table object
 */
export const getTableById = async (id) => {
  const table = await prisma.table.findUnique({
    where: { id },
    include: {
      fulfillmentDetails: {
        where: {
          order: {
            status: {
              in: ["PENDING", "CONFIRMED", "PREPARING", "READY"],
            },
          },
        },
        include: {
          order: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  return table;
};

/**
 * Create new table
 * @param {object} data - Table data
 * @returns {Promise<object>} Created table
 */
export const createTable = async (data) => {
  const { tableNumber, capacity, restaurantId } = data;

  // Validate inputs
  if (!tableNumber || tableNumber.trim().length === 0) {
    throw new Error("Table number is required");
  }

  if (!restaurantId) {
    throw new Error("Restaurant ID is required");
  }

  // Check for duplicate table number
  const existingTable = await prisma.table.findFirst({
    where: {
      tableNumber: tableNumber.trim(),
      restaurantId,
    },
  });

  if (existingTable) {
    throw new Error("Table with this number already exists");
  }

  const table = await prisma.table.create({
    data: {
      tableNumber: tableNumber.trim(),
      capacity: capacity ? parseInt(capacity) : null,
      restaurantId,
    },
  });

  return table;
};

/**
 * Update table
 * @param {string} id - Table ID
 * @param {object} data - Updated table data
 * @returns {Promise<object>} Updated table
 */
export const updateTable = async (id, data) => {
  const { tableNumber, capacity } = data;

  // Check if table exists
  const existingTable = await prisma.table.findUnique({
    where: { id },
  });

  if (!existingTable) {
    throw new Error("Table not found");
  }

  const updateData = {};

  if (tableNumber !== undefined) {
    if (tableNumber.trim().length === 0) {
      throw new Error("Table number cannot be empty");
    }

    // Check for duplicate
    const duplicateTable = await prisma.table.findFirst({
      where: {
        tableNumber: tableNumber.trim(),
        restaurantId: existingTable.restaurantId,
        id: { not: id },
      },
    });

    if (duplicateTable) {
      throw new Error("Table with this number already exists");
    }

    updateData.tableNumber = tableNumber.trim();
  }

  if (capacity !== undefined) {
    updateData.capacity = capacity ? parseInt(capacity) : null;
  }

  const table = await prisma.table.update({
    where: { id },
    data: updateData,
  });

  return table;
};

/**
 * Delete table
 * @param {string} id - Table ID
 * @returns {Promise<object>} Deleted table
 */
export const deleteTable = async (id) => {
  // Check if table exists
  const existingTable = await prisma.table.findUnique({
    where: { id },
    include: {
      fulfillmentDetails: true,
    },
  });

  if (!existingTable) {
    throw new Error("Table not found");
  }

  // Check if table has active orders
  const activeOrders = existingTable.fulfillmentDetails.filter(
    (fd) => fd.order?.status !== "COMPLETED" && fd.order?.status !== "CANCELLED"
  );

  if (activeOrders.length > 0) {
    throw new Error("Cannot delete table with active orders");
  }

  const table = await prisma.table.delete({
    where: { id },
  });

  return table;
};

/**
 * Check table availability
 * @param {string} tableId - Table ID
 * @param {Date} dateTime - Date and time to check
 * @returns {Promise<boolean>} Whether table is available
 */
export const checkTableAvailability = async (tableId, dateTime) => {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });

  if (!table) {
    throw new Error("Table not found");
  }

  // Check for overlapping reservations (within 2 hours)
  const checkTime = new Date(dateTime);
  const twoHoursBefore = new Date(checkTime.getTime() - 2 * 60 * 60 * 1000);
  const twoHoursAfter = new Date(checkTime.getTime() + 2 * 60 * 60 * 1000);

  const conflictingReservations = await prisma.fulfillmentDetails.findMany({
    where: {
      tableId,
      reservationTime: {
        gte: twoHoursBefore,
        lte: twoHoursAfter,
      },
      order: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    },
  });

  return conflictingReservations.length === 0;
};

/**
 * Get available tables for a time slot
 * @param {string} restaurantId - Restaurant ID
 * @param {Date} dateTime - Date and time
 * @param {number} partySize - Number of guests (optional)
 * @returns {Promise<Array>} Available tables
 */
export const getAvailableTables = async (restaurantId, dateTime, partySize = null) => {
  const allTables = await prisma.table.findMany({
    where: {
      restaurantId,
      ...(partySize && { capacity: { gte: parseInt(partySize) } }),
    },
  });

  const checkTime = new Date(dateTime);
  const twoHoursBefore = new Date(checkTime.getTime() - 2 * 60 * 60 * 1000);
  const twoHoursAfter = new Date(checkTime.getTime() + 2 * 60 * 60 * 1000);

  // Get all reservations in the time window
  const reservations = await prisma.fulfillmentDetails.findMany({
    where: {
      table: {
        restaurantId,
      },
      reservationTime: {
        gte: twoHoursBefore,
        lte: twoHoursAfter,
      },
      order: {
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    },
    select: {
      tableId: true,
    },
  });

  const reservedTableIds = new Set(reservations.map((r) => r.tableId));

  const availableTables = allTables.filter(
    (table) => !reservedTableIds.has(table.id)
  );

  return availableTables;
};

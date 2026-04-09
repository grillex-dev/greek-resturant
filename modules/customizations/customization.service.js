// modules/customizations/customization.service.js
import prisma from "../../config/prisma.js";

// ============================================
// EXTRAS
// ============================================

/**
 * Get all extras
 * @returns {Promise<Array>} List of extras
 */
export const getExtras = async () => {
  const extras = await prisma.extra.findMany({
    // Removed restaurantId filter
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return extras;
};

/**
 * Create new extra
 * @param {object} data - Extra data
 * @returns {Promise<object>} Created extra
 */
export const createExtra = async (data) => {
  const { name, price } = data; // Removed restaurantId from destructuring

  // Validate inputs
  if (!name || name.trim().length === 0) {
    throw new Error("Extra name is required");
  }

  if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    throw new Error("Valid price is required");
  }

  const extra = await prisma.extra.create({
    data: {
      name: name.trim(),
      price: parseFloat(price),
      // Removed restaurantId assignment
    },
  });

  return extra;
};

/**
 * Update extra
 * @param {string} id - Extra ID
 * @param {object} data - Updated extra data
 * @returns {Promise<object>} Updated extra
 */
export const updateExtra = async (id, data) => {
  const { name, price } = data;

  const existingExtra = await prisma.extra.findUnique({
    where: { id },
  });

  if (!existingExtra) {
    throw new Error("Extra not found");
  }

  const updateData = {};

  if (name !== undefined) {
    if (name.trim().length === 0) {
      throw new Error("Extra name cannot be empty");
    }
    updateData.name = name.trim();
  }

  if (price !== undefined) {
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      throw new Error("Invalid price");
    }
    updateData.price = parseFloat(price);
  }

  const extra = await prisma.extra.update({
    where: { id },
    data: updateData,
  });

  return extra;
};

/**
 * Delete extra
 * @param {string} id - Extra ID
 * @returns {Promise<object>} Deleted extra
 */
export const deleteExtra = async (id) => {
  const existingExtra = await prisma.extra.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });

  if (!existingExtra) {
    throw new Error("Extra not found");
  }

  if (existingExtra.products.length > 0) {
    throw new Error("Cannot delete extra that is used in products");
  }

  const extra = await prisma.extra.delete({
    where: { id },
  });

  return extra;
};

// ============================================
// COMPONENTS
// ============================================

/**
 * Get all components
 * @returns {Promise<Array>} List of components
 */
export const getComponents = async () => {
  const components = await prisma.component.findMany({
    // Removed restaurantId filter
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return components;
};

/**
 * Create new component
 * @param {object} data - Component data
 * @returns {Promise<object>} Created component
 */
export const createComponent = async (data) => {
  const { name, costImpact } = data; // Removed restaurantId from destructuring

  // Validate inputs
  if (!name || name.trim().length === 0) {
    throw new Error("Component name is required");
  }

  if (costImpact === undefined || isNaN(parseFloat(costImpact))) {
    throw new Error("Valid cost impact is required");
  }

  const component = await prisma.component.create({
    data: {
      name: name.trim(),
      costImpact: parseFloat(costImpact),
      // Removed restaurantId assignment
    },
  });

  return component;
};

/**
 * Update component
 * @param {string} id - Component ID
 * @param {object} data - Updated component data
 * @returns {Promise<object>} Updated component
 */
export const updateComponent = async (id, data) => {
  const { name, costImpact } = data;

  const existingComponent = await prisma.component.findUnique({
    where: { id },
  });

  if (!existingComponent) {
    throw new Error("Component not found");
  }

  const updateData = {};

  if (name !== undefined) {
    if (name.trim().length === 0) {
      throw new Error("Component name cannot be empty");
    }
    updateData.name = name.trim();
  }

  if (costImpact !== undefined) {
    if (isNaN(parseFloat(costImpact))) {
      throw new Error("Invalid cost impact");
    }
    updateData.costImpact = parseFloat(costImpact);
  }

  const component = await prisma.component.update({
    where: { id },
    data: updateData,
  });

  return component;
};

/**
 * Delete component
 * @param {string} id - Component ID
 * @returns {Promise<object>} Deleted component
 */
export const deleteComponent = async (id) => {
  const existingComponent = await prisma.component.findUnique({
    where: { id },
    include: {
      products: true,
    },
  });

  if (!existingComponent) {
    throw new Error("Component not found");
  }

  if (existingComponent.products.length > 0) {
    throw new Error("Cannot delete component that is used in products");
  }

  const component = await prisma.component.delete({
    where: { id },
  });

  return component;
};
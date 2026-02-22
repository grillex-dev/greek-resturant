// modules/categories/category.service.js
import prisma from "../../config/prisma.js";

/**
 * Get all categories for a restaurant
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async (restaurantId) => {
  const categories = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { name: "asc" },
  });
  return categories;
};

/**
 * Get single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<object>} Category object
 */
export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          imageUrl: true,
        },
      },
    },
  });
  return category;
};

/**
 * Create new category
 * @param {string} name - Category name
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<object>} Created category
 */
export const createCategory = async (name, restaurantId) => {
  // Validate input
  if (!name || name.trim().length === 0) {
    throw new Error("Category name is required");
  }

  if (!restaurantId) {
    throw new Error("Restaurant ID is required");
  }

  // Check for duplicate name in same restaurant
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      restaurantId,
    },
  });

  if (existingCategory) {
    throw new Error("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      restaurantId,
    },
  });

  return category;
};

/**
 * Update category
 * @param {string} id - Category ID
 * @param {string} name - New category name
 * @returns {Promise<object>} Updated category
 */
export const updateCategory = async (id, name) => {
  // Validate input
  if (!name || name.trim().length === 0) {
    throw new Error("Category name is required");
  }

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // Check for duplicate name
  const duplicateCategory = await prisma.category.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      restaurantId: existingCategory.restaurantId,
      id: { not: id },
    },
  });

  if (duplicateCategory) {
    throw new Error("Category with this name already exists");
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: name.trim() },
  });

  return category;
};

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise<object>} Deleted category
 */
export const deleteCategory = async (id) => {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // Check if category has products
  if (existingCategory.products.length > 0) {
    throw new Error("Cannot delete category with existing products");
  }

  const category = await prisma.category.delete({
    where: { id },
  });

  return category;
};

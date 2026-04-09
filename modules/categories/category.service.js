// modules/categories/category.service.js
import prisma from "../../config/prisma.js";


export const getCategories = async () => {
  const categories = await prisma.category.findMany({
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

export const createCategory = async (name,  imageData = {}) => {
  if (!name || name.trim().length === 0) {
    throw new Error("Category name is required");
  }

 
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
    },
  });
 
  if (existingCategory) {
    throw new Error("Category with this name already exists");
  }
 
  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      imageUrl: imageData.imageUrl ?? null,
      imagePublicId: imageData.imagePublicId ?? null,
    },
  });
 
  return category;
};
 
export const updateCategory = async (id, data) => {
  const { name, imageUrl, imagePublicId } = data;
 
  const existingCategory = await prisma.category.findUnique({ where: { id } });
  if (!existingCategory) {
    throw new Error("Category not found");
  }
 
  const updateData = {};
 
  if (name !== undefined) {
    if (name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }
 
    // Check for duplicate name (excluding this record)
    const duplicate = await prisma.category.findFirst({
      where: {
        name: { equals: name.trim(), mode: "insensitive" },
        NOT: { id },
      },
    });
 
    if (duplicate) {
      throw new Error("Category with this name already exists");
    }
 
    updateData.name = name.trim();
  }
 
  // Only overwrite image fields when a new upload was provided
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId;
 
  const category = await prisma.category.update({
    where: { id },
    data: updateData,
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

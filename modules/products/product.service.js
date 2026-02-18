// modules/products/product.service.js
import prisma from "../../config/prisma.js";

/**
 * Get all products with filters
 * @param {object} filters - Filter options
 * @param {string} filters.restaurantId - Restaurant ID
 * @param {string} filters.categoryId - Category ID (optional)
 * @param {string} filters.search - Search term (optional)
 * @param {boolean} filters.isActive - Filter by active status (optional)
 * @returns {Promise<Array>} List of products
 */
export const getProducts = async (filters) => {
  const { restaurantId, categoryId, search, isActive } = filters;

  const where = {
    restaurantId,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return products;
};

/**
 * Get single product with details
 * @param {string} id - Product ID
 * @returns {Promise<object>} Product with components and extras
 */
export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      components: {
        include: {
          component: {
            select: {
              id: true,
              name: true,
              costImpact: true,
            },
          },
        },
      },
      extras: {
        include: {
          extra: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  return product;
};

/**
 * Create new product
 * @param {object} data - Product data
 * @returns {Promise<object>} Created product
 */
export const createProduct = async (data) => {
  const {
    name,
    description,
    basePrice,
    imageUrl,
    categoryId,
    restaurantId,
    componentIds,
    extraIds,
  } = data;

  // Validate required fields
  if (!name || name.trim().length === 0) {
    throw new Error("Product name is required");
  }

  if (!basePrice || isNaN(parseFloat(basePrice))) {
    throw new Error("Valid base price is required");
  }

  if (!categoryId) {
    throw new Error("Category ID is required");
  }

  if (!restaurantId) {
    throw new Error("Restaurant ID is required");
  }

  // Check if category exists
  const category = await prisma.category.findFirst({
    where: { id: categoryId, restaurantId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      basePrice: parseFloat(basePrice),
      imageUrl,
      categoryId,
      restaurantId,
      components: componentIds?.length
        ? {
            create: componentIds.map((componentId) => ({
              component: { connect: { id: componentId } },
            })),
          }
        : undefined,
      extras: extraIds?.length
        ? {
            create: extraIds.map((extraId) => ({
              extra: { connect: { id: extraId } },
            })),
          }
        : undefined,
    },
    include: {
      category: true,
      components: { include: { component: true } },
      extras: { include: { extra: true } },
    },
  });

  return product;
};

/**
 * Update product
 * @param {string} id - Product ID
 * @param {object} data - Updated product data
 * @returns {Promise<object>} Updated product
 */
export const updateProduct = async (id, data) => {
  const {
    name,
    description,
    basePrice,
    imageUrl,
    categoryId,
    isActive,
    componentIds,
    extraIds,
  } = data;

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const updateData = {};

  if (name !== undefined) {
    if (name.trim().length === 0) {
      throw new Error("Product name cannot be empty");
    }
    updateData.name = name.trim();
  }

  if (description !== undefined) {
    updateData.description = description?.trim();
  }

  if (basePrice !== undefined) {
    if (isNaN(parseFloat(basePrice))) {
      throw new Error("Invalid base price");
    }
    updateData.basePrice = parseFloat(basePrice);
  }

  if (imageUrl !== undefined) {
    updateData.imageUrl = imageUrl;
  }

  if (categoryId !== undefined) {
    updateData.categoryId = categoryId;
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }

  // Handle component updates if provided
  if (componentIds !== undefined) {
    // Delete existing component relations
    await prisma.productComponent.deleteMany({
      where: { productId: id },
    });

    // Create new component relations
    if (componentIds.length > 0) {
      await prisma.productComponent.createMany({
        data: componentIds.map((componentId) => ({
          productId: id,
          componentId,
        })),
      });
    }
  }

  // Handle extra updates if provided
  if (extraIds !== undefined) {
    // Delete existing extra relations
    await prisma.productExtra.deleteMany({
      where: { productId: id },
    });

    // Create new extra relations
    if (extraIds.length > 0) {
      await prisma.productExtra.createMany({
        data: extraIds.map((extraId) => ({
          productId: id,
          extraId,
        })),
      });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      components: { include: { component: true } },
      extras: { include: { extra: true } },
    },
  });

  return product;
};

/**
 * Delete product
 * @param {string} id - Product ID
 * @returns {Promise<object>} Deleted product
 */
export const deleteProduct = async (id) => {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // Check if product is used in orders
  if (existingProduct.orderItems.length > 0) {
    // Soft delete - mark as inactive instead
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return { ...product, softDeleted: true };
  }

  // Hard delete if no orders
  const product = await prisma.product.delete({
    where: { id },
  });

  return product;
};

/**
 * Toggle product availability
 * @param {string} id - Product ID
 * @returns {Promise<object>} Updated product
 */
export const toggleProductStatus = async (id) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: !existingProduct.isActive },
  });

  return product;
};

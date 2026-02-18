// modules/restaurant/restaurant.service.js
import prisma from "../../config/prisma.js";

/**
 * Get restaurant by ID
 * @param {string} id - Restaurant ID
 * @returns {Promise<object>} Restaurant details
 */
export const getRestaurantById = async (id) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          categories: true,
          products: true,
          tables: true,
        },
      },
    },
  });

  return restaurant;
};

/**
 * Get restaurant public info
 * @param {string} id - Restaurant ID
 * @returns {Promise<object>} Restaurant public details
 */
export const getRestaurantPublicInfo = async (id) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      logoUrl: true,
      coverImageUrl: true,
      mondayOpen: true,
      mondayClose: true,
      tuesdayOpen: true,
      tuesdayClose: true,
      wednesdayOpen: true,
      wednesdayClose: true,
      thursdayOpen: true,
      thursdayClose: true,
      fridayOpen: true,
      fridayClose: true,
      saturdayOpen: true,
      saturdayClose: true,
      sundayOpen: true,
      sundayClose: true,
      deliveryEnabled: true,
      deliveryFee: true,
      minOrderAmount: true,
      taxRate: true,
    },
  });

  return restaurant;
};

/**
 * Create restaurant
 * @param {object} data - Restaurant data
 * @returns {Promise<object>} Created restaurant
 */
export const createRestaurant = async (data) => {
  const { name } = data;

  if (!name || name.trim().length === 0) {
    throw new Error("Restaurant name is required");
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name: name.trim(),
    },
  });

  return restaurant;
};

/**
 * Update restaurant settings
 * @param {string} id - Restaurant ID
 * @param {object} data - Updated restaurant data
 * @returns {Promise<object>} Updated restaurant
 */
export const updateRestaurant = async (id, data) => {
  // Check if restaurant exists
  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!existingRestaurant) {
    throw new Error("Restaurant not found");
  }

  const updateData = {};

  // Basic info
  if (data.name !== undefined) {
    if (data.name.trim().length === 0) {
      throw new Error("Restaurant name cannot be empty");
    }
    updateData.name = data.name.trim();
  }

  if (data.description !== undefined) {
    updateData.description = data.description?.trim() || null;
  }

  if (data.phone !== undefined) {
    updateData.phone = data.phone?.trim() || null;
  }

  if (data.email !== undefined) {
    updateData.email = data.email?.trim() || null;
  }

  // Address
  if (data.address !== undefined) {
    updateData.address = data.address?.trim() || null;
  }

  if (data.city !== undefined) {
    updateData.city = data.city?.trim() || null;
  }

  if (data.state !== undefined) {
    updateData.state = data.state?.trim() || null;
  }

  if (data.zipCode !== undefined) {
    updateData.zipCode = data.zipCode?.trim() || null;
  }

  if (data.country !== undefined) {
    updateData.country = data.country?.trim() || null;
  }

  // Images
  if (data.logoUrl !== undefined) {
    updateData.logoUrl = data.logoUrl?.trim() || null;
  }

  if (data.coverImageUrl !== undefined) {
    updateData.coverImageUrl = data.coverImageUrl?.trim() || null;
  }

  // Business hours
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  days.forEach((day) => {
    const openField = `${day}Open`;
    const closeField = `${day}Close`;

    if (data[openField] !== undefined) {
      updateData[openField] = data[openField]?.trim() || null;
    }

    if (data[closeField] !== undefined) {
      updateData[closeField] = data[closeField]?.trim() || null;
    }
  });

  // Delivery settings
  if (data.deliveryEnabled !== undefined) {
    updateData.deliveryEnabled = data.deliveryEnabled;
  }

  if (data.deliveryFee !== undefined) {
    updateData.deliveryFee = data.deliveryFee
      ? parseFloat(data.deliveryFee)
      : null;
  }

  if (data.minOrderAmount !== undefined) {
    updateData.minOrderAmount = data.minOrderAmount
      ? parseFloat(data.minOrderAmount)
      : null;
  }

  // Tax settings
  if (data.taxRate !== undefined) {
    updateData.taxRate = data.taxRate ? parseFloat(data.taxRate) : null;
  }

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: updateData,
  });

  return restaurant;
};

/**
 * Delete restaurant
 * @param {string} id - Restaurant ID
 * @returns {Promise<object>} Deleted restaurant
 */
export const deleteRestaurant = async (id) => {
  // Check if restaurant exists
  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      orders: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"],
          },
        },
      },
    },
  });

  if (!existingRestaurant) {
    throw new Error("Restaurant not found");
  }

  // Check if restaurant has active orders
  if (existingRestaurant.orders.length > 0) {
    throw new Error("Cannot delete restaurant with active orders");
  }

  // Delete related data in order
  await prisma.$transaction([
    prisma.cartItemCustomization.deleteMany({
      where: {
        cartItem: {
          product: {
            restaurantId: id,
          },
        },
      },
    }),
    prisma.cartItem.deleteMany({
      where: {
        product: {
          restaurantId: id,
        },
      },
    }),
    prisma.orderItemCustomization.deleteMany({
      where: {
        orderItem: {
          order: {
            restaurantId: id,
          },
        },
      },
    }),
    prisma.orderItem.deleteMany({
      where: {
        order: {
          restaurantId: id,
        },
      },
    }),
    prisma.fulfillmentDetails.deleteMany({
      where: {
        order: {
          restaurantId: id,
        },
      },
    }),
    prisma.order.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.productComponent.deleteMany({
      where: {
        product: {
          restaurantId: id,
        },
      },
    }),
    prisma.productExtra.deleteMany({
      where: {
        product: {
          restaurantId: id,
        },
      },
    }),
    prisma.product.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.component.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.extra.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.category.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.table.deleteMany({
      where: { restaurantId: id },
    }),
    prisma.restaurant.delete({
      where: { id },
    }),
  ]);

  return { message: "Restaurant deleted successfully" };
};

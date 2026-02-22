// prisma/seed.js
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const DEFAULT_USER_EMAIL = "customer@test.com";
const DEFAULT_USER_PASSWORD = "password123";
const RESTAURANT_NAME = "Greek Restaurant";

async function main() {
  // Idempotency: use existing restaurant if present
  let restaurant = await prisma.restaurant.findFirst({
    where: { name: RESTAURANT_NAME },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: RESTAURANT_NAME,
        description: "Traditional Greek cuisine",
        address: "123 Olive Street",
        city: "Athens",
        country: "Greece",
        deliveryEnabled: true,
        deliveryFee: "5.00",
        minOrderAmount: "10.00",
      },
    });
    console.log("Created restaurant:", restaurant.name);

    // Categories
    const mainDishes = await prisma.category.create({
      data: { name: "Main Dishes", restaurantId: restaurant.id },
    });
    const sides = await prisma.category.create({
      data: { name: "Sides", restaurantId: restaurant.id },
    });
    console.log("Created categories: Main Dishes, Sides");

    // Components and Extras (same restaurant)
    const olives = await prisma.component.create({
      data: {
        name: "Olives",
        costImpact: "0",
        restaurantId: restaurant.id,
      },
    });
    const feta = await prisma.component.create({
      data: {
        name: "Feta",
        costImpact: "1.50",
        restaurantId: restaurant.id,
      },
    });
    const extraSauce = await prisma.extra.create({
      data: {
        name: "Extra sauce",
        price: "1.00",
        restaurantId: restaurant.id,
      },
    });
    const extraOliveOil = await prisma.extra.create({
      data: {
        name: "Extra olive oil",
        price: "0.50",
        restaurantId: restaurant.id,
      },
    });
    console.log("Created components and extras");

    // Products
    const gyro = await prisma.product.create({
      data: {
        name: "Chicken Gyro",
        description: "Served with pita, tzatziki, and fries",
        basePrice: "12.99",
        categoryId: mainDishes.id,
        restaurantId: restaurant.id,
        isActive: true,
      },
    });
    const salad = await prisma.product.create({
      data: {
        name: "Greek Salad",
        description: "Tomatoes, cucumber, olives, feta, oregano",
        basePrice: "8.99",
        categoryId: sides.id,
        restaurantId: restaurant.id,
        isActive: true,
      },
    });
    console.log("Created products: Chicken Gyro, Greek Salad");

    // ProductComponent: link product to components
    await prisma.productComponent.createMany({
      data: [
        { productId: gyro.id, componentId: olives.id, isRemovable: true },
        { productId: gyro.id, componentId: feta.id, isRemovable: true },
        { productId: salad.id, componentId: olives.id, isRemovable: true },
        { productId: salad.id, componentId: feta.id, isRemovable: true },
      ],
    });
    await prisma.productExtra.createMany({
      data: [
        { productId: gyro.id, extraId: extraSauce.id },
        { productId: gyro.id, extraId: extraOliveOil.id },
        { productId: salad.id, extraId: extraOliveOil.id },
      ],
    });
    console.log("Linked products to components and extras");
  } else {
    console.log("Restaurant already exists, skipping restaurant data");
  }

  // Default CUSTOMER user (idempotent)
  const existingUser = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(
      DEFAULT_USER_PASSWORD,
      SALT_ROUNDS,
    );
    await prisma.user.create({
      data: {
        name: "Test Customer",
        email: DEFAULT_USER_EMAIL,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });
    console.log("Created default user:", DEFAULT_USER_EMAIL);
  } else {
    console.log("Default user already exists:", DEFAULT_USER_EMAIL);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// prisma/seed.js
import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const DEFAULT_USER_EMAIL = "customer@test.com";
const DEFAULT_USER_PASSWORD = "password123";
const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
const DEFAULT_ADMIN_PASSWORD = "123456";
const RESTAURANT_NAME = "Greek Restaurant";

async function main() {
  // 1. Create GLOBAL Components and Extras (No restaurantId)
  // We do this first so they are available regardless of restaurant existence
  console.log("Seeding global customizations...");
  
  const olives = await prisma.component.upsert({
    where: { name: "Olives" }, // Assuming name is unique or used for identification
    update: {},
    create: { name: "Olives", costImpact: 0 },
  });

  const feta = await prisma.component.upsert({
    where: { name: "Feta" },
    update: {},
    create: { name: "Feta", costImpact: 1.50 },
  });

  const extraSauce = await prisma.extra.upsert({
    where: { name: "Extra sauce" },
    update: {},
    create: { name: "Extra sauce", price: 1.00 },
  });

  const extraOliveOil = await prisma.extra.upsert({
    where: { name: "Extra olive oil" },
    update: {},
    create: { name: "Extra olive oil", price: 0.50 },
  });

  // 2. Handle Restaurant and Products
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
        deliveryFee: 5.00,
        minOrderAmount: 10.00,
      },
    });

    const mainDishes = await prisma.category.create({
      data: { name: "Main Dishes", restaurantId: restaurant.id },
    });
    const sides = await prisma.category.create({
      data: { name: "Sides", restaurantId: restaurant.id },
    });

    // Products
    const gyro = await prisma.product.create({
      data: {
        name: "Chicken Gyro",
        description: "Served with pita, tzatziki, and fries",
        basePrice: 12.99,
        categoryId: mainDishes.id,
        restaurantId: restaurant.id,
        isActive: true,
        // NEW: Seed Sizes for the Gyro
        sizes: {
          create: [
            { size: "SMALL", priceModifier: 0 },
            { size: "MEDIUM", priceModifier: 2.50 },
            { size: "LARGE", priceModifier: 5.00 }
          ]
        },
        // Link to global components/extras
        components: {
          create: [
            { componentId: olives.id, isRemovable: true },
            { componentId: feta.id, isRemovable: true },
          ]
        },
        extras: {
          create: [
            { extraId: extraSauce.id },
            { extraId: extraOliveOil.id },
          ]
        }
      },
    });

    console.log("Created restaurant, categories, and products with sizes");
  }

  // 3. Users (Idempotent)
  await seedUser("Test Customer", DEFAULT_USER_EMAIL, DEFAULT_USER_PASSWORD, "CUSTOMER");
  await seedUser("Admin", DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, "ADMIN");
}

async function seedUser(name, email, password, role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
    console.log(`Created ${role}: ${email}`);
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
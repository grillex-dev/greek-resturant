// prisma/seed-menu.js
import prisma from "../config/prisma.js";
import menuData from "./menu.json" with { type: "json" };
async function main() {
  console.log("🚀 Starting Greek Kitchen Menu Seeding...");

  // ========================
  // 1. SEED GLOBAL EXTRAS
  // ========================
  console.log("Seeding global extras...");

  const mainExtras = [
    { name: "Chicken", price: 12.00 },
    { name: "Lamb", price: 15.00 },
    { name: "Beef", price: 15.00 },
    { name: "Falafel (3 pieces)", price: 9.00 },
    { name: "Shrimp (3 pieces)", price: 19.00 },
    { name: "Chicken Tender (2 pieces)", price: 10.00 },
    { name: "Cheese", price: 4.00 },
    { name: "Bacon", price: 5.00 },
    { name: "Pineapple", price: 6.00 },
    { name: "Egg", price: 4.00 },
    { name: "Guacamole Sauce", price: 5.00 },
    { name: "Relish Sauce", price: 3.00 },
    { name: "Tartar Sauce", price: 3.00 },
    { name: "Garlic Sauce", price: 3.00 },
    { name: "BBQ Sauce", price: 3.00 },
    { name: "Dynamite Sauce", price: 3.00 },
    { name: "Cocktail Sauce", price: 3.00 },
    { name: "Tahini Sauce", price: 3.00 },
    { name: "Tzatziki Sauce", price: 3.00 },
    { name: "Honey Mustard Sauce", price: 4.00 },
    { name: "Buffalo Sauce", price: 5.00 },
  ];

  const pizzaExtras = [
    { name: "Tomato Sauce", price: 5.00 },
    { name: "Pesto Sauce", price: 5.00 },
    { name: "Alfredo White Sauce", price: 6.00 },
    { name: "Zaatar", price: 6.00 },
    { name: "Mozzarella Cheese", price: 7.00 },
    { name: "Feta Cheese", price: 6.00 },
    { name: "Cheddar Cheese", price: 6.00 },
    { name: "Parmesan Cheese", price: 5.00 },
    { name: "Mushrooms", price: 6.00 },
    { name: "Pepperoni", price: 6.00 },
    { name: "Salami", price: 6.00 },
    { name: "Ham", price: 5.00 },
    { name: "Sausage", price: 10.00 },
    { name: "Bacon", price: 6.00 },
    { name: "Tomatoes", price: 5.00 },
    { name: "Sundried Tomato", price: 5.00 },
    { name: "Olives", price: 4.00 },
    { name: "Onions", price: 4.00 },
    { name: "Green Peppers", price: 4.00 },
    { name: "Jalapenos", price: 4.00 },
    { name: "Sweetcorn", price: 4.00 },
    { name: "Spinach", price: 7.00 },
    { name: "Artichoke", price: 6.00 },
  ];

  const allExtras = [...mainExtras, ...pizzaExtras];

  const extraMap = {};
for (const ex of allExtras) {
    // Check if extra already exists
    let extra = await prisma.extra.findFirst({
      where: { name: ex.name }
    });

    if (extra) {
      // Update price if it changed
      if (extra.price.toNumber() !== ex.price) {
        extra = await prisma.extra.update({
          where: { id: extra.id },
          data: { price: ex.price },
        });
      }
    } else {
      // Create new extra
      extra = await prisma.extra.create({
        data: {
          name: ex.name,
          price: ex.price,
        },
      });
    }

    extraMap[ex.name] = extra.id;
  }

  console.log(`✅ Processed ${allExtras.length} extras`);

  // ========================
  // 2. SEED CATEGORIES & PRODUCTS
  // ========================
  console.log("Seeding categories and products...");

  for (const cat of menuData.categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });

    console.log(`📂 Processing: ${category.name}`);

    for (const prod of cat.products) {
      const product = await prisma.product.upsert({
        where: {
          name_categoryId: { name: prod.name, categoryId: category.id },
        },
        update: {
          description: prod.description || null,
          basePrice: prod.basePrice,
          isActive: true,
        },
        create: {
          name: prod.name,
          description: prod.description || null,
          basePrice: prod.basePrice,
          categoryId: category.id,
          isActive: true,
        },
      });

      // Handle Sizes (Pizza)
      if (prod.sizes && prod.sizes.length > 0) {
        for (const s of prod.sizes) {
          await prisma.productSize.upsert({
            where: { productId_size: { productId: product.id, size: s.size } },
            update: { priceModifier: s.priceModifier },
            create: {
              productId: product.id,
              size: s.size,
              priceModifier: s.priceModifier,
            },
          });
        }
      }

      // Assign extras based on category
      let extrasToAssign = [];
      if (cat.name === "Pizza") {
        extrasToAssign = pizzaExtras.map(e => e.name);
      } else if (["Breakfast", "Sweets", "Greek Protein", "Smoothie & Milk Shake", "Hot & Cold Drinks"].includes(cat.name)) {
        extrasToAssign = [];
      } else {
        extrasToAssign = mainExtras.map(e => e.name);
      }

      for (const extraName of extrasToAssign) {
        if (extraMap[extraName]) {
          await prisma.productExtra.upsert({
            where: {
              productId_extraId: {
                productId: product.id,
                extraId: extraMap[extraName],
              },
            },
            update: {},
            create: {
              productId: product.id,
              extraId: extraMap[extraName],
            },
          });
        }
      }
    }

    console.log(`✅ Seeded ${cat.products.length} products in "${cat.name}"`);
  }

  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
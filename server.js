import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";
import "./config/cloudinary.js"; // Initialize Cloudinary

const PORT = process.env.PORT || 5000;

// Test database connection on startup
async function startServer() {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log("✅ Database connection established via Prisma");

    // Test Cloudinary (optional - just verify env vars are set)
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      console.log("✅ Cloudinary configured");
    } else {
      console.warn("⚠️  Cloudinary credentials not found in .env");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
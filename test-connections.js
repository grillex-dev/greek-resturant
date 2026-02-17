// test-connections.js
// Test script to verify all connections: Database, Prisma, and Cloudinary

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("🔍 Testing Connections...\n");
console.log("=" .repeat(50));

// Test results
const results = {
  database: false,
  prisma: false,
  cloudinary: false,
};

// 1. Test Environment Variables
console.log("\n📋 Checking Environment Variables:");
console.log("-".repeat(50));

const envVars = {
  DATABASE_URL: !!process.env.DATABASE_URL,
  DIRECT_URL: !!process.env.DIRECT_URL,
  CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
};

Object.entries(envVars).forEach(([key, exists]) => {
  console.log(`${exists ? "✅" : "❌"} ${key}: ${exists ? "Set" : "Missing"}`);
});

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

// 2. Test Database Connection (Direct PostgreSQL)
console.log("\n🗄️  Testing Direct Database Connection:");
console.log("-".repeat(50));

if (connectionString) {
  try {
    const pool = new Pool({ connectionString });
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time, version() as pg_version");
    console.log("✅ Database connection successful!");
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(",")[0]}`);
    client.release();
    await pool.end();
    results.database = true;
  } catch (error) {
    console.log("❌ Database connection failed!");
    console.log(`   Error: ${error.message}`);
  }
} else {
  console.log("❌ No database connection string found (DATABASE_URL or DIRECT_URL)");
}

// 3. Test Prisma Connection
console.log("\n🔷 Testing Prisma Connection:");
console.log("-".repeat(50));

if (connectionString) {
  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    await prisma.$connect();
    console.log("✅ Prisma connection successful!");

    // Try a simple query
    try {
      const userCount = await prisma.user.count();
      console.log(`   Users in database: ${userCount}`);
    } catch (queryError) {
      console.log(`   ⚠️  Could not query User table: ${queryError.message}`);
      console.log("   (This is normal if migrations haven't been run yet)");
    }

    await prisma.$disconnect();
    await pool.end();
    results.prisma = true;
  } catch (error) {
    console.log("❌ Prisma connection failed!");
    console.log(`   Error: ${error.message}`);
  }
} else {
  console.log("❌ Cannot test Prisma - no database connection string");
}

// 4. Test Cloudinary Connection
console.log("\n☁️  Testing Cloudinary Connection:");
console.log("-".repeat(50));

const hasCloudinaryCreds =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryCreds) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test connection by getting account details
    const accountInfo = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful!");
    console.log(`   Cloud name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   Status: ${accountInfo.status}`);
    results.cloudinary = true;
  } catch (error) {
    console.log("❌ Cloudinary connection failed!");
    console.log(`   Error: ${error.message}`);
    if (error.message.includes("Invalid API Key")) {
      console.log("   💡 Check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET");
    }
  }
} else {
  console.log("❌ Cloudinary credentials not found in .env");
  console.log("   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("📊 Test Summary:");
console.log("=".repeat(50));
console.log(`${results.database ? "✅" : "❌"} Database Connection: ${results.database ? "PASS" : "FAIL"}`);
console.log(`${results.prisma ? "✅" : "❌"} Prisma Connection: ${results.prisma ? "PASS" : "FAIL"}`);
console.log(`${results.cloudinary ? "✅" : "❌"} Cloudinary Connection: ${results.cloudinary ? "PASS" : "FAIL"}`);

const allPassed = Object.values(results).every((r) => r);
console.log("\n" + "=".repeat(50));
if (allPassed) {
  console.log("🎉 All connections successful!");
  process.exit(0);
} else {
  console.log("⚠️  Some connections failed. Please check your .env file and configuration.");
  process.exit(1);
}


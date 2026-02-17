import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Ensure .env is present at project root."
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  let exitCode = 0;
  try {
    await prisma.$connect();
    console.log("Database connection successful.");
  } catch (err) {
    exitCode = 1;
    console.error("Database connection failed:", err.message || err);
  } finally {
    await prisma.$disconnect().catch((disconnectErr) => {
      console.error(
        "Failed to disconnect Prisma cleanly:",
        disconnectErr.message || disconnectErr
      );
      exitCode = 1;
    });
    await pool.end().catch((poolErr) => {
      console.error("Failed to close PG pool:", poolErr.message || poolErr);
      exitCode = 1;
    });
    process.exit(exitCode);
  }
}

main();

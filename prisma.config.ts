import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "./.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.js" as const,
  },
  datasource: {
    url: process.env.DATABASE_URL || process.env.DIRECT_URL,
  },
});

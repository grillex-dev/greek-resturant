/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Component` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Extra` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Component" DROP CONSTRAINT "Component_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Extra" DROP CONSTRAINT "Extra_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "Component" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "Extra" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "restaurantId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "restaurantId";

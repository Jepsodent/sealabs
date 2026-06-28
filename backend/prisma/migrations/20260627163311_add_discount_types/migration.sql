/*
  Warnings:

  - The `discountType` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `vourcers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('VOUCHER', 'PROMO');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "discountType",
ADD COLUMN     "discountType" "DiscountType";

-- DropTable
DROP TABLE "vourcers";

-- CreateTable
CREATE TABLE "vourchers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "isPercent" BOOLEAN NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "remainingUsage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vourchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vourchers_code_key" ON "vourchers"("code");

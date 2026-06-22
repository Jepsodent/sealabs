/*
  Warnings:

  - A unique constraint covering the columns `[storeId,name]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "products_storeId_name_key" ON "products"("storeId", "name");

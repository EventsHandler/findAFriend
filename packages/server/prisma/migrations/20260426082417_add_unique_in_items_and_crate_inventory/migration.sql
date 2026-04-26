/*
  Warnings:

  - A unique constraint covering the columns `[userId,crateId]` on the table `CrateInventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,itemId]` on the table `ItemInventory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CrateInventory_userId_crateId_key" ON "CrateInventory"("userId", "crateId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemInventory_userId_itemId_key" ON "ItemInventory"("userId", "itemId");

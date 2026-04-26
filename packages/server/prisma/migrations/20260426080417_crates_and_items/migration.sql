-- CreateEnum
CREATE TYPE "RarityType" AS ENUM ('COMMON', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "Crate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "RarityType" NOT NULL,
    "chance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Crate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrateRarityDrop" (
    "id" TEXT NOT NULL,
    "crateId" TEXT NOT NULL,
    "rarity" "RarityType" NOT NULL,
    "chance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CrateRarityDrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rarity" "RarityType" NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrateInventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "crateId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CrateInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemInventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ItemInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrateRarityDrop_crateId_rarity_key" ON "CrateRarityDrop"("crateId", "rarity");

-- CreateIndex
CREATE INDEX "CrateInventory_userId_idx" ON "CrateInventory"("userId");

-- CreateIndex
CREATE INDEX "ItemInventory_userId_idx" ON "ItemInventory"("userId");

-- AddForeignKey
ALTER TABLE "CrateRarityDrop" ADD CONSTRAINT "CrateRarityDrop_crateId_fkey" FOREIGN KEY ("crateId") REFERENCES "Crate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrateInventory" ADD CONSTRAINT "CrateInventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrateInventory" ADD CONSTRAINT "CrateInventory_crateId_fkey" FOREIGN KEY ("crateId") REFERENCES "Crate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemInventory" ADD CONSTRAINT "ItemInventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemInventory" ADD CONSTRAINT "ItemInventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

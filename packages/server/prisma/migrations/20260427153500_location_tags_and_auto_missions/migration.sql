-- CreateEnum
CREATE TYPE "LocationTag" AS ENUM ('PARK', 'RESTAURANT', 'LANDMARK');

-- AlterTable
ALTER TABLE "Location" ADD COLUMN "tag" "LocationTag" NOT NULL DEFAULT 'LANDMARK';

-- CreateIndex
CREATE UNIQUE INDEX "Mission_locationId_title_key" ON "Mission"("locationId", "title");


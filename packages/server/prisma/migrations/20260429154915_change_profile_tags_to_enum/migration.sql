/*
  Warnings:

  - The `profileTags` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InterestTag" AS ENUM ('NATURE', 'FOOD', 'CULTURE', 'ENTERTAINMENT', 'SPORTS', 'RELAXATION', 'ADVENTURE', 'SHOPPING', 'HISTORY', 'ART');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profileTags",
ADD COLUMN     "profileTags" "InterestTag"[];

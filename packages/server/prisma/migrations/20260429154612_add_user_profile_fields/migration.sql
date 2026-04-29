-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "profileTags" TEXT[];

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "cooldownHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "repeatable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserMission" ADD COLUMN     "lockedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "QuestCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rewardXp" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestCompletion_userId_completedAt_idx" ON "QuestCompletion"("userId", "completedAt" DESC);

-- CreateIndex
CREATE INDEX "QuestCompletion_userId_missionId_idx" ON "QuestCompletion"("userId", "missionId");

-- AddForeignKey
ALTER TABLE "QuestCompletion" ADD CONSTRAINT "QuestCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestCompletion" ADD CONSTRAINT "QuestCompletion_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

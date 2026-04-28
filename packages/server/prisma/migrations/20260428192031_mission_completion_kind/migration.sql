-- CreateEnum
CREATE TYPE "MissionCompletionKind" AS ENUM ('MANUAL_CONFIRM', 'WALK_DISTANCE', 'STAY_TIME', 'CHAT_COUNT', 'PHOTO', 'TIMED');

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "completionKind" "MissionCompletionKind" NOT NULL DEFAULT 'MANUAL_CONFIRM',
ADD COLUMN     "distanceMeters" INTEGER,
ADD COLUMN     "staySeconds" INTEGER,
ADD COLUMN     "timerSeconds" INTEGER;

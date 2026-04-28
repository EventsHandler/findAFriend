import type { PrismaClient } from '../../../generated/prisma/index.js'

const XP_PER_LEVEL = 100
const MILESTONE_EVERY_LEVELS = 5
const MILESTONE_POINTS = 100

// Points economy tuning.
// If you want “much more points”, increase POINTS_PER_XP.
const POINTS_PER_XP = 0.5

export function computeLevelFromXp(xp: number) {
  const safe = Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0
  return Math.floor(safe / XP_PER_LEVEL) + 1
}

export function questPointsForRewardXp(rewardXp: number) {
  const xp = Number.isFinite(rewardXp) ? Math.max(0, Math.floor(rewardXp)) : 0
  return Math.max(1, Math.round(xp * POINTS_PER_XP))
}

export function milestonePointsForLevelRange(oldLevel: number, newLevel: number) {
  const from = Math.max(1, Math.floor(oldLevel) + 1)
  const to = Math.max(1, Math.floor(newLevel))
  if (to < from) return 0

  let milestones = 0
  for (let lvl = from; lvl <= to; lvl++) {
    if (lvl % MILESTONE_EVERY_LEVELS === 0) milestones++
  }
  return milestones * MILESTONE_POINTS
}

export async function applyQuestRewards(tx: PrismaClient, args: { userId: string; rewardXp: number }) {
  const { userId, rewardXp } = args

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  })
  if (!user) return

  const nextXp = user.xp + rewardXp
  const nextLevel = computeLevelFromXp(nextXp)
  const questPoints = questPointsForRewardXp(rewardXp)
  const milestonePoints = milestonePointsForLevelRange(user.level, nextLevel)

  await tx.user.update({
    where: { id: userId },
    data: {
      xp: nextXp,
      level: nextLevel,
      points: { increment: questPoints + milestonePoints },
    },
  })
}


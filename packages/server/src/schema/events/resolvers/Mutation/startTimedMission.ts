import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
import { CLAIM_RADIUS_METERS, haversineMeters } from '../missionArea'
import { missionError } from '../missionErrors'
import { applyQuestRewards } from '../questRewards'

const timerByKey = new Map<string, NodeJS.Timeout>()

async function scheduleTimedCompletion(args: {
  userId: string
  missionId: string
  userMissionId: string
  durationMs: number
  startedAt: Date
}) {
  const { userId, missionId, userMissionId, durationMs, startedAt } = args
  const key = `${userId}:${missionId}`

  const elapsed = Date.now() - startedAt.getTime()
  const remainingMs = Math.max(0, durationMs - elapsed)

  if (timerByKey.has(key)) return

  const timeout = setTimeout(async () => {
    timerByKey.delete(key)

    try {
      const fresh = await prisma.userMission.findUnique({
        where: { id: userMissionId },
        include: { mission: true },
      })
      if (!fresh) return
      if (fresh.status !== 'ACTIVE') return

      const target = fresh.mission.targetProgress
      const lockedUntil = fresh.mission.repeatable
        ? new Date(Date.now() + fresh.mission.cooldownHours * 60 * 60 * 1000)
        : null

      await prisma.$transaction(async (tx) => {
        await tx.questCompletion.create({
          data: {
            userId,
            missionId: fresh.missionId,
            title: fresh.mission.title,
            rewardXp: fresh.mission.rewardXp,
          },
        })
        await applyQuestRewards(tx as any, { userId, rewardXp: fresh.mission.rewardXp })
        await tx.userMission.update({
          where: { id: fresh.id },
          data: {
            progress: target,
            status: 'COMPLETED',
            completedAt: new Date(),
            lockedUntil,
            startedAt: null,
          },
        })
      })
    } catch {
      // Best-effort timer completion; swallow to avoid crashing server.
    }
  }, remainingMs)

  timerByKey.set(key, timeout)
}

export const startTimedMission: NonNullable<MutationResolvers['startTimedMission']> = async (
  _parent,
  { missionId, lat, lng },
  { user },
) => {
  if (!user) missionError('UNAUTHORIZED', 'Unauthorized')

  const mission = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!mission) missionError('NOT_FOUND', 'Mission not found', { missionId })

  if (mission.completionKind !== 'TIMED') {
    missionError('INVALID_MISSION_TYPE', 'This mission is not a timed start mission', { title: mission.title })
  }
  const durationMs = (mission.timerSeconds ?? 0) * 1000
  if (!durationMs) missionError('INVALID_MISSION_TYPE', 'Timed mission missing timerSeconds', { missionId })

  if (mission.locationId) {
    if (!user.locationId) missionError('LOCATION_REQUIRED', 'You must join the location first')
    if (user.locationId !== mission.locationId) {
      missionError('LOCATION_MISMATCH', 'You must be in the mission location', {
        userLocationId: user.locationId,
        missionLocationId: mission.locationId,
      })
    }
    const loc = await prisma.location.findUnique({ where: { id: mission.locationId } })
    if (!loc) missionError('NOT_FOUND', 'Mission location not found', { locationId: mission.locationId })

    const dist = haversineMeters({ lat, lng }, { lat: loc.posx, lng: loc.posy })
    if (dist > CLAIM_RADIUS_METERS) {
      missionError('OUTSIDE_AREA', 'You must be inside the mission area', {
        distanceMeters: Math.round(dist),
        requiredMeters: CLAIM_RADIUS_METERS,
      })
    }
  }

  const um = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId } },
    include: { mission: true },
  })
  if (!um) missionError('NOT_CLAIMED', 'Claim the mission first', { missionId })
  if (um.status !== 'ACTIVE') missionError('NOT_ACTIVE', 'Mission is not active', { status: um.status })

  const key = `${user.id}:${missionId}`

  // Idempotent behavior:
  // - If already started, (re)schedule completion (useful after server restart) and return current UM.
  // - If timer already scheduled in-memory, just return.
  const existingStartedAt = um.startedAt as Date | null | undefined
  if (existingStartedAt) {
    await scheduleTimedCompletion({
      userId: user.id,
      missionId,
      userMissionId: um.id as string,
      durationMs,
      startedAt: existingStartedAt,
    })
    return um as any
  }
  if (timerByKey.has(key)) return um as any

  const startedAt = new Date()
  const updated = await prisma.userMission.update({
    where: { id: um.id as string },
    data: { startedAt },
    include: { mission: true },
  })

  await scheduleTimedCompletion({
    userId: user.id,
    missionId,
    userMissionId: updated.id as string,
    durationMs,
    startedAt,
  })

  return updated as any
}

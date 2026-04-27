import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
import { CLAIM_RADIUS_METERS, haversineMeters } from '../missionArea'
import { missionError } from '../missionErrors'

const timerByKey = new Map<string, NodeJS.Timeout>()

function parseDurationMsFromTitle(title: string): number | null {
  // Accept: "Sprint 2 minute", "Stretch 5 minute", "Respirație 1 minut"
  const m = title.match(/(\d+)\s*(minute|minut)/i)
  if (!m) return null
  const minutes = Number(m[1])
  if (!Number.isFinite(minutes) || minutes <= 0) return null
  return minutes * 60 * 1000
}

export const startTimedMission: NonNullable<MutationResolvers['startTimedMission']> = async (
  _parent,
  { missionId, lat, lng },
  { user },
) => {
  if (!user) missionError('UNAUTHORIZED', 'Unauthorized')

  const mission = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!mission) missionError('NOT_FOUND', 'Mission not found', { missionId })

  const durationMs = parseDurationMsFromTitle(mission.title)
  if (!durationMs) {
    missionError('INVALID_MISSION_TYPE', 'This mission is not a timed start mission', { title: mission.title })
  }

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
  if (timerByKey.has(key)) missionError('ALREADY_STARTED', 'Timed mission already started')

  // Start timer (best-effort; in-memory for hackathon).
  const timeout = setTimeout(async () => {
    timerByKey.delete(key)

    try {
      const fresh = await prisma.userMission.findUnique({
        where: { userId_missionId: { userId: user.id, missionId } },
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
            userId: user.id,
            missionId: fresh.missionId,
            title: fresh.mission.title,
            rewardXp: fresh.mission.rewardXp,
          },
        })
        await tx.user.update({
          where: { id: user.id },
          data: { xp: { increment: fresh.mission.rewardXp } },
        })
        await tx.userMission.update({
          where: { id: fresh.id },
          data: {
            progress: target,
            status: 'COMPLETED',
            completedAt: new Date(),
            lockedUntil,
          },
        })
      })
    } catch {
      // Best-effort timer completion; swallow to avoid crashing server.
    }
  }, durationMs)

  timerByKey.set(key, timeout)
  return um as any
}

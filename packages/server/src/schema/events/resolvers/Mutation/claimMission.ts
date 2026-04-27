import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
import { setClaimedNow } from '../missionValidationState'
import { CLAIM_RADIUS_METERS, haversineMeters } from '../missionArea'
import { missionError } from '../missionErrors'

export const claimMission: NonNullable<MutationResolvers['claimMission']> = async (
  _parent,
  { missionId },
  { user },
) => {
  if (!user) missionError('UNAUTHORIZED', 'Unauthorized')

  const mission = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!mission) missionError('NOT_FOUND', 'Mission not found', { missionId })

  // Hard validation: you can only claim a location mission while you're in that location (area).
  if (mission.locationId) {
    if (!user.locationId) missionError('LOCATION_REQUIRED', 'You must join the location first')
    if (user.locationId !== mission.locationId) {
      missionError('LOCATION_MISMATCH', 'You must be in the mission location to claim it', {
        userLocationId: user.locationId,
        missionLocationId: mission.locationId,
      })
    }
    if (user.posx == null || user.posy == null) {
      missionError('GEOLOCATION_REQUIRED', 'Location permission required to claim missions')
    }

    const loc = await prisma.location.findUnique({ where: { id: mission.locationId } })
    if (!loc) missionError('NOT_FOUND', 'Mission location not found', { locationId: mission.locationId })

    const dist = haversineMeters({ lat: user.posx, lng: user.posy }, { lat: loc.posx, lng: loc.posy })
    if (dist > CLAIM_RADIUS_METERS) {
      missionError('OUTSIDE_AREA', 'You must be inside the mission area to claim it', {
        distanceMeters: Math.round(dist),
        requiredMeters: CLAIM_RADIUS_METERS,
      })
    }
  }

  const existing = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId } },
  })

  if (!existing) {
    const prior = await prisma.questCompletion.findFirst({
      where: { userId: user.id, missionId },
    })
    if (prior && !mission.repeatable) missionError('INVALID_STATE', 'Quest already completed')
    const created = (await prisma.userMission.create({
      data: { userId: user.id, missionId },
    })) as any
    setClaimedNow(user.id, missionId)
    return created
  }

  if (existing.status === 'ACTIVE') missionError('ALREADY_ACTIVE', 'Mission already in progress')

  if (existing.status === 'COMPLETED') {
    if (!mission.repeatable) missionError('INVALID_STATE', 'Quest already completed')
    if (existing.lockedUntil && existing.lockedUntil > new Date()) {
      missionError('COOLDOWN', 'Quest on cooldown — try again after the timer', {
        lockedUntil: existing.lockedUntil.toISOString(),
      })
    }
    const updated = (await prisma.userMission.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        progress: 0,
        completedAt: null,
        lockedUntil: null,
      },
    })) as any
    setClaimedNow(user.id, missionId)
    return updated
  }

  missionError('INVALID_STATE', 'Invalid mission state', { status: existing.status })
}

import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
import { CLAIM_RADIUS_METERS, haversineMeters } from '../missionArea'
import { missionError } from '../missionErrors'
import { applyQuestRewards } from '../questRewards'

export const completeMission: NonNullable<MutationResolvers['completeMission']> = async (
  _parent,
  { missionId, lat, lng },
  { user },
) => {
  if (!user) missionError('UNAUTHORIZED', 'Unauthorized')

  const mission = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!mission) missionError('NOT_FOUND', 'Mission not found', { missionId })

  // Manual completion still requires you to be in the correct area for location missions.
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

  const target = um.mission.targetProgress
  const lockedUntil = um.mission.repeatable
    ? new Date(Date.now() + um.mission.cooldownHours * 60 * 60 * 1000)
    : null

  return prisma.$transaction(async (tx) => {
    await tx.questCompletion.create({
      data: {
        userId: user.id,
        missionId: um.missionId,
        title: um.mission.title,
        rewardXp: um.mission.rewardXp,
      },
    })
    await applyQuestRewards(tx as any, { userId: user.id, rewardXp: um.mission.rewardXp })
    return tx.userMission.update({
      where: { id: um.id },
      data: {
        progress: target,
        status: 'COMPLETED',
        completedAt: new Date(),
        lockedUntil,
      },
    }) as any
  }) as any
}

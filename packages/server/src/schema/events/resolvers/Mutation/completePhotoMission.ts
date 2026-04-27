import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
import { CLAIM_RADIUS_METERS, haversineMeters } from '../missionArea.js'

export const completePhotoMission: NonNullable<MutationResolvers['completePhotoMission']> = async (
  _parent,
  { missionId, lat, lng },
  { user },
) => {
  if (!user) throw new Error('Unauthorized')

  const mission = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!mission) throw new Error('Mission not found')

  // For now we validate region by GPS coordinates provided by the client at capture time.
  // (We are not parsing EXIF in this hackathon implementation.)
  if (mission.locationId) {
    if (!user.locationId) throw new Error('You must join the location first')
    if (user.locationId !== mission.locationId) throw new Error('You must be in the mission location')

    const loc = await prisma.location.findUnique({ where: { id: mission.locationId } })
    if (!loc) throw new Error('Mission location not found')

    const dist = haversineMeters({ lat, lng }, { lat: loc.posx, lng: loc.posy })
    if (dist > CLAIM_RADIUS_METERS) throw new Error('You must be inside the mission area')
  }

  const um = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId } },
    include: { mission: true },
  })
  if (!um) throw new Error('Claim the mission first')
  if (um.status !== 'ACTIVE') throw new Error('Mission is not active')

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
    await tx.user.update({
      where: { id: user.id },
      data: { xp: { increment: um.mission.rewardXp } },
    })
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


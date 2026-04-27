import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
import { setClaimedNow } from '../missionValidationState.ts'

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * R * Math.asin(Math.sqrt(x))
}

export const claimMission: NonNullable<MutationResolvers['claimMission']> = async (
  _parent,
  { missionId },
  { user },
) => {
  if (!user) throw new Error('Unauthorized')

  const mission = await prisma.mission.findUnique({ where: { id: missionId } })
  if (!mission) throw new Error('Mission not found')

  // Hard validation: you can only claim a location mission while you're in that location (area).
  if (mission.locationId) {
    if (!user.locationId) throw new Error('You must join the location first')
    if (user.locationId !== mission.locationId) throw new Error('You must be in the mission location to claim it')
    if (user.posx == null || user.posy == null) throw new Error('Location permission required to claim missions')

    const loc = await prisma.location.findUnique({ where: { id: mission.locationId } })
    if (!loc) throw new Error('Mission location not found')

    const dist = haversineMeters({ lat: user.posx, lng: user.posy }, { lat: loc.posx, lng: loc.posy })
    const CLAIM_RADIUS_METERS = 250
    if (dist > CLAIM_RADIUS_METERS) {
      throw new Error('You must be inside the mission area to claim it')
    }
  }

  const existing = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId } },
  })

  if (!existing) {
    const prior = await prisma.questCompletion.findFirst({
      where: { userId: user.id, missionId },
    })
    if (prior && !mission.repeatable) throw new Error('Quest already completed')
    const created = (await prisma.userMission.create({
      data: { userId: user.id, missionId },
    })) as any
    setClaimedNow(user.id, missionId)
    return created
  }

  if (existing.status === 'ACTIVE') throw new Error('Mission already in progress')

  if (existing.status === 'COMPLETED') {
    if (!mission.repeatable) throw new Error('Quest already completed')
    if (existing.lockedUntil && existing.lockedUntil > new Date()) {
      throw new Error('Quest on cooldown — try again after the timer')
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

  throw new Error('Invalid mission state')
}

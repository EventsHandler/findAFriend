import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
import { autoProgressFromPositionEvent } from '../missionAutoProgress'

export const updatePosition: NonNullable<MutationResolvers['updatePosition']> = async (
  _parent,
  { locationId, lat, lng },
  { user },
) => {
  if (!user) throw new Error('Unauthorized')
  if (user.locationId !== locationId) throw new Error('User not joined to this room')

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { posx: lat, posy: lng },
  })

  // Best-effort auto progress for server-validated missions.
  // NOTE: this is intentionally non-blocking for the position update call path.
  void autoProgressFromPositionEvent({ userId: user.id, locationId, lat, lng })

  return updated
}

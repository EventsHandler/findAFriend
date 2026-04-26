import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'

export const updatePosition: NonNullable<MutationResolvers['updatePosition']> = async (
  _parent,
  { locationId, lat, lng },
  { user },
) => {
  if (!user) throw new Error('Unauthorized')
  if (user.locationId !== locationId) throw new Error('User not joined to this room')

  return await prisma.user.update({
    where: { id: user.id },
    data: { posx: lat, posy: lng },
  })
}

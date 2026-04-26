import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'

export const joinRoom: NonNullable<MutationResolvers['joinRoom']> = async (
  _parent,
  { locationId },
  { user },
) => {
  if (!user) throw new Error('Unauthorized')

  const location = await prisma.location.findUnique({ where: { id: locationId } })
  if (!location) throw new Error('Location not found')

  return await prisma.user.update({
    where: { id: user.id },
    data: { locationId },
  })
}

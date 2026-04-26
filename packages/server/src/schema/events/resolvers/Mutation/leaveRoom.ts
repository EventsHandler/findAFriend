import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'

export const leaveRoom: NonNullable<MutationResolvers['leaveRoom']> = async (
  _parent,
  _arg,
  { user },
) => {
  if (!user) throw new Error('Unauthorized')

  return await prisma.user.update({
    where: { id: user.id },
    data: { locationId: null },
  })
}

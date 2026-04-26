import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'

export const locationUsers: NonNullable<QueryResolvers['locationUsers']> = async (
  _parent,
  { locationId },
  _ctx,
) => {
  return await prisma.user.findMany({
    where: { locationId },
    orderBy: { name: 'asc' },
  })
}

import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'
export const userCrates: NonNullable<QueryResolvers['userCrates']> = async (_parent, { userId }, _ctx) => {
  return await prisma.crateInventory.findMany({
    where: { userId },
  })
}

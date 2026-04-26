import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'
export const userItems: NonNullable<QueryResolvers['userItems']> = async (_parent, { userId }, _ctx) => {
  return await prisma.itemInventory.findMany({
    where: { userId },
  })
}

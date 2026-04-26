import { prisma } from '../../../prisma.js'
import type { UserResolvers } from './../../types.generated.js'
export const User: UserResolvers = {
  inventories: async (parent, _arg, _ctx) => {
    return await prisma.itemInventory.findMany({ where: { userId: parent.id as string } })
  },
  crateInventories: async (parent, _arg, _ctx) => {
    return await prisma.crateInventory.findMany({where: { userId: parent.id as string}})
  }
}

import { prisma } from '../../../prisma.js'
import type { UserResolvers } from './../../types.generated.js'

export const User: UserResolvers = {
  inventories: async (parent, _arg, _ctx) => {
    return await prisma.itemInventory.findMany({ where: { userId: parent.id as string } })
  },
  crateInventories: async (parent, _arg, _ctx) => {
    return await prisma.crateInventory.findMany({ where: { userId: parent.id as string } })
  },
  userMissions: async (parent, _arg, _ctx) => {
    return prisma.userMission.findMany({
      where: { userId: parent.id as string },
      orderBy: { id: 'asc' },
    }) as any
  },
  questHistory: async (parent, { limit }, _ctx) => {
    const take = Math.min(Math.max(limit ?? 40, 1), 100)
    return prisma.questCompletion.findMany({
      where: { userId: parent.id as string },
      orderBy: { completedAt: 'desc' },
      take,
    }) as any
  },
}

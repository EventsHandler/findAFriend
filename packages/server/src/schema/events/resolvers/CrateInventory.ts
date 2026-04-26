import { prisma } from '../../../prisma.js'
import type { CrateInventoryResolvers } from './../../types.generated.js'
export const CrateInventory: CrateInventoryResolvers = {
  user: async (parent, _arg, _ctx) => {
      return await prisma.user.findUnique({where: {
        id: parent.userId
      }})
    },
  crate: async (parent, _arg, _ctx) => {
      return await prisma.crate.findUnique({where: {
        id: parent.crateId
      }})
    }
}

import { prisma } from '../../../prisma.js'
import type { ItemInventoryResolvers } from './../../types.generated.js'
export const ItemInventory: ItemInventoryResolvers = {
  user: async (parent, _arg, _ctx) => {
    return await prisma.user.findUnique({where: {
        id: parent.userId
    }})
  },
  item: async (parent, _arg, _ctx) => {
    return await prisma.item.findUnique({where: {
      id: parent.itemId
    }}) 
  }
}

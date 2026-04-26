import { prisma } from '../../../prisma.js'
import type { CrateResolvers } from './../../types.generated.js'
export const Crate: CrateResolvers = {
  rarityDrops: async (parent, _arg, _ctx) => {
    return await prisma.crateRarityDrop.findMany({where: {
      crateId: parent.id as string
    }})
  }
}

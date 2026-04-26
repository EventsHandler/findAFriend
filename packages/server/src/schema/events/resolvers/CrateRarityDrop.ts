import { prisma } from '../../../prisma.js'
import type { CrateRarityDropResolvers } from './../../types.generated.js'
export const CrateRarityDrop: CrateRarityDropResolvers = {
  crate: async (parent, _arg, _ctx) => {
    return await prisma.crate.findUnique({where: {
      id: parent.crateId
    }})
  }
}

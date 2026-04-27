import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'
export const userCrate: NonNullable<QueryResolvers['userCrate']> = async (_parent, {userId, crateId}, _ctx) => {
  const crate = await prisma.crateInventory.findUnique({
    where: {
      userId_crateId: {
        userId,
        crateId
      }
    }
  })
  if(!crate){
    throw new Error('Crate inexistent')
  }
  return crate
}

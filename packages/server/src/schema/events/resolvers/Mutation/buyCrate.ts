import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
export const buyCrate: NonNullable<MutationResolvers['buyCrate']> = async (_parent, { userId, crateId, quantity }, _ctx) => {
  await prisma.crateInventory.upsert({
    where: {
      userId_crateId: {
        userId,
        crateId
      }
    },
    update: {
      quantity: {
        increment: quantity
      }
    },
    create: {
      userId,
      crateId,
      quantity
    }
  })

  return true
}

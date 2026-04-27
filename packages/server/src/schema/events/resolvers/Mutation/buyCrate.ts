import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
export const buyCrate: NonNullable<MutationResolvers['buyCrate']> = async (
  _parent,
  { userId, crateId, quantity },
  _ctx,
) => {
  return await prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    })
    if (!user) throw new Error('User not found')

    const crate = await tx.crate.findUnique({
      where: { id: crateId },
    })
    if (!crate) throw new Error('Crate not found')

    const price = crate.price * quantity

    if (user.points < price) {
      throw new Error('Not enouhg points')
    }

    await tx.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: price,
        },
      },
    })
    await tx.crateInventory.upsert({
      where: {
        userId_crateId: {
          userId,
          crateId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        crateId,
        quantity,
      },
    })
    return true
  })
}

// import { prisma } from '../../../../prisma.js'
// import type { MutationResolvers } from './../../../types.generated.js'
// export const buyCrate: NonNullable<MutationResolvers['buyCrate']> = async (_parent, { userId, crateId, quantity }, _ctx) => {
//   await prisma.crateInventory.upsert({
//     where: {
//       userId_crateId: {
//         userId,
//         crateId
//       }
//     },
//     update: {
//       quantity: {
//         increment: quantity
//       }
//     },
//     create: {
//       userId,
//       crateId,
//       quantity
//     }
//   })

//   return true
// }

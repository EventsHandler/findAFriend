import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
export const addPoints: NonNullable<MutationResolvers['addPoints']> = async (_parent, {userId, amount}, _ctx) => { await prisma.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: amount,
        },
      },
    })

    return true
}
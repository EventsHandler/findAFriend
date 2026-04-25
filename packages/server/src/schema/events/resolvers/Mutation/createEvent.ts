import { prisma } from '../../../../prisma'
import type { MutationResolvers } from './../../../types.generated.js'

export const createEvent: NonNullable<MutationResolvers['createEvent']> = async (_parent, { name }, _ctx) => {
  return await prisma.event.create({
    data: {
      name,
    },
  })
}

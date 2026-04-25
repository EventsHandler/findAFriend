import { prisma } from '../../../../prisma'
import type { QueryResolvers } from './../../../types.generated.js'

export const events: NonNullable<QueryResolvers['events']> = async (_parent, { filter }, _ctx) => {
  return prisma.event.findMany({
    where: !filter
      ? {}
      : {
          name: {
            contains: filter,
            mode: 'insensitive',
          },
        },
  })
}

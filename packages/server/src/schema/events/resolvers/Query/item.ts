import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'
export const item: NonNullable<QueryResolvers['item']> = async (_parent, {id}, _ctx) => {
  return await prisma.item.findUnique({
    where: { id }
  })
}

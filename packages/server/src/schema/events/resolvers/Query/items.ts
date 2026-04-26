import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'
export const items: NonNullable<QueryResolvers['items']> = async (_parent, _arg, _ctx) => {
  return await prisma.item.findMany()
}

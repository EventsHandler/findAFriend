import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'
export const crates: NonNullable<QueryResolvers['crates']> = async (_parent, _arg, _ctx) => {
  return await prisma.crate.findMany()
}

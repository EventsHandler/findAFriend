import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'
export const crate: NonNullable<QueryResolvers['crate']> = async (_parent, {id}, _ctx) => {
  return await prisma.crate.findUnique({
    where: { id },
  })
}

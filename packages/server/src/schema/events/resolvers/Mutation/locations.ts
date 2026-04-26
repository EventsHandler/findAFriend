import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
export const locations: NonNullable<MutationResolvers['locations']> = async (_parent, _arg, _ctx) => {
  return await prisma.location.findMany()
}

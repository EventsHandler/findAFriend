import { prisma } from '../../../../prisma.js';
import type { QueryResolvers } from './../../../types.generated.js'
export const locations: NonNullable<QueryResolvers['locations']> = async (_parent, _arg, _ctx) => {
  return await prisma.location.findMany();
}

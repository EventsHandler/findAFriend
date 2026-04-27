import { prisma } from '../../../prisma.js'
import type { MissionResolvers } from './../../types.generated.js'

export const Mission: MissionResolvers = {
  location: async (parent, _arg, _ctx) => {
    const id = parent.locationId as string | null | undefined
    if (!id) return null
    return prisma.location.findUnique({ where: { id } })
  },
}

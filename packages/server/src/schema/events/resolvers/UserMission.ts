import { prisma } from '../../../prisma.js'
import type { UserMissionResolvers } from './../../types.generated.js'

export const UserMission: UserMissionResolvers = {
  lockedUntil: (parent) => {
    const d = parent.lockedUntil as Date | null | undefined
    return d ? d.toISOString() : null
  },
  mission: async (parent, _arg, _ctx) => {
    return prisma.mission.findUniqueOrThrow({ where: { id: parent.missionId as string } })
  },
}

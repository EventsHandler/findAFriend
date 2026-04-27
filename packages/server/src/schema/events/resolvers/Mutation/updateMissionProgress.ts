import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'

// Manual progress updates are disabled.
// Progress is advanced server-side based on verifiable events (GPS updates + chat).

export const updateMissionProgress: NonNullable<MutationResolvers['updateMissionProgress']> = async (
  _parent,
  { userMissionId, progress },
  { user },
) => {
  if (!user) throw new Error('Unauthorized')
  void userMissionId
  void progress

  // Keep the Prisma import referenced (tsc/noUnusedLocals in some setups).
  void prisma

  throw new Error('Manual quest progress is disabled. Progress is tracked automatically.')
}

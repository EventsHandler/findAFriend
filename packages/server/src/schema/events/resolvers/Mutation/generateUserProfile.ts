import { generateUserProfile as generate } from '../../../../ai.js'
import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'

export const generateUserProfile: NonNullable<MutationResolvers['generateUserProfile']> = async (
  _parent,
  _arg,
  _ctx,
) => {
    if(!_ctx.user?.id) {
        throw new Error("Unauthorized: cannot generate profile for another user")
    }
    await generate(_ctx.user.id as string, _arg.description)
    const user = await prisma.user.findUnique({
      where: { id: _ctx.user.id },
    })
    if(!user) {
        throw new Error("User not found after profile generation")
    }
    return user
}

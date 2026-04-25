import type { QueryResolvers } from './../../../types.generated'
export const me: NonNullable<QueryResolvers['me']> = async (_parent, _arg, { user }) => {
  return user
}

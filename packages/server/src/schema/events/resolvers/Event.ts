import type { EventResolvers } from './../../types.generated.js'

export const Event: EventResolvers = {
  derived: async (_parent, _arg, _ctx) => {
    return 'This can be dynamically computed if not part of the mapped typescript type'
  },
}

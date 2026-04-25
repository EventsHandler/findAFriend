/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
import type { Resolvers } from './types.generated.js'
import { events as Query_events } from './events/resolvers/Query/events.js'
import { createEvent as Mutation_createEvent } from './events/resolvers/Mutation/createEvent.js'
import { Event } from './events/resolvers/Event.js'
export const resolvers: Resolvers = {
  Query: { events: Query_events },
  Mutation: { createEvent: Mutation_createEvent },

  Event: Event,
}

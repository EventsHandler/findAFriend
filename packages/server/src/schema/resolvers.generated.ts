/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
import type { Resolvers } from './types.generated.js'
import { events as Query_events } from './events/resolvers/Query/events.js'
import { locations as Query_locations } from './events/resolvers/Query/locations.js'
import { createEvent as Mutation_createEvent } from './events/resolvers/Mutation/createEvent.js'
import { Event } from './events/resolvers/Event.js'
import { Location } from './events/resolvers/Location.js'
import { User } from './events/resolvers/User.js'
export const resolvers: Resolvers = {
  Query: { events: Query_events, locations: Query_locations },
  Mutation: { createEvent: Mutation_createEvent },

  Event: Event,
  Location: Location,
  User: User,
}

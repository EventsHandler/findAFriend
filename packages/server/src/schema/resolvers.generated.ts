/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
import type { Resolvers } from './types.generated.js'
import { events as Query_events } from './events/resolvers/Query/events.js'
import { locations as Query_locations } from './events/resolvers/Query/locations.js'
import { me as Query_me } from './events/resolvers/Query/me.js'
import { createEvent as Mutation_createEvent } from './events/resolvers/Mutation/createEvent.js'
import { login as Mutation_login } from './events/resolvers/Mutation/login.js'
import { register as Mutation_register } from './events/resolvers/Mutation/register.js'
import { AuthPayload } from './events/resolvers/AuthPayload.js'
import { Event } from './events/resolvers/Event.js'
import { Location } from './events/resolvers/Location.js'
import { User } from './events/resolvers/User.js'
export const resolvers: Resolvers = {
  Query: { events: Query_events, locations: Query_locations, me: Query_me },
  Mutation: { createEvent: Mutation_createEvent, login: Mutation_login, register: Mutation_register },

  AuthPayload: AuthPayload,
  Event: Event,
  Location: Location,
  User: User,
}

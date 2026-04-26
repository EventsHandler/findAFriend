/* This file was automatically generated. DO NOT UPDATE MANUALLY. */
import type { Resolvers } from './types.generated.js'
import { crate as Query_crate } from './events/resolvers/Query/crate.js'
import { crates as Query_crates } from './events/resolvers/Query/crates.js'
import { item as Query_item } from './events/resolvers/Query/item.js'
import { items as Query_items } from './events/resolvers/Query/items.js'
import { locationUsers as Query_locationUsers } from './events/resolvers/Query/locationUsers.js'
import { locations as Query_locations } from './events/resolvers/Query/locations.js'
import { me as Query_me } from './events/resolvers/Query/me.js'
import { userCrates as Query_userCrates } from './events/resolvers/Query/userCrates.js'
import { userItems as Query_userItems } from './events/resolvers/Query/userItems.js'
import { buyCrate as Mutation_buyCrate } from './events/resolvers/Mutation/buyCrate.js'
import { joinRoom as Mutation_joinRoom } from './events/resolvers/Mutation/joinRoom.js'
import { leaveRoom as Mutation_leaveRoom } from './events/resolvers/Mutation/leaveRoom.js'
import { locations as Mutation_locations } from './events/resolvers/Mutation/locations.js'
import { login as Mutation_login } from './events/resolvers/Mutation/login.js'
import { openCrate as Mutation_openCrate } from './events/resolvers/Mutation/openCrate.js'
import { register as Mutation_register } from './events/resolvers/Mutation/register.js'
import { updatePosition as Mutation_updatePosition } from './events/resolvers/Mutation/updatePosition.js'
import { AuthPayload } from './events/resolvers/AuthPayload.js'
import { Crate } from './events/resolvers/Crate.js'
import { CrateInventory } from './events/resolvers/CrateInventory.js'
import { CrateRarityDrop } from './events/resolvers/CrateRarityDrop.js'
import { Item } from './events/resolvers/Item.js'
import { ItemInventory } from './events/resolvers/ItemInventory.js'
import { Location } from './events/resolvers/Location.js'
import { User } from './events/resolvers/User.js'
export const resolvers: Resolvers = {
  Query: {
    crate: Query_crate,
    crates: Query_crates,
    item: Query_item,
    items: Query_items,
    locationUsers: Query_locationUsers,
    locations: Query_locations,
    me: Query_me,
    userCrates: Query_userCrates,
    userItems: Query_userItems,
  },
  Mutation: {
    buyCrate: Mutation_buyCrate,
    joinRoom: Mutation_joinRoom,
    leaveRoom: Mutation_leaveRoom,
    locations: Mutation_locations,
    login: Mutation_login,
    openCrate: Mutation_openCrate,
    register: Mutation_register,
    updatePosition: Mutation_updatePosition,
  },

  AuthPayload: AuthPayload,
  Crate: Crate,
  CrateInventory: CrateInventory,
  CrateRarityDrop: CrateRarityDrop,
  Item: Item,
  ItemInventory: ItemInventory,
  Location: Location,
  User: User,
}

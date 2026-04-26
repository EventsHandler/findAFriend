/* eslint-disable */
import * as types from './graphql'
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
<<<<<<< HEAD
  'mutation Login($name: String!, $password: String!) {\n  login(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation Register($name: String!, $password: String!) {\n  register(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}': typeof types.LoginDocument
  'query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nquery LocationUsers($locationId: ID!) {\n  locationUsers(locationId: $locationId) {\n    id\n    name\n    posx\n    posy\n    locationId\n  }\n}\n\nmutation JoinRoom($locationId: ID!) {\n  joinRoom(locationId: $locationId) {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation LeaveRoom {\n  leaveRoom {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation UpdatePosition($locationId: ID!, $lat: Float!, $lng: Float!) {\n  updatePosition(locationId: $locationId, lat: $lat, lng: $lng) {\n    id\n    locationId\n    posx\n    posy\n  }\n}': typeof types.LocationsDocument
=======
  'mutation Login($name: String!, $password: String!) {\n  login(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation Register($name: String!, $password: String!) {\n  register(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation AddPoints($userId: ID!, $amount: Int!) {\n  addPoints(userId: $userId, amount: $amount)\n}\n\nmutation OpenCrate($userId: ID!, $crateId: ID!) {\n  openCrate(userId: $userId, crateId: $crateId) {\n    id\n    name\n    rarity\n  }\n}': typeof types.LoginDocument
  'query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    points\n  }\n}\n\nquery Crates {\n  crates {\n    id\n    name\n    price\n    rarity\n  }\n}': typeof types.LocationsDocument
>>>>>>> d860fc1 (shop implementation in progress)
}
const documents: Documents = {
  'mutation Login($name: String!, $password: String!) {\n  login(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation Register($name: String!, $password: String!) {\n  register(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation AddPoints($userId: ID!, $amount: Int!) {\n  addPoints(userId: $userId, amount: $amount)\n}\n\nmutation OpenCrate($userId: ID!, $crateId: ID!) {\n  openCrate(userId: $userId, crateId: $crateId) {\n    id\n    name\n    rarity\n  }\n}':
    types.LoginDocument,
<<<<<<< HEAD
  'query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nquery LocationUsers($locationId: ID!) {\n  locationUsers(locationId: $locationId) {\n    id\n    name\n    posx\n    posy\n    locationId\n  }\n}\n\nmutation JoinRoom($locationId: ID!) {\n  joinRoom(locationId: $locationId) {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation LeaveRoom {\n  leaveRoom {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation UpdatePosition($locationId: ID!, $lat: Float!, $lng: Float!) {\n  updatePosition(locationId: $locationId, lat: $lat, lng: $lng) {\n    id\n    locationId\n    posx\n    posy\n  }\n}':
=======
  'query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    points\n  }\n}\n\nquery Crates {\n  crates {\n    id\n    name\n    price\n    rarity\n  }\n}':
>>>>>>> d860fc1 (shop implementation in progress)
    types.LocationsDocument,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: 'mutation Login($name: String!, $password: String!) {\n  login(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation Register($name: String!, $password: String!) {\n  register(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation AddPoints($userId: ID!, $amount: Int!) {\n  addPoints(userId: $userId, amount: $amount)\n}\n\nmutation OpenCrate($userId: ID!, $crateId: ID!) {\n  openCrate(userId: $userId, crateId: $crateId) {\n    id\n    name\n    rarity\n  }\n}',
): (typeof documents)['mutation Login($name: String!, $password: String!) {\n  login(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation Register($name: String!, $password: String!) {\n  register(name: $name, password: $password) {\n    token\n    user {\n      id\n      name\n    }\n  }\n}\n\nmutation AddPoints($userId: ID!, $amount: Int!) {\n  addPoints(userId: $userId, amount: $amount)\n}\n\nmutation OpenCrate($userId: ID!, $crateId: ID!) {\n  openCrate(userId: $userId, crateId: $crateId) {\n    id\n    name\n    rarity\n  }\n}']
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
<<<<<<< HEAD
  source: 'query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nquery LocationUsers($locationId: ID!) {\n  locationUsers(locationId: $locationId) {\n    id\n    name\n    posx\n    posy\n    locationId\n  }\n}\n\nmutation JoinRoom($locationId: ID!) {\n  joinRoom(locationId: $locationId) {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation LeaveRoom {\n  leaveRoom {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation UpdatePosition($locationId: ID!, $lat: Float!, $lng: Float!) {\n  updatePosition(locationId: $locationId, lat: $lat, lng: $lng) {\n    id\n    locationId\n    posx\n    posy\n  }\n}',
): (typeof documents)['query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nquery LocationUsers($locationId: ID!) {\n  locationUsers(locationId: $locationId) {\n    id\n    name\n    posx\n    posy\n    locationId\n  }\n}\n\nmutation JoinRoom($locationId: ID!) {\n  joinRoom(locationId: $locationId) {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation LeaveRoom {\n  leaveRoom {\n    id\n    name\n    locationId\n    posx\n    posy\n  }\n}\n\nmutation UpdatePosition($locationId: ID!, $lat: Float!, $lng: Float!) {\n  updatePosition(locationId: $locationId, lat: $lat, lng: $lng) {\n    id\n    locationId\n    posx\n    posy\n  }\n}']
=======
  source: 'query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    points\n  }\n}\n\nquery Crates {\n  crates {\n    id\n    name\n    price\n    rarity\n  }\n}',
): (typeof documents)['query Locations {\n  locations {\n    id\n    name\n    posx\n    posy\n  }\n}\n\nquery Me {\n  me {\n    id\n    name\n    points\n  }\n}\n\nquery Crates {\n  crates {\n    id\n    name\n    price\n    rarity\n  }\n}']
>>>>>>> d860fc1 (shop implementation in progress)

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never

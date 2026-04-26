/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type AuthPayload = {
  __typename?: 'AuthPayload'
  token: Scalars['String']['output']
  user: User
}

export type Crate = {
  __typename?: 'Crate'
  chance: Scalars['Float']['output']
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  rarity: RarityType
  rarityDrops?: Maybe<Array<CrateRarityDrop>>
}

export type CrateInventory = {
  __typename?: 'CrateInventory'
  crate?: Maybe<Crate>
  crateId: Scalars['String']['output']
  id: Scalars['ID']['output']
  quantity: Scalars['Int']['output']
  user?: Maybe<User>
  userId: Scalars['String']['output']
}

export type CrateRarityDrop = {
  __typename?: 'CrateRarityDrop'
  chance: Scalars['Float']['output']
  crate?: Maybe<Crate>
  crateId: Scalars['String']['output']
  id: Scalars['ID']['output']
  rarity: RarityType
}

export type Item = {
  __typename?: 'Item'
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  rarity: RarityType
}

export type ItemInventory = {
  __typename?: 'ItemInventory'
  id: Scalars['ID']['output']
  item?: Maybe<Item>
  itemId: Scalars['String']['output']
  quantity: Scalars['Int']['output']
  user?: Maybe<User>
  userId: Scalars['String']['output']
}

export type Location = {
  __typename?: 'Location'
  id: Scalars['ID']['output']
  name: Scalars['String']['output']
  posx: Scalars['Float']['output']
  posy: Scalars['Float']['output']
}

export type Mutation = {
  __typename?: 'Mutation'
  buyCrate: Scalars['Boolean']['output']
  joinRoom: User
  leaveRoom: User
  locations?: Maybe<Array<Location>>
  login: AuthPayload
  openCrate: Item
  register: AuthPayload
  updatePosition: User
}

export type MutationBuyCrateArgs = {
  crateId: Scalars['ID']['input']
  quantity: Scalars['Int']['input']
  userId: Scalars['ID']['input']
}

export type MutationJoinRoomArgs = {
  locationId: Scalars['ID']['input']
}

export type MutationLoginArgs = {
  name: Scalars['String']['input']
  password: Scalars['String']['input']
}

export type MutationOpenCrateArgs = {
  crateId: Scalars['ID']['input']
  userId: Scalars['ID']['input']
}

export type MutationRegisterArgs = {
  name: Scalars['String']['input']
  password: Scalars['String']['input']
}

export type MutationUpdatePositionArgs = {
  lat: Scalars['Float']['input']
  lng: Scalars['Float']['input']
  locationId: Scalars['ID']['input']
}

export type Query = {
  __typename?: 'Query'
  crate?: Maybe<Crate>
  crates: Array<Crate>
  item?: Maybe<Item>
  items: Array<Item>
  locationUsers: Array<User>
  locations: Array<Location>
  me?: Maybe<User>
  userCrates: Array<CrateInventory>
  userItems: Array<ItemInventory>
}

export type QueryCrateArgs = {
  id: Scalars['ID']['input']
}

export type QueryItemArgs = {
  id: Scalars['ID']['input']
}

export type QueryLocationUsersArgs = {
  locationId: Scalars['ID']['input']
}

export type QueryUserCratesArgs = {
  userId: Scalars['ID']['input']
}

export type QueryUserItemsArgs = {
  userId: Scalars['ID']['input']
}

export const RarityType = {
  Common: 'COMMON',
  Epic: 'EPIC',
  Legendary: 'LEGENDARY',
} as const

export type RarityType = (typeof RarityType)[keyof typeof RarityType]
export type User = {
  __typename?: 'User'
  crateInventories?: Maybe<Array<CrateInventory>>
  id: Scalars['ID']['output']
  inventories?: Maybe<Array<ItemInventory>>
  locationId?: Maybe<Scalars['ID']['output']>
  name: Scalars['String']['output']
  posx?: Maybe<Scalars['Float']['output']>
  posy?: Maybe<Scalars['Float']['output']>
}

export type LoginMutationVariables = Exact<{
  name: Scalars['String']['input']
  password: Scalars['String']['input']
}>

export type LoginMutation = {
  __typename?: 'Mutation'
  login: { __typename?: 'AuthPayload'; token: string; user: { __typename?: 'User'; id: string; name: string } }
}

export type RegisterMutationVariables = Exact<{
  name: Scalars['String']['input']
  password: Scalars['String']['input']
}>

export type RegisterMutation = {
  __typename?: 'Mutation'
  register: { __typename?: 'AuthPayload'; token: string; user: { __typename?: 'User'; id: string; name: string } }
}

export type LocationsQueryVariables = Exact<{ [key: string]: never }>

export type LocationsQuery = {
  __typename?: 'Query'
  locations: Array<{ __typename?: 'Location'; id: string; name: string; posx: number; posy: number }>
}

export type MeQueryVariables = Exact<{ [key: string]: never }>

export type MeQuery = {
  __typename?: 'Query'
  me?: {
    __typename?: 'User'
    id: string
    name: string
    locationId?: string | null
    posx?: number | null
    posy?: number | null
  } | null
}

export type LocationUsersQueryVariables = Exact<{
  locationId: Scalars['ID']['input']
}>

export type LocationUsersQuery = {
  __typename?: 'Query'
  locationUsers: Array<{
    __typename?: 'User'
    id: string
    name: string
    posx?: number | null
    posy?: number | null
    locationId?: string | null
  }>
}

export type JoinRoomMutationVariables = Exact<{
  locationId: Scalars['ID']['input']
}>

export type JoinRoomMutation = {
  __typename?: 'Mutation'
  joinRoom: {
    __typename?: 'User'
    id: string
    name: string
    locationId?: string | null
    posx?: number | null
    posy?: number | null
  }
}

export type LeaveRoomMutationVariables = Exact<{ [key: string]: never }>

export type LeaveRoomMutation = {
  __typename?: 'Mutation'
  leaveRoom: {
    __typename?: 'User'
    id: string
    name: string
    locationId?: string | null
    posx?: number | null
    posy?: number | null
  }
}

export type UpdatePositionMutationVariables = Exact<{
  locationId: Scalars['ID']['input']
  lat: Scalars['Float']['input']
  lng: Scalars['Float']['input']
}>

export type UpdatePositionMutation = {
  __typename?: 'Mutation'
  updatePosition: {
    __typename?: 'User'
    id: string
    locationId?: string | null
    posx?: number | null
    posy?: number | null
  }
}

export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Login' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'login' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'name' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>
export const RegisterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Register' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'register' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'name' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>
export const LocationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Locations' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'locations' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posy' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LocationsQuery, LocationsQueryVariables>
export const MeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Me' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'me' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'locationId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posy' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>
export const LocationUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'LocationUsers' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'locationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'locationUsers' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locationId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locationId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'locationId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LocationUsersQuery, LocationUsersQueryVariables>
export const JoinRoomDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'JoinRoom' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'locationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'joinRoom' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locationId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locationId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'locationId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posy' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JoinRoomMutation, JoinRoomMutationVariables>
export const LeaveRoomDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'LeaveRoom' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'leaveRoom' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'locationId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posy' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LeaveRoomMutation, LeaveRoomMutationVariables>
export const UpdatePositionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePosition' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'locationId' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'lat' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'lng' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePosition' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locationId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'locationId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'lat' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'lat' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'lng' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'lng' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'locationId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posx' } },
                { kind: 'Field', name: { kind: 'Name', value: 'posy' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdatePositionMutation, UpdatePositionMutationVariables>

import { GraphQLResolveInfo } from 'graphql'
import { UserContext } from '../types/context.js'
export type Maybe<T> = T | null | undefined
export type InputMaybe<T> = T | null | undefined
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never }
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string | number }
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
  id: Scalars['ID']['output']
  quantity: Scalars['Int']['output']
  user?: Maybe<User>
}

export type CrateRarityDrop = {
  __typename?: 'CrateRarityDrop'
  chance: Scalars['Float']['output']
  crate?: Maybe<Crate>
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
  quantity: Scalars['Int']['output']
  user?: Maybe<User>
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

export type MutationbuyCrateArgs = {
  crateId: Scalars['ID']['input']
  quantity: Scalars['Int']['input']
  userId: Scalars['ID']['input']
}

export type MutationjoinRoomArgs = {
  locationId: Scalars['ID']['input']
}

export type MutationloginArgs = {
  name: Scalars['String']['input']
  password: Scalars['String']['input']
}

export type MutationopenCrateArgs = {
  crateId: Scalars['ID']['input']
  userId: Scalars['ID']['input']
}

export type MutationregisterArgs = {
  name: Scalars['String']['input']
  password: Scalars['String']['input']
}

export type MutationupdatePositionArgs = {
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

export type QuerycrateArgs = {
  id: Scalars['ID']['input']
}

export type QueryitemArgs = {
  id: Scalars['ID']['input']
}

export type QuerylocationUsersArgs = {
  locationId: Scalars['ID']['input']
}

export type QueryuserCratesArgs = {
  userId: Scalars['ID']['input']
}

export type QueryuserItemsArgs = {
  userId: Scalars['ID']['input']
}

export type RarityType = 'COMMON' | 'EPIC' | 'LEGENDARY'

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

export type ResolverTypeWrapper<T> = Promise<T> | T

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AuthPayload: ResolverTypeWrapper<Omit<AuthPayload, 'user'> & { user: ResolversTypes['User'] }>
  String: ResolverTypeWrapper<Scalars['String']['output']>
  Crate: ResolverTypeWrapper<
    Omit<Crate, 'rarity' | 'rarityDrops'> & {
      rarity: ResolversTypes['RarityType']
      rarityDrops?: Maybe<Array<ResolversTypes['CrateRarityDrop']>>
    }
  >
  Float: ResolverTypeWrapper<Scalars['Float']['output']>
  ID: ResolverTypeWrapper<Scalars['ID']['output']>
  CrateInventory: ResolverTypeWrapper<
    Omit<CrateInventory, 'crate' | 'user'> & {
      crate?: Maybe<ResolversTypes['Crate']>
      user?: Maybe<ResolversTypes['User']>
    }
  >
  Int: ResolverTypeWrapper<Scalars['Int']['output']>
  CrateRarityDrop: ResolverTypeWrapper<
    Omit<CrateRarityDrop, 'crate' | 'rarity'> & {
      crate?: Maybe<ResolversTypes['Crate']>
      rarity: ResolversTypes['RarityType']
    }
  >
  Item: ResolverTypeWrapper<Omit<Item, 'rarity'> & { rarity: ResolversTypes['RarityType'] }>
  ItemInventory: ResolverTypeWrapper<
    Omit<ItemInventory, 'item' | 'user'> & {
      item?: Maybe<ResolversTypes['Item']>
      user?: Maybe<ResolversTypes['User']>
    }
  >
  Location: ResolverTypeWrapper<Location>
  Mutation: ResolverTypeWrapper<{}>
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>
  Query: ResolverTypeWrapper<{}>
  RarityType: ResolverTypeWrapper<'COMMON' | 'EPIC' | 'LEGENDARY'>
  User: ResolverTypeWrapper<
    Omit<User, 'crateInventories' | 'inventories'> & {
      crateInventories?: Maybe<Array<ResolversTypes['CrateInventory']>>
      inventories?: Maybe<Array<ResolversTypes['ItemInventory']>>
    }
  >
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AuthPayload: Omit<AuthPayload, 'user'> & { user: ResolversParentTypes['User'] }
  String: Scalars['String']['output']
  Crate: Omit<Crate, 'rarityDrops'> & { rarityDrops?: Maybe<Array<ResolversParentTypes['CrateRarityDrop']>> }
  Float: Scalars['Float']['output']
  ID: Scalars['ID']['output']
  CrateInventory: Omit<CrateInventory, 'crate' | 'user'> & {
    crate?: Maybe<ResolversParentTypes['Crate']>
    user?: Maybe<ResolversParentTypes['User']>
  }
  Int: Scalars['Int']['output']
  CrateRarityDrop: Omit<CrateRarityDrop, 'crate'> & { crate?: Maybe<ResolversParentTypes['Crate']> }
  Item: Item
  ItemInventory: Omit<ItemInventory, 'item' | 'user'> & {
    item?: Maybe<ResolversParentTypes['Item']>
    user?: Maybe<ResolversParentTypes['User']>
  }
  Location: Location
  Mutation: {}
  Boolean: Scalars['Boolean']['output']
  Query: {}
  User: Omit<User, 'crateInventories' | 'inventories'> & {
    crateInventories?: Maybe<Array<ResolversParentTypes['CrateInventory']>>
    inventories?: Maybe<Array<ResolversParentTypes['ItemInventory']>>
  }
}

export type AuthPayloadResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload'],
> = {
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type CrateResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['Crate'] = ResolversParentTypes['Crate'],
> = {
  chance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  rarity?: Resolver<ResolversTypes['RarityType'], ParentType, ContextType>
  rarityDrops?: Resolver<Maybe<Array<ResolversTypes['CrateRarityDrop']>>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type CrateInventoryResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['CrateInventory'] = ResolversParentTypes['CrateInventory'],
> = {
  crate?: Resolver<Maybe<ResolversTypes['Crate']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type CrateRarityDropResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['CrateRarityDrop'] = ResolversParentTypes['CrateRarityDrop'],
> = {
  chance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  crate?: Resolver<Maybe<ResolversTypes['Crate']>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  rarity?: Resolver<ResolversTypes['RarityType'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type ItemResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['Item'] = ResolversParentTypes['Item'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  rarity?: Resolver<ResolversTypes['RarityType'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type ItemInventoryResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['ItemInventory'] = ResolversParentTypes['ItemInventory'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  item?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType>
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type LocationResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  posx?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  posy?: Resolver<ResolversTypes['Float'], ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type MutationResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
  buyCrate?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationbuyCrateArgs, 'crateId' | 'quantity' | 'userId'>
  >
  joinRoom?: Resolver<
    ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<MutationjoinRoomArgs, 'locationId'>
  >
  leaveRoom?: Resolver<ResolversTypes['User'], ParentType, ContextType>
  locations?: Resolver<Maybe<Array<ResolversTypes['Location']>>, ParentType, ContextType>
  login?: Resolver<
    ResolversTypes['AuthPayload'],
    ParentType,
    ContextType,
    RequireFields<MutationloginArgs, 'name' | 'password'>
  >
  openCrate?: Resolver<
    ResolversTypes['Item'],
    ParentType,
    ContextType,
    RequireFields<MutationopenCrateArgs, 'crateId' | 'userId'>
  >
  register?: Resolver<
    ResolversTypes['AuthPayload'],
    ParentType,
    ContextType,
    RequireFields<MutationregisterArgs, 'name' | 'password'>
  >
  updatePosition?: Resolver<
    ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<MutationupdatePositionArgs, 'lat' | 'lng' | 'locationId'>
  >
}

export type QueryResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
  crate?: Resolver<Maybe<ResolversTypes['Crate']>, ParentType, ContextType, RequireFields<QuerycrateArgs, 'id'>>
  crates?: Resolver<Array<ResolversTypes['Crate']>, ParentType, ContextType>
  item?: Resolver<Maybe<ResolversTypes['Item']>, ParentType, ContextType, RequireFields<QueryitemArgs, 'id'>>
  items?: Resolver<Array<ResolversTypes['Item']>, ParentType, ContextType>
  locationUsers?: Resolver<
    Array<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<QuerylocationUsersArgs, 'locationId'>
  >
  locations?: Resolver<Array<ResolversTypes['Location']>, ParentType, ContextType>
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>
  userCrates?: Resolver<
    Array<ResolversTypes['CrateInventory']>,
    ParentType,
    ContextType,
    RequireFields<QueryuserCratesArgs, 'userId'>
  >
  userItems?: Resolver<
    Array<ResolversTypes['ItemInventory']>,
    ParentType,
    ContextType,
    RequireFields<QueryuserItemsArgs, 'userId'>
  >
}

export type RarityTypeResolvers = EnumResolverSignature<
  { COMMON?: any; EPIC?: any; LEGENDARY?: any },
  ResolversTypes['RarityType']
>

export type UserResolvers<
  ContextType = UserContext,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'],
> = {
  crateInventories?: Resolver<Maybe<Array<ResolversTypes['CrateInventory']>>, ParentType, ContextType>
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>
  inventories?: Resolver<Maybe<Array<ResolversTypes['ItemInventory']>>, ParentType, ContextType>
  locationId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>
  posx?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  posy?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>
}

export type Resolvers<ContextType = UserContext> = {
  AuthPayload?: AuthPayloadResolvers<ContextType>
  Crate?: CrateResolvers<ContextType>
  CrateInventory?: CrateInventoryResolvers<ContextType>
  CrateRarityDrop?: CrateRarityDropResolvers<ContextType>
  Item?: ItemResolvers<ContextType>
  ItemInventory?: ItemInventoryResolvers<ContextType>
  Location?: LocationResolvers<ContextType>
  Mutation?: MutationResolvers<ContextType>
  Query?: QueryResolvers<ContextType>
  RarityType?: RarityTypeResolvers
  User?: UserResolvers<ContextType>
}

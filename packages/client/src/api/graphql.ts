/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Crate = {
  __typename?: 'Crate';
  chance: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Int']['output'];
  rarity: RarityType;
  rarityDrops?: Maybe<Array<CrateRarityDrop>>;
};

export type CrateInventory = {
  __typename?: 'CrateInventory';
  crate?: Maybe<Crate>;
  crateId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type CrateRarityDrop = {
  __typename?: 'CrateRarityDrop';
  chance: Scalars['Float']['output'];
  crate?: Maybe<Crate>;
  crateId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  rarity: RarityType;
};

export const InterestTag = {
  Adventure: 'ADVENTURE',
  Art: 'ART',
  Culture: 'CULTURE',
  Entertainment: 'ENTERTAINMENT',
  Food: 'FOOD',
  History: 'HISTORY',
  Nature: 'NATURE',
  Relaxation: 'RELAXATION',
  Shopping: 'SHOPPING',
  Sports: 'SPORTS'
} as const;

export type InterestTag = typeof InterestTag[keyof typeof InterestTag];
export type Item = {
  __typename?: 'Item';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rarity: RarityType;
  svgId: Scalars['String']['output'];
};

export type ItemInventory = {
  __typename?: 'ItemInventory';
  id: Scalars['ID']['output'];
  item?: Maybe<Item>;
  itemId: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type Location = {
  __typename?: 'Location';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  posx: Scalars['Float']['output'];
  posy: Scalars['Float']['output'];
  tag: LocationTag;
};

export const LocationTag = {
  Landmark: 'LANDMARK',
  Park: 'PARK',
  Restaurant: 'RESTAURANT'
} as const;

export type LocationTag = typeof LocationTag[keyof typeof LocationTag];
export type Mission = {
  __typename?: 'Mission';
  completionKind: MissionCompletionKind;
  cooldownHours: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  distanceMeters?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Location>;
  locationId?: Maybe<Scalars['ID']['output']>;
  repeatable: Scalars['Boolean']['output'];
  rewardXp: Scalars['Int']['output'];
  staySeconds?: Maybe<Scalars['Int']['output']>;
  targetProgress: Scalars['Int']['output'];
  timerSeconds?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
};

export const MissionCompletionKind = {
  ChatCount: 'CHAT_COUNT',
  ManualConfirm: 'MANUAL_CONFIRM',
  Photo: 'PHOTO',
  StayTime: 'STAY_TIME',
  Timed: 'TIMED',
  WalkDistance: 'WALK_DISTANCE'
} as const;

export type MissionCompletionKind = typeof MissionCompletionKind[keyof typeof MissionCompletionKind];
export type Mutation = {
  __typename?: 'Mutation';
  addPoints: Scalars['Boolean']['output'];
  buyCrate: Scalars['Boolean']['output'];
  claimMission: UserMission;
  completeMission: UserMission;
  completePhotoMission: UserMission;
  generateUserProfile: User;
  joinRoom: User;
  leaveRoom: User;
  locations?: Maybe<Array<Location>>;
  login: AuthPayload;
  openCrate: Item;
  register: AuthPayload;
  startTimedMission: UserMission;
  updateMissionProgress: UserMission;
  updatePosition: User;
};


export type MutationAddPointsArgs = {
  amount: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationBuyCrateArgs = {
  crateId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationClaimMissionArgs = {
  missionId: Scalars['ID']['input'];
};


export type MutationCompleteMissionArgs = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
  missionId: Scalars['ID']['input'];
};


export type MutationCompletePhotoMissionArgs = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
  missionId: Scalars['ID']['input'];
};


export type MutationGenerateUserProfileArgs = {
  description: Scalars['String']['input'];
};


export type MutationJoinRoomArgs = {
  locationId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationOpenCrateArgs = {
  crateId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRegisterArgs = {
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationStartTimedMissionArgs = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
  missionId: Scalars['ID']['input'];
};


export type MutationUpdateMissionProgressArgs = {
  progress: Scalars['Int']['input'];
  userMissionId: Scalars['ID']['input'];
};


export type MutationUpdatePositionArgs = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
  locationId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  crate?: Maybe<Crate>;
  crates: Array<Crate>;
  item?: Maybe<Item>;
  items: Array<Item>;
  locationUsers: Array<User>;
  locations: Array<Location>;
  me?: Maybe<User>;
  missions: Array<Mission>;
  userCrate: CrateInventory;
  userCrates: Array<CrateInventory>;
  userItems: Array<ItemInventory>;
};


export type QueryCrateArgs = {
  id: Scalars['ID']['input'];
};


export type QueryItemArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLocationUsersArgs = {
  locationId: Scalars['ID']['input'];
};


export type QueryMissionsArgs = {
  locationId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryUserCrateArgs = {
  crateId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryUserCratesArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryUserItemsArgs = {
  userId: Scalars['ID']['input'];
};

export type QuestCompletion = {
  __typename?: 'QuestCompletion';
  completedAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mission?: Maybe<Mission>;
  missionId: Scalars['ID']['output'];
  rewardXp: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export const RarityType = {
  Common: 'COMMON',
  Epic: 'EPIC',
  Legendary: 'LEGENDARY'
} as const;

export type RarityType = typeof RarityType[keyof typeof RarityType];
export type User = {
  __typename?: 'User';
  crateInventories?: Maybe<Array<CrateInventory>>;
  id: Scalars['ID']['output'];
  inventories?: Maybe<Array<ItemInventory>>;
  level: Scalars['Int']['output'];
  locationId?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  points: Scalars['Int']['output'];
  posx?: Maybe<Scalars['Float']['output']>;
  posy?: Maybe<Scalars['Float']['output']>;
  profileDescription: Scalars['String']['output'];
  profileTags: Array<InterestTag>;
  questHistory?: Maybe<Array<QuestCompletion>>;
  userMissions?: Maybe<Array<UserMission>>;
  xp: Scalars['Int']['output'];
};


export type UserQuestHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type UserMission = {
  __typename?: 'UserMission';
  id: Scalars['ID']['output'];
  lockedUntil?: Maybe<Scalars['String']['output']>;
  mission: Mission;
  missionId: Scalars['ID']['output'];
  progress: Scalars['Int']['output'];
  startedAt?: Maybe<Scalars['String']['output']>;
  status: UserMissionStatus;
  userId: Scalars['ID']['output'];
};

export const UserMissionStatus = {
  Active: 'ACTIVE',
  Completed: 'COMPLETED'
} as const;

export type UserMissionStatus = typeof UserMissionStatus[keyof typeof UserMissionStatus];
export type LoginMutationVariables = Exact<{
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, name: string } } };

export type RegisterMutationVariables = Exact<{
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, name: string } } };

export type AddPointsMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  amount: Scalars['Int']['input'];
}>;


export type AddPointsMutation = { __typename?: 'Mutation', addPoints: boolean };

export type OpenCrateMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  crateId: Scalars['ID']['input'];
}>;


export type OpenCrateMutation = { __typename?: 'Mutation', openCrate: { __typename?: 'Item', id: string, name: string, rarity: RarityType, svgId: string } };

export type BuyCrateMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  crateId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
}>;


export type BuyCrateMutation = { __typename?: 'Mutation', buyCrate: boolean };

export type JoinRoomMutationVariables = Exact<{
  locationId: Scalars['ID']['input'];
}>;


export type JoinRoomMutation = { __typename?: 'Mutation', joinRoom: { __typename?: 'User', id: string, name: string, locationId?: string | null, posx?: number | null, posy?: number | null, points: number } };

export type LeaveRoomMutationVariables = Exact<{ [key: string]: never; }>;


export type LeaveRoomMutation = { __typename?: 'Mutation', leaveRoom: { __typename?: 'User', id: string, name: string, locationId?: string | null, posx?: number | null, posy?: number | null, points: number } };

export type UpdatePositionMutationVariables = Exact<{
  locationId: Scalars['ID']['input'];
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
}>;


export type UpdatePositionMutation = { __typename?: 'Mutation', updatePosition: { __typename?: 'User', id: string, locationId?: string | null, posx?: number | null, posy?: number | null, points: number } };

export type ClaimMissionMutationVariables = Exact<{
  missionId: Scalars['ID']['input'];
}>;


export type ClaimMissionMutation = { __typename?: 'Mutation', claimMission: { __typename?: 'UserMission', id: string, progress: number, status: UserMissionStatus, lockedUntil?: string | null, mission: { __typename?: 'Mission', id: string, title: string, rewardXp: number, targetProgress: number, completionKind: MissionCompletionKind, distanceMeters?: number | null, staySeconds?: number | null, timerSeconds?: number | null, repeatable: boolean, cooldownHours: number } } };

export type UpdateMissionProgressMutationVariables = Exact<{
  userMissionId: Scalars['ID']['input'];
  progress: Scalars['Int']['input'];
}>;


export type UpdateMissionProgressMutation = { __typename?: 'Mutation', updateMissionProgress: { __typename?: 'UserMission', id: string, progress: number, status: UserMissionStatus, lockedUntil?: string | null, mission: { __typename?: 'Mission', id: string, rewardXp: number, targetProgress: number, completionKind: MissionCompletionKind, distanceMeters?: number | null, staySeconds?: number | null, timerSeconds?: number | null, repeatable: boolean, cooldownHours: number } } };

export type CompletePhotoMissionMutationVariables = Exact<{
  missionId: Scalars['ID']['input'];
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
}>;


export type CompletePhotoMissionMutation = { __typename?: 'Mutation', completePhotoMission: { __typename?: 'UserMission', id: string, progress: number, status: UserMissionStatus, lockedUntil?: string | null, mission: { __typename?: 'Mission', id: string, title: string, rewardXp: number, targetProgress: number, completionKind: MissionCompletionKind, distanceMeters?: number | null, staySeconds?: number | null, timerSeconds?: number | null, repeatable: boolean, cooldownHours: number } } };

export type CompleteMissionMutationVariables = Exact<{
  missionId: Scalars['ID']['input'];
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
}>;


export type CompleteMissionMutation = { __typename?: 'Mutation', completeMission: { __typename?: 'UserMission', id: string, progress: number, status: UserMissionStatus, lockedUntil?: string | null, mission: { __typename?: 'Mission', id: string, title: string, rewardXp: number, targetProgress: number, completionKind: MissionCompletionKind, distanceMeters?: number | null, staySeconds?: number | null, timerSeconds?: number | null, repeatable: boolean, cooldownHours: number } } };

export type StartTimedMissionMutationVariables = Exact<{
  missionId: Scalars['ID']['input'];
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
}>;


export type StartTimedMissionMutation = { __typename?: 'Mutation', startTimedMission: { __typename?: 'UserMission', id: string, progress: number, status: UserMissionStatus, lockedUntil?: string | null, mission: { __typename?: 'Mission', id: string, title: string, rewardXp: number, targetProgress: number, completionKind: MissionCompletionKind, distanceMeters?: number | null, staySeconds?: number | null, timerSeconds?: number | null, repeatable: boolean, cooldownHours: number } } };

export type GenerateUserProfileMutationVariables = Exact<{
  description: Scalars['String']['input'];
}>;


export type GenerateUserProfileMutation = { __typename?: 'Mutation', generateUserProfile: { __typename?: 'User', profileDescription: string, profileTags: Array<InterestTag> } };

export type LocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type LocationsQuery = { __typename?: 'Query', locations: Array<{ __typename?: 'Location', id: string, name: string, posx: number, posy: number }> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name: string, xp: number, level: number, locationId?: string | null, posx?: number | null, posy?: number | null, points: number, profileDescription: string, profileTags: Array<InterestTag>, userMissions?: Array<{ __typename?: 'UserMission', id: string, progress: number, status: UserMissionStatus, startedAt?: string | null, lockedUntil?: string | null, mission: { __typename?: 'Mission', id: string, title: string, description?: string | null, rewardXp: number, targetProgress: number, completionKind: MissionCompletionKind, distanceMeters?: number | null, staySeconds?: number | null, timerSeconds?: number | null, repeatable: boolean, cooldownHours: number } }> | null, questHistory?: Array<{ __typename?: 'QuestCompletion', id: string, missionId: string, title: string, rewardXp: number, completedAt: string }> | null } | null };

export type MissionsQueryVariables = Exact<{
  locationId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type MissionsQuery = { __typename?: 'Query', missions: Array<{ __typename?: 'Mission', id: string, title: string, description?: string | null, rewardXp: number, targetProgress: number, completionKind: MissionCompletionKind, distanceMeters?: number | null, staySeconds?: number | null, timerSeconds?: number | null, repeatable: boolean, cooldownHours: number, locationId?: string | null }> };

export type LocationUsersQueryVariables = Exact<{
  locationId: Scalars['ID']['input'];
}>;


export type LocationUsersQuery = { __typename?: 'Query', locationUsers: Array<{ __typename?: 'User', id: string, name: string, posx?: number | null, posy?: number | null, locationId?: string | null, points: number }> };

export type CratesQueryVariables = Exact<{ [key: string]: never; }>;


export type CratesQuery = { __typename?: 'Query', crates: Array<{ __typename?: 'Crate', id: string, name: string, price: number, rarity: RarityType }> };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name: string, locationId?: string | null, posx?: number | null, posy?: number | null, points: number, crateInventories?: Array<{ __typename?: 'CrateInventory', quantity: number, crateId: string, userId: string, crate?: { __typename?: 'Crate', rarity: RarityType, name: string } | null }> | null, inventories?: Array<{ __typename?: 'ItemInventory', quantity: number, item?: { __typename?: 'Item', id: string, name: string, svgId: string, rarity: RarityType } | null }> | null } | null };

export type GetBadgesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetBadgesQuery = { __typename?: 'Query', items: Array<{ __typename?: 'Item', id: string, name: string, rarity: RarityType, svgId: string }> };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const AddPointsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPoints"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPoints"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}}]}]}}]} as unknown as DocumentNode<AddPointsMutation, AddPointsMutationVariables>;
export const OpenCrateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"OpenCrate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"crateId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"openCrate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"crateId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"crateId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}},{"kind":"Field","name":{"kind":"Name","value":"svgId"}}]}}]}}]} as unknown as DocumentNode<OpenCrateMutation, OpenCrateMutationVariables>;
export const BuyCrateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BuyCrate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"crateId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"buyCrate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"crateId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"crateId"}}},{"kind":"Argument","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}]}]}}]} as unknown as DocumentNode<BuyCrateMutation, BuyCrateMutationVariables>;
export const JoinRoomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinRoom"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinRoom"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"locationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"posx"}},{"kind":"Field","name":{"kind":"Name","value":"posy"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<JoinRoomMutation, JoinRoomMutationVariables>;
export const LeaveRoomDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LeaveRoom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leaveRoom"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"posx"}},{"kind":"Field","name":{"kind":"Name","value":"posy"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<LeaveRoomMutation, LeaveRoomMutationVariables>;
export const UpdatePositionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePosition"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lat"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lng"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePosition"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"locationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lat"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lat"}}},{"kind":"Argument","name":{"kind":"Name","value":"lng"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lng"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"posx"}},{"kind":"Field","name":{"kind":"Name","value":"posy"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<UpdatePositionMutation, UpdatePositionMutationVariables>;
export const ClaimMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClaimMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"claimMission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"missionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lockedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"mission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"targetProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completionKind"}},{"kind":"Field","name":{"kind":"Name","value":"distanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"staySeconds"}},{"kind":"Field","name":{"kind":"Name","value":"timerSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"repeatable"}},{"kind":"Field","name":{"kind":"Name","value":"cooldownHours"}}]}}]}}]}}]} as unknown as DocumentNode<ClaimMissionMutation, ClaimMissionMutationVariables>;
export const UpdateMissionProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMissionProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userMissionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"progress"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMissionProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userMissionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userMissionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"progress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"progress"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lockedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"mission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"targetProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completionKind"}},{"kind":"Field","name":{"kind":"Name","value":"distanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"staySeconds"}},{"kind":"Field","name":{"kind":"Name","value":"timerSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"repeatable"}},{"kind":"Field","name":{"kind":"Name","value":"cooldownHours"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateMissionProgressMutation, UpdateMissionProgressMutationVariables>;
export const CompletePhotoMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompletePhotoMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lat"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lng"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completePhotoMission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"missionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lat"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lat"}}},{"kind":"Argument","name":{"kind":"Name","value":"lng"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lng"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lockedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"mission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"targetProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completionKind"}},{"kind":"Field","name":{"kind":"Name","value":"distanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"staySeconds"}},{"kind":"Field","name":{"kind":"Name","value":"timerSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"repeatable"}},{"kind":"Field","name":{"kind":"Name","value":"cooldownHours"}}]}}]}}]}}]} as unknown as DocumentNode<CompletePhotoMissionMutation, CompletePhotoMissionMutationVariables>;
export const CompleteMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lat"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lng"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeMission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"missionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lat"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lat"}}},{"kind":"Argument","name":{"kind":"Name","value":"lng"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lng"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lockedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"mission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"targetProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completionKind"}},{"kind":"Field","name":{"kind":"Name","value":"distanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"staySeconds"}},{"kind":"Field","name":{"kind":"Name","value":"timerSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"repeatable"}},{"kind":"Field","name":{"kind":"Name","value":"cooldownHours"}}]}}]}}]}}]} as unknown as DocumentNode<CompleteMissionMutation, CompleteMissionMutationVariables>;
export const StartTimedMissionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartTimedMission"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lat"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lng"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startTimedMission"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"missionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"missionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lat"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lat"}}},{"kind":"Argument","name":{"kind":"Name","value":"lng"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lng"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lockedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"mission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"targetProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completionKind"}},{"kind":"Field","name":{"kind":"Name","value":"distanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"staySeconds"}},{"kind":"Field","name":{"kind":"Name","value":"timerSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"repeatable"}},{"kind":"Field","name":{"kind":"Name","value":"cooldownHours"}}]}}]}}]}}]} as unknown as DocumentNode<StartTimedMissionMutation, StartTimedMissionMutationVariables>;
export const GenerateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"description"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateUserProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"description"},"value":{"kind":"Variable","name":{"kind":"Name","value":"description"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profileDescription"}},{"kind":"Field","name":{"kind":"Name","value":"profileTags"}}]}}]}}]} as unknown as DocumentNode<GenerateUserProfileMutation, GenerateUserProfileMutationVariables>;
export const LocationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"posx"}},{"kind":"Field","name":{"kind":"Name","value":"posy"}}]}}]}}]} as unknown as DocumentNode<LocationsQuery, LocationsQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"xp"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"posx"}},{"kind":"Field","name":{"kind":"Name","value":"posy"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"profileDescription"}},{"kind":"Field","name":{"kind":"Name","value":"profileTags"}},{"kind":"Field","name":{"kind":"Name","value":"userMissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"progress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startedAt"}},{"kind":"Field","name":{"kind":"Name","value":"lockedUntil"}},{"kind":"Field","name":{"kind":"Name","value":"mission"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"targetProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completionKind"}},{"kind":"Field","name":{"kind":"Name","value":"distanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"staySeconds"}},{"kind":"Field","name":{"kind":"Name","value":"timerSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"repeatable"}},{"kind":"Field","name":{"kind":"Name","value":"cooldownHours"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"questHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"40"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"missionId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const MissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Missions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"locationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"rewardXp"}},{"kind":"Field","name":{"kind":"Name","value":"targetProgress"}},{"kind":"Field","name":{"kind":"Name","value":"completionKind"}},{"kind":"Field","name":{"kind":"Name","value":"distanceMeters"}},{"kind":"Field","name":{"kind":"Name","value":"staySeconds"}},{"kind":"Field","name":{"kind":"Name","value":"timerSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"repeatable"}},{"kind":"Field","name":{"kind":"Name","value":"cooldownHours"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}}]}}]}}]} as unknown as DocumentNode<MissionsQuery, MissionsQueryVariables>;
export const LocationUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LocationUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"locationUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"locationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"posx"}},{"kind":"Field","name":{"kind":"Name","value":"posy"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"points"}}]}}]}}]} as unknown as DocumentNode<LocationUsersQuery, LocationUsersQueryVariables>;
export const CratesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Crates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}}]}}]}}]} as unknown as DocumentNode<CratesQuery, CratesQueryVariables>;
export const CurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"locationId"}},{"kind":"Field","name":{"kind":"Name","value":"posx"}},{"kind":"Field","name":{"kind":"Name","value":"posy"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"crateInventories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crate"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rarity"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"crateId"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inventories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"svgId"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}}]}}]}}]} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const GetBadgesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBadges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"rarity"}},{"kind":"Field","name":{"kind":"Name","value":"svgId"}}]}}]}}]} as unknown as DocumentNode<GetBadgesQuery, GetBadgesQueryVariables>;
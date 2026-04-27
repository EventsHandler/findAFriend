import { GraphQLError } from 'graphql'

export type MissionErrorCode =
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'LOCATION_REQUIRED'
  | 'LOCATION_MISMATCH'
  | 'GEOLOCATION_REQUIRED'
  | 'OUTSIDE_AREA'
  | 'NOT_CLAIMED'
  | 'NOT_ACTIVE'
  | 'ALREADY_ACTIVE'
  | 'COOLDOWN'
  | 'INVALID_STATE'
  | 'ALREADY_STARTED'
  | 'INVALID_MISSION_TYPE'

export function missionError(
  code: MissionErrorCode,
  message: string,
  details?: Record<string, unknown>,
): never {
  throw new GraphQLError(message, {
    extensions: {
      code,
      ...(details ? { details } : {}),
    },
  })
}


import { computed } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'
import {
  JoinRoomDocument,
  LeaveRoomDocument,
  LocationUsersDocument,
  MeDocument,
  UpdatePositionDocument,
} from '../api/graphql'

export function useRoom() {
  const { result: meResult, loading: meLoading, refetch: refetchMe } = useQuery(MeDocument)

  const me = computed(() => meResult.value?.me ?? null)
  const currentRoomId = computed(() => me.value?.locationId ?? null)

  const { result: roomUsersResult, refetch: refetchRoomUsers } = useQuery(
    LocationUsersDocument,
    () => ({ locationId: currentRoomId.value! }),
    {
      enabled: computed(() => !!currentRoomId.value),
      pollInterval: 5000,
    },
  )

  const roomUsers = computed(() => roomUsersResult.value?.locationUsers ?? [])

  const { mutate: joinRoomMutate } = useMutation(JoinRoomDocument)
  const { mutate: leaveRoomMutate } = useMutation(LeaveRoomDocument)
  const { mutate: updatePositionMutate } = useMutation(UpdatePositionDocument)

  async function joinRoom(locationId: string) {
    try {
      await joinRoomMutate({ locationId })
      await refetchMe()
      await refetchRoomUsers()
    } catch (error) {
      console.error('Failed to join room:', error)
      throw error
    }
  }

  async function leaveRoom() {
    try {
      await leaveRoomMutate()
      await refetchMe()
    } catch (error) {
      console.error('Failed to leave room:', error)
      throw error
    }
  }

  async function updatePosition(locationId: string, lat: number, lng: number) {
    await updatePositionMutate({ locationId, lat, lng })
  }

  return {
    me,
    meLoading,
    currentRoomId,
    roomUsers,
    joinRoom,
    leaveRoom,
    updatePosition,
    refetchRoomUsers,
    refetchMe,
  }
}

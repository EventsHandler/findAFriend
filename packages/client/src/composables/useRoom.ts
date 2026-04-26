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

  const { mutate: joinRoomMutate } = useMutation(JoinRoomDocument, {
    update: (cache, { data }) => {
      if (data?.joinRoom) {
        cache.writeQuery({
          query: MeDocument,
          data: { me: data.joinRoom },
        })

        // Add the user to the LocationUsers cache for the joined room
        const locationId = data.joinRoom.locationId
        if (locationId) {
          try {
            const existingData = cache.readQuery({
              query: LocationUsersDocument,
              variables: { locationId },
            })
            if (existingData?.locationUsers) {
              // Check if user is already in the list
              const userExists = existingData.locationUsers.some(
                (user: any) => user.id === data.joinRoom.id
              )
              if (!userExists) {
                const updatedUsers = [...existingData.locationUsers, data.joinRoom]
                cache.writeQuery({
                  query: LocationUsersDocument,
                  variables: { locationId },
                  data: { locationUsers: updatedUsers },
                })
              }
            }
          } catch (error) {
            // Cache might not exist, ignore
          }
        }
      }
    },
  })
  const { mutate: leaveRoomMutate } = useMutation(LeaveRoomDocument, {
    update: (cache, { data }) => {
      if (data?.leaveRoom) {
        // Update the Me query cache with the returned user data
        cache.writeQuery({
          query: MeDocument,
          data: { me: data.leaveRoom },
        })

        // Remove the user from the LocationUsers cache for the current room
        const currentLocationId = currentRoomId.value
        if (currentLocationId) {
          try {
            const existingData = cache.readQuery({
              query: LocationUsersDocument,
              variables: { locationId: currentLocationId },
            })
            if (existingData?.locationUsers) {
              const filteredUsers = existingData.locationUsers.filter(
                (user: any) => user.id !== data.leaveRoom.id
              )
              cache.writeQuery({
                query: LocationUsersDocument,
                variables: { locationId: currentLocationId },
                data: { locationUsers: filteredUsers },
              })
            }
          } catch (error) {
            // Cache might not exist, ignore
          }
        }
      }
    },
  })
  const { mutate: updatePositionMutate } = useMutation(UpdatePositionDocument)

  async function joinRoom(locationId: string) {
    try {
      await joinRoomMutate({ locationId })
      // Cache is updated automatically via the update function
      await refetchRoomUsers()
    } catch (error) {
      console.error('Failed to join room:', error)
      throw error
    }
  }

  async function leaveRoom() {
    try {
      await leaveRoomMutate()
      // Cache is updated automatically via the update function
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
  }
}

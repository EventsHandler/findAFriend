import { ref } from 'vue'
import L from 'leaflet'
import type { User } from '../api/graphql'

export function useMapSync() {
  const roomUsersLayer = ref<L.LayerGroup | null>(null)
  const roomUserMarkers = new Map<string, L.Marker>()

  function createUserIcon() {
    return L.divIcon({
      className: '',
      html: `
        <div class="w-3 h-3 rounded-full bg-lime-400 shadow-[0_0_10px_#7afb72] border border-white/20"></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })
  }

  function initRoomLayer(map: L.Map) {
    roomUsersLayer.value = L.layerGroup().addTo(map)
  }

  function clearRoomUsers() {
    roomUserMarkers.forEach((marker) => marker.remove())
    roomUserMarkers.clear()
    roomUsersLayer.value?.clearLayers()
  }

  function syncRoomUsers(users: User[], currentUserId: string | null) {
    if (!roomUsersLayer.value) return

    const remainingIds = new Set(users.filter((user) => user.id !== currentUserId).map((user) => user.id))

    for (const user of users) {
      if (user.id === currentUserId) continue
      if (typeof user.posx !== 'number' || typeof user.posy !== 'number') continue

      const existing = roomUserMarkers.get(user.id)
      const latLng: [number, number] = [user.posx, user.posy]

      if (existing) {
        existing.setLatLng(latLng)
        continue
      }

      const marker = L.marker(latLng, {
        icon: createUserIcon(),
      })

      marker.bindTooltip(user.name, { direction: 'top', offset: [0, -10], permanent: false })
      marker.addTo(roomUsersLayer.value as L.LayerGroup)
      roomUserMarkers.set(user.id, marker)
    }

    roomUserMarkers.forEach((marker, id) => {
      if (!remainingIds.has(id)) {
        roomUsersLayer.value?.removeLayer(marker)
        roomUserMarkers.delete(id)
      }
    })
  }

  return {
    initRoomLayer,
    syncRoomUsers,
    clearRoomUsers,
  }
}

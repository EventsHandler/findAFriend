<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { useQuery } from '@vue/apollo-composable'
import { useRoom } from '../composables/useRoom'
import { useMapSync } from '../composables/useMapSync'
import { useChatRoom } from '../composables/useChatRoom'
import { LocationsDocument, LocationUsersDocument } from '../api/graphql'

const { result } = useQuery(LocationsDocument)
const locations = computed(() => result.value?.locations ?? [])

const activePOI = ref<any>(null)
const selectedLocationId = computed(() => activePOI.value?.id ?? null)

const zoomLevel = ref(13)

const { result: selectedLocationUsersResult } = useQuery(
  LocationUsersDocument,
  () => ({ locationId: selectedLocationId.value! }),
  {
    enabled: computed(() => !!selectedLocationId.value),
  },
)

const selectedLocationUsers = computed(() => selectedLocationUsersResult.value?.locationUsers ?? [])

const {
  me,
  currentRoomId,
  roomUsers,
  joinRoom,
  leaveRoom,
  updatePosition,
  refetchRoomUsers,
} = useRoom()
const { openChat } = useChatRoom()
const { initRoomLayer, syncRoomUsers, clearRoomUsers } = useMapSync()

const handleLeaveRoom = async () => {
  try {
    await leaveRoom()
  } catch (error) {
    console.error('Failed to leave room:', error)
    // You could show a toast or alert here
  }
}

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const markersLayer = ref<L.LayerGroup | null>(null)

const lastUpdate = ref('Never')
let playerMarker: L.Marker | null = null
const hasCenteredOnce = ref(false)

const playerIcon = L.divIcon({
  className: '',
  html: `
    <div class="w-4 h-4 bg-lime-400 rounded-full
      shadow-[0_0_15px_#84ff7a] border-2 border-white">
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const initMap = () => {
  if (!mapContainer.value) return

  map.value = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([47.0245, 28.8323], 13)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map.value as L.Map)

  markersLayer.value = L.layerGroup().addTo(map.value as L.Map)
  initRoomLayer(map.value as L.Map)

  // Update zoom level on zoom change
  map.value.on('zoom', () => {
    zoomLevel.value = (map.value as L.Map).getZoom()
  })

  zoomLevel.value = (map.value as L.Map).getZoom() // Initial value
}

const renderLocations = () => {
  if (!map.value || !markersLayer.value) return

  markersLayer.value.clearLayers()

  const zoom = zoomLevel.value
  const iconSize = Math.max(16, zoom * 3) // Scale icon size with zoom
  const anchor = iconSize / 2

  locations.value.forEach((loc: any) => {
    const isActive = activePOI.value?.id === loc.id

    const marker = L.marker([loc.posx, loc.posy], {
      icon: L.divIcon({
        className: '',
        html: `
          <div class="border-2 border-lime-400 bg-lime-400/20 rounded-sm shadow-[0_0_8px_#84ff7a]
            ${isActive
              ? 'border-white bg-white/20 shadow-[0_0_12px_white]'
              : 'border-lime-400 bg-lime-400/20'}"
            style="width: ${iconSize - 8}px; height: ${iconSize - 8}px;">
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [anchor, anchor],
      }),
    })

    marker.on('click', () => {
      activePOI.value = loc
    })

    markersLayer.value?.addLayer(marker)
  })
}

watch([locations, activePOI], () => {
  renderLocations()
})

watch(zoomLevel, () => {
  renderLocations()
})

watch([roomUsers, currentRoomId], () => {
  if (!currentRoomId.value) {
    clearRoomUsers()
    return
  }

  syncRoomUsers(roomUsers.value, me.value?.id ?? null)
})

const updateLocation = () => {
  if (!navigator.geolocation) return

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords

      lastUpdate.value = new Date().toLocaleTimeString()

      if (!map.value) return

      if (!hasCenteredOnce.value) {
        map.value.setView([latitude, longitude], 14)
        hasCenteredOnce.value = true
      }

      if (!playerMarker) {
        playerMarker = L.marker([latitude, longitude], {
          icon: playerIcon,
        }).addTo(map.value as L.Map)
      } else {
        playerMarker.setLatLng([latitude, longitude])
      }

      if (currentRoomId.value) {
        updatePosition(currentRoomId.value, latitude, longitude).catch(() => {
          // ignore update errors while transitioning between rooms
        })
      }
    },
    (err) => {
      console.error('Geolocation error:', err)
      // Handle permission denied or other errors
      if (err.code === err.PERMISSION_DENIED) {
        console.warn('Location permission denied')
      }
    },
    { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 300000 // Use cached position for up to 5 minutes
    },
  )
}

let intervalId: number | null = null

onMounted(() => {
  initMap()
  updateLocation()

  intervalId = setInterval(updateLocation, 5000)
})

watch(selectedLocationId, () => {
  requestAnimationFrame(() => {
    map.value?.invalidateSize()
  })
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (map.value) map.value.remove()
})
</script>

<template>
  <div class="h-dvh w-full bg-[#0b0f0c] text-white flex flex-col">

    <!-- TOP BAR -->
    <header class="h-12 flex items-center justify-between px-4 border-b border-white/10">
      <div class="text-lime-400 text-sm uppercase tracking-widest">
        Radar Map
      </div>

      <div class="text-xs text-gray-400">
        {{ lastUpdate }}
      </div>
    </header>

    <!-- MAIN AREA -->
    <div
      class="flex flex-1 overflow-hidden"
      :class="activePOI ? 'flex-col md:flex-row' : ''"
    >

      <!-- MAP -->
      <div
        class="relative"
        :class="activePOI ? 'flex-1' : 'w-full h-full'"
      >
        <div ref="mapContainer" class="w-full h-full"></div>
      </div>

      <!-- MENU -->
      <aside
        v-if="activePOI"
        class="
          bg-[#101712]/95 backdrop-blur
          border-white/10
          p-4
        "
        :class="[
          'w-full md:w-80',
          'border-t md:border-t-0 md:border-l'
        ]"
      >
        <div class="text-[10px] text-gray-500 uppercase">
          Location
        </div>

        <div class="text-lime-300 font-semibold text-sm mt-1">
          {{ activePOI.name }}
        </div>

        <div class="mt-4 text-xs text-slate-400">
          <div v-if="me?.locationId === activePOI.id">Joined room</div>
          <div v-else-if="me?.locationId">Joined another room</div>
          <div v-else>Not joined</div>
        </div>

        <div class="mt-4">
          <div class="text-[10px] text-gray-500 uppercase mb-2">
            Participants ({{ selectedLocationUsers.length }})
          </div>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div
              v-for="user in selectedLocationUsers"
              :key="user.id"
              class="text-xs px-2 py-1 rounded bg-slate-800/50 flex items-center justify-between"
            >
              <span class="text-slate-300">{{ user.name }}</span>
              <div class="flex items-center gap-1">
                <div
                  v-if="user.posx && user.posy"
                  class="w-2 h-2 bg-green-400 rounded-full"
                  title="Has position"
                ></div>
                <div
                  v-if="me?.id === user.id"
                  class="text-[10px] text-lime-400"
                >
                  (you)
                </div>
              </div>
            </div>
            <div
              v-if="selectedLocationUsers.length === 0"
              class="text-xs text-slate-500 italic px-2 py-1"
            >
              No participants yet
            </div>
          </div>
        </div>

        <button
          class="mt-4 w-full bg-lime-500/20 border border-lime-400/30 text-lime-300 py-2 rounded"
          @click="joinRoom(activePOI.id)"
        >
          {{ me?.locationId === activePOI.id ? 'Refresh Room' : 'Join Room' }}
        </button>

        <button
          class="mt-3 w-full bg-white/10 border border-white/10 text-white py-2 rounded"
          @click="openChat(activePOI.id)"
        >
          Open Chat Room
        </button>

        <button
          v-if="me?.locationId === activePOI.id"
          class="mt-3 w-full bg-red-500/20 border border-red-400/30 text-red-300 py-2 rounded"
          @click="handleLeaveRoom"
        >
          Leave Room
        </button>

        <button
          class="mt-4 w-full bg-lime-500/20 border border-lime-400/30 text-lime-300 py-2 rounded"
          @click="activePOI = null"
        >
          Close
        </button>
      </aside>

    </div>

  </div>
</template>

<style scoped>
:deep(.leaflet-marker-icon) {
  background: transparent;
  border: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
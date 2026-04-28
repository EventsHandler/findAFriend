<script setup lang="ts">
import { ref, onActivated, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { useMutation, useQuery } from '@vue/apollo-composable'
import { ApolloError } from '@apollo/client/core'
import { useRoom } from '../composables/useRoom'
import { useMapSync } from '../composables/useMapSync'
import { useChatRoom } from '../composables/useChatRoom'
import { useRoute, useRouter } from 'vue-router'
import UiTopBar from '../ui/UiTopBar.vue'
import UiButton from '../ui/UiButton.vue'
import UiCard from '../ui/UiCard.vue'
import UiBadge from '../ui/UiBadge.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiModal from '../ui/UiModal.vue'
import {
  ClaimMissionDocument,
  CompleteMissionDocument,
  CompletePhotoMissionDocument,
  LocationsDocument,
  LocationUsersDocument,
  MissionsDocument,
  StartTimedMissionDocument,
  UserMissionStatus,
} from '../api/graphql'

const { result } = useQuery(LocationsDocument)
const locations = computed(() => result.value?.locations ?? [])

const route = useRoute()
const router = useRouter()

const activePOI = ref<any>(null)
const selectedLocationId = computed(() => activePOI.value?.id ?? null)

const zoomLevel = ref(13)
const missionsLastRefreshedAt = ref<Date | null>(null)
const { result: missionsResult, loading: missionsLoading, refetch: refetchMissions } = useQuery(
  MissionsDocument,
  () => ({ locationId: selectedLocationId.value }),
  { enabled: computed(() => !!selectedLocationId.value) },
)
const missionsForLocation = computed(() => missionsResult.value?.missions ?? [])

watch(
  missionsResult,
  () => {
    if (!missionsLoading.value) missionsLastRefreshedAt.value = new Date()
  },
  { deep: true },
)

async function refreshMissions() {
  await refetchMissions()
  missionsLastRefreshedAt.value = new Date()
}

const missionsLastRefreshedLabel = computed(() => {
  const d = missionsLastRefreshedAt.value
  if (!d) return '—'
  try {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return String(d)
  }
})

const { result: selectedLocationUsersResult } = useQuery(
  LocationUsersDocument,
  () => ({ locationId: selectedLocationId.value! }),
  {
    enabled: computed(() => !!selectedLocationId.value),
  },
)

const selectedLocationUsers = computed(() => selectedLocationUsersResult.value?.locationUsers ?? [])

const distance = computed(() => {
  if (!activePOI.value || !playerMarker) return null
  const playerLatLng = playerMarker.getLatLng()
  const destLatLng = L.latLng(activePOI.value.posx, activePOI.value.posy)
  return calculateDistance(playerLatLng.lat, playerLatLng.lng, destLatLng.lat, destLatLng.lng)
})

const {
  me,
  currentRoomId,
  roomUsers,
  joinRoom,
  leaveRoom,
  updatePosition,
  refetchRoomUsers,
  refetchMe,
} = useRoom()
const { openChat } = useChatRoom()
const { initRoomLayer, syncRoomUsers, clearRoomUsers } = useMapSync()

const { mutate: claimMissionMutate, loading: claiming } = useMutation(ClaimMissionDocument)
const { mutate: completeMissionMutate, loading: completing } = useMutation(CompleteMissionDocument)
const { mutate: completePhotoMutate, loading: completingPhoto } = useMutation(CompletePhotoMissionDocument)
const { mutate: startTimedMissionMutate, loading: startingTimer } = useMutation(StartTimedMissionDocument)

const geoError = ref<string | null>(null)
const questActionError = ref<string | null>(null)
const photoBusyByMissionId = ref(new Set<string>())

const isJoinedHere = computed(() => {
  return !!currentRoomId.value && me.value?.locationId === selectedLocationId.value
})

const showAllParticipants = ref(false)
const confirmComplete = ref<{ open: boolean; missionId: string | null; title: string }>({
  open: false,
  missionId: null,
  title: '',
})

const missionElById = ref(new Map<string, HTMLElement>())
function setMissionEl(id: string) {
  return (node: Element | { $el?: unknown } | null) => {
    const map = missionElById.value
    if (!node) {
      map.delete(id)
      return
    }
    const el = node instanceof Element ? node : (node.$el as unknown)
    if (el instanceof HTMLElement) map.set(id, el)
  }
}

function requestConfirmComplete(missionId: string, title: string) {
  confirmComplete.value = { open: true, missionId, title }
}

async function confirmCompleteNow() {
  const id = confirmComplete.value.missionId
  if (!id) return
  confirmComplete.value.open = false
  await onCompleteMission(id)
}

const myMissionsByMissionId = computed(() => {
  const missions = me.value?.userMissions ?? []
  const map = new Map<string, (typeof missions)[number]>()
  for (const um of missions) map.set(um.mission.id, um)
  return map
})

const sortedMissionsForLocation = computed(() => {
  const rows = [...missionsForLocation.value]
  rows.sort((a, b) => {
    const sa = myMissionsByMissionId.value.get(a.id)?.status ?? null
    const sb = myMissionsByMissionId.value.get(b.id)?.status ?? null
    const rank = (s: any) =>
      s === UserMissionStatus.Active ? 0 : s === UserMissionStatus.Completed ? 2 : 1
    const ra = rank(sa)
    const rb = rank(sb)
    if (ra !== rb) return ra - rb
    return a.title.localeCompare(b.title)
  })
  return rows
})

function isOnCooldown(lockedUntil: string | null | undefined) {
  if (!lockedUntil) return false
  return new Date(lockedUntil).getTime() > Date.now()
}

function cooldownRemaining(lockedUntil: string | null | undefined) {
  if (!lockedUntil) return ''
  const ms = new Date(lockedUntil).getTime() - Date.now()
  if (ms <= 0) return ''
  const h = Math.floor(ms / 3600000)
  const m = Math.ceil((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function isPhotoMissionTitle(title: string) {
  const t = title.toLowerCase()
  return t.includes('poză') || t.includes('poza') || t.includes('fotograf')
}

function isTimedStartMissionTitle(title: string) {
  const t = title.toLowerCase()
  return t.includes('sprint 2 minute') || t.includes('stretch 5 minute') || t.includes('respira')
}

function isManualCompleteMissionTitle(title: string) {
  const t = title.toLowerCase()
  return (
    t.includes('hidratare') ||
    t.includes('descoperă') ||
    t.includes('descopera') ||
    t.includes('încearcă ceva nou') ||
    t.includes('incearca ceva nou') ||
    t.includes('împarte un desert') ||
    t.includes('imparte un desert') ||
    t.includes('recenzie rapidă') ||
    t.includes('recenzie rapida') ||
    t.includes('comandă o băutură') ||
    t.includes('comanda o bautura') ||
    t.includes('fotografie de meniu')
  )
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371e3 // metres
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

async function getRoute(start: L.LatLng, end: L.LatLng): Promise<L.LatLng[]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    const response = await fetch(url)
    const data = await response.json()
    if (data.routes && data.routes[0]) {
      const coordinates = data.routes[0].geometry.coordinates
      return coordinates.map(([lng, lat]: [number, number]) => L.latLng(lat, lng))
    }
  } catch (e) {
    console.warn('Failed to get route:', e)
  }
  return [start, end] // fallback to straight line
}

async function getCurrentGps() {
  if (!navigator.geolocation) throw new Error('Geolocation unavailable')
  return await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30_000 },
    )
  })
}

function formatQuestApolloError(e: ApolloError) {
  const gqlErr = e.graphQLErrors?.[0] as any
  if (gqlErr) {
    const code = gqlErr.extensions?.code as string | undefined
    const details = gqlErr.extensions?.details as Record<string, unknown> | undefined

    let msg = String(gqlErr.message ?? 'Request failed')
    if (code) msg += ` (${code})`

    const dist = (details as any)?.distanceMeters
    const req = (details as any)?.requiredMeters
    if (typeof dist === 'number' && typeof req === 'number') msg += ` — dist ${dist}m / ${req}m`

    const lockedUntil = (details as any)?.lockedUntil
    if (typeof lockedUntil === 'string') msg += ` — lockedUntil ${lockedUntil}`

    return msg
  }

  const netMsg =
    (e.networkError as any)?.result?.errors?.[0]?.message || (e.networkError as any)?.message
  return netMsg ?? e.message
}

async function onCompleteMission(missionId: string) {
  questActionError.value = null
  if (!localStorage.getItem('token')) {
    questActionError.value = 'Autentificare necesară'
    return
  }
  try {
    const { lat, lng } = await getCurrentGps()
    await completeMissionMutate({ missionId, lat, lng })
    await refetchMe()
  } catch (e) {
    if (e instanceof ApolloError) {
      questActionError.value = formatQuestApolloError(e)
    } else {
      questActionError.value = e instanceof Error ? e.message : 'Unexpected error'
    }
  }
}

async function onStartTimedMission(missionId: string) {
  questActionError.value = null
  if (!localStorage.getItem('token')) {
    questActionError.value = 'Autentificare necesară'
    return
  }
  try {
    const { lat, lng } = await getCurrentGps()
    await startTimedMissionMutate({ missionId, lat, lng })
    // The mission will complete server-side after countdown; refresh later or when user reopens.
    await refetchMe()
  } catch (e) {
    if (e instanceof ApolloError) {
      questActionError.value = formatQuestApolloError(e)
    } else {
      questActionError.value = e instanceof Error ? e.message : 'Unexpected error'
    }
  }
}

async function onCompletePhotoMission(missionId: string, _file?: File) {
  questActionError.value = null
  if (!localStorage.getItem('token')) {
    questActionError.value = 'Autentificare necesară'
    return
  }

  if (photoBusyByMissionId.value.has(missionId)) return
  photoBusyByMissionId.value.add(missionId)

  try {
    const { lat, lng } = await getCurrentGps()
    await completePhotoMutate({ missionId, lat, lng })
    await refetchMe()
  } catch (e) {
    if (e instanceof ApolloError) {
      questActionError.value = formatQuestApolloError(e)
    } else {
      questActionError.value = e instanceof Error ? e.message : 'Unexpected error'
    }
  } finally {
    photoBusyByMissionId.value.delete(missionId)
  }
}

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
const pathLayer = ref<L.LayerGroup | null>(null)

const lastUpdate = ref('Never')
let playerMarker: L.Marker | null = null
const playerLatLng = ref<L.LatLng | null>(null)
const routeDrawnFor = ref<string | null>(null)
const routePoints = ref<L.LatLng[]>([])
let permanentPolyline: L.Polyline | null = null
let animatedPolyline: L.Polyline | null = null
const pathAnimationTimers: number[] = []
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
  // If we navigated back and Vue reused the component, ensure we don't double-init Leaflet.
  if (map.value) return

  map.value = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
  }).setView([47.0245, 28.8323], 13)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map.value as L.Map)

  markersLayer.value = L.layerGroup().addTo(map.value as L.Map)
  pathLayer.value = L.layerGroup().addTo(map.value as L.Map)
  initRoomLayer(map.value as L.Map)

  // Update zoom level on zoom change
  map.value.on('zoom', () => {
    zoomLevel.value = (map.value as L.Map).getZoom()
  })

  zoomLevel.value = (map.value as L.Map).getZoom() // Initial value
}

async function ensureMapMounted() {
  // When navigating back, refs may exist before the DOM is painted.
  await nextTick()
  initMap()
  renderLocations()
  requestAnimationFrame(() => {
    map.value?.invalidateSize()
  })
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

// Deep-link support: /MapPage?locationId=...
watch(
  [() => route.query.locationId, locations],
  ([locationId]) => {
    const id = typeof locationId === 'string' ? locationId : null
    if (!id) return
    if (activePOI.value?.id === id) return
    const loc = locations.value.find((l: any) => l?.id === id)
    if (!loc) return
    activePOI.value = loc
    // Optional: center map on the selected location for clarity.
    map.value?.setView([loc.posx, loc.posy], Math.max(14, zoomLevel.value))
  },
  { immediate: true },
)

// Persist last opened location for a smoother return-to-map experience.
watch(
  activePOI,
  (loc) => {
    try {
      if (loc?.id) localStorage.setItem('lastLocationId', String(loc.id))
      else localStorage.removeItem('lastLocationId')
    } catch {
      // ignore
    }
  },
  { deep: false },
)

onMounted(() => {
  try {
    const qLoc = typeof route.query.locationId === 'string' ? route.query.locationId : null
    if (qLoc) return
    const last = localStorage.getItem('lastLocationId')
    if (!last) return
    const loc = locations.value.find((l: any) => l?.id === last)
    if (!loc) return
    activePOI.value = loc
  } catch {
    // ignore
  }
})

function focusMissionFromQuery() {
  const missionId = typeof route.query.missionId === 'string' ? route.query.missionId : null
  if (!missionId) return
  requestAnimationFrame(() => {
    const el = missionElById.value.get(missionId)
    if (!el) return
    el.scrollIntoView({ block: 'nearest' })
  })
}

let missionHighlightTimer: number | null = null
watch(
  [() => route.query.missionId, sortedMissionsForLocation],
  () => {
    focusMissionFromQuery()
    if (missionHighlightTimer) window.clearTimeout(missionHighlightTimer)
    if (typeof route.query.missionId !== 'string') return
    missionHighlightTimer = window.setTimeout(() => {
      // Clear highlight without disrupting other query params.
      const q = { ...route.query }
      delete (q as any).missionId
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      router.replace({ query: q as any })
    }, 4500)
  },
  { immediate: true },
)

watch(activePOI, () => {
  routeDrawnFor.value = null
  if (activePOI.value) {
    drawPathAnimated()
  } else {
    // clearPathAnimation()
  }
})

watch(zoomLevel, () => {
  renderLocations()
})

function clearPathAnimation() {
  if (!pathLayer.value) return
  pathLayer.value.clearLayers()
  routeDrawnFor.value = null
  pathAnimationTimers.forEach((timeoutId) => clearTimeout(timeoutId))
  pathAnimationTimers.length = 0
}

async function drawPathAnimated() {
  if (!pathLayer.value) return
  if (!activePOI.value || !playerMarker) return
  if (routeDrawnFor.value === activePOI.value.id) return

  clearPathAnimation()

  const playerLatLngValue = playerMarker.getLatLng()
  const destLatLng = L.latLng(activePOI.value.posx, activePOI.value.posy)
  const routePoints = await getRoute(playerLatLngValue, destLatLng)

  const polyline = L.polyline([], {
    color: 'lime',
    weight: 3,
    opacity: 0.8
  })

  pathLayer.value.addLayer(polyline)

  const numPoints = routePoints.length
  const delay = Math.max(20, 1000 / Math.max(1, numPoints))
  for (let i = 0; i < numPoints; i++) {
    const timeoutId = window.setTimeout(() => {
      polyline.addLatLng(routePoints[i])
    }, i * delay)
    pathAnimationTimers.push(timeoutId)
  }

  routeDrawnFor.value = activePOI.value.id
}

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
      geoError.value = null
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

      playerLatLng.value = new L.LatLng(latitude, longitude)
      if (activePOI.value && routeDrawnFor.value !== activePOI.value.id) {
        drawPathAnimated()
      }

      if (currentRoomId.value) {
        updatePosition(currentRoomId.value, latitude, longitude).catch(() => {
          // ignore update errors while transitioning between rooms
        })
      }
    },
    (err) => {
      // Most common: user denied (code 1). Don't crash UI; just show status and stop spamming.
      const msg = err?.message || 'Geolocation unavailable'
      geoError.value = msg
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      // Don't spam the console for expected "denied" errors.
      if ((err as GeolocationPositionError | undefined)?.code !== 1) {
        console.warn('GeolocationPositionError:', err)
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // Use cached position for up to 5 minutes
    },
  )
}

let intervalId: number | null = null

function retryGeolocation() {
  geoError.value = null
  updateLocation()
  if (!intervalId) intervalId = setInterval(updateLocation, 5000)
}

async function onClaimLocationMission(missionId: string) {
  questActionError.value = null
  if (!localStorage.getItem('token')) {
    questActionError.value = 'Autentificare necesară'
    return
  }
  try {
    // Claim validation is server-side and requires you're joined + have a recent GPS position saved.
    if (!currentRoomId.value || me.value?.locationId !== selectedLocationId.value) {
      questActionError.value = 'Intră în cameră (Join) înainte să pornești misiunea'
      return
    }
    try {
      const { lat, lng } = await getCurrentGps()
      await updatePosition(currentRoomId.value, lat, lng)
    } catch {
      // If GPS is denied/unavailable we still attempt claim, but server may reject it.
    }
    await claimMissionMutate({ missionId })
    await refetchMe()
  } catch (e) {
    // avoid unhandled promise rejection in Vue click handlers
    if (e instanceof ApolloError) {
      const graphMsg = e.graphQLErrors?.[0]?.message
      const netMsg =
        (e.networkError as any)?.result?.errors?.[0]?.message ||
        (e.networkError as any)?.message
      const msg = graphMsg ?? netMsg ?? e.message
      questActionError.value = msg
      console.warn('Claim mission failed:', msg)
    } else {
      questActionError.value = e instanceof Error ? e.message : 'Unexpected error'
      console.warn('Claim mission failed:', e)
    }
  }
}

onMounted(() => {
  ensureMapMounted()
  updateLocation()

  intervalId = setInterval(updateLocation, 5000)
})

// If this view is wrapped in <keep-alive>, browser "Back" may reactivate without remounting.
onActivated(() => {
  ensureMapMounted()
})

watch(selectedLocationId, () => {
  requestAnimationFrame(() => {
    map.value?.invalidateSize()
  })
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (map.value) {
    map.value.remove()
    map.value = null
    markersLayer.value = null
  }
})
</script>

<template>
  <div class="h-dvh w-full app-screen flex flex-col pb-nav-safe">
    <UiTopBar :title="`HARTĂ${distance ? ` · ${Math.round(distance)}m` : ''}`" :right-text="String(lastUpdate ?? '')" />

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
        <div ref="mapContainer" class="w-full h-full bg-gray-900"></div>
      </div>

      <!-- MENU -->
      <aside
        v-if="activePOI"
        class="bg-[color:rgba(11,15,12,0.72)] backdrop-blur-xl border border-[var(--c-border)] md:border-l md:border-t-0 md:border-r-0 md:border-b-0 p-4 md:p-5 shadow-[0_0_30px_rgba(0,0,0,0.45)] overflow-y-auto styled-scrollbar"
        :class="[
          'w-full md:w-[22rem]',
          'border-t',
          'rounded-t-2xl md:rounded-none',
          'max-h-[calc(100dvh-3rem-5.5rem)] md:max-h-none'
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[10px] text-gray-500 uppercase tracking-[0.25em]">Locație</div>
            <div class="text-lime-300 font-semibold text-sm mt-1 truncate">
              {{ activePOI.name }}
            </div>
          </div>
          <UiButton variant="ghost" size="sm" @click="activePOI = null">Închide</UiButton>
        </div>

        <div class="mt-4 flex items-center justify-between gap-3 text-xs">
          <div class="text-slate-400">
            <span v-if="me?.locationId === activePOI.id" class="text-lime-300/90">Ești în cameră</span>
            <span v-else-if="me?.locationId" class="text-amber-200/90">Ești în altă cameră</span>
            <span v-else class="text-slate-400">Nu ești conectat</span>
          </div>
          <div class="text-[10px] text-gray-500 tracking-widest uppercase tabular-nums">
            {{ selectedLocationUsers.length }} aici
          </div>
        </div>
        <UiEmptyState
          v-if="geoError"
          class="mt-3"
          title="Locația e oprită"
          :description="`Nu pot accesa GPS: ${geoError}. Pentru misiuni pe distanță, activează locația și încearcă din nou.`"
          action-label="Reîncearcă"
          tone="warning"
          @action="retryGeolocation"
        />

        <div class="mt-4 grid grid-cols-1 gap-2">
          <UiButton v-if="me?.locationId !== activePOI.id" variant="primary" block @click="joinRoom(activePOI.id)">
            Intră în cameră
          </UiButton>

          <UiButton v-if="me?.locationId === activePOI.id" variant="danger" block @click="handleLeaveRoom">
            Ieși din cameră
          </UiButton>

          <UiButton variant="ghost" block @click="openChat(activePOI.id)">
            Deschide chat-ul
          </UiButton>
        </div>

        <div class="mt-5">
          <div class="flex items-center justify-between">
            <div class="text-[10px] text-white/55 uppercase tracking-[0.25em]">
              Participanți <span class="text-white/35">({{ selectedLocationUsers.length }})</span>
            </div>
            <UiButton
              v-if="selectedLocationUsers.length > 6"
              variant="ghost"
              size="sm"
              @click="showAllParticipants = !showAllParticipants"
            >
              {{ showAllParticipants ? 'Mai puțin' : 'Toți' }}
            </UiButton>
          </div>

          <div class="mt-2 rounded-2xl border border-white/10 bg-black/20">
            <div class="max-h-32 overflow-y-auto styled-scrollbar divide-y divide-white/5">
              <div
                v-for="user in (showAllParticipants ? selectedLocationUsers : selectedLocationUsers.slice(0, 6))"
                :key="user.id"
                class="px-3 py-2 flex items-center justify-between"
              >
                <div class="min-w-0 flex items-center gap-2">
                  <span class="text-xs text-white/80 truncate">{{ user.name }}</span>
                  <span v-if="me?.id === user.id" class="text-[10px] text-[var(--c-accent)] tracking-widest uppercase"
                    >tu</span
                  >
                </div>
                <div
                  v-if="user.posx && user.posy"
                  class="w-2 h-2 bg-green-400 rounded-full"
                  title="Has position"
                />
              </div>

              <div v-if="selectedLocationUsers.length === 0" class="px-3 py-3 text-xs text-white/35">
                Niciun participant încă.
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <div class="flex items-center justify-between gap-3">
            <div class="text-[10px] text-white/55 uppercase tracking-[0.25em]">
              Misiuni <span class="text-white/35">({{ missionsForLocation.length }})</span>
            </div>
          </div>

          <UiEmptyState
            v-if="questActionError"
            title="Nu a mers"
            :description="questActionError"
            tone="danger"
            class="mt-2"
          />

          <div v-if="missionsLoading" class="mt-2 text-xs text-white/35">
            Se încarcă misiunile…
          </div>
          <div v-else-if="missionsForLocation.length === 0" class="mt-2 text-xs text-white/35">
            Nu există misiuni pentru această locație.
          </div>

          <div v-else class="mt-2 rounded-2xl border border-white/10 bg-black/20">
            <div class="max-h-[42dvh] overflow-y-auto styled-scrollbar divide-y divide-white/5">
              <div
                v-for="m in sortedMissionsForLocation"
                :key="m.id"
                :ref="setMissionEl(m.id)"
                class="px-3 py-3"
                :class="route.query.missionId === m.id ? 'bg-[var(--c-accent)]/5 ring-1 ring-[var(--c-border-strong)] rounded-xl' : ''"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-white truncate">{{ m.title }}</div>
                    <div v-if="m.description" class="mt-1 text-[12px] leading-snug text-white/45">
                      {{ m.description }}
                    </div>
                  </div>
                  <div class="shrink-0">
                    <UiBadge v-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active" tone="success">
                      Activă
                    </UiBadge>
                    <UiBadge
                      v-else-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && !m.repeatable"
                      tone="warning"
                    >
                      Finalizată
                    </UiBadge>
                    <UiBadge
                      v-else-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && m.repeatable && isOnCooldown(myMissionsByMissionId.get(m.id)?.lockedUntil)"
                      tone="warning"
                    >
                      Răcire
                    </UiBadge>
                    <UiBadge v-else-if="myMissionsByMissionId.has(m.id) && m.repeatable" tone="info">
                      Repetabilă
                    </UiBadge>
                    <UiBadge v-else tone="neutral">Nouă</UiBadge>
                  </div>
                </div>

                <div class="mt-3 flex items-center justify-between gap-3">
                  <div class="text-[11px] text-[var(--c-accent)] tabular-nums">+{{ m.rewardXp }} XP</div>

                  <div
                    v-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && m.repeatable && isOnCooldown(myMissionsByMissionId.get(m.id)?.lockedUntil)"
                    class="text-[11px] text-amber-200/80 tabular-nums"
                  >
                    {{ cooldownRemaining(myMissionsByMissionId.get(m.id)?.lockedUntil) }}
                  </div>

                  <div class="flex items-center gap-2">
                    <UiButton
                      v-if="
                        myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active &&
                        isTimedStartMissionTitle(m.title)
                      "
                      :disabled="startingTimer"
                      @click="onStartTimedMission(m.id)"
                      variant="ghost"
                      size="sm"
                    >
                      Pornește
                    </UiButton>

                    <UiButton
                      v-else-if="
                        myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active &&
                        isManualCompleteMissionTitle(m.title)
                      "
                      :disabled="completing"
                      @click="requestConfirmComplete(m.id, m.title)"
                      variant="ghost"
                      size="sm"
                    >
                      Finalizează
                    </UiButton>

                    <label
                      v-else-if="
                        myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active &&
                        isPhotoMissionTitle(m.title)
                      "
                      class="text-[11px] px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-300/20 text-cyan-100 cursor-pointer"
                      :class="(completingPhoto || photoBusyByMissionId.has(m.id) ? 'opacity-40 cursor-not-allowed' : '')"
                    >
                      Fă poză
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        class="hidden"
                        :disabled="completingPhoto || photoBusyByMissionId.has(m.id)"
                        @change="(e: Event) => {
                          const input = e.target as HTMLInputElement
                          const file = input.files?.[0]
                          if (file) onCompletePhotoMission(m.id, file)
                          input.value = ''
                        }"
                      />
                    </label>

                    <UiButton
                      v-if="myMissionsByMissionId.get(m.id)?.status !== UserMissionStatus.Active"
                      :disabled="
                        claiming ||
                        !isJoinedHere ||
                        !!geoError ||
                        (myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && !m.repeatable) ||
                        (myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed &&
                          m.repeatable &&
                          isOnCooldown(myMissionsByMissionId.get(m.id)?.lockedUntil))
                      "
                      @click="onClaimLocationMission(m.id)"
                      variant="primary"
                      size="sm"
                    >
                      {{
                        myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && !m.repeatable
                          ? 'Finalizată'
                          : myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && m.repeatable
                            ? 'Din nou'
                            : 'Pornește'
                      }}
                    </UiButton>
                  </div>
                </div>

                <div v-if="myMissionsByMissionId.get(m.id)?.status !== UserMissionStatus.Active" class="mt-2 text-[11px] text-white/35">
                  <span v-if="!isJoinedHere">Intră în cameră ca să pornești misiunea.</span>
                  <span v-else-if="geoError">Activează locația (GPS) ca să pornești misiunea.</span>
                </div>

                <div v-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active" class="mt-3">
                  <div class="flex justify-between text-[10px] text-white/35 mb-1">
                    <span>Progres</span>
                    <span class="tabular-nums">
                      {{ myMissionsByMissionId.get(m.id)?.progress }} / {{ m.targetProgress }}
                    </span>
                  </div>
                  <div class="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      class="h-full bg-[var(--c-accent)]/80 transition-all"
                      :style="{
                        width: `${Math.min(100, ((myMissionsByMissionId.get(m.id)?.progress ?? 0) / m.targetProgress) * 100)}%`,
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </aside>

    </div>

  </div>

  <UiModal
    :open="confirmComplete.open"
    title="Finalizezi misiunea?"
    :description="confirmComplete.title"
    confirm-label="Da, finalizează"
    cancel-label="Nu încă"
    :busy="completing"
    @close="confirmComplete.open = false"
    @confirm="confirmCompleteNow"
  />
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
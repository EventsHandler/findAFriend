<script setup lang="ts">
import { ref, onActivated, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { useMutation, useQuery } from '@vue/apollo-composable'
import { ApolloError } from '@apollo/client/core'
import { useRoom } from '../composables/useRoom'
import { useMapSync } from '../composables/useMapSync'
import { useChatRoom } from '../composables/useChatRoom'
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

const myMissionsByMissionId = computed(() => {
  const missions = me.value?.userMissions ?? []
  const map = new Map<string, (typeof missions)[number]>()
  for (const um of missions) map.set(um.mission.id, um)
  return map
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
  <div class="h-dvh w-full bg-[#0b0f0c] text-white flex flex-col pb-20">

    <!-- TOP BAR -->
    <header class="h-12 flex items-center justify-between px-4 border-b border-white/10">
      <div class="text-lime-400 text-sm uppercase tracking-widest">
        Hartă
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
        class="bg-[#0b0f0c]/85 backdrop-blur-xl border border-lime-500/15 md:border-l md:border-t-0 md:border-r-0 md:border-b-0 p-4 md:p-5 shadow-[0_0_30px_rgba(0,0,0,0.45)] overflow-y-auto styled-scrollbar"
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
          <button
            type="button"
            class="shrink-0 text-[10px] text-gray-300 border border-gray-700/80 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors tracking-widest uppercase"
            @click="activePOI = null"
          >
            Închide
          </button>
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
        <div v-if="geoError" class="mt-2 text-xs text-amber-300/90">
          Geolocation: {{ geoError }}
        </div>

        <div class="mt-4 rounded-xl bg-[#101712]/70 border border-lime-500/10 p-3">
          <div class="text-[10px] text-gray-500 uppercase tracking-[0.25em] mb-2">
            Participanți ({{ selectedLocationUsers.length }})
          </div>
          <div class="max-h-32 overflow-y-auto space-y-1">
            <div
              v-for="user in selectedLocationUsers"
              :key="user.id"
              class="text-xs px-2 py-1 rounded bg-[#0a0e0b] border border-white/5 flex items-center justify-between"
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
              Niciun participant încă
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-xl bg-[#101712]/70 border border-lime-500/10 p-3">
          <div class="flex items-center justify-between gap-3 mb-2">
            <div class="text-[10px] text-gray-500 uppercase tracking-[0.25em]">
              Misiuni ({{ missionsForLocation.length }})
            </div>
          </div>
          <div v-if="questActionError" class="text-xs text-red-300/90 px-2 py-1">
            {{ questActionError }}
          </div>
          <div v-if="missionsLoading" class="text-xs text-slate-500 italic px-2 py-1">
            Se încarcă misiunile...
          </div>
          <div v-else-if="missionsForLocation.length === 0" class="text-xs text-slate-500 italic px-2 py-1">
            Nu există misiuni pentru această locație
          </div>
          <div v-else class="space-y-2 pr-2 styled-scrollbar">
            <div
              v-for="m in missionsForLocation"
              :key="m.id"
              class="px-3 py-2.5 rounded-lg bg-[#0a0e0b] border border-white/5 hover:border-lime-500/20 transition-colors"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-xs text-white font-medium">{{ m.title }}</div>
                  <div v-if="m.description" class="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {{ m.description }}
                  </div>
                </div>
                <div class="shrink-0 text-[9px] uppercase tracking-wider">
                  <span
                    v-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active"
                    class="text-lime-300 border border-lime-400/25 bg-lime-500/10 px-2 py-0.5 rounded"
                  >În desfășurare</span>
                  <span
                    v-else-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && !m.repeatable"
                    class="text-orange-300 border border-orange-400/25 bg-orange-500/10 px-2 py-0.5 rounded"
                  >Finalizată</span>
                  <span
                    v-else-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && m.repeatable && isOnCooldown(myMissionsByMissionId.get(m.id)?.lockedUntil)"
                    class="text-amber-200 border border-amber-300/25 bg-amber-500/10 px-2 py-0.5 rounded"
                  >În așteptare</span>
                  <span
                    v-else-if="myMissionsByMissionId.has(m.id) && m.repeatable"
                    class="text-cyan-200 border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 rounded"
                  >Repetabilă</span>
                  <span
                    v-else
                    class="text-gray-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded"
                  >Nouă</span>
                </div>
              </div>

              <div
                v-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active"
                class="mt-2"
              >
                <div class="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Progres</span>
                  <span>
                    {{ myMissionsByMissionId.get(m.id)?.progress }} / {{ m.targetProgress }}
                  </span>
                </div>
                <div class="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-lime-400/80 transition-all"
                    :style="{
                      width: `${Math.min(100, ((myMissionsByMissionId.get(m.id)?.progress ?? 0) / m.targetProgress) * 100)}%`,
                    }"
                  ></div>
                </div>
              </div>

              <div class="mt-2 flex items-center justify-between gap-2">
                <div class="text-[10px] text-lime-300/90 tracking-wider">
                  +{{ m.rewardXp }} XP
                </div>
                <div
                  v-if="myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && m.repeatable && isOnCooldown(myMissionsByMissionId.get(m.id)?.lockedUntil)"
                  class="text-[10px] text-amber-200/80 tabular-nums"
                >
                  {{ cooldownRemaining(myMissionsByMissionId.get(m.id)?.lockedUntil) }}
                </div>
                <div class="flex items-center gap-1.5">
                  <button
                    v-if="
                      myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active &&
                      isTimedStartMissionTitle(m.title)
                    "
                    class="text-[10px] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-300/20 text-cyan-200 disabled:opacity-40"
                    :disabled="startingTimer"
                    @click="onStartTimedMission(m.id)"
                  >
                    Start
                  </button>

                  <button
                    v-else-if="
                      myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active &&
                      isManualCompleteMissionTitle(m.title)
                    "
                    class="text-[10px] px-2 py-1 rounded bg-orange-500/10 border border-orange-400/20 text-orange-200 disabled:opacity-40"
                    :disabled="completing"
                    @click="onCompleteMission(m.id)"
                  >
                    Finalizat
                  </button>

                  <label
                    v-else-if="
                      myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Active &&
                      isPhotoMissionTitle(m.title)
                    "
                    class="text-[10px] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-300/20 text-cyan-200 disabled:opacity-40 cursor-pointer"
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
                  <button
                    v-if="myMissionsByMissionId.get(m.id)?.status !== UserMissionStatus.Active"
                    class="text-[10px] px-2 py-1 rounded bg-lime-500/15 border border-lime-400/25 text-lime-200 disabled:opacity-40"
                    :disabled="
                      claiming ||
                      (myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && !m.repeatable) ||
                      (myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed &&
                        m.repeatable &&
                        isOnCooldown(myMissionsByMissionId.get(m.id)?.lockedUntil))
                    "
                    @click="onClaimLocationMission(m.id)"
                  >
                    {{
                      myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && !m.repeatable
                        ? 'Finalizată'
                        : myMissionsByMissionId.get(m.id)?.status === UserMissionStatus.Completed && m.repeatable
                          ? 'Din nou'
                          : 'Pornește'
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-2">
          <button v-if="me?.locationId !== activePOI.id"
            class="w-full bg-lime-500/15 border border-lime-400/25 text-lime-200 py-2 rounded-xl hover:bg-lime-500/20 transition-colors"
            @click="joinRoom(activePOI.id)"
          >
            Intră în cameră
          </button>

          <button
            v-if="me?.locationId === activePOI.id"
            class="w-full bg-red-500/10 border border-red-400/20 text-red-200 py-2 rounded-xl hover:bg-red-500/15 transition-colors"
            @click="handleLeaveRoom"
          >
            Ieși din cameră
          </button>

          <button
            class="w-full bg-white/5 border border-white/10 text-white py-2 rounded-xl hover:bg-white/10 transition-colors"
            @click="openChat(activePOI.id)"
          >
            Deschide chat-ul
          </button>
        </div>

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
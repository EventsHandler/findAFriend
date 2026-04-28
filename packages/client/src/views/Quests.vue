<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { useRouter } from 'vue-router'
import { LocationsDocument, MeDocument, MissionsDocument, UserMissionStatus } from '../api/graphql'

const router = useRouter()

const { result: meResult, loading: meLoading } = useQuery(MeDocument)
const me = computed(() => meResult.value?.me ?? null)

const { result: locationsResult } = useQuery(LocationsDocument)
const locations = computed(() => locationsResult.value?.locations ?? [])

const currentLocationId = computed(() => me.value?.locationId ?? null)
const missionsLastRefreshedAt = ref<Date | null>(null)
const { result: missionsResult, loading: missionsLoading, refetch: refetchMissions } = useQuery(
  MissionsDocument,
  () => ({
    locationId: currentLocationId.value,
  }),
  { enabled: computed(() => !!currentLocationId.value) },
)
const missions = computed(() => missionsResult.value?.missions ?? [])

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

const locationById = computed(() => {
  const map = new Map<string, (typeof locations.value)[number]>()
  for (const l of locations.value) map.set(l.id, l)
  return map
})

const myMissionByMissionId = computed(() => {
  const missions = me.value?.userMissions ?? []
  const map = new Map<string, (typeof missions)[number]>()
  for (const um of missions) map.set(um.mission.id, um)
  return map
})

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function fmtDistance(m: number | null) {
  if (m == null) return '—'
  if (m < 1000) return `${Math.round(m)}m`
  return `${(m / 1000).toFixed(1)}km`
}

function isOnCooldown(lockedUntil: string | null | undefined) {
  if (!lockedUntil) return false
  return new Date(lockedUntil).getTime() > Date.now()
}

function formatCompletedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

const nearbyQuests = computed(() => {
  const user = me.value
  const hasPos = typeof user?.posx === 'number' && typeof user?.posy === 'number'

  const rows = missions.value.map((q) => {
    const loc = q.locationId ? locationById.value.get(q.locationId) ?? null : null
    const dist =
      hasPos && loc ? haversineMeters(user!.posx as number, user!.posy as number, loc.posx, loc.posy) : null
    const um = myMissionByMissionId.value.get(q.id) ?? null
    const status = um?.status ?? null
    const cooldown = um?.lockedUntil ?? null
    return { quest: q, location: loc, distanceM: dist, userMission: um, status, cooldown }
  })

  rows.sort((a, b) => {
    if (a.distanceM == null && b.distanceM == null) return a.quest.title.localeCompare(b.quest.title)
    if (a.distanceM == null) return 1
    if (b.distanceM == null) return -1
    return a.distanceM - b.distanceM
  })

  return rows
})

const stats = computed(() => {
  const history = me.value?.questHistory ?? []
  const active = (me.value?.userMissions ?? []).filter((um) => um.status === UserMissionStatus.Active).length
  const earnedXp = history.reduce((sum, h) => sum + (h.rewardXp ?? 0), 0)
  const today = new Date().toDateString()
  const completedToday = history.filter((h) => new Date(h.completedAt).toDateString() === today).length
  return {
    active,
    earnedXp,
    completedTotal: history.length,
    completedToday,
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#0b0f0c] text-white font-sans pb-24">
    <header
      class="p-4 flex items-center justify-between border-b border-lime-500/10 bg-[#0b0f0c]/80 backdrop-blur sticky top-0 z-20"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm tracking-widest text-lime-300">MISIUNI</span>
      </div>
      <div class="text-[10px] text-gray-500 tracking-widest uppercase">
        <span v-if="meLoading || missionsLoading">se încarcă…</span>
        <span v-else-if="me">ca {{ me.name }}</span>
      </div>
    </header>

    <main class="p-4 space-y-6">
      <section class="rounded-2xl bg-[#101712] border border-lime-500/10 p-4">
        <div class="text-[10px] text-gray-400 tracking-[0.25em] uppercase">Statistici</div>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-[#0a0e0b] border border-white/5 p-3">
            <div class="text-[10px] text-gray-500 uppercase tracking-widest">Active</div>
            <div class="mt-1 text-lg font-bold text-lime-300 tabular-nums">{{ stats.active }}</div>
          </div>
          <div class="rounded-xl bg-[#0a0e0b] border border-white/5 p-3">
            <div class="text-[10px] text-gray-500 uppercase tracking-widest">XP câștigat</div>
            <div class="mt-1 text-lg font-bold text-orange-300 tabular-nums">{{ stats.earnedXp }}</div>
          </div>
          <div class="rounded-xl bg-[#0a0e0b] border border-white/5 p-3">
            <div class="text-[10px] text-gray-500 uppercase tracking-widest">Finalizate</div>
            <div class="mt-1 text-lg font-bold text-gray-200 tabular-nums">{{ stats.completedTotal }}</div>
          </div>
          <div class="rounded-xl bg-[#0a0e0b] border border-white/5 p-3">
            <div class="text-[10px] text-gray-500 uppercase tracking-widest">Astăzi</div>
            <div class="mt-1 text-lg font-bold text-cyan-200 tabular-nums">{{ stats.completedToday }}</div>
          </div>
        </div>
      </section>

      <section>
        <div class="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 class="text-[10px] text-gray-400 tracking-[0.25em] uppercase">Misiuni din apropiere</h2>
            <p class="text-[11px] text-gray-500 mt-1">
              Sortate după distanță (necesită poziția GPS).
            </p>
          </div>
        <div class="flex items-center gap-2">
          <router-link
            to="/MapPage"
            class="text-[10px] px-3 py-2 rounded-lg bg-lime-500/10 text-lime-300 border border-lime-400/20 uppercase tracking-widest"
          >
            Deschide harta
          </router-link>
        </div>
        </div>

        <div v-if="nearbyQuests.length === 0" class="text-xs text-gray-500 px-1 mt-3">
          Nu s-au găsit misiuni.
        </div>

        <div v-else class="mt-3 space-y-3">
          <div
            v-for="row in nearbyQuests"
            :key="row.quest.id"
            class="rounded-2xl bg-[#101712] border border-lime-500/10 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm font-semibold text-white truncate">{{ row.quest.title }}</div>
                <div v-if="row.quest.description" class="text-[11px] text-gray-500 mt-1 leading-snug">
                  {{ row.quest.description }}
                </div>
                <div class="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
                  <span class="text-lime-300/90">+{{ row.quest.rewardXp }} XP</span>
                  <span class="text-cyan-200/90">+{{ Math.max(1, Math.round((row.quest.rewardXp ?? 0) * 0.5)) }} PTS</span>
                  <span class="text-gray-500" v-if="row.location">
                    {{ row.location.name }} · {{ fmtDistance(row.distanceM) }}
                  </span>
                  <span class="text-gray-500" v-else>Misiune globală</span>
                </div>
              </div>
              <div class="shrink-0 text-[9px] uppercase tracking-wider">
                <span
                  v-if="row.status === UserMissionStatus.Active"
                  class="text-lime-300 border border-lime-400/25 bg-lime-500/10 px-2 py-0.5 rounded"
                >În desfășurare</span>
                <span
                  v-else-if="row.status === UserMissionStatus.Completed && !row.quest.repeatable"
                  class="text-orange-300 border border-orange-400/25 bg-orange-500/10 px-2 py-0.5 rounded"
                >Finalizată</span>
                <span
                  v-else-if="row.status === UserMissionStatus.Completed && row.quest.repeatable && isOnCooldown(row.cooldown)"
                  class="text-amber-200 border border-amber-300/25 bg-amber-500/10 px-2 py-0.5 rounded"
                >Răcire</span>
                <span
                  v-else-if="row.status === UserMissionStatus.Completed && row.quest.repeatable"
                  class="text-cyan-200 border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 rounded"
                >Repetabilă</span>
                <span
                  v-else
                  class="text-gray-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded"
                >Nouă</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="me && (me.questHistory?.length ?? 0) > 0">
        <div class="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 class="text-[10px] text-gray-400 tracking-[0.25em] uppercase">Istoric misiuni</h2>
            <p class="text-[11px] text-gray-500 mt-1">Ultimele completări.</p>
          </div>
        </div>

        <div class="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1 styled-scrollbar">
          <div
            v-for="q in me.questHistory"
            :key="q.id"
            class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-[#0a0e0b] border border-white/5 text-[11px]"
          >
            <div class="min-w-0">
              <div class="font-medium text-gray-200 truncate">{{ q.title }}</div>
              <div class="text-[10px] text-gray-500 mt-0.5">{{ formatCompletedAt(q.completedAt) }}</div>
            </div>
            <div class="shrink-0 text-lime-300/90 tabular-nums">
              +{{ q.rewardXp }} XP · +{{ Math.max(1, Math.round((q.rewardXp ?? 0) * 0.5)) }} PTS
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>


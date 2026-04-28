<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { useRouter } from 'vue-router'
import { LocationsDocument, MeDocument, MissionsDocument, UserMissionStatus } from '../api/graphql'
import UiTopBar from '../ui/UiTopBar.vue'
import UiCard from '../ui/UiCard.vue'
import UiBadge from '../ui/UiBadge.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiContainer from '../ui/UiContainer.vue'

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
  <div class="app-screen pb-nav-safe">
    <UiTopBar
      title="MISIUNI"
      :right-text="meLoading || missionsLoading ? 'se încarcă…' : me ? `ca ${me.name}` : ''"
    />

    <UiContainer as="main" class="py-4 space-y-6">
      <div class="flex items-center justify-between gap-3">
        <div class="text-[10px] text-white/55 tracking-[0.25em] uppercase">
          Ultima actualizare: <span class="tabular-nums">{{ missionsLastRefreshedLabel }}</span>
        </div>
        <div class="flex items-center gap-2">
          <UiButton variant="ghost" size="sm" :disabled="missionsLoading" @click="refreshMissions">
            Reîmprospătează
          </UiButton>
          <router-link to="/MapPage">
            <UiButton variant="ghost" size="sm">Hartă</UiButton>
          </router-link>
        </div>
      </div>

      <UiCard>
        <div class="text-[10px] text-white/55 tracking-[0.25em] uppercase">Statistici</div>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <UiCard variant="surface2" class="p-3" :padded="false">
            <div class="text-[10px] text-white/40 uppercase tracking-widest">Active</div>
            <div class="mt-1 text-lg font-bold text-[var(--c-accent)] tabular-nums">{{ stats.active }}</div>
          </UiCard>
          <UiCard variant="surface2" class="p-3" :padded="false">
            <div class="text-[10px] text-white/40 uppercase tracking-widest">XP câștigat</div>
            <div class="mt-1 text-lg font-bold text-orange-300 tabular-nums">{{ stats.earnedXp }}</div>
          </UiCard>
          <UiCard variant="surface2" class="p-3" :padded="false">
            <div class="text-[10px] text-white/40 uppercase tracking-widest">Finalizate</div>
            <div class="mt-1 text-lg font-bold text-white/80 tabular-nums">{{ stats.completedTotal }}</div>
          </UiCard>
          <UiCard variant="surface2" class="p-3" :padded="false">
            <div class="text-[10px] text-white/40 uppercase tracking-widest">Astăzi</div>
            <div class="mt-1 text-lg font-bold text-cyan-200 tabular-nums">{{ stats.completedToday }}</div>
          </UiCard>
        </div>
      </UiCard>

      <section>
        <div class="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 class="text-[10px] text-white/55 tracking-[0.25em] uppercase">Misiuni din apropiere</h2>
            <p class="text-[11px] text-white/40 mt-1">
              Sortate după distanță. Dacă nu vezi distanțe, activează locația și mergi pe Hartă.
            </p>
          </div>
        </div>

        <UiEmptyState
          v-if="nearbyQuests.length === 0 && !missionsLoading"
          class="mt-3"
          title="Nicio misiune aici"
          description="Selectează o locație pe Hartă și asigură-te că ai GPS activ."
          action-label="Deschide harta"
          tone="info"
          @action="router.push('/MapPage')"
        />

        <div v-else class="mt-3 space-y-3">
          <UiCard
            v-for="row in nearbyQuests"
            :key="row.quest.id"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm font-semibold text-white truncate">{{ row.quest.title }}</div>
                <div v-if="row.quest.description" class="text-[11px] text-white/45 mt-1 leading-snug">
                  {{ row.quest.description }}
                </div>
                <div class="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
                  <span class="text-[var(--c-accent)]/90">+{{ row.quest.rewardXp }} XP</span>
                  <span class="text-white/40" v-if="row.location">
                    {{ row.location.name }} · {{ fmtDistance(row.distanceM) }}
                  </span>
                  <span class="text-white/40" v-else>Misiune globală</span>
                </div>
              </div>
              <div class="shrink-0">
                <UiBadge v-if="row.status === UserMissionStatus.Active" tone="success">În desfășurare</UiBadge>
                <UiBadge
                  v-else-if="row.status === UserMissionStatus.Completed && !row.quest.repeatable"
                  tone="warning"
                >Finalizată</UiBadge>
                <UiBadge
                  v-else-if="row.status === UserMissionStatus.Completed && row.quest.repeatable && isOnCooldown(row.cooldown)"
                  tone="warning"
                >Răcire</UiBadge>
                <UiBadge
                  v-else-if="row.status === UserMissionStatus.Completed && row.quest.repeatable"
                  tone="info"
                >Repetabilă</UiBadge>
                <UiBadge v-else tone="neutral">Nouă</UiBadge>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <router-link
                v-if="row.quest.locationId"
                :to="{
                  path: '/MapPage',
                  query: {
                    locationId: row.quest.locationId,
                    missionId: row.quest.id,
                  },
                }"
              >
                <UiButton variant="ghost" size="sm">
                  {{ row.status === UserMissionStatus.Active ? 'Continuă' : 'Deschide locația' }}
                </UiButton>
              </router-link>
              <router-link v-else to="/MapPage">
                <UiButton variant="ghost" size="sm">Deschide pe Hartă</UiButton>
              </router-link>
            </div>
          </UiCard>
        </div>
      </section>
    </UiContainer>
  </div>
</template>


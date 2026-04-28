<script setup lang="ts">
import { useApolloClient, useQuery } from '@vue/apollo-composable'
import { useRouter } from 'vue-router'
import {
  MeDocument,
  UserMissionStatus,
} from '../api/graphql'
import { computed, ref } from 'vue'

const XP_PER_LEVEL = 600

const router = useRouter()
const actionError = ref('')
const { client: apollo } = useApolloClient()

const { result, loading, error, refetch: refetchMe } = useQuery(MeDocument)
console.log(error)

const user = computed(() => result.value?.me)

const ongoingMissions = computed(() => {
  const u = user.value
  return (u?.userMissions ?? []).filter((um) => um.status === UserMissionStatus.Active)
})

const levelInfo = computed(() => {
  const xp = user.value?.xp ?? 0
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  const pct = Math.min(100, (xpInLevel / XP_PER_LEVEL) * 100)
  return { xp, level, xpInLevel, pct, span: XP_PER_LEVEL }
})

const pageLoading = computed(() => loading.value)

const logout = () => {
  localStorage.removeItem('token')
  // Drop authenticated data from cache immediately.
  void apollo.clearStore()
  router.push('/login')
}

const users = [
  { id: 1, name: "Alex", distance: "120m", status: "walking" },
  { id: 2, name: "Maria", distance: "300m", status: "idle" },
  { id: 3, name: "Ion", distance: "80m", status: "arriving" },
]

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

function formatCompletedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

const questHistory = computed(() => user.value?.questHistory ?? [])
</script>

<template>
  <div class="min-h-screen bg-[#0b0f0c] text-white font-sans pb-20">
    <!-- TOP HUD -->
    <header class="p-4 flex justify-between items-center border-b border-lime-500/10 bg-[#0b0f0c]/80 backdrop-blur sticky top-0 z-20">
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3"/>
          <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6"/>
          <path d="M12 12 L20 6" stroke="currentColor"/>
        </svg>
        <span class="text-sm tracking-widest text-lime-300">PROFIL</span>
      </div>

      <div class="flex items-center gap-3">
        <div v-if="user" class="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/30">
          LVL {{ levelInfo.level }}
        </div>
        <button @click="logout" class="text-[10px] text-gray-400 border border-gray-700 px-2 py-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors">
          DECONECTARE
        </button>
      </div>
    </header>

    <main class="p-4 pb-24 space-y-6">
      <!-- USER CARD -->
      <section v-if="user" class="relative p-6 rounded-2xl bg-gradient-to-br from-[#101712] to-[#050705] border border-lime-500/20 overflow-hidden">
        <div class="absolute inset-0 opacity-10"
             style="background-image: linear-gradient(#1a2a1f 1px, transparent 1px), linear-gradient(90deg, #1a2a1f 1px, transparent 1px); background-size: 20px 20px;">
        </div>
        
        <div class="relative flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-lime-500/10 border-2 border-lime-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(132,255,122,0.2)]">
            <svg class="w-8 h-8 text-lime-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor"/>
              <path d="M4 20c2-4 14-4 16 0" stroke="currentColor"/>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white tracking-wide">{{ user.name }}</h2>
            <div class="text-xs text-lime-300 opacity-70 tracking-widest uppercase">Operator ID: {{ user.id.slice(-6) }}</div>
          </div>
        </div>
      </section>

      <div v-else-if="pageLoading" class="text-center py-10 text-lime-300 animate-pulse tracking-widest">
        SE ÎNCARCĂ...
      </div>

      <div v-else-if="error" class="text-center py-10 text-red-400 border border-red-400/20 bg-red-400/5 rounded-xl">
        CONEXIUNE EȘUATĂ
      </div>

      <!-- XP BAR -->
      <div v-if="user" class="px-2">
        <div class="flex justify-between text-[10px] text-gray-400 mb-2 uppercase tracking-widest">
          <span>XP (level {{ levelInfo.level }})</span>
          <span class="text-lime-300">{{ levelInfo.xpInLevel }} / {{ levelInfo.span }} · {{ levelInfo.xp }} total</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
          <div
            class="h-full bg-gradient-to-r from-lime-400 to-orange-400 shadow-[0_0_10px_rgba(132,255,122,0.5)] transition-all duration-300"
            :style="{ width: `${levelInfo.pct}%` }"
          ></div>
        </div>
      </div>

      <p v-if="actionError" class="text-[11px] text-red-400 px-2">{{ actionError }}</p>

      <!-- MISSIONS -->
      <section v-if="user">
        <h2 class="text-[10px] text-gray-400 mb-3 tracking-[0.2em] uppercase px-2">Misiuni în desfășurare</h2>
        <div v-if="ongoingMissions.length === 0" class="text-xs text-gray-500 px-2">
          Nu ai misiuni active. Pornește una de pe hartă.
        </div>
        <div class="space-y-3">
          <div
            v-for="um in ongoingMissions"
            :key="um.id"
            class="p-4 rounded-xl bg-[#0f1511] border border-lime-500/10 group hover:border-lime-500/30 transition-colors space-y-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm font-medium">{{ um.mission.title }}</div>
                <p v-if="um.mission.description" class="text-[11px] text-gray-500 mt-1 leading-snug">
                  {{ um.mission.description }}
                </p>
                <div class="text-[10px] text-lime-300 mt-2 tracking-wider">
                  Recompensă +{{ um.mission.rewardXp }} XP
                </div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Progres</span>
                <span>{{ um.progress }} / {{ um.mission.targetProgress }}</span>
              </div>
              <div class="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-lime-400/80 transition-all"
                  :style="{
                    width: `${Math.min(100, (um.progress / um.mission.targetProgress) * 100)}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- QUEST HISTORY -->
      <section v-if="user && questHistory.length > 0">
        <h2 class="text-[10px] text-gray-400 mb-3 tracking-[0.2em] uppercase px-2">Istoric misiuni</h2>
        <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <div
            v-for="q in questHistory"
            :key="q.id"
            class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-[#0a0e0b] border border-white/5 text-[11px]"
          >
            <div class="min-w-0">
              <div class="font-medium text-gray-200 truncate">{{ q.title }}</div>
              <div class="text-[10px] text-gray-500 mt-0.5">{{ formatCompletedAt(q.completedAt) }}</div>
            </div>
            <div class="shrink-0 text-lime-300/90 tabular-nums">+{{ q.rewardXp }} XP</div>
          </div>
        </div>
      </section>

      <!-- NEARBY PLAYERS -->
      <section>
        <h2 class="text-[10px] text-gray-400 mb-3 tracking-[0.2em] uppercase px-2">Jucători în zonă</h2>
        <div class="space-y-3">
          <div
            v-for="u in users"
            :key="u.id"
            class="flex items-center justify-between bg-[#101712] border border-lime-500/10 p-4 rounded-xl"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-lime-500/5 border border-lime-400/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-lime-400/70" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor"/>
                  <path d="M4 20c2-4 14-4 16 0" stroke="currentColor"/>
                </svg>
              </div>
              <div>
                <div class="text-sm">{{ u.name }}</div>
                <div class="text-[10px] text-gray-500 mt-0.5">{{ u.distance }} • {{ u.status }}</div>
              </div>
            </div>
            <button class="text-[10px] px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-300 border border-orange-400/20 uppercase tracking-widest">
              Invită
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

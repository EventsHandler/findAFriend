<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { useRouter } from 'vue-router'
import { MeDocument } from '../api/graphql'
import { computed } from 'vue'

const { result, loading, error } = useQuery(MeDocument)
const user = computed(() => result.value?.me)
const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

const users = [
  { id: 1, name: "Alex", distance: "120m", status: "walking" },
  { id: 2, name: "Maria", distance: "300m", status: "idle" },
  { id: 3, name: "Ion", distance: "80m", status: "arriving" },
]

const missions = [
  { title: "Walk 1km together", xp: 120 },
  { title: "Meet 2 new players", xp: 200 },
  { title: "Stay in zone 10 min", xp: 80 },
]
</script>

<template>
  <div class="min-h-screen bg-[#0b0f0c] text-white font-sans">
    <!-- TOP HUD -->
    <header class="p-4 flex justify-between items-center border-b border-lime-500/10 bg-[#0b0f0c]/80 backdrop-blur sticky top-0 z-20">
      <div class="flex items-center gap-2">
        <svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3"/>
          <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6"/>
          <path d="M12 12 L20 6" stroke="currentColor"/>
        </svg>
        <span class="text-sm tracking-widest text-lime-300">USER PROFILE</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/30">
          LVL 7
        </div>
        <button @click="logout" class="text-[10px] text-gray-400 border border-gray-700 px-2 py-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors">
          TERMINATE
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

      <div v-else-if="loading" class="text-center py-10 text-lime-300 animate-pulse tracking-widest">
        FETCHING DATA...
      </div>

      <div v-else-if="error" class="text-center py-10 text-red-400 border border-red-400/20 bg-red-400/5 rounded-xl">
        DATA LINK FAILED
      </div>

      <!-- XP BAR -->
      <div class="px-2">
        <div class="flex justify-between text-[10px] text-gray-400 mb-2 uppercase tracking-widest">
          <span>XP Progress</span>
          <span class="text-lime-300">420 / 600</span>
        </div>
        <div class="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
          <div class="h-full bg-gradient-to-r from-lime-400 to-orange-400 w-[70%] shadow-[0_0_10px_rgba(132,255,122,0.5)]"></div>
        </div>
      </div>

      <!-- MISSIONS -->
      <section>
        <h2 class="text-[10px] text-gray-400 mb-3 tracking-[0.2em] uppercase px-2">Current Missions</h2>
        <div class="space-y-3">
          <div
            v-for="(m, i) in missions"
            :key="i"
            class="flex items-center justify-between p-4 rounded-xl bg-[#0f1511] border border-lime-500/10 group hover:border-lime-500/30 transition-colors"
          >
            <div>
              <div class="text-sm font-medium">{{ m.title }}</div>
              <div class="text-[10px] text-lime-300 mt-1 tracking-wider">+{{ m.xp }} XP</div>
            </div>
            <button class="text-[10px] bg-lime-500/10 text-lime-300 px-4 py-1.5 rounded-full border border-lime-400/20 uppercase tracking-widest group-hover:bg-lime-500 group-hover:text-black transition-all">
              Start
            </button>
          </div>
        </div>
      </section>

      <!-- NEARBY PLAYERS -->
      <section>
        <h2 class="text-[10px] text-gray-400 mb-3 tracking-[0.2em] uppercase px-2">Players in Area</h2>
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
              Invite
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- BOTTOM NAV (GAME HUD) -->
    <footer class="fixed bottom-0 left-0 right-0 bg-[#0b0f0c]/90 backdrop-blur-md border-t border-lime-500/10 flex justify-around py-4 z-30">
      <router-link to="/MapPage" class="flex flex-col items-center text-gray-400 text-[10px] tracking-widest">
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 12L12 3l9 9" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 21V9h6v12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        MAP
      </router-link>

      <button class="flex flex-col items-center text-gray-400 text-[10px] tracking-widest">
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        QUESTS
      </button>

      <router-link to="/me" class="flex flex-col items-center text-lime-300 text-[10px] tracking-widest">
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        PROFILE
      </router-link>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useRoom } from './composables/useRoom'

const { currentRoomId } = useRoom()
const route = useRoute()
const router = useRouter()

const goToChat = () => {
  if (currentRoomId.value) {
    router.push(`/chat/${currentRoomId.value}`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0b0f0c] text-white font-sans flex flex-col">
    <RouterView />

    <!-- BOTTOM NAV (GAME HUD) -->
    <footer
      v-if="!$route.path.startsWith('/chat/')"
      class="fixed bottom-0 left-0 right-0 bg-[#0b0f0c]/90 backdrop-blur-md border-t border-lime-500/10 flex justify-around py-4 z-[2000] pointer-events-auto"
    >
      <router-link to="/MapPage" class="flex flex-col items-center text-gray-400 text-[10px] tracking-widest hover:text-lime-300 transition-colors"
                   :class="{ 'text-lime-300': $route.path === '/' || $route.path === '/MapPage' }">
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 12L12 3l9 9" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 21V9h6v12" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        MAP
      </router-link>

      <router-link
        to="/Quests"
        class="flex flex-col items-center text-gray-400 text-[10px] tracking-widest hover:text-lime-300 transition-colors"
        :class="{ 'text-lime-300': $route.path === '/Quests' }"
      >
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        QUESTS
      </router-link>

      <router-link to="/shop" class="flex flex-col items-center text-gray-400 text-[10px] tracking-widest hover:text-lime-300 transition-colors"
                   :class="{ 'text-lime-300': $route.path === '/shop' || $route.path === '/inventory' }">
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="m1 1 4 4h15l4-4"/>
          <path d="M3.5 11V1h17v10"/>
          <path d="m9 11 3 9"/>
        </svg>
        SHOP
      </router-link>

      <button v-if="currentRoomId" @click="goToChat" class="flex flex-col items-center text-gray-400 text-[10px] tracking-widest hover:text-lime-300 transition-colors"
              :class="{ 'text-lime-300': $route.path.startsWith('/chat/') }">
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        CHAT
      </button>

      <router-link to="/me" class="flex flex-col items-center text-gray-400 text-[10px] tracking-widest hover:text-lime-300 transition-colors"
                   :class="{ 'text-lime-300': $route.path === '/me' }">
        <svg class="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        PROFILE
      </router-link>
    </footer>
  </div>
</template>

<style>
@import './assets/main.css';

body {
  margin: 0;
  background-color: #0b0f0c;
}
</style>

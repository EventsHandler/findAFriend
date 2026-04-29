<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useRoom } from './composables/useRoom'
import { computed } from 'vue'

import MapActive from '@/assets/navigationIcons/MapActive.svg'
import MapUnactive from '@/assets/navigationIcons/MapUnactive.svg'

import QuestActive from '@/assets/navigationIcons/QuestActive.svg'
import QuestUnactive from '@/assets/navigationIcons/QuestInactive.svg'

import InventoryActive from '@/assets/navigationIcons/InventoryBackpackActive.svg'
import InventoryUnactive from '@/assets/navigationIcons/InventoryBackpackUnactive.svg'

import ChatActive from '@/assets/navigationIcons/ChatActive.svg'
import ChatUnactive from '@/assets/navigationIcons/ChatUnactive.svg'

import ProfileActive from '@/assets/navigationIcons/ProfileActive.svg'
import ProfileUnactive from '@/assets/navigationIcons/ProfileUnactive.svg'

const route = useRoute()

const isMap = computed(() =>
  route.path === '/' || route.path === '/MapPage'
)

const isQuest = computed(() =>
  route.path === '/Quests'
)

const isShop = computed(() =>
  route.path === '/inventory'
)

const isChat = computed(() =>
  route.path.startsWith('/chat/')
)

const isProfile = computed(() =>
  route.path === '/me'
)


const { currentRoomId } = useRoom()
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
      v-if="!route.path.startsWith('/chat/') && !route.path.startsWith('/login')"
      class="fixed bottom-0 left-0 right-0 z-[2000] bg-[#0b0f0c]/90 backdrop-blur-md border-t border-lime-500/10"
    >
      <div
        class="max-w-3xl mx-auto px-2 sm:px-4 h-[74px] sm:h-[82px] grid grid-cols-5 items-center"
      >
        <!-- SHOP -->
        <router-link
          to="/inventory"
          class="group flex flex-col items-center justify-center h-full transition-all"
        >
          <div
            class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all"
            :class="isShop ? 'bg-lime-400/10 border border-lime-400/20' : ''"
          >
            <img
              :src="isShop ? InventoryActive : InventoryUnactive"
              class="w-6 h-6 sm:w-7 sm:h-7"
            />
          </div>

          <span
            class="hidden sm:block text-[10px] mt-1 tracking-widest"
            :class="isShop ? 'text-lime-300' : 'text-gray-400'"
          >
            INVENTORY
          </span>
        </router-link>

        <!-- QUEST -->
        <router-link
          to="/Quests"
          class="group flex flex-col items-center justify-center h-full transition-all"
        >
          <div
            class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all"
            :class="isQuest ? 'bg-lime-400/10  border border-lime-400/20' : ''"
          >
            <img
              :src="isQuest ? QuestActive : QuestUnactive"
              class="w-6 h-6 sm:w-7 sm:h-7"
            />
          </div>

          <span
            class="hidden sm:block text-[10px] mt-1 tracking-widest"
            :class="isQuest ? 'text-lime-300' : 'text-gray-400'"
          >
            QUESTS
          </span>
        </router-link>

        <!-- MAP -->
        <router-link
          to="/MapPage"
          class="group flex flex-col items-center justify-center h-full transition-all"
        >
          <div
            class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all"
            :class="isMap ? 'bg-lime-400/10 border border-lime-400/20' : 'bg-[#0b0f0c]/50 border border-lime-500/10'"
          >
            <img
              :src="isMap ? MapActive : MapUnactive"
              class="w-6 h-6 sm:w-7 sm:h-7"
            />
          </div>

          <span
            class="hidden sm:block text-[10px] mt-1 tracking-widest"
            :class="isMap ? 'text-lime-300' : 'text-gray-400'"
          >
            MAP
          </span>
        </router-link>

        <!-- CHAT -->
        <button
          @click="currentRoomId ? goToChat() : null"
          :disabled="!currentRoomId"
          class="group flex flex-col items-center justify-center h-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div
            class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all"
            :class="isChat ? 'bg-lime-400/10 border border-lime-400/20' : ''"
          >
            <img
              :src="isChat ? ChatActive : ChatUnactive"
              class="w-6 h-6 sm:w-7 sm:h-7"
            />
          </div>

          <span
            class="hidden sm:block text-[10px] mt-1 tracking-widest"
            :class="currentRoomId ? (isChat ? 'text-lime-300' : 'text-gray-400') : 'text-gray-500'"
          >
            CHAT
          </span>
        </button>

        <!-- ME -->
        <router-link
          to="/me"
          class="group flex flex-col items-center justify-center h-full transition-all"
        >
          <div
            class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all"
            :class="isProfile ? 'bg-lime-400/10 border border-lime-400/20' : ''"
          >
            <img
              :src="isProfile ? ProfileActive : ProfileUnactive"
              class="w-6 h-6 sm:w-7 sm:h-7"
            />
          </div>

          <span
            class="hidden sm:block text-[10px] mt-1 tracking-widest"
            :class="isProfile ? 'text-lime-300' : 'text-gray-400'"
          >
            ME
          </span>
        </router-link>
      </div>
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

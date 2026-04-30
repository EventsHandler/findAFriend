<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

const props = defineProps<{
  currentRoomId?: string | null
}>()

const route = useRoute()
const router = useRouter()

const isHidden = computed(() => route.path.startsWith('/login'))

const isMap = computed(() => route.path === '/' || route.path === '/MapPage')
const isQuest = computed(() => route.path === '/Quests')
const isShop = computed(() => route.path === '/inventory')
const isChat = computed(() => route.path.startsWith('/chat/'))
const isProfile = computed(() => route.path === '/me')

function goToChat() {
  if (!props.currentRoomId) return
  router.push(`/chat/${props.currentRoomId}`)
}
</script>

<template>
  <footer
    v-if="!isHidden"
    class="fixed bottom-0 left-0 right-0 z-[2000] border-t border-[var(--c-border)] bg-[color:rgba(11,15,12,0.90)] backdrop-blur-md"
    :style="{ paddingBottom: 'var(--safe-bottom)' }"
  >
    <div class="max-w-6xl mx-auto px-2 sm:px-4 h-[var(--nav-h)] grid grid-cols-5 items-center">
      <router-link to="/inventory" aria-label="Inventory" class="flex flex-col items-center justify-center h-full">
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors"
          :class="isShop ? 'bg-white/5 border border-[var(--c-border-strong)]' : 'border border-transparent'"
        >
          <img :src="isShop ? InventoryActive : InventoryUnactive" class="w-6 h-6 sm:w-7 sm:h-7" alt="" aria-hidden="true" />
        </div>
        <span
          class="hidden sm:block text-[10px] mt-1 tracking-widest"
          :class="isShop ? 'text-[var(--c-accent)]' : 'text-white/45'"
        >
          INVENTORY
        </span>
      </router-link>

      <router-link to="/Quests" aria-label="Quests" class="flex flex-col items-center justify-center h-full">
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors"
          :class="isQuest ? 'bg-white/5 border border-[var(--c-border-strong)]' : 'border border-transparent'"
        >
          <img :src="isQuest ? QuestActive : QuestUnactive" class="w-6 h-6 sm:w-7 sm:h-7" alt="" aria-hidden="true" />
        </div>
        <span
          class="hidden sm:block text-[10px] mt-1 tracking-widest"
          :class="isQuest ? 'text-[var(--c-accent)]' : 'text-white/45'"
        >
          QUESTS
        </span>
      </router-link>

      <router-link to="/MapPage" aria-label="Map" class="flex flex-col items-center justify-center h-full">
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors border"
          :class="isMap ? 'bg-white/5 border-[var(--c-border-strong)]' : 'bg-white/0 border-[var(--c-border)]'"
        >
          <img :src="isMap ? MapActive : MapUnactive" class="w-6 h-6 sm:w-7 sm:h-7" alt="" aria-hidden="true" />
        </div>
        <span
          class="hidden sm:block text-[10px] mt-1 tracking-widest"
          :class="isMap ? 'text-[var(--c-accent)]' : 'text-white/45'"
        >
          MAP
        </span>
      </router-link>

      <button
        type="button"
        aria-label="Chat"
        class="flex flex-col items-center justify-center h-full disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!currentRoomId"
        @click="goToChat"
      >
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors"
          :class="isChat ? 'bg-white/5 border border-[var(--c-border-strong)]' : 'border border-transparent'"
        >
          <img 
            :src="isChat ? ChatActive : ChatUnactive" 
            :class="['w-6 h-6 sm:w-7 sm:h-7', { 'cursor-pointer': isChat }]" 
            alt="" 
            aria-hidden="true" 
          />
        </div>
        <span
          class="hidden sm:block text-[10px] mt-1 tracking-widest"
          :class="currentRoomId ? (isChat ? 'text-[var(--c-accent)]' : 'text-white/45') : 'text-white/30'"
        >
          CHAT
        </span>
      </button>

      <router-link to="/me" aria-label="Profile" class="flex flex-col items-center justify-center h-full">
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors"
          :class="isProfile ? 'bg-white/5 border border-[var(--c-border-strong)]' : 'border border-transparent'"
        >
          <img :src="isProfile ? ProfileActive : ProfileUnactive" class="w-6 h-6 sm:w-7 sm:h-7" alt="" aria-hidden="true" />
        </div>
        <span
          class="hidden sm:block text-[10px] mt-1 tracking-widest"
          :class="isProfile ? 'text-[var(--c-accent)]' : 'text-white/45'"
        >
          ME
        </span>
      </router-link>
    </div>
  </footer>
</template>


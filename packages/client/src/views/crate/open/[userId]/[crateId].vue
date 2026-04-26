<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import crateClosed from '@/assets/crates/crate-closed.svg'
import crateOpen from '@/assets/crates/crate-open.svg'

const route = useRoute()
const router = useRouter()
const userId = computed(() => String(route.params.userId || ''))
const crateId = computed(() => String(route.params.crateId || ''))


const crateState = ref<'closed' | 'open' | 'reward'>('closed')
const isOpening = ref(false)

function openCrate() {
  if (isOpening.value) return

  isOpening.value = true
  crateState.value = 'open'

  setTimeout(() => {
    crateState.value = 'reward'
  }, 1000)

  setTimeout(() => {
    router.push('/inventory')
  }, 2500)
}

const currImage = computed(() => {
  if ((crateState.value === 'closed')) return crateClosed
  if ((crateState.value === 'open')) return crateOpen
  // return crateBadge
})

const stateMessage = computed(() => {
  if ((crateState.value === 'closed')) return 'Tap!'
  if ((crateState.value === 'open')) return 'Opening...'
  return 'New badge unlocked!'
})
</script>

<template>
  <div
    class="min-h-screen bg-[#0b0f0c] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden"
  >
    <div class="absolute top-4 left-4 flex items-center gap-2">
      <svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3" />
        <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6" />
        <path d="M12 12 L20 6" stroke="currentColor" />
      </svg>
      <span class="text-sm tracking-widest text-lime-300 uppercase"> Reward System </span>
    </div>

    <div
      class="w-full max-w-md bg-[#101712] border border-lime-500/20 p-8 rounded-2xl shadow-[0_0_30px_rgba(132,255,122,0.05)] relative overflow-hidden"
    >
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        style="
          background-image:
            linear-gradient(#1a2a1f 1px, transparent 1px), linear-gradient(90deg, #1a2a1f 1px, transparent 1px);
          background-size: 20px 20px;
        "
      />

      <div class="relative z-10 flex flex-col items-center">
        <div class="text-xs text-gray-400 tracking-widest uppercase mb-2">Crate #{{ crateId }}</div>

        <h1 class="text-2xl font-bold text-lime-400 tracking-widest uppercase mb-8">
          {{ stateMessage }}
        </h1>

        <img
          :src="currImage"
          alt="crate"
          class="w-48 h-48 object-contain transition-all duration-700"
          :class="crateState === 'reward' ? 'scale-110' : 'scale-100'"
        />

        <div v-if="crateState === 'reward'" class="mt-6 text-center">
          <div class="text-lg text-lime-300 font-bold tracking-wide">New Badge Earned</div>
          <div class="text-sm text-gray-400 mt-1 tracking-widest uppercase">Explorer</div>
        </div>

        <button
          v-if="crateState === 'closed'"
          @click="openCrate"
          class="mt-8 w-full py-3 bg-lime-500 text-black font-bold rounded-xl hover:bg-lime-400 transition-colors shadow-[0_0_15px_rgba(132,255,122,0.3)]"
        >
          OPEN REWARD BOX
        </button>

        <div v-if="crateState === 'open'" class="mt-8 text-xs text-gray-400 tracking-widest uppercase animate-pulse">
          Unlocking reward...
        </div>
      </div>
    </div>

    <div class="mt-8 flex gap-4 opacity-50">
      <div class="h-1 w-12 bg-lime-500/30 rounded-full" />
      <div class="h-1 w-24 bg-orange-500/30 rounded-full" />
      <div class="h-1 w-12 bg-lime-500/30 rounded-full" />
    </div>
  </div>
</template>

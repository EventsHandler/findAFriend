<script setup lang="ts">
import { useQuery, useMutation } from '@vue/apollo-composable'
import { MeDocument, AddPointsDocument, CratesDocument, BuyCrateDocument } from '../api/graphql'
import { computed, ref } from 'vue'
import CommonCrateClosed from '../assets/crates/CommonChestClosed.svg'
import EpicCrateClosed from '../assets/crates/EpicChestClosed.svg'
import LegendaryCrateClosed from '../assets/crates/LegendaryChestClosed.svg'

type Rarity = 'COMMON' | 'EPIC' | 'LEGENDARY'

const { result, refetch } = useQuery(MeDocument)
const user = computed(() => result.value?.me)

const { result: cratesResult } = useQuery(CratesDocument)
const crates = computed(() => cratesResult.value?.crates ?? [])

const { mutate: addPoints, loading: addPointsLoading } = useMutation(AddPointsDocument)
const { mutate: buyCrate, loading: buyCrateLoading } = useMutation(BuyCrateDocument)
const isLoading = computed(() => addPointsLoading.value || buyCrateLoading.value)

const shopCrates = computed(() => {
  const grouped: Record<Rarity, any | null> = {
    COMMON: null,
    EPIC: null,
    LEGENDARY: null,
  }
  for (const crate of crates.value) {
    if (!grouped[crate.rarity]) {
      grouped[crate.rarity] = crate
    }
  }
  return Object.values(grouped).filter(Boolean)
})

function getImage(rarity: string) {
  switch (rarity) {
    case 'COMMON':
      return CommonCrateClosed
    case 'EPIC':
      return EpicCrateClosed
    case 'LEGENDARY':
      return LegendaryCrateClosed
  }
}

const errorMessage = ref('')
const succes = ref(false)

async function buyCrateHandler(crate: any) {
  errorMessage.value = ''
  succes.value = false
  if (!user.value?.id) return
  try {
    const res = await buyCrate({
      userId: user.value.id,
      crateId: crate.id,
      quantity: 1,
    })
    succes.value = true
    setTimeout(() => {
      succes.value = false
    }, 1500)
    await refetch()
  } catch (err) {
    console.log(err)
    errorMessage.value = 'Nu aveti suficiente puncte'
    setTimeout(() => {
      errorMessage.value = ''
    }, 1500)
  }
}

async function addPointsHandler() {
  if (!user.value?.id) return
  try {
    await addPoints({
      userId: user?.value?.id,
      amount: 1000,
    })
    await refetch()
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0b0f0c] text-white font-sans pb-24">
    <header class="sticky top-0 z-20 p-4 border-b border-lime-500/10 bg-[#0b0f0c]/90 backdrop-blur-md">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[10px] text-gray-400 tracking-[0.25em] uppercase cursor-default">Sistem recompense</div>
          <h1 class="text-xl font-bold text-lime-300 tracking-widest uppercase cursor-default">Magazin crate-uri</h1>
        </div>

        <div
          class="px-4 py-2 rounded-xl bg-[#101712] border border-lime-500/20 shadow-[0_0_20px_rgba(132,255,122,0.05)]"
        >
          <div class="text-[10px] text-gray-400 uppercase tracking-widest cursor-default">Puncte</div>
          <div class="text-lg font-bold text-lime-400 cursor-default">{{ user?.points ?? 0 }}</div>
        </div>
      </div>
    </header>

    <main class="p-4 space-y-6">
      <div
        v-if="succes"
        class="p-4 rounded-xl border border-lime-400/20 bg-lime-500/5 text-lime-300 text-sm tracking-widest uppercase"
      >
        Cutia a fost cumpărată și adăugată în inventar
      </div>
      <div
        v-if="errorMessage"
        class="p-4 rounded-xl border border-red-400/20 bg-red-500/5 text-red-300 text-sm tracking-widest uppercase"
      >
        {{ errorMessage }}
      </div>
      <section
        class="relative p-6 rounded-2xl bg-linear-to-br from-[#101712] to-[#050705] border border-lime-500/20 overflow-hidden"
      >
        <div
          class="absolute inset-0 opacity-10"
          style="
            background-image:
              linear-gradient(#1a2a1f 1px, transparent 1px), linear-gradient(90deg, #1a2a1f 1px, transparent 1px);
            background-size: 20px 20px;
          "
        />

        <div class="relative">
          <div class="text-sm text-white font-semibold cursor-default">Alege cutia dorită</div>
          <div class="text-[10px] text-gray-400 mt-1 tracking-widest uppercase cursor-default">
            Deblochează badge-uri și iteme rare
          </div>
        </div>
      </section>

      <section class="px-4 space-y-4">
        <div
          v-for="crate in shopCrates"
          :key="crate.id"
          class="group relative p-5 rounded-2xl bg-[#101712] border border-lime-500/10 flex items-center justify-between overflow-hidden hover:border-lime-400/30 transition"
        >
          <div class="absolute right-4 opacity-10 group-hover:opacity-20 transition">
            <img :src="getImage(crate.rarity)" class="w-20 h-20" />
          </div>

          <div class="relative z-10">
            <div class="text-xs tracking-widest uppercase text-gray-400 cursor-default">Crate</div>

            <div
              class="text-sm font-bold uppercase tracking-widest cursor-default"
              :class="{
                'text-gray-300': crate.rarity === 'COMMON',
                'text-blue-400': crate.rarity === 'EPIC',
                'text-yellow-400': crate.rarity === 'LEGENDARY',
              }"
            >
              {{ crate.rarity }}
            </div>

            <div class="text-xs text-gray-400 mt-1 cursor-default">Preț: {{ crate.price }} P</div>
          </div>

          <!-- RIGHT BUTTON -->
          <button
            @click="buyCrateHandler(crate)"
            :disabled="isLoading"
            class="relative z-10 text-[10px] px-4 py-2 rounded-full border border-lime-400/20 bg-lime-500/10 text-lime-300 uppercase tracking-widest hover:bg-lime-500 hover:text-black transition cursor-pointer"
          >
            {{ isLoading ? 'Loading...' : 'Cumpără' }}
          </button>
        </div>
      </section>

      <button
        @click="addPointsHandler"
        :disabled="isLoading"
        class="w-full py-3 rounded-xl border border-lime-500/20 text-lime-300 tracking-widest uppercase hover:bg-lime-500 hover:text-black transition cursor-pointer"
      >
        {{ isLoading ? 'Loading...' : '+1000 PUNCTE' }}
      </button>
    </main>
  </div>
</template>

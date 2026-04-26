<script setup lang="ts">
import { useQuery, useMutation } from '@vue/apollo-composable'
import { MeDocument, AddPointsDocument, CratesDocument, BuyCrateDocument } from '../api/graphql'
import { computed, ref } from 'vue'

type Rarity = 'COMMON' | 'EPIC' | 'LEGENDARY'

const { result, refetch } = useQuery(MeDocument)
const user = computed(() => result.value?.me)

const { result: cratesResult } = useQuery(CratesDocument)
const crates = computed(() => cratesResult.value?.crates ?? [])

const { mutate: addPoints } = useMutation(AddPointsDocument)
const { mutate: buyCrate } = useMutation(BuyCrateDocument)

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
        succes.value =  false
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
      amount: 100,
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
          <div class="text-[10px] text-gray-400 tracking-[0.25em] uppercase">Sistem recompense</div>
          <h1 class="text-xl font-bold text-lime-300 tracking-widest uppercase">Magazin crate-uri</h1>
        </div>

        <div
          class="px-4 py-2 rounded-xl bg-[#101712] border border-lime-500/20 shadow-[0_0_20px_rgba(132,255,122,0.05)]"
        >
          <div class="text-[10px] text-gray-400 uppercase tracking-widest">Puncte</div>
          <div class="text-lg font-bold text-lime-400">{{ user?.points ?? 0 }}</div>
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
          <div class="text-sm text-white font-semibold">Alege cutia dorită</div>
          <div class="text-[10px] text-gray-400 mt-1 tracking-widest uppercase">
            Deblochează badge-uri și iteme rare
          </div>
        </div>
      </section>

      <section class="px-4 space-y-4">
        <div
          v-for="crate in shopCrates"
          :key="crate.id"
          class="p-5 rounded-2xl bg-[#101712] border border-lime-500/10 flex justify-between items-center"
        >
          <div>
            <div>
              <div class="text-sm font-bold uppercase tracking-widest text-lime-300">
                {{ crate.rarity }}
              </div>
              <div class="text-xs text-gray-400 mt-1">Preț: {{ crate.price }} P</div>
            </div>
          </div>

          <button
            @click="buyCrateHandler(crate)"
            class="text-[10px] px-4 py-2 rounded-full border border-lime-400/20 bg-lime-500/10 text-lime-300 uppercase tracking-widest hover:bg-lime-500 hover:text-black transition"
          >
            Cumpără
          </button>
        </div>
      </section>

      <button
        @click="addPointsHandler"
        class="w-full py-3 rounded-xl border border-lime-500/20 text-lime-300 tracking-widest uppercase"
      >
        +100 puncte
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useQuery, useMutation } from '@vue/apollo-composable'
import { MeDocument, AddPointsDocument, CratesDocument, BuyCrateDocument } from '../api/graphql'
import { computed, ref } from 'vue'
import CommonCrateClosed from '../assets/crates/CommonChestClosed.svg'
import EpicCrateClosed from '../assets/crates/EpicChestClosed.svg'
import LegendaryCrateClosed from '../assets/crates/LegendaryChestClosed.svg'
import UiTopBar from '../ui/UiTopBar.vue'
import UiCard from '../ui/UiCard.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiContainer from '../ui/UiContainer.vue'

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
    // ignore for demo flow
  }
}
</script>

<template>
  <div class="app-screen pb-nav-safe">
    <UiTopBar title="MAGAZIN" subtitle="Sistem recompense">
      <template #right>
        <UiCard variant="surface2" :padded="false" class="px-4 py-2">
          <div class="text-[10px] text-white/45 uppercase tracking-widest">Puncte</div>
          <div class="text-lg font-bold text-[var(--c-accent)]">{{ user?.points ?? 0 }}</div>
        </UiCard>
      </template>
    </UiTopBar>

    <UiContainer as="main" class="py-4 space-y-6">
      <div
        v-if="succes"
        class="p-4 rounded-xl border border-[var(--c-border-strong)] bg-white/5 text-[var(--c-accent)] text-sm tracking-widest uppercase"
      >
        Cutia a fost cumpărată și adăugată în inventar
      </div>
      <div
        v-if="errorMessage"
        class="p-4 rounded-xl border border-red-400/20 bg-red-500/5 text-red-300 text-sm tracking-widest uppercase"
      >
        {{ errorMessage }}
      </div>
      <section class="relative p-6 rounded-2xl bg-linear-to-br from-[var(--c-surface)] to-[#050705] border border-[var(--c-border-strong)] overflow-hidden">
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
          <div class="text-[10px] text-white/45 mt-1 tracking-widest uppercase cursor-default">
            Deblochează badge-uri și iteme rare
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="text-[11px] text-white/45 cursor-default">
          Tip: crate-urile îți pot debloca badge-uri. După cumpărare, le găsești în Inventar.
        </div>

        <UiEmptyState
          v-if="shopCrates.length === 0"
          title="Magazin gol"
          description="Nu sunt crate-uri disponibile momentan."
          tone="neutral"
        />
        <UiCard
          v-for="crate in shopCrates"
          :key="crate.id"
          :padded="false"
          class="group relative p-5 flex items-center justify-between overflow-hidden hover:border-[var(--c-border-strong)] transition"
        >
          <div class="absolute right-4 opacity-10 group-hover:opacity-20 transition">
            <img :src="getImage(crate.rarity)" class="w-20 h-20" />
          </div>

          <div class="relative z-10">
            <div class="text-xs tracking-widest uppercase text-white/45 cursor-default">Crate</div>

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

            <div class="text-xs text-white/45 mt-1 cursor-default">Preț: {{ crate.price }} P</div>
          </div>

          <!-- RIGHT BUTTON -->
          <UiButton variant="ghost" size="sm" class="relative z-10" @click="buyCrateHandler(crate)">
            {{ isLoading ? 'Loading...' : 'Cumpără' }}
          </UiButton>
        </UiCard>
      </section>

      <UiButton variant="ghost" block @click="addPointsHandler" class="hover:bg-lime-500">
        {{ isLoading ? 'Loading...' : '+1000 PUNCTE' }}
      </UiButton>
    </UiContainer>
  </div>
</template>

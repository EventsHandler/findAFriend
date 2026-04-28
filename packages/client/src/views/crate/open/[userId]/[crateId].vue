<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { OpenCrateDocument, RarityType, CurrentUserDocument } from '../../../../api/graphql'
import UiCard from '../../../../ui/UiCard.vue'
import UiButton from '../../../../ui/UiButton.vue'

import CommonCrateClosed from '../../../../assets/crates/CommonChestClosed.svg'
import CommonCrateOpened from '../../../../assets/crates/CommonChestOpened.svg'
import EpicCrateClosed from '../../../../assets/crates/EpicChestClosed.svg'
import EpicCrateOpened from '../../../../assets/crates/EpicChestOpened.svg'
import LegendaryCrateClosed from '../../../../assets/crates/LegendaryChestClosed.svg'
import LegendaryCrateOpened from '../../../../assets/crates/LegendaryChestOpened.svg'

import badge_1 from '../../../../assets/badges/common/FirstStep.svg'
import badge_2 from '../../../../assets/badges/common/Lucky.svg'
import badge_3 from '../../../../assets/badges/common/SocialSpark.svg'

import badge_4 from '../../../../assets/badges/epic/ConnectionBuilder.svg'
import badge_5 from '../../../../assets/badges/epic/Momentum.svg'
import badge_6 from '../../../../assets/badges/epic/TeamPlayer.svg'

import badge_7 from '../../../../assets/badges/legendary/CommunityIcon.svg'
import badge_8 from '../../../../assets/badges/legendary/SocialLegend.svg'
import badge_9 from '../../../../assets/badges/legendary/Unstoppable.svg'

const route = useRoute()
const router = useRouter()

const crateState = ref<'closed' | 'open' | 'reward'>('closed')
const redirectButton = ref<boolean>(false)
const isOpening = ref(false)
const reward = ref<any>(null)
const { result } = useQuery(CurrentUserDocument)
const user = computed(() => result.value?.me)
const crateId = route.params.crateId
const currCrate = user.value?.crateInventories?.find(
    crate => crate.crateId === crateId
  )

const { mutate: openCrateMutation } = useMutation(OpenCrateDocument, {
  refetchQueries: [{ query: CurrentUserDocument }],
  awaitRefetchQueries: true,
})

const badgeMap: Record<string, string> = {
  badge_1,
  badge_2,
  badge_3,
  badge_4,
  badge_5,
  badge_6,
  badge_7,
  badge_8,
  badge_9,
}

function getClosedImage() {
  if(!currCrate) return
  switch (currCrate.crate?.rarity) {
    case RarityType.Common:
      return CommonCrateClosed
    case RarityType.Epic:
      return EpicCrateClosed
    case RarityType.Legendary:
      return LegendaryCrateClosed
    default:
      return CommonCrateClosed
  }
}
function getOpenImage() {
  if(!currCrate) return
  switch (currCrate.crate?.rarity) {
    case RarityType.Common:
      return CommonCrateOpened
    case RarityType.Epic:
      return EpicCrateOpened
    case RarityType.Legendary:
      return LegendaryCrateOpened
    default:
      return CommonCrateOpened
  }
}

const currImage = computed(() => {
  if (crateState.value === 'closed') return getClosedImage()
  if (crateState.value === 'open') return getOpenImage()
  return reward.value?.svg
})

const stateMessage = computed(() => {
  if (crateState.value === 'closed') return 'Apasă!'
  if (crateState.value === 'open') return 'Se deschide...'
  return 'Noul tău badge!'
})

async function openCrate() {
  if (isOpening.value) return

  isOpening.value = true

  try {
    crateState.value = 'closed'
    await new Promise(r => setTimeout(r, 400))
    crateState.value = 'open'
    const res = await openCrateMutation({
      userId: String(route.params.userId),
      crateId: String(route.params.crateId),
    })

    const item = res?.data?.openCrate

    if (!item) {
      throw new Error('No reward received')
    }

    reward.value = {
      name: item.name,
      rarity: item.rarity,
      svg: badgeMap[item.svgId] || CommonCrateClosed,
    }
    await new Promise(r => setTimeout(r, 700))
    crateState.value = 'reward'

    redirectButton.value = true
  } catch (err) {
    crateState.value = 'closed'
  } finally {
    isOpening.value = false
  }
}
</script>

<template>
  <div
    class="app-screen flex flex-col items-center justify-center p-4 relative overflow-hidden pb-nav-safe"
  >
    <div class="absolute top-4 left-4 flex items-center gap-2">
      <svg class="w-6 h-6 text-lime-400" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" opacity="0.3" />
        <circle cx="12" cy="12" r="6" stroke="currentColor" opacity="0.6" />
        <path d="M12 12 L20 6" stroke="currentColor" />
      </svg>
      <span class="text-sm tracking-widest text-lime-300 uppercase"> Reward System </span>
    </div>

    <UiCard class="w-full max-w-md relative overflow-hidden" :padded="false">
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        style="
          background-image:
            linear-gradient(#1a2a1f 1px, transparent 1px), linear-gradient(90deg, #1a2a1f 1px, transparent 1px);
          background-size: 20px 20px;
        "
      />

      <div class="relative z-10 flex flex-col items-center p-6 sm:p-8">
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
          <div class="text-lg text-lime-300 font-bold tracking-wide">Nou badge câștigat!</div>
          <div class="text-sm text-gray-400 mt-1 tracking-widest uppercase">{{ reward.name }}</div>
        </div>

        <UiButton v-if="crateState === 'closed'" block :loading="isOpening" @click="openCrate" class="mt-8">
          Deschide crate-ul cu recompensă
        </UiButton>

        <UiButton v-if="redirectButton" block @click="router.push('/inventory')" class="mt-3">
          Înapoi la inventar
        </UiButton>

        <div v-if="crateState === 'open'" class="mt-8 text-xs text-gray-400 tracking-widest uppercase animate-pulse">
          Deblocarea recompensei...
        </div>
      </div>
    </UiCard>

    <div class="mt-8 flex gap-4 opacity-50">
      <div class="h-1 w-12 bg-lime-500/30 rounded-full" />
      <div class="h-1 w-24 bg-orange-500/30 rounded-full" />
      <div class="h-1 w-12 bg-lime-500/30 rounded-full" />
    </div>
  </div>
</template>

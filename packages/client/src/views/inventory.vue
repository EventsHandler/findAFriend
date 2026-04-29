<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CurrentUserDocument, GetBadgesDocument } from '../api/graphql'
import { useQuery } from '@vue/apollo-composable'
import { RarityType } from '../api/graphql'
import CommonCrate from '../assets/crates/CommonChestClosed.svg'
import EpicCrate from '../assets/crates/EpicChestClosed.svg'
import LegendaryCrate from '../assets/crates/LegendaryChestClosed.svg'
import UiTopBar from '../ui/UiTopBar.vue'
import UiCard from '../ui/UiCard.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiContainer from '../ui/UiContainer.vue'

import badge_1 from "../assets/badges/common/FirstStep.svg"
import badge_2 from "../assets/badges/common/Lucky.svg"
import badge_3 from "../assets/badges/common/SocialSpark.svg"

import badge_4 from "../assets/badges/epic/ConnectionBuilder.svg"
import badge_5 from "../assets/badges/epic/Momentum.svg"
import badge_6 from "../assets/badges/epic/TeamPlayer.svg"

import badge_7 from "../assets/badges/legendary/CommunityIcon.svg"
import badge_8 from "../assets/badges/legendary/SocialLegend.svg"
import badge_9 from "../assets/badges/legendary/Unstoppable.svg"

import ShopUnactive from '@/assets/navigationIcons/ShopUnactive.svg'

const router = useRouter()

const { result, refetch } = useQuery(CurrentUserDocument)
const user = computed(() => result.value?.me)

const crateItems = computed(
  () =>
    user.value?.crateInventories?.map(crate => ({
      id: crate.crateId,
      name: crate.crate?.name ?? 'Unknown',
      rarity: crate.crate?.rarity ?? 'COMMON',
      quantity: crate.quantity,
    })) ?? [],
)

const { result: badges } = useQuery(GetBadgesDocument)
const allBadges = computed(() => badges.value?.items)

const userBadges = computed(() =>
  user.value?.inventories?.map(badge => ({
    id: badge.item?.id,
    name: badge.item?.name ?? 'Unknown',
    rarity: badge.item?.rarity ?? 'COMMON',
    svgId: badge.item?.svgId ?? 'Unknown',
    quantity: badge.quantity,
  })),
)

const badgeItems = computed(() => {
  const owned = new Set(userBadges.value?.map(badge => badge.id) ?? [])

  return (
    allBadges.value?.map(badge => ({
      id: badge.id,
      name: badge.name,
      rarity: badge.rarity,
      svgId: badge.svgId,
      unlocked: owned.has(badge.id),
      quantity: userBadges.value?.find(b => b.id === badge.id)?.quantity ?? 0,
    })) ?? []
  )
})

function rarityColor(type: string) {
  switch (type) {
    case RarityType.Common:
      return 'text-gray-400'
    case RarityType.Epic:
      return 'text-blue-400'
    case RarityType.Legendary:
      return 'text-yellow-400'
    default:
      return 'text-white'
  }
}

function rarityImage(type: string) {
  switch (type) {
    case RarityType.Common:
      return CommonCrate
    case RarityType.Epic:
      return EpicCrate
    case RarityType.Legendary:
      return LegendaryCrate
    default:
      return CommonCrate
  }
}

const badgeImages: Record<string, string> = {
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

function getBadgeImage(name: string) {
  return badgeImages[name] || badge_1 
}

function handleItemClick(item: any) {
    if (!user.value?.id) return
    router.push(`/crate/open/${user.value.id}/${item.id}`)
}
onMounted(() => {
  refetch()
})
</script>

<template>
  <div class="app-screen pb-nav-safe">
    <UiTopBar title="INVENTAR">
      <template #right>
        <router-link to="/shop" class="inline-flex items-center gap-2">
          <UiButton variant="ghost" size="sm">
            <img :src="ShopUnactive" class="w-4 h-4 object-contain" alt="" aria-hidden="true" />
            <span>Shop</span>
          </UiButton>
        </router-link>
      </template>
    </UiTopBar>

    <UiContainer class="py-4 space-y-6">
      <div class="text-[11px] text-white/45">
        Tip: apasă pe un crate ca să îl deschizi. Badge-urile blocate se deblochează din crate-uri.
      </div>

    <!-- CRATES SECTION -->
    <section>
      <div
        class="w-full sm:w-fit px-4 py-3 rounded-t-xl border border-[var(--c-border-strong)] bg-[var(--c-accent)] text-black text-sm sm:text-base font-semibold"
      >
        Crate-uri
      </div>
      <div
        class="p-4 sm:p-6 bg-[var(--c-surface)] border border-t-0 border-[var(--c-border-strong)] rounded-b-xl shadow-[var(--shadow-soft)]"
      >
        <UiEmptyState
          v-if="crateItems.length === 0"
          title="Niciun crate"
          description="Cumpără un crate din Shop și revino aici ca să îl deschizi."
          action-label="Deschide Shop"
          tone="info"
          @action="router.push('/shop')"
        />
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <div
            v-for="item in crateItems"
            :key="item.id"
            @click="handleItemClick(item)"
            @keydown.enter="handleItemClick(item)"
            @keydown.space.prevent="handleItemClick(item)"
            tabindex="0"
            role="button"
            class="group flex flex-col justify-between p-3 rounded-2xl border border-[var(--c-border)] bg-[color:rgba(13,20,16,1)] hover:bg-[color:rgba(22,33,26,1)] hover:border-[var(--c-border-strong)] transition-all duration-300 cursor-pointer aspect-square shadow-md hover:shadow-lime-500/10"
          >
            <div class="flex justify-center items-center flex-1">
              <img
                :src="rarityImage(item.rarity)"
                :alt="item.name"
                class="w-12 h-12 sm:w-16 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div class="space-y-2 mt-3">
              <p class="text-xs sm:text-sm text-center truncate" :class="rarityColor(item.rarity)">{{ item.name }}</p>
              <div class="flex justify-between text-[12px] sm:text-[16px]">
                <span :class="rarityColor(item.rarity)"> {{ item.rarity }} </span>
                <span :class="rarityColor(item.rarity)"> x{{ item.quantity }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- BADGES SECTION -->
    <section>
      <div
        class="w-full sm:w-fit px-4 py-3 rounded-t-xl border border-[var(--c-border-strong)] bg-[var(--c-accent)] text-black text-sm sm:text-base font-semibold"
      >
        Badge-uri
      </div>
      <div class="p-4 sm:p-6 bg-[var(--c-surface)] border border-t-0 border-[var(--c-border-strong)] rounded-b-xl shadow-[var(--shadow-soft)]">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <div
          v-for="badge in badgeItems"
          :key="badge.id"
          role="button"
          tabindex="0"
          class="group relative flex flex-col justify-between p-3 rounded-2xl border border-[var(--c-border)] bg-[color:rgba(13,20,16,1)] hover:bg-[color:rgba(22,33,26,1)] transition-all duration-300 aspect-square shadow-md"
        >
          <div class="flex justify-center items-center flex-1 relative">
            <img
              :src="getBadgeImage(badge.svgId)"
              :alt="badge.name"
              class="w-15 h-15 sm:w-30 sm:h-30 object-contain transition-all duration-300"
              :class="badge.unlocked ? 'opacity-100' : 'opacity-30 grayscale'"
            />
            <div
              v-if="!badge.unlocked"
              class="absolute inset-0 flex items-center justify-center text-xs tracking-widest uppercase text-white/60"
            >
              locked
            </div>
          </div>
          <div v-if="!badge.unlocked" class="mt-2 text-[10px] text-white/35 tracking-widest uppercase text-center">
            Deblochează din crate-uri
          </div>
          <div class="space-y-2 mt-3">
            <p
              class="text-xs sm:text-sm text-center truncate"
              :class="badge.unlocked ? rarityColor(badge.rarity) : 'text-gray-500'"
            >
              {{ badge.name }}
            </p>
            <div class="flex justify-between text-[12px] sm:text-[16px]">
              <span :class="badge.unlocked ? rarityColor(badge.rarity) : 'text-gray-500'">
                {{ badge.unlocked ? badge.rarity : 'LOCKED' }}
              </span>
              <span v-if="badge.unlocked" :class="rarityColor(badge.rarity)"> x{{ badge.quantity }} </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CurrentUserDocument, GetBadgesDocument } from '../api/graphql'
import { useQuery } from '@vue/apollo-composable'
import { RarityType } from '../api/graphql'
import CommonCrate from '../assets/crates/CommonChestClosed.svg'
import EpicCrate from '../assets/crates/EpicChestClosed.svg'
import LegendaryCrate from '../assets/crates/LegendaryChestClosed.svg'

import badge_1 from "../assets/badges/common/FirstStep.svg"
import badge_2 from "../assets/badges/common/Lucky.svg"
import badge_3 from "../assets/badges/common/SocialSpark.svg"

import badge_4 from "../assets/badges/epic/ConnectionBuilder.svg"
import badge_5 from "../assets/badges/epic/Momentum.svg"
import badge_6 from "../assets/badges/epic/TeamPlayer.svg"

import badge_7 from "../assets/badges/legendary/CommunityIcon.svg"
import badge_8 from "../assets/badges/legendary/SocialLegend.svg"
import badge_9 from "../assets/badges/legendary/Unstoppable.svg"

const router = useRouter()

const { result } = useQuery(CurrentUserDocument)
const user = computed(() => result.value?.me)
console.log(user)

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
</script>

<template>
  <div class="p-3 sm:p-6 space-y-6 bg-[#0b0f0c] min-h-screen">
    <!-- CRATES SECTION -->
    <section>
      <div
        class="w-full sm:w-fit px-4 py-3 rounded-t-xl border border-lime-500/30 bg-lime-500 text-black text-sm sm:text-base font-semibold"
      >
        Crate-uri
      </div>
      <div
        class="p-4 sm:p-6 bg-[#101712] border border-t-0 border-lime-500/30 rounded-b-xl shadow-[0_0_30px_rgba(132,255,122,0.05)]"
      >
        <div v-if="crateItems.length === 0" class="text-gray-400 text-center py-8 text-sm sm:text-base">
          Nu aveți nici un crate în inventar.
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <div
            v-for="item in crateItems"
            :key="item.id"
            @click="handleItemClick(item)"
            @keydown.enter="handleItemClick(item)"
            tabindex="0"
            role="button"
            class="group flex flex-col justify-between p-3 rounded-2xl border border-lime-500/20 bg-[#0d1410] hover:bg-[#16211a] hover:border-lime-400/50 transition-all duration-300 cursor-pointer aspect-square shadow-md hover:shadow-lime-500/10"
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
              <div class="flex justify-between text-[10px] sm:text-xs">
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
        class="w-full sm:w-fit px-4 py-3 rounded-t-xl border border-lime-500/30 bg-lime-500 text-black text-sm sm:text-base font-semibold"
      >
        Badge-uri
      </div>
            <div
        class="p-4 sm:p-6 bg-[#101712] border border-t-0 border-lime-500/30 rounded-b-xl shadow-[0_0_30px_rgba(132,255,122,0.05)]"
      >
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <div
          v-for="badge in badgeItems"
          :key="badge.id"
          role="button"
          tabindex="0"
          class="group relative flex flex-col justify-between p-3 rounded-2xl border border-lime-500/20 bg-[#0d1410] hover:bg-[#16211a] transition-all duration-300 aspect-square shadow-md"
        >
          <div class="flex justify-center items-center flex-1 relative">
            <img
              :src="getBadgeImage(badge.svgId)"
              :alt="badge.name"
              class="w-12 h-12 sm:w-16 sm:h-16 object-contain transition-all duration-300"
              :class="badge.unlocked ? 'opacity-100' : 'opacity-30 grayscale'"
            />
            <div v-if="!badge.unlocked" class="absolute inset-0 flex items-center justify-center text-2xl">🔒</div>
          </div>
          <div class="space-y-2 mt-3">
            <p
              class="text-xs sm:text-sm text-center truncate"
              :class="badge.unlocked ? rarityColor(badge.rarity) : 'text-gray-500'"
            >
              {{ badge.name }}
            </p>
            <div class="flex justify-between text-[10px] sm:text-xs">
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CurrentUserDocument } from '../api/graphql'
import { useQuery } from '@vue/apollo-composable'
import { RarityType } from '../api/graphql'

const router = useRouter()

const { result, refetch } = useQuery(CurrentUserDocument)
const user = computed(() => result.value?.me)
console.log(user)

const items = computed(() => user.value?.crateInventories?.map(crate => ({
    id: crate.crateId,
    name: crate.crate?.name ?? 'Unknown',
    rarity: crate.crate?.rarity ?? 'COMMON',
    quantity: crate.quantity,
  })) ?? []
)

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
      return 'img1'
    case RarityType.Epic:
      return 'img2'
    case RarityType.Legendary:
      return 'img3'
    default:
      return 'text-white'
  }
}

function handleItemClick(item: any) {
  console.log('Clicked item:', item.name)
}
</script>

<template>
  <div class="flex mx-3 mt-4 rounded-t-lg overflow-hidden border border-lime-500/30">
    <button
      @click="router.push('/inventoryChest')"
      class="w-1/2 bg-lime-500 text-black py-3 text-sm font-medium hover:bg-lime-400"
    >
      Chests
    </button>
    <button
      @click="router.push('/inventoryBadge')"
      class="w-1/2 bg-[#101712] text-white py-3 text-sm font-medium hover:bg-lime-400 hover:text-black border-l border-lime-500/30"
    >
      Badges
    </button>
  </div>

  <div
    class="mx-3 mb-4 p-3 bg-[#101712] border border-t-0 border-lime-500/30 rounded-b-lg shadow-[0_0_30px_rgba(132,255,122,0.05)]"
  >
    <div v-if="items.length === 0" class="text-gray-400 text-center py-6">
      Nu aveți nici un crate în inventar.
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      <div
        v-for="item in items"
        :key="item.id"
        @click="handleItemClick(item)"
        @keydown.enter="handleItemClick(item)"
        tabindex="0"
        role="button"
        class="flex flex-col items-center justify-between p-2 rounded-xl border border-lime-500/30 bg-[#0d1410] hover:bg-[#16211a] transition cursor-pointer aspect-square"
      >
        <img
          :src="rarityImage(item.rarity)"
          :alt="item.name"
          class="w-10 h-10 object-contain"
        />

        <span
          class="text-xs text-center truncate w-full"
          :class="rarityColor(item.rarity)"
        >
          {{ item.name }}
        </span>

        <div class="flex justify-between w-full text-[10px] mt-auto">
          <span :class="rarityColor(item.rarity)">
            {{ item.rarity }}
          </span>
          <span :class="rarityColor(item.rarity)">
            x{{ item.quantity }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
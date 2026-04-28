<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CurrentUserDocument } from '../api/graphql'
import { useQuery } from '@vue/apollo-composable'
import { RarityType } from '../api/graphql'
import UiTopBar from '../ui/UiTopBar.vue'
import UiCard from '../ui/UiCard.vue'
import UiButton from '../ui/UiButton.vue'
import UiEmptyState from '../ui/UiEmptyState.vue'
import UiContainer from '../ui/UiContainer.vue'

const router = useRouter()

const { result, refetch } = useQuery(CurrentUserDocument)
const user = computed(() => result.value?.me)

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
  // TODO: open crate details if needed
}
</script>

<template>
  <div class="app-screen pb-nav-safe">
    <UiTopBar title="INVENTAR" subtitle="Crate-uri" />

    <UiContainer class="py-4 space-y-4">
      <div class="flex rounded-xl overflow-hidden border border-[var(--c-border-strong)]">
        <UiButton class="w-1/2 rounded-none" size="md" @click="router.push('/inventoryChest')">
          Crate-uri
        </UiButton>
        <UiButton class="w-1/2 rounded-none" variant="ghost" size="md" @click="router.push('/inventoryBadge')">
          Badge-uri
        </UiButton>
      </div>

      <UiCard>
        <UiEmptyState
          v-if="items.length === 0"
          title="Niciun crate"
          description="Cumpără un crate din Shop și revino aici."
          action-label="Deschide Shop"
          tone="info"
          @action="router.push('/shop')"
        />

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="item in items"
            :key="item.id"
            role="button"
            tabindex="0"
            class="flex flex-col items-center justify-between p-3 rounded-2xl border border-[var(--c-border)] bg-[color:rgba(13,20,16,1)] hover:border-[var(--c-border-strong)] hover:bg-[color:rgba(22,33,26,1)] transition cursor-pointer aspect-square"
            @click="handleItemClick(item)"
            @keydown.enter="handleItemClick(item)"
            @keydown.space.prevent="handleItemClick(item)"
          >
            <img :src="rarityImage(item.rarity)" :alt="item.name" class="w-10 h-10 object-contain" />

            <span class="text-xs text-center truncate w-full" :class="rarityColor(item.rarity)">
              {{ item.name }}
            </span>

            <div class="flex justify-between w-full text-[10px] mt-auto">
              <span :class="rarityColor(item.rarity)">{{ item.rarity }}</span>
              <span :class="rarityColor(item.rarity)">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </UiCard>
    </UiContainer>
  </div>
</template>
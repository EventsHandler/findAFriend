
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UiTopBar from '../ui/UiTopBar.vue'
import UiCard from '../ui/UiCard.vue'
import UiButton from '../ui/UiButton.vue'
import UiContainer from '../ui/UiContainer.vue'

const router = useRouter()

const items = ref([
  { id: 1, name: 'Wooden Chest',  icon: '#',type: "Common", quantity: 2 },
  { id: 2, name: 'Iron Chest', icon: '/icons/potion.png', type: "Rare", quantity: 4 },
  { id: 3, name: 'Golden Chest', icon: '/icons/shield.png',type: "Legendary", quantity: 1 },
])

function rarityColor(type: string) {
  switch (type) {
    case 'Common':    return 'text-gray-400'
    case 'Rare':      return 'text-blue-400'
    case 'Legendary': return 'text-yellow-400'
    default:          return 'text-white'
  }
}

function handleItemClick(item: any) {
  // TODO: show badge details if needed
}
</script>

<template>
  <div class="app-screen pb-nav-safe">
    <UiTopBar title="INVENTAR" subtitle="Badge-uri" />

    <UiContainer class="py-4 space-y-4">
      <div class="flex rounded-xl overflow-hidden border border-[var(--c-border-strong)]">
        <UiButton class="w-1/2 rounded-none" variant="ghost" size="md" @click="router.push('/inventoryChest')">
          Crate-uri
        </UiButton>
        <UiButton class="w-1/2 rounded-none" size="md" @click="router.push('/inventoryBadge')">
          Badge-uri
        </UiButton>
      </div>

      <UiCard>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
            <img :src="item.icon" :alt="item.name" class="w-10 h-10 object-contain" />
            <span class="text-xs text-center truncate w-full" :class="rarityColor(item.type)">{{ item.name }}</span>
            <div class="flex justify-between w-full text-[10px] mt-auto">
              <span :class="rarityColor(item.type)">{{ item.type }}</span>
              <span :class="rarityColor(item.type)">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </UiCard>
    </UiContainer>
  </div>
</template>
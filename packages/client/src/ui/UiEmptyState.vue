<script setup lang="ts">
import UiCard from './UiCard.vue'
import UiButton from './UiButton.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    actionLabel?: string
    tone?: 'neutral' | 'info' | 'warning' | 'danger'
  }>(),
  { description: '', actionLabel: '', tone: 'neutral' },
)

const emit = defineEmits<{
  (e: 'action'): void
}>()

function toneCls(tone: 'neutral' | 'info' | 'warning' | 'danger') {
  switch (tone) {
    case 'info':
      return 'border-cyan-300/20 bg-cyan-500/5'
    case 'warning':
      return 'border-amber-300/20 bg-amber-500/5'
    case 'danger':
      return 'border-red-400/20 bg-red-500/5'
    default:
      return 'border-white/10 bg-white/5'
  }
}
</script>

<template>
  <UiCard variant="surface2" class="text-center" :class="toneCls(tone)">
    <div class="text-[10px] text-white/55 tracking-[0.25em] uppercase cursor-default">{{ title }}</div>
    <div v-if="description" class="mt-2 text-[12px] leading-relaxed text-white/55 cursor-default">
      {{ description }}
    </div>
    <div v-if="actionLabel" class="mt-4 flex justify-center">
      <UiButton variant="ghost" size="sm" @click="emit('action')">{{ actionLabel }}</UiButton>
    </div>
  </UiCard>
</template>


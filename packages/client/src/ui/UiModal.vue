<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import UiButton from './UiButton.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    tone?: 'neutral' | 'danger'
    busy?: boolean
  }>(),
  {
    description: '',
    confirmLabel: 'Confirmă',
    cancelLabel: 'Anulează',
    tone: 'neutral',
    busy: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const panelCls = computed(() =>
  props.tone === 'danger'
    ? 'border-red-400/20 bg-red-500/5'
    : 'border-[var(--c-border)] bg-[var(--c-surface)]',
)

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[5000]">
    <div class="absolute inset-0 bg-black/60" @click="emit('close')" />
    <div class="absolute inset-0 flex items-end sm:items-center justify-center p-4">
      <div
        class="w-full max-w-md rounded-2xl border shadow-[0_0_30px_rgba(0,0,0,0.45)] backdrop-blur"
        :class="panelCls"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="p-5">
          <div class="text-[10px] text-white/55 tracking-[0.25em] uppercase">Confirmare</div>
          <div class="mt-2 text-base font-semibold text-white">{{ title }}</div>
          <div v-if="description" class="mt-2 text-[12px] leading-relaxed text-white/55">
            {{ description }}
          </div>
          <div class="mt-5 flex gap-3 justify-end">
            <UiButton variant="ghost" size="sm" :disabled="busy" @click="emit('close')">
              {{ cancelLabel }}
            </UiButton>
            <UiButton :variant="tone === 'danger' ? 'danger' : 'primary'" size="sm" :loading="busy" @click="emit('confirm')">
              {{ confirmLabel }}
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


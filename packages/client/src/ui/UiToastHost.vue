<script setup lang="ts">
import UiButton from './UiButton.vue'
import { useToasts } from './toast'

const { toasts, dismiss } = useToasts()

function toneCls(tone: string) {
  switch (tone) {
    case 'success':
      return 'border-[var(--c-border-strong)] bg-[var(--c-accent)]/10'
    case 'info':
      return 'border-cyan-300/20 bg-cyan-500/10'
    case 'warning':
      return 'border-amber-300/20 bg-amber-500/10'
    case 'danger':
      return 'border-red-400/20 bg-red-500/10'
    default:
      return 'border-white/10 bg-white/5'
  }
}
</script>

<template>
  <div class="fixed top-3 left-0 right-0 z-[6000] pointer-events-none">
    <div class="mx-auto max-w-3xl px-3 space-y-2">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto rounded-2xl border shadow-[0_0_30px_rgba(0,0,0,0.35)] backdrop-blur bg-[color:rgba(11,15,12,0.82)]"
        :class="toneCls(t.tone)"
      >
        <div class="p-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[10px] text-white/55 tracking-[0.25em] uppercase">{{ t.title }}</div>
            <div v-if="t.description" class="mt-1 text-[12px] text-white/65 leading-relaxed">
              {{ t.description }}
            </div>
          </div>
          <UiButton variant="ghost" size="sm" aria-label="Dismiss toast" @click="dismiss(t.id)">
            Închide
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>


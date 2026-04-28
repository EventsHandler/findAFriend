<script setup lang="ts">
type Tone = 'neutral' | 'success' | 'warning' | 'info' | 'danger'

const props = withDefaults(
  defineProps<{
    tone?: Tone
  }>(),
  { tone: 'neutral' },
)

function clsForTone(t: Tone) {
  switch (t) {
    case 'success':
      return 'text-lime-200 border-lime-400/25 bg-lime-500/10'
    case 'warning':
      return 'text-amber-200 border-amber-300/25 bg-amber-500/10'
    case 'info':
      return 'text-cyan-200 border-cyan-300/25 bg-cyan-500/10'
    case 'danger':
      return 'text-red-200 border-red-400/25 bg-red-500/10'
    default:
      return 'text-white/70 border-white/10 bg-white/5'
  }
}
</script>

<template>
  <span
    class="inline-flex items-center rounded px-2 py-0.5 text-[9px] uppercase tracking-wider border"
    :class="clsForTone(tone)"
  >
    <slot />
  </span>
</template>


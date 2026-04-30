<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    as?: 'button' | 'a'
    href?: string
    type?: 'button' | 'submit' | 'reset'
    variant?: Variant
    size?: Size
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  {
    as: 'button',
    type: 'button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
  },
)

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-widest transition ' +
  'focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

const sizeCls = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-[10px] px-3 py-2 min-h-10'
    case 'lg':
      return 'text-xs px-5 py-3.5 min-h-12'
    default:
      return 'text-xs px-4 py-3 min-h-11'
  }
})

const variantCls = computed(() => {
  switch (props.variant) {
    case 'ghost':
      return 'bg-white/0 text-white/90 border border-white/10 hover:bg-white/5 focus:bg-white/5 cursor-pointer'
    case 'danger':
      return 'bg-red-400/10 text-red-200 border border-red-400/25 hover:bg-red-400/15 cursor-pointer'
    default:
      return 'bg-[var(--c-accent)] text-black shadow-[var(--shadow-accent)] hover:opacity-90 cursor-pointer'
  }
})

const blockCls = computed(() => (props.block ? 'w-full' : ''))

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <component
    :is="as"
    :href="as === 'a' ? href : undefined"
    :type="as === 'button' ? type : undefined"
    :disabled="as === 'button' ? isDisabled : undefined"
    :aria-disabled="as !== 'button' ? String(isDisabled) : undefined"
    :class="[base, sizeCls, variantCls, blockCls]"
  >
    <span
      v-if="loading"
      class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>


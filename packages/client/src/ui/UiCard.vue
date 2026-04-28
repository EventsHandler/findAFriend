<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'section' | 'div'
    padded?: boolean
    variant?: 'surface' | 'surface2'
  }>(),
  {
    as: 'section',
    padded: true,
    variant: 'surface',
  },
)
</script>

<template>
  <component
    :is="as"
    :class="[
      variant === 'surface' ? 'ui-surface' : 'ui-surface-2',
      padded ? 'p-4 sm:p-5' : '',
    ]"
  >
    <slot />
  </component>
</template>


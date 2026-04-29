<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'div' | 'main' | 'section'
    padded?: boolean
  }>(),
  {
    as: 'div',
    padded: true,
  },
)
</script>

<template>
  <component
    :is="as"
    :class="[
      'w-full max-w-6xl mx-auto',
      padded ? 'px-4' : '',
    ]"
  >
    <slot />
  </component>
</template>


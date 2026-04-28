<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    rightText?: string
  }>(),
  {
    title: '',
    subtitle: '',
    rightText: '',
  },
)
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-[var(--c-border)] bg-[color:rgba(11,15,12,0.80)] backdrop-blur"
  >
    <div class="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
      <div class="min-w-0">
        <div v-if="subtitle" class="text-[10px] text-white/55 tracking-[0.25em] uppercase">
          {{ subtitle }}
        </div>
        <div v-if="title" class="text-sm font-semibold text-[var(--c-accent)] tracking-widest uppercase truncate">
          {{ title }}
        </div>
        <slot name="left" />
      </div>
      <div class="text-[10px] text-white/45 tracking-widest uppercase">
        <slot name="right">
          {{ rightText }}
        </slot>
      </div>
    </div>
  </header>
</template>


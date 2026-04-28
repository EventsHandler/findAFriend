<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    type?: string
    name?: string
    autocomplete?: string
    disabled?: boolean
    required?: boolean
    error?: string | null
    hint?: string | null
  }>(),
  {
    type: 'text',
    disabled: false,
    required: false,
    error: null,
    hint: null,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const id = useId()
const describedBy = computed(() => {
  const ids: string[] = []
  if (props.hint) ids.push(`${id}-hint`)
  if (props.error) ids.push(`${id}-error`)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="block text-xs text-white/60 tracking-widest uppercase">
      {{ label }}
    </label>

    <input
      :id="id"
      :name="name"
      :type="type"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : 'false'"
      :aria-describedby="describedBy"
      class="w-full rounded-xl bg-[var(--c-bg)] border px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:border-[var(--c-border-strong)]"
      :class="error ? 'border-red-400/35' : 'border-[var(--c-border-strong)]/60'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <p v-if="hint" :id="`${id}-hint`" class="text-[11px] text-white/45">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${id}-error`" class="text-[11px] text-red-300">
      {{ error }}
    </p>
  </div>
</template>


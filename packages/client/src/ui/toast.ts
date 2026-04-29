import { readonly, ref } from 'vue'

export type ToastTone = 'neutral' | 'success' | 'info' | 'warning' | 'danger'

export type Toast = {
  id: string
  title: string
  description?: string
  tone: ToastTone
  timeoutMs: number
}

const toasts = ref<Toast[]>([])

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function useToasts() {
  function push(partial: Omit<Toast, 'id'>) {
    const toast: Toast = { id: uid(), ...partial }
    toasts.value = [toast, ...toasts.value].slice(0, 4)
    window.setTimeout(() => dismiss(toast.id), toast.timeoutMs)
    return toast.id
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts: readonly(toasts),
    push,
    dismiss,
  }
}


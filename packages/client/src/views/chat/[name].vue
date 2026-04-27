<script setup lang="ts">
import Pusher from 'pusher-js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { MeDocument } from '../../api/graphql'

type ChatMessage = {
  id: string
  location: string
  text: string
  ts: string
  user: { id: string; name: string }
}

const route = useRoute()
const router = useRouter()
const locationName = computed(() => String(route.params.name || ''))

const { result: meResult, loading: meLoading } = useQuery(MeDocument)
const me = computed(() => meResult.value?.me ?? null)

const messages = ref<ChatMessage[]>([])
const draft = ref('')
const sending = ref(false)
const errorText = ref<string | null>(null)

const bottomRef = ref<HTMLElement | null>(null)

const pusherKey = import.meta.env.VITE_PUSHER_KEY as string | undefined
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER as string | undefined

let pusher: Pusher | null = null
let channel: ReturnType<Pusher['subscribe']> | null = null
let isCleaningUp = false

function scrollToBottom() {
  nextTick(() => bottomRef.value?.scrollIntoView({ block: 'end' }))
}

function resetConnection() {
  errorText.value = null
  messages.value = []

  if (!pusherKey || !pusherCluster) {
    errorText.value = 'Chat is not configured (missing VITE_PUSHER_KEY / VITE_PUSHER_CLUSTER).'
    return
  }

  cleanupConnection()

  pusher = new Pusher(pusherKey, { cluster: pusherCluster })
  const channelName = `location-${encodeURIComponent(locationName.value)}`
  channel = pusher.subscribe(channelName)

  channel.bind('message', (data: ChatMessage) => {
    if (!data?.id || !data?.text) return
    if (messages.value.some((m) => m.id === data.id)) return
    messages.value.push(data)
    scrollToBottom()
  })

  channel.bind('pusher:subscription_error', () => {
    errorText.value = 'Failed to subscribe to chat channel.'
  })
}

function cleanupConnection() {
  if (!pusher || isCleaningUp) return
  isCleaningUp = true
  try {
    if (channel) {
      try {
        channel.unbind_all()
      } catch {
        // ignore
      }
    }
  } finally {
    try {
      pusher.disconnect()
    } catch {
      // ignore
    }
    channel = null
    pusher = null
    isCleaningUp = false
  }
}

async function sendMessage() {
  if (sending.value) return
  const token = localStorage.getItem('token')
  const text = draft.value.trim()
  if (!token || !text || !locationName.value) return

  sending.value = true
  errorText.value = null
  const API_URL = import.meta.env.VITE_API_URL ?? ''
  try {
    const res = await fetch(`${API_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        location: locationName.value,
        message: text,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error || `HTTP ${res.status}`)
    }
    draft.value = ''
  } catch (e) {
    errorText.value = e instanceof Error ? e.message : 'Failed to send message.'
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  resetConnection()
})

watch(locationName, () => {
  resetConnection()
})

onBeforeUnmount(() => {
  cleanupConnection()
})
</script>

<template>
  <div class="h-full bg-[#0b0f0c] text-white font-sans flex flex-col pb-20">
    <header
      class="p-4 flex items-center justify-between border-b border-lime-500/10 bg-[#0b0f0c]/80 backdrop-blur sticky top-0 z-20"
    >
      <div class="flex items-center gap-3">
        <button
          class="text-[10px] text-gray-300 border border-gray-700 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors tracking-widest uppercase"
          @click="router.push('/MapPage')"
        >
          Înapoi
        </button>
        <div>
          <div class="text-[10px] text-gray-400 tracking-[0.25em] uppercase">Chat locație</div>
          <div class="text-lg font-bold text-lime-300">{{ locationName }}</div>
        </div>
      </div>

      <div class="text-[10px] text-gray-400 tracking-widest uppercase">
        <span v-if="meLoading">Se conectează…</span>
        <span v-else-if="me">ca {{ me.name }}</span>
        <span v-else>neautentificat</span>
      </div>
    </header>

    <main class="flex-1 p-4 pb-28 overflow-y-auto">
      <div
        v-if="errorText"
        class="mb-4 text-red-300 border border-red-400/20 bg-red-400/5 rounded-xl p-3 text-xs tracking-widest"
      >
        {{ errorText }}
      </div>

      <div v-if="messages.length === 0" class="text-center py-10 text-lime-300/70 text-xs tracking-widest">
        NICIUN MESAJ ÎNCĂ
      </div>

      <div class="space-y-3">
        <div
          v-for="m in messages"
          :key="m.id"
          class="p-4 rounded-2xl border border-lime-500/10 bg-[#101712]"
          :class="me?.id === m.user.id ? 'border-lime-400/30 bg-[#0f1611]' : ''"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs text-lime-300 font-semibold tracking-wide">
              {{ m.user.name }}
              <span v-if="me?.id === m.user.id" class="text-[10px] text-gray-400 ml-2 tracking-widest uppercase"
                >(tu)</span
              >
            </div>
            <div class="text-[10px] text-gray-500 tracking-widest uppercase">
              {{ new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </div>
          <div class="mt-2 text-sm text-white/90 whitespace-pre-wrap break-words">{{ m.text }}</div>
        </div>
      </div>
      <div ref="bottomRef" class="h-1"></div>
    </main>

    <footer class="fixed bottom-0 left-0 right-0 p-4 bg-[#0b0f0c]/90 backdrop-blur-md border-t border-lime-500/10">
      <form
        class="max-w-3xl mx-auto flex gap-3"
        @submit.prevent="sendMessage"
      >
        <input
          v-model="draft"
          class="flex-1 bg-[#0b0f0c] border border-lime-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-400 transition-colors"
          :placeholder="me ? 'Scrie un mesaj…' : 'Autentifică-te pentru chat…'"
          :disabled="!me || sending"
        />
        <button
          type="submit"
          class="px-5 py-3 rounded-xl bg-lime-500 text-black font-bold text-xs tracking-widest uppercase disabled:opacity-50"
          :disabled="!me || sending || !draft.trim()"
        >
          Trimite
        </button>
      </form>
      <div class="max-w-3xl mx-auto mt-2 text-[10px] text-gray-500 tracking-widest uppercase">
        Canal: location-{{ encodeURIComponent(locationName) }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Pusher from 'pusher-js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@vue/apollo-composable'
import { MeDocument } from '../../api/graphql'
import UiButton from '../../ui/UiButton.vue'
import UiCard from '../../ui/UiCard.vue'
import UiEmptyState from '../../ui/UiEmptyState.vue'
import UiContainer from '../../ui/UiContainer.vue'

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

const { result: meResult, loading: meLoading, refetch: refetchMe } = useQuery(MeDocument)
const me = computed(() => meResult.value?.me ?? null)

const messages = ref<ChatMessage[]>([])
const draft = ref('')
const sending = ref(false)
const errorText = ref<string | null>(null)
const sendError = ref<string | null>(null)

const loadingHistory = ref(false)
const hasMoreHistory = ref(true)
const connectionStatus = ref<'connecting' | 'connected' | 'error'>('connecting')

const isNearBottom = ref(true)
const hasNewMessages = ref(false)

let historyDebounceTimer: number | null = null

const bottomRef = ref<HTMLElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)

const pusherKey = import.meta.env.VITE_PUSHER_KEY as string | undefined
const pusherCluster = import.meta.env.VITE_PUSHER_CLUSTER as string | undefined

const API_URL = (import.meta.env.VITE_API_URL ?? '') as string

let pusher: Pusher | null = null
let channel: ReturnType<Pusher['subscribe']> | null = null
let isCleaningUp = false

let questRefreshTimer: number | null = null
let lastQuestRefreshAt = 0
function scheduleQuestRefresh() {
  // Quests can progress server-side based on chat events; refetch Me best-effort.
  const now = Date.now()
  if (now - lastQuestRefreshAt < 1500) return
  lastQuestRefreshAt = now

  if (questRefreshTimer) window.clearTimeout(questRefreshTimer)
  questRefreshTimer = window.setTimeout(() => {
    const fn = refetchMe
    if (!fn) return
    void Promise.resolve(fn()).catch(() => {
      // ignore
    })
  }, 600)
}

function scrollToBottom() {
  nextTick(() => bottomRef.value?.scrollIntoView({ block: 'end' }))
}

const reachedTopOnce = ref(false)

function updateNearBottom() {
  const el = scrollRef.value
  if (!el) return
  const dist = el.scrollHeight - el.scrollTop - el.clientHeight
  isNearBottom.value = dist < 160
  if (isNearBottom.value) hasNewMessages.value = false
}

async function loadHistory({ reset }: { reset: boolean }) {
  if (loadingHistory.value) return
  if (!hasMoreHistory.value && !reset) return
  if (!locationName.value) return

  loadingHistory.value = true
  errorText.value = null
  try {
    const limit = 20
    const params = new URLSearchParams({
      location: locationName.value,
      limit: String(limit),
    })

    if (!reset && messages.value.length > 0) {
      const oldest = messages.value[0]
      params.set('beforeTs', oldest.ts)
      params.set('beforeId', oldest.id)
    }

    const prevScrollHeight = scrollRef.value?.scrollHeight ?? 0
    const prevScrollTop = scrollRef.value?.scrollTop ?? 0

    const res = await fetch(`${API_URL}/chat/history?${params.toString()}`)
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error || `HTTP ${res.status}`)
    }

    const body = (await res.json()) as { messages?: ChatMessage[] }
    const batch = (body.messages ?? []).filter(Boolean)

    // Server returns newest-first; UI wants oldest-first.
    batch.reverse()

    if (reset) {
      messages.value = batch
      hasMoreHistory.value = batch.length === limit
      scrollToBottom()
      return
    }

    if (batch.length === 0) {
      hasMoreHistory.value = false
      return
    }

    // Prepend older messages.
    messages.value = [...batch, ...messages.value]
    hasMoreHistory.value = batch.length === limit

    // Keep viewport stable after prepending.
    await nextTick()
    const newScrollHeight = scrollRef.value?.scrollHeight ?? prevScrollHeight
    if (scrollRef.value) {
      scrollRef.value.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop
    }
  } catch (e) {
    errorText.value = e instanceof Error ? e.message : 'Failed to load chat history.'
  } finally {
    loadingHistory.value = false
  }
}

function onScroll() {
  const el = scrollRef.value
  if (!el) return
  updateNearBottom()
  if (el.scrollTop < 120) {
    reachedTopOnce.value = true
    if (historyDebounceTimer) window.clearTimeout(historyDebounceTimer)
    historyDebounceTimer = window.setTimeout(() => {
      void loadHistory({ reset: false })
    }, 120)
  }
}

function resetConnection() {
  errorText.value = null
  messages.value = []
  hasMoreHistory.value = true
  connectionStatus.value = 'connecting'
  hasNewMessages.value = false

  if (!pusherKey || !pusherCluster) {
    errorText.value = 'Chat is not configured (missing VITE_PUSHER_KEY / VITE_PUSHER_CLUSTER).'
    connectionStatus.value = 'error'
    return
  }

  cleanupConnection()

  void loadHistory({ reset: true })

  pusher = new Pusher(pusherKey, { cluster: pusherCluster })
  const channelName = `location-${encodeURIComponent(locationName.value)}`
  channel = pusher.subscribe(channelName)

  channel.bind('message', (data: ChatMessage) => {
    if (!data?.id || !data?.text) return
    if (messages.value.some((m) => m.id === data.id)) return
    messages.value.push(data)
    if (isNearBottom.value) {
      scrollToBottom()
    } else {
      hasNewMessages.value = true
    }

    // If this message could advance our missions, refresh quest progress UI.
    if (me.value?.id && data.user?.id === me.value.id) {
      scheduleQuestRefresh()
    }
  })

  channel.bind('pusher:subscription_succeeded', () => {
    connectionStatus.value = 'connected'
  })

  channel.bind('pusher:subscription_error', () => {
    errorText.value = 'Failed to subscribe to chat channel.'
    connectionStatus.value = 'error'
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
  sendError.value = null
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
    // Server may auto-progress missions from chat; refresh the cached Me state shortly after sending.
    scheduleQuestRefresh()
  } catch (e) {
    sendError.value = e instanceof Error ? e.message : 'Nu am putut trimite mesajul.'
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  resetConnection()
  nextTick(() => updateNearBottom())
})

watch(locationName, () => {
  resetConnection()
})

onBeforeUnmount(() => {
  if (questRefreshTimer) window.clearTimeout(questRefreshTimer)
  cleanupConnection()
})
</script>

<template>
  <div class="app-screen flex flex-col pb-nav-safe" :style="{ '--chat-h': '84px' }">
    <header
      class="p-4 flex items-center justify-between border-b border-[var(--c-border)] bg-[color:rgba(11,15,12,0.80)] backdrop-blur sticky top-0 z-20"
    >
      <div class="flex items-center gap-3">
        <UiButton variant="ghost" size="sm" @click="router.push('/MapPage')">Înapoi</UiButton>
        <div>
          <div class="text-[10px] text-gray-400 tracking-[0.25em] uppercase">Chat locație</div>
        </div>
      </div>

      <div class="text-[10px] text-white/45 tracking-widest uppercase">
        <span v-if="meLoading">Se conectează…</span>
        <span v-else-if="me">ca {{ me.name }}</span>
        <span v-else>neautentificat</span>
      </div>
    </header>

    <main ref="scrollRef" class="flex-1 overflow-y-auto styled-scrollbar" @scroll.passive="onScroll">
      <UiContainer
        class="py-4"
        :style="{ paddingBottom: 'calc(var(--chat-h) + var(--nav-h) + var(--safe-bottom))' }"
      >
      <div class="mb-3 flex items-center justify-between gap-3">
        <div class="text-[10px] text-white/35 tracking-widest uppercase">
          <span v-if="connectionStatus === 'connecting'">se conectează…</span>
          <span v-else-if="connectionStatus === 'connected'">conectat</span>
          <span v-else>deconectat</span>
        </div>
        <UiButton
          v-if="hasNewMessages"
          variant="ghost"
          size="sm"
          @click="scrollToBottom(); hasNewMessages = false"
        >
          Mesaje noi
        </UiButton>
      </div>

      <UiEmptyState
        v-if="!meLoading && !me"
        class="mb-4"
        title="Chat indisponibil"
        description="Autentifică-te ca să trimiți mesaje. Poți citi istoricul dacă serverul permite."
        action-label="Mergi la login"
        tone="info"
        @action="router.push('/login')"
      />

      <UiCard v-if="errorText" variant="surface2" class="mb-4" :padded="true">
        <div class="text-red-200 text-xs tracking-widest uppercase">Eroare</div>
        <div class="mt-1 text-[11px] text-white/65">{{ errorText }}</div>
      </UiCard>

      <UiCard v-if="sendError" variant="surface2" class="mb-4" :padded="true">
        <div class="text-red-200 text-xs tracking-widest uppercase">Mesaj netrimis</div>
        <div class="mt-1 text-[11px] text-white/65">{{ sendError }}</div>
        <div class="mt-3 flex justify-end">
          <UiButton variant="ghost" size="sm" :disabled="sending || !draft.trim() || !me" @click="sendMessage">
            Reîncearcă
          </UiButton>
        </div>
      </UiCard>

      <div
        v-if="loadingHistory"
        class="mb-4 text-center text-[10px] text-white/35 tracking-widest uppercase"
      >
        Se încarcă mesaje mai vechi…
      </div>

      <div
        v-else-if="messages.length > 0 && hasMoreHistory"
        class="mb-4 text-center text-[10px] text-gray-500 tracking-widest uppercase"
      >
        Derulează în sus pentru mesaje mai vechi…
      </div>

      <div
        v-else-if="messages.length > 0 && !hasMoreHistory"
        class="mb-4 text-center text-[10px] text-white/30 tracking-widest uppercase"
      >
        Începutul conversației
      </div>

      <div v-if="messages.length === 0" class="text-center py-10 text-[var(--c-accent)]/70 text-xs tracking-widest">
        NICIUN MESAJ ÎNCĂ
      </div>

      <div class="space-y-3">
        <div
          v-for="m in messages"
          :key="m.id"
          class="p-4 rounded-2xl border bg-[var(--c-surface)]"
          :class="me?.id === m.user.id ? 'border-[var(--c-border-strong)] bg-[color:rgba(15,22,17,1)]' : 'border-[var(--c-border)]'"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs text-[var(--c-accent)] font-semibold tracking-wide">
              {{ m.user.name }}
              <span v-if="me?.id === m.user.id" class="text-[10px] text-white/45 ml-2 tracking-widest uppercase"
                >(tu)</span
              >
            </div>
            <div class="text-[10px] text-white/35 tracking-widest uppercase">
              {{ new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </div>
          </div>
          <div class="mt-2 text-sm text-white/85 whitespace-pre-wrap break-words">{{ m.text }}</div>
        </div>
      </div>
      <div ref="bottomRef" class="h-1"></div>
      </UiContainer>
    </main>

    <footer
      class="fixed left-0 right-0 p-4 bg-[color:rgba(11,15,12,0.90)] backdrop-blur-md border-t border-[var(--c-border)]"
      :style="{ bottom: 'calc(var(--nav-h) + var(--safe-bottom))' }"
    >
      <UiContainer :padded="false">
        <form class="px-4 flex gap-3" @submit.prevent="sendMessage">
        <input
          v-model="draft"
          class="flex-1 bg-[var(--c-bg)] border border-[var(--c-border-strong)]/60 rounded-xl px-4 py-3 text-sm focus:border-[var(--c-border-strong)] transition-colors"
          :placeholder="me ? 'Scrie un mesaj…' : 'Autentifică-te pentru chat…'"
          :disabled="!me || sending"
        />
        <UiButton type="submit" :disabled="!me || sending || !draft.trim()" :loading="sending">
          Trimite
        </UiButton>
        </form>
      </UiContainer>
    </footer>
  </div>
</template>

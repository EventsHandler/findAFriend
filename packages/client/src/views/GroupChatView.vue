<script setup lang="ts">
import Pusher, { type PresenceChannel } from 'pusher-js'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type ChatMessage = {
  id: string
  text: string
  userId: string
  name: string
  ts: number
}

type Member = { id: string; name: string }

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY as string | undefined
const PUSHER_CLUSTER = (import.meta.env.VITE_PUSHER_CLUSTER as string | undefined) ?? 'eu'

function getOrCreateUserId() {
  const key = 'chat.userId'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const created = crypto.randomUUID()
  localStorage.setItem(key, created)
  return created
}

const userId = ref(getOrCreateUserId())
const name = ref(localStorage.getItem('chat.name') ?? 'Anonymous')
const room = ref('group-chat')
const connected = ref(false)
const connecting = ref(false)
const status = ref<string>('')

const text = ref('')
const messages = ref<ChatMessage[]>([])
const members = ref<Member[]>([])

const canConnect = computed(
  () => Boolean(PUSHER_KEY) && name.value.trim().length > 0 && !connecting.value && !connected.value,
)

let pusher: Pusher | null = null
let channel: PresenceChannel | null = null

function addMessage(msg: ChatMessage) {
  messages.value.push(msg)
  if (messages.value.length > 200) messages.value.splice(0, messages.value.length - 200)
}

function disconnect() {
  channel?.unbind_all()
  if (channel) pusher?.unsubscribe(channel.name)
  channel = null

  pusher?.disconnect()
  pusher = null

  connecting.value = false
  connected.value = false
  members.value = []
  status.value = ''
}

async function connect() {
  if (!canConnect.value) return
  disconnect()
  connecting.value = true

  localStorage.setItem('chat.name', name.value.trim())
  status.value = 'Connecting…'

  pusher = new Pusher(PUSHER_KEY!, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true,
    authEndpoint: '/pusher/auth',
    auth: {
      params: {
        userId: userId.value,
        name: name.value.trim(),
      },
    },
  })

  pusher.connection.bind('connected', () => {
    status.value = 'Connected'
  })
  pusher.connection.bind('error', (err: unknown) => {
    status.value = `Connection error`
    console.error('Pusher connection error:', err)
    connecting.value = false
  })

  const channelName = `presence-${room.value}`
  channel = pusher.subscribe(channelName) as PresenceChannel

  channel.bind('pusher:subscription_succeeded', () => {
    connected.value = true
    connecting.value = false
    status.value = `Joined ${channelName}`
    const next: Member[] = []
    channel?.members.each((m: any) => {
      next.push({ id: String(m.id), name: String(m.info?.name ?? m.id) })
    })
    members.value = next
  })

  channel.bind('pusher:member_added', (m: any) => {
    members.value = [...members.value, { id: String(m.id), name: String(m.info?.name ?? m.id) }]
  })

  channel.bind('pusher:member_removed', (m: any) => {
    const id = String(m.id)
    members.value = members.value.filter((x) => x.id !== id)
  })

  channel.bind('new-message', (msg: ChatMessage) => addMessage(msg))
}

async function sendMessage() {
  if (!connected.value) return
  const payload = {
    text: text.value,
    userId: userId.value,
    name: name.value.trim(),
  }

  text.value = ''
  const res = await fetch('/chat/message', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    status.value = err?.error ? String(err.error) : 'Failed to send'
  }
}

onMounted(() => {
  if (!PUSHER_KEY) {
    status.value = 'Missing VITE_PUSHER_KEY in client env'
  }
})

onBeforeUnmount(() => disconnect())
</script>

<template>
  <main class="chat">
    <header class="chat__header">
      <h1>Group chat</h1>
      <p class="chat__subtitle">
        Real-time messages via Pusher Channels.
      </p>
    </header>

    <section class="chat__panel">
      <div class="chat__controls">
        <label class="field">
          <span>Name</span>
          <input v-model="name" :disabled="connected" placeholder="Your name" />
        </label>

        <label class="field">
          <span>Room</span>
          <input v-model="room" :disabled="connected" placeholder="group-chat" />
        </label>

        <div class="chat__buttons">
          <button v-if="!connected" :disabled="!canConnect" @click="connect">
            {{ connecting ? 'Joining…' : 'Join' }}
          </button>
          <button v-else class="secondary" @click="disconnect">Leave</button>
        </div>

        <div class="chat__status" v-if="status">{{ status }}</div>
      </div>

      <div class="chat__body">
        <aside class="chat__members">
          <h2>Members ({{ members.length }})</h2>
          <ul>
            <li v-for="m in members" :key="m.id">
              <strong>{{ m.name }}</strong>
            </li>
          </ul>
        </aside>

        <section class="chat__messages">
          <div class="chat__messagesList">
            <div v-if="messages.length === 0" class="chat__empty">
              No messages yet.
            </div>
            <article v-for="m in messages" :key="m.id" class="msg">
              <div class="msg__meta">
                <strong>{{ m.name }}</strong>
                <span class="msg__time">{{ new Date(m.ts).toLocaleTimeString() }}</span>
              </div>
              <div class="msg__text">{{ m.text }}</div>
            </article>
          </div>

          <form class="chat__composer" @submit.prevent="sendMessage">
            <input
              v-model="text"
              :disabled="!connected"
              placeholder="Write a message…"
              autocomplete="off"
            />
            <button type="submit" :disabled="!connected || !text.trim()">Send</button>
          </form>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.chat {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.chat__header h1 {
  margin: 0;
}

.chat__subtitle {
  margin: 6px 0 0;
  opacity: 0.8;
}

.chat__panel {
  margin-top: 18px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.chat__controls {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  padding: 14px;
  align-items: end;
  border-bottom: 1px solid var(--color-border);
}

.field {
  display: grid;
  gap: 6px;
  font-size: 12px;
}

.field input {
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: inherit;
}

.chat__buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

button {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: inherit;
  cursor: pointer;
}

button.secondary {
  background: transparent;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat__status {
  grid-column: 1 / -1;
  font-size: 12px;
  opacity: 0.85;
}

.chat__body {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 520px;
}

.chat__members {
  padding: 14px;
  border-right: 1px solid var(--color-border);
}

.chat__members h2 {
  font-size: 14px;
  margin: 0 0 10px;
}

.chat__members ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.chat__messages {
  display: grid;
  grid-template-rows: 1fr auto;
}

.chat__messagesList {
  padding: 14px;
  overflow: auto;
  display: grid;
  gap: 10px;
}

.chat__empty {
  opacity: 0.75;
}

.msg {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

.msg__meta {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 12px;
  opacity: 0.9;
}

.msg__time {
  opacity: 0.7;
}

.msg__text {
  margin-top: 6px;
  white-space: pre-wrap;
}

.chat__composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 14px;
  border-top: 1px solid var(--color-border);
}

.chat__composer input {
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: inherit;
}

@media (max-width: 860px) {
  .chat__controls {
    grid-template-columns: 1fr;
  }
  .chat__body {
    grid-template-columns: 1fr;
  }
  .chat__members {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>


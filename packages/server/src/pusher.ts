import Pusher from 'pusher'

export const CHAT_CHANNEL = 'presence-group-chat'
export const CHAT_EVENT_NEW_MESSAGE = 'new-message'

let singleton: Pusher | null = null

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export function getPusher(): Pusher {
  if (singleton) return singleton

  singleton = new Pusher({
    appId: requireEnv('PUSHER_APP_ID'),
    key: requireEnv('PUSHER_KEY'),
    secret: requireEnv('PUSHER_SECRET'),
    cluster: requireEnv('PUSHER_CLUSTER'),
    useTLS: true,
  })

  return singleton
}


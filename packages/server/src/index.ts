import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'http'
import crypto from 'node:crypto'
import { parse as parseQueryString } from 'node:querystring'
import { typeDefs } from './schema/typeDefs.generated'
import { resolvers } from './schema/resolvers.generated'
import { CHAT_CHANNEL, CHAT_EVENT_NEW_MESSAGE, getPusher } from './pusher.js'

async function readRawBody(req: import('http').IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

async function readBody<T>(req: import('http').IncomingMessage): Promise<T> {
  const raw = await readRawBody(req)
  if (!raw) return {} as T

  const contentType = (req.headers['content-type'] ?? '').toLowerCase()
  if (contentType.includes('application/json')) {
    return JSON.parse(raw) as T
  }

  // Pusher client auth requests are commonly form-encoded.
  // Example payload: socket_id=123.456&channel_name=presence-...
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return parseQueryString(raw) as unknown as T
  }

  // Best-effort: try JSON first, then querystring.
  try {
    return JSON.parse(raw) as T
  } catch {
    return parseQueryString(raw) as unknown as T
  }
}

function sendJson(res: import('http').ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/graphql',
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    allowedHeaders: ['content-type'],
    methods: ['GET', 'POST', 'OPTIONS'],
  },
})

const server = createServer(async (req, res) => {
  const url = req.url ?? '/'

  // Pusher presence/private channel auth endpoint
  if (req.method === 'POST' && url.startsWith('/pusher/auth')) {
    try {
      const { socket_id, channel_name, userId, name } = await readBody<{
        socket_id: string
        channel_name: string
        userId?: string
        name?: string
      }>(req)

      if (!socket_id || !channel_name) {
        return sendJson(res, 400, { error: 'Missing socket_id or channel_name' })
      }

      const presenceData =
        channel_name.startsWith('presence-') && userId
          ? { user_id: userId, user_info: { name: name ?? 'Anonymous' } }
          : undefined

      const auth = getPusher().authorizeChannel(socket_id, channel_name, presenceData as any)
      return sendJson(res, 200, auth)
    } catch (error) {
      console.error('Pusher auth error:', error)
      return sendJson(res, 500, { error: 'Auth failed' })
    }
  }

  // Broadcast a group chat message
  if (req.method === 'POST' && url.startsWith('/chat/message')) {
    try {
      const { text, userId, name } = await readBody<{
        text: string
        userId?: string
        name?: string
      }>(req)

      if (!text?.trim()) return sendJson(res, 400, { error: 'Message text is required' })

      const message = {
        id: crypto.randomUUID(),
        text: text.trim(),
        userId: userId ?? 'anonymous',
        name: name ?? 'Anonymous',
        ts: Date.now(),
      }

      await getPusher().trigger(CHAT_CHANNEL, CHAT_EVENT_NEW_MESSAGE, message)
      return sendJson(res, 200, { ok: true, message })
    } catch (error) {
      console.error('Chat message error:', error)
      return sendJson(res, 500, { error: 'Failed to send message' })
    }
  }

  return yoga(req, res)
})
server.listen(process.env.PORT || 3000)

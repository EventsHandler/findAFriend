import { createYoga, createSchema } from 'graphql-yoga'
import { createServer } from 'http'
import { typeDefs } from './schema/typeDefs.generated'
import { resolvers } from './schema/resolvers.generated'
import { prisma } from './prisma'
import jwt from 'jsonwebtoken'
import { UserContext } from './types/context'
import Pusher from 'pusher'
import { autoProgressFromChatEvent } from './schema/events/resolvers/missionAutoProgress.ts'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const pusher =
  process.env.PUSHER_APP_ID &&
  process.env.PUSHER_KEY &&
  process.env.PUSHER_SECRET &&
  process.env.PUSHER_CLUSTER
    ? new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.PUSHER_CLUSTER,
        useTLS: true,
      })
    : null

async function readJsonBody(req: import('http').IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return null
  return JSON.parse(raw)
}

async function getUserFromRequest(req: import('http').IncomingMessage) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return await prisma.user.findUnique({ where: { id: decoded.userId } })
  } catch {
    return null
  }
}

const yoga = createYoga<UserContext>({
  schema: createSchema({ typeDefs, resolvers }),
  // During development we want real error messages (e.g. "Unauthorized", cooldown, etc.)
  // so the client can display them. In production keep them masked.
  maskedErrors: process.env.NODE_ENV === 'production',
  context: async ({ request }) => {
    const auth = request.headers.get('authorization')
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.substring(7)
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        })
        return { user }
      } catch (e) {
        return { user: null }
      }
    }
    return { user: null }
  },
})

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/chat/send') {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://eventshandler.github.io'
    ]

    const origin = req.headers.origin

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
    const user = await getUserFromRequest(req)
    if (!user) {
      res.writeHead(401, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'Unauthorized' }))
      return
    }
    if (!pusher) {
      res.writeHead(500, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'Pusher not configured on server' }))
      return
    }

    try {
      const body = (await readJsonBody(req)) as null | { location?: string; message?: string }
      const location = body?.location?.trim()
      const message = body?.message?.trim()
      if (!location || !message) {
        res.writeHead(400, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ error: 'Missing location or message' }))
        return
      }

      const channel = `location-${encodeURIComponent(location)}`
      const payload = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        location,
        text: message,
        ts: new Date().toISOString(),
        user: { id: user.id, name: user.name },
      }

      await pusher.trigger(channel, 'message', payload)
      if (user.locationId === location) {
        // Best-effort server-side quest progress from chat events.
        void autoProgressFromChatEvent({ userId: user.id, locationId: location, messageId: payload.id })
      }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    } catch {
      res.writeHead(400, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON body' }))
      return
    }
  }

  return yoga(req, res)
})
server.listen(process.env.PORT || 3000)

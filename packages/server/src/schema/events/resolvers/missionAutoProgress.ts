import { prisma } from '../../../prisma.js'
import { canUpdateProgressNow } from './missionValidationState'

type Pos = { lat: number; lng: number }

type WalkState = { last: Pos; meters: number }
type StayState = { lastAtMs: number; ms: number }
type ChatState = { lastMessageId?: string; count: number }

const walkByUserMissionId = new Map<string, WalkState>()
const stayByUserMissionId = new Map<string, StayState>()
const chatByUserMissionId = new Map<string, ChatState>()

function haversineMeters(a: Pos, b: Pos) {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * R * Math.asin(Math.sqrt(x))
}

function parseWalkMeters(title: string) {
  const t = title.toLowerCase()
  if (t.includes('1km') || t.includes('1 km')) return 1000
  if (t.includes('500m') || t.includes('500 m')) return 500
  return null
}

function parseStaySeconds(title: string) {
  const t = title.toLowerCase()
  if (t.includes('10 minute')) return 10 * 60
  if (t.includes('5 minute')) return 5 * 60
  if (t.includes('2 minute')) return 2 * 60
  if (t.includes('1 minut')) return 1 * 60
  return null
}

function isChatMission(title: string) {
  const t = title.toLowerCase()
  return (
    t.includes('salut') ||
    t.includes('bună') ||
    t.includes('buna') ||
    t.includes('conversa') ||
    t.includes('recomand')
  )
}

async function completeIfReady(userMissionId: string) {
  const um = await prisma.userMission.findFirst({
    where: { id: userMissionId },
    include: { mission: true },
  })
  if (!um) return
  if (um.status === 'COMPLETED') return

  const target = um.mission.targetProgress
  if (um.progress < target) return

  const lockedUntil = um.mission.repeatable
    ? new Date(Date.now() + um.mission.cooldownHours * 60 * 60 * 1000)
    : null

  await prisma.$transaction(async (tx) => {
    await tx.questCompletion.create({
      data: {
        userId: um.userId,
        missionId: um.missionId,
        title: um.mission.title,
        rewardXp: um.mission.rewardXp,
      },
    })
    await tx.user.update({
      where: { id: um.userId },
      data: { xp: { increment: um.mission.rewardXp } },
    })
    await tx.userMission.update({
      where: { id: um.id },
      data: {
        progress: target,
        status: 'COMPLETED',
        completedAt: new Date(),
        lockedUntil,
      },
    })
  })
}

export async function autoProgressFromPositionEvent(args: {
  userId: string
  locationId: string
  lat: number
  lng: number
}) {
  const { userId, locationId, lat, lng } = args

  // Keep DB reads bounded (called every ~5s on clients).
  if (!canUpdateProgressNow(`pos:${userId}`, 1500)) return

  const active = await prisma.userMission.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      mission: {
        OR: [{ locationId: null }, { locationId }],
      },
    },
    include: { mission: true },
  })

  await Promise.all(
    active.map(async (um) => {
      const title = um.mission.title

      const walkMeters = parseWalkMeters(title)
      if (walkMeters) {
        const key = um.id
        const prev = walkByUserMissionId.get(key)
        const current: Pos = { lat, lng }
        if (!prev) {
          walkByUserMissionId.set(key, { last: current, meters: 0 })
          return
        }

        // Anti-teleport: ignore insane jumps between ticks.
        const step = haversineMeters(prev.last, current)
        if (step > 80) {
          walkByUserMissionId.set(key, { ...prev, last: current })
          return
        }

        const meters = prev.meters + step
        walkByUserMissionId.set(key, { last: current, meters })

        const pct = Math.min(1, meters / walkMeters)
        const next = Math.max(um.progress, Math.floor(pct * um.mission.targetProgress))
        if (next !== um.progress) {
          await prisma.userMission.update({ where: { id: um.id }, data: { progress: next } })
          await completeIfReady(um.id)
        }
        return
      }

      const staySeconds = parseStaySeconds(title)
      if (staySeconds) {
        const key = um.id
        const now = Date.now()
        const prev = stayByUserMissionId.get(key)
        const nextState: StayState = prev
          ? { lastAtMs: now, ms: prev.ms + Math.min(10_000, Math.max(0, now - prev.lastAtMs)) }
          : { lastAtMs: now, ms: 0 }
        stayByUserMissionId.set(key, nextState)

        const pct = Math.min(1, nextState.ms / (staySeconds * 1000))
        const next = Math.max(um.progress, Math.floor(pct * um.mission.targetProgress))
        if (next !== um.progress) {
          await prisma.userMission.update({ where: { id: um.id }, data: { progress: next } })
          await completeIfReady(um.id)
        }
      }
    }),
  )
}

export async function autoProgressFromChatEvent(args: {
  userId: string
  locationId: string
  messageId: string
}) {
  const { userId, locationId, messageId } = args

  if (!canUpdateProgressNow(`chat:${userId}`, 800)) return

  const active = await prisma.userMission.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      mission: { OR: [{ locationId: null }, { locationId }] },
    },
    include: { mission: true },
  })

  await Promise.all(
    active.map(async (um) => {
      if (!isChatMission(um.mission.title)) return

      const state = chatByUserMissionId.get(um.id) ?? { count: 0 }
      if (state.lastMessageId === messageId) return
      state.lastMessageId = messageId
      state.count += 1
      chatByUserMissionId.set(um.id, state)

      const next = Math.min(um.mission.targetProgress, Math.max(um.progress, state.count))
      if (next !== um.progress) {
        await prisma.userMission.update({ where: { id: um.id }, data: { progress: next } })
        await completeIfReady(um.id)
      }
    }),
  )
}


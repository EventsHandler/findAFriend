import { prisma } from '../../../../prisma.js'
import type { QueryResolvers } from './../../../types.generated.js'

type MissionTemplate = {
  title: string
  description?: string
  rewardXp: number
  targetProgress: number
  completionKind:
    | 'MANUAL_CONFIRM'
    | 'WALK_DISTANCE'
    | 'STAY_TIME'
    | 'CHAT_COUNT'
    | 'PHOTO'
    | 'TIMED'
  distanceMeters?: number
  staySeconds?: number
  timerSeconds?: number
  repeatable: boolean
  cooldownHours: number
}

export const missions: NonNullable<QueryResolvers['missions']> = async (_parent, { locationId }, _ctx) => {
  if (!locationId) return []

  // Use raw SQL for tag to avoid Prisma client needing regeneration on Windows file-lock issues.
  const tagRow = (await prisma.$queryRaw<
    Array<{ tag: 'PARK' | 'RESTAURANT' | 'LANDMARK' }>
  >`SELECT "tag" FROM "Location" WHERE "id" = ${locationId} LIMIT 1`)?.[0]
  if (!tagRow) return []

  const templatesByTag: Record<string, MissionTemplate[]> = {
    PARK: [
      {
        title: 'Sprint 2 minute',
        description: 'Fă un sprint ușor (sau alergare) timp de 2 minute.',
        rewardXp: 70,
        targetProgress: 1,
        completionKind: 'TIMED',
        timerSeconds: 2 * 60,
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Stretch 5 minute',
        description: 'Fă stretching timp de 5 minute într-un loc sigur.',
        rewardXp: 60,
        targetProgress: 1,
        completionKind: 'TIMED',
        timerSeconds: 5 * 60,
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Plimbare în parc (1 km)',
        description: 'Fă o plimbare de cel puțin 1 km prin parc.',
        rewardXp: 120,
        targetProgress: 100,
        completionKind: 'WALK_DISTANCE',
        distanceMeters: 1000,
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Stai în zonă 10 minute',
        description: 'Rămâi în locație timp de 10 minute.',
        rewardXp: 80,
        targetProgress: 100,
        completionKind: 'STAY_TIME',
        staySeconds: 10 * 60,
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Salută 2 jucători',
        description: 'Spune salut la doi jucători din zonă.',
        rewardXp: 110,
        targetProgress: 2,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Poză cu natura',
        description: 'Fă o poză (pentru tine) cu un loc frumos din parc.',
        rewardXp: 75,
        targetProgress: 1,
        completionKind: 'PHOTO',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Hidratare',
        description: 'Bea un pahar de apă.',
        rewardXp: 40,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Descoperă un colț nou',
        description: 'Mergi într-un punct din parc unde nu ai fost azi.',
        rewardXp: 90,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Întâlnire: 1 prieten',
        description: 'Convinge un prieten să vină în parc.',
        rewardXp: 140,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Respirație 1 minut',
        description: 'Respiră profund timp de 1 minut.',
        rewardXp: 35,
        targetProgress: 1,
        completionKind: 'TIMED',
        timerSeconds: 1 * 60,
        repeatable: true,
        cooldownHours: 24,
      },
    ],
    RESTAURANT: [
      {
        title: 'Încearcă ceva nou',
        description: 'Comandă un fel de mâncare pe care nu l-ai mai încercat.',
        rewardXp: 150,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Recomandare pentru un prieten',
        description: 'Întreabă pe cineva ce recomandă din meniu.',
        rewardXp: 100,
        targetProgress: 1,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Salută personalul',
        description: 'Spune „bună ziua” și mulțumește.',
        rewardXp: 60,
        targetProgress: 1,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Recomandă un loc',
        description: 'Recomandă acest restaurant cuiva.',
        rewardXp: 80,
        targetProgress: 1,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Împarte un desert',
        description: 'Împarte ceva cu un prieten.',
        rewardXp: 120,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Recenzie rapidă',
        description: 'Scrie 2-3 propoziții despre experiență (pentru tine).',
        rewardXp: 90,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Nouă conversație',
        description: 'Începe o conversație scurtă cu cineva.',
        rewardXp: 140,
        targetProgress: 1,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Comandă o băutură',
        description: 'Încearcă o băutură nouă (non-alcoolică).',
        rewardXp: 70,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Schimb de recomandări',
        description: 'Întreabă pe cineva ce local îi place cel mai mult.',
        rewardXp: 110,
        targetProgress: 1,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Fotografie de meniu',
        description: 'Fă o poză (pentru tine) cu ceva interesant din meniu.',
        rewardXp: 55,
        targetProgress: 1,
        completionKind: 'PHOTO',
        repeatable: true,
        cooldownHours: 24,
      },
    ],
    LANDMARK: [
      {
        title: 'Poză cu locul',
        description: 'Fă o poză (pentru tine) și notează ce îți place la acest loc.',
        rewardXp: 90,
        targetProgress: 1,
        completionKind: 'PHOTO',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: '3 detalii',
        description: 'Observă 3 detalii interesante la acest loc.',
        rewardXp: 60,
        targetProgress: 3,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Povestea locului',
        description: 'Caută (sau întreabă) un fapt interesant despre acest loc.',
        rewardXp: 120,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Salută 1 turist',
        description: 'Oferă direcții sau ajutor cuiva (dacă e cazul).',
        rewardXp: 150,
        targetProgress: 1,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Plimbare scurtă',
        description: 'Fă o plimbare de 5 minute în jurul locului.',
        rewardXp: 70,
        targetProgress: 1,
        completionKind: 'TIMED',
        timerSeconds: 5 * 60,
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Check-in',
        description: 'Fă check-in în zonă și salută comunitatea.',
        rewardXp: 80,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Găsește un unghi bun',
        description: 'Caută cel mai bun unghi pentru o poză reușită.',
        rewardXp: 65,
        targetProgress: 1,
        completionKind: 'MANUAL_CONFIRM',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Spune „bună”',
        description: 'Spune bună unei persoane din zonă.',
        rewardXp: 75,
        targetProgress: 1,
        completionKind: 'CHAT_COUNT',
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Mini-tură 500m',
        description: 'Fă o mini-tură de 500m în apropiere.',
        rewardXp: 95,
        targetProgress: 100,
        completionKind: 'WALK_DISTANCE',
        distanceMeters: 500,
        repeatable: true,
        cooldownHours: 24,
      },
      {
        title: 'Rămâi 5 minute',
        description: 'Rămâi în zonă cel puțin 5 minute.',
        rewardXp: 55,
        targetProgress: 100,
        completionKind: 'STAY_TIME',
        staySeconds: 5 * 60,
        repeatable: true,
        cooldownHours: 24,
      },
    ],
  }

  const tag = tagRow.tag
  const templates = templatesByTag[tag] ?? templatesByTag['LANDMARK'] ?? []

  // Auto-assign: create missing missions for this location (idempotent by @@unique([locationId, title])).
  await prisma.mission.createMany({
    data: templates.map((t) => ({ ...t, locationId })),
    skipDuplicates: true,
  })

  const all = await prisma.mission.findMany({
    where: { locationId },
    orderBy: { title: 'asc' },
  })

  // Daily rotation: pick 3 missions per location, changes every 24h without needing a cron.
  if (all.length <= 3) return all

  const dayIndex = Math.floor(Date.now() / 86_400_000)
  let seed = 0
  for (let i = 0; i < locationId.length; i++) seed = (seed * 31 + locationId.charCodeAt(i)) >>> 0
  const start = (seed + dayIndex) % all.length

  const picked: typeof all = []
  for (let i = 0; i < 3; i++) {
    const m = all[(start + i) % all.length]
    if (m) picked.push(m)
  }
  return picked
}

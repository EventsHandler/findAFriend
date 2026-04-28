import { prisma } from './prisma'

type MissionPatch = {
  title: string
  completionKind: 'MANUAL_CONFIRM' | 'WALK_DISTANCE' | 'STAY_TIME' | 'CHAT_COUNT' | 'PHOTO' | 'TIMED'
  distanceMeters?: number | null
  staySeconds?: number | null
  timerSeconds?: number | null
  targetProgress?: number
}

// Backfill for missions that were created before we introduced completionKind.
// This is intentionally title-based, but only as a one-time migration aid.
const PATCHES: MissionPatch[] = [
  { title: 'Sprint 2 minute', completionKind: 'TIMED', timerSeconds: 2 * 60, targetProgress: 1 },
  { title: 'Stretch 5 minute', completionKind: 'TIMED', timerSeconds: 5 * 60, targetProgress: 1 },
  { title: 'Respirație 1 minut', completionKind: 'TIMED', timerSeconds: 1 * 60, targetProgress: 1 },
  { title: 'Plimbare în parc (1 km)', completionKind: 'WALK_DISTANCE', distanceMeters: 1000, targetProgress: 100 },
  { title: 'Mini-tură 500m', completionKind: 'WALK_DISTANCE', distanceMeters: 500, targetProgress: 100 },
  { title: 'Stai în zonă 10 minute', completionKind: 'STAY_TIME', staySeconds: 10 * 60, targetProgress: 100 },
  { title: 'Rămâi 5 minute', completionKind: 'STAY_TIME', staySeconds: 5 * 60, targetProgress: 100 },
  { title: 'Salută 2 jucători', completionKind: 'CHAT_COUNT', targetProgress: 2 },
  { title: 'Salută 1 turist', completionKind: 'CHAT_COUNT', targetProgress: 1 },
  { title: 'Spune „bună”', completionKind: 'CHAT_COUNT', targetProgress: 1 },
  { title: 'Nouă conversație', completionKind: 'CHAT_COUNT', targetProgress: 1 },
  { title: 'Recomandare pentru un prieten', completionKind: 'CHAT_COUNT', targetProgress: 1 },
  { title: 'Salută personalul', completionKind: 'CHAT_COUNT', targetProgress: 1 },
  { title: 'Recomandă un loc', completionKind: 'CHAT_COUNT', targetProgress: 1 },
  { title: 'Schimb de recomandări', completionKind: 'CHAT_COUNT', targetProgress: 1 },
  { title: 'Poză cu natura', completionKind: 'PHOTO', targetProgress: 1 },
  { title: 'Fotografie de meniu', completionKind: 'PHOTO', targetProgress: 1 },
  { title: 'Poză cu locul', completionKind: 'PHOTO', targetProgress: 1 },
  { title: 'Plimbare scurtă', completionKind: 'TIMED', timerSeconds: 5 * 60, targetProgress: 1 },
  { title: 'Hidratare', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Descoperă un colț nou', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Întâlnire: 1 prieten', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: '3 detalii', completionKind: 'MANUAL_CONFIRM', targetProgress: 3 },
  { title: 'Povestea locului', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Check-in', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Găsește un unghi bun', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Încearcă ceva nou', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Împarte un desert', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Recenzie rapidă', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
  { title: 'Comandă o băutură', completionKind: 'MANUAL_CONFIRM', targetProgress: 1 },
]

async function main() {
  let updated = 0
  for (const p of PATCHES) {
    const res = await prisma.mission.updateMany({
      where: { title: p.title },
      data: {
        completionKind: p.completionKind,
        distanceMeters: p.distanceMeters ?? null,
        staySeconds: p.staySeconds ?? null,
        timerSeconds: p.timerSeconds ?? null,
        ...(typeof p.targetProgress === 'number' ? { targetProgress: p.targetProgress } : null),
      } as any,
    })
    updated += res.count
  }

  // Ensure any mission marked TIMED actually has timerSeconds.
  await prisma.mission.updateMany({
    where: { completionKind: 'TIMED', timerSeconds: null },
    data: { completionKind: 'MANUAL_CONFIRM' },
  })

  console.log(`✅ Backfilled completionKind for ~${updated} mission rows`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())


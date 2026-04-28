import { prisma } from "./prisma";

/**
 * Location names must match rows from `seedLocations.ts` (Chișinău spots).
 * Missions are tied to those seeded places — no new locations are created here.
 */
const MISSION_DEFS = [
  {
    title: "Walk 1km together",
    description: "Meet someone and walk at least 1 km in the area.",
    rewardXp: 120,
    targetProgress: 100,
    completionKind: "WALK_DISTANCE" as const,
    distanceMeters: 1000,
    repeatable: true,
    cooldownHours: 24,
    locationName: "Parcul Ștefan cel Mare și Sfânt",
  },
  {
    title: "Meet 2 new players",
    description: "Say hi and exchange names with two people at this spot.",
    rewardXp: 200,
    targetProgress: 2,
    completionKind: "CHAT_COUNT" as const,
    repeatable: true,
    cooldownHours: 24,
    locationName: "Catedrala Nașterii Domnului",
  },
  {
    title: "Stay in zone 10 min",
    description: "Hang out in the active location for ten minutes.",
    rewardXp: 80,
    targetProgress: 100,
    completionKind: "STAY_TIME" as const,
    staySeconds: 10 * 60,
    repeatable: false,
    cooldownHours: 24,
    locationName: "Parcul Valea Morilor",
  },
] as const;

/** Default missions for hang-out goals (idempotent if rows already exist). */
async function main() {
  const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });
  const idByName = new Map(locations.map((l) => [l.name, l.id]));

  function locationIdFor(name: string): string | null {
    const id = idByName.get(name);
    if (!id) {
      console.warn('No seeded location named "%s" — run `pnpm --filter server seed:locations` first', name);
    }
    return id ?? null;
  }

  const existing = await prisma.mission.count();
  if (existing === 0) {
    await prisma.mission.createMany({
      data: MISSION_DEFS.map((d) => ({
        title: d.title,
        description: d.description,
        rewardXp: d.rewardXp,
        targetProgress: d.targetProgress,
        completionKind: d.completionKind,
        distanceMeters: (d as any).distanceMeters ?? null,
        staySeconds: (d as any).staySeconds ?? null,
        repeatable: d.repeatable,
        cooldownHours: d.cooldownHours,
        locationId: locationIdFor(d.locationName),
      })),
    });
    console.log("✅ Seeded %d missions (linked to seeded locations)", MISSION_DEFS.length);
  } else {
    for (const d of MISSION_DEFS) {
      await prisma.mission.updateMany({
        where: { title: d.title },
        data: {
          repeatable: d.repeatable,
          cooldownHours: d.cooldownHours,
          locationId: locationIdFor(d.locationName),
          completionKind: d.completionKind,
          distanceMeters: (d as any).distanceMeters ?? null,
          staySeconds: (d as any).staySeconds ?? null,
        },
      });
    }
    console.log("Missions already present — updated repeat/cooldown/location from seeded places");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

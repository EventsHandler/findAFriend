// npx ts-node src/seed.ts

import { prisma } from './prisma'
import { RarityType } from '../src/generated/prisma'

async function upsertItem(name: string, rarity: RarityType) {
  return prisma.item.upsert({
    where: { name },
    update: { rarity },
    create: { name, rarity },
  })
}

async function upsertCrate(name: string, rarity: RarityType, price: number, chance: number) {
  return prisma.crate.upsert({
    where: { name },
    update: {
      rarity,
      price,
      chance,
    },
    create: {
      name,
      rarity,
      price,
      chance,
    },
  })
}

async function upsertDrop(crateId: string, rarity: RarityType, chance: number) {
  return prisma.crateRarityDrop.upsert({
    where: {
      crateId_rarity: { crateId, rarity },
    },
    update: { chance },
    create: { crateId, rarity, chance },
  })
}

async function main() {
  // 🔥 ITEMS (max 5)
  await Promise.all([
    upsertItem('Wooden Sword', RarityType.COMMON),
    upsertItem('Iron Sword', RarityType.COMMON),
    upsertItem('Magic Wand', RarityType.EPIC),
    upsertItem('Dragon Blade', RarityType.LEGENDARY),
    upsertItem('Phoenix Feather', RarityType.LEGENDARY),
  ])

  // 🎁 CRATES
  const commonCrate = await upsertCrate('Common Crate', RarityType.COMMON, 100, 0.7)

  const epicCrate = await upsertCrate('Epic Crate', RarityType.EPIC, 500, 0.25)

  const legendaryCrate = await upsertCrate('Legendary Crate', RarityType.LEGENDARY, 2000, 0.05)

  // 🎲 RARITY DROPS

  // COMMON CRATE
  await Promise.all([
    upsertDrop(commonCrate.id, RarityType.COMMON, 0.8),
    upsertDrop(commonCrate.id, RarityType.EPIC, 0.18),
    upsertDrop(commonCrate.id, RarityType.LEGENDARY, 0.02),
  ])

  // EPIC CRATE
  await Promise.all([
    upsertDrop(epicCrate.id, RarityType.COMMON, 0.2),
    upsertDrop(epicCrate.id, RarityType.EPIC, 0.6),
    upsertDrop(epicCrate.id, RarityType.LEGENDARY, 0.2),
  ])

  // LEGENDARY CRATE
  await Promise.all([
    upsertDrop(legendaryCrate.id, RarityType.EPIC, 0.5),
    upsertDrop(legendaryCrate.id, RarityType.LEGENDARY, 0.5),
  ])

  console.log('✅ Seed done')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
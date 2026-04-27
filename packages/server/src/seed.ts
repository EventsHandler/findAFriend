// npx ts-node src/seed.ts

import { prisma } from './prisma'
import { RarityType } from '../src/generated/prisma'

async function createItem(name: string, rarity: RarityType, svgId: string) {
  return prisma.item.create({
    data: { name, rarity, svgId },
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
  // DELETE ONLY BADGES / ITEMS
  await prisma.itemInventory.deleteMany()
  await prisma.item.deleteMany()

  // RECREATE BADGES
  await Promise.all([
    createItem('Primul Pas', RarityType.COMMON, 'badge_1'),
    createItem('Scântee Socială', RarityType.COMMON, 'badge_2'),
    createItem('Noroc Chior', RarityType.COMMON, 'badge_3'),
    createItem('Constructor de Conexiuni', RarityType.EPIC, 'badge_4'),
    createItem('Momentum', RarityType.EPIC, 'badge_5'),
    createItem('Jucător de Echipă ', RarityType.EPIC, 'badge_6'),
    createItem('Legendă Socială', RarityType.LEGENDARY, 'badge_7'),
    createItem('Unstoppable', RarityType.LEGENDARY, 'badge_8'),
    createItem('Inima Comunității', RarityType.LEGENDARY, 'badge_9'),
  ])

  // KEEP CRATES UNCHANGED
  const commonCrate = await upsertCrate('Common Crate', RarityType.COMMON, 100, 0.7)

  const epicCrate = await upsertCrate('Epic Crate', RarityType.EPIC, 500, 0.25)

  const legendaryCrate = await upsertCrate('Legendary Crate', RarityType.LEGENDARY, 2000, 0.05)

  // KEEP DROP TABLE UNCHANGED
  await Promise.all([
    upsertDrop(commonCrate.id, RarityType.COMMON, 0.8),
    upsertDrop(commonCrate.id, RarityType.EPIC, 0.18),
    upsertDrop(commonCrate.id, RarityType.LEGENDARY, 0.02),

    upsertDrop(epicCrate.id, RarityType.COMMON, 0.2),
    upsertDrop(epicCrate.id, RarityType.EPIC, 0.6),
    upsertDrop(epicCrate.id, RarityType.LEGENDARY, 0.2),

    upsertDrop(legendaryCrate.id, RarityType.EPIC, 0.5),
    upsertDrop(legendaryCrate.id, RarityType.LEGENDARY, 0.5),
  ])

  console.log('✅ Items recreated, crates unchanged')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

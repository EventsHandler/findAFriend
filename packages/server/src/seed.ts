// npx ts-node src/seed.ts

import { prisma } from "./prisma"
import { RarityType } from "../src/generated/prisma"

async function main() {
  // 🔥 ITEMS (max 5)
  const items = await Promise.all([
    prisma.item.create({
      data: { name: "Wooden Sword", rarity: RarityType.COMMON }
    }),
    prisma.item.create({
      data: { name: "Iron Sword", rarity: RarityType.COMMON }
    }),
    prisma.item.create({
      data: { name: "Magic Wand", rarity: RarityType.EPIC }
    }),
    prisma.item.create({
      data: { name: "Dragon Blade", rarity: RarityType.LEGENDARY }
    }),
    prisma.item.create({
      data: { name: "Phoenix Feather", rarity: RarityType.LEGENDARY }
    }),
  ])

  // 🎁 CRATES
  const commonCrate = await prisma.crate.create({
    data: {
      name: "Common Crate",
      rarity: RarityType.COMMON,
      chance: 0.7
    }
  })

  const epicCrate = await prisma.crate.create({
    data: {
      name: "Epic Crate",
      rarity: RarityType.EPIC,
      chance: 0.25
    }
  })

  const legendaryCrate = await prisma.crate.create({
    data: {
      name: "Legendary Crate",
      rarity: RarityType.LEGENDARY,
      chance: 0.05
    }
  })

  // 🎲 RARITY DROPS

  // COMMON CRATE
  await prisma.crateRarityDrop.createMany({
    data: [
      { crateId: commonCrate.id, rarity: RarityType.COMMON, chance: 0.8 },
      { crateId: commonCrate.id, rarity: RarityType.EPIC, chance: 0.18 },
      { crateId: commonCrate.id, rarity: RarityType.LEGENDARY, chance: 0.02 },
    ]
  })

  // EPIC CRATE
  await prisma.crateRarityDrop.createMany({
    data: [
      { crateId: epicCrate.id, rarity: RarityType.COMMON, chance: 0.2 },
      { crateId: epicCrate.id, rarity: RarityType.EPIC, chance: 0.6 },
      { crateId: epicCrate.id, rarity: RarityType.LEGENDARY, chance: 0.2 },
    ]
  })

  // LEGENDARY CRATE
  await prisma.crateRarityDrop.createMany({
    data: [
      { crateId: legendaryCrate.id, rarity: RarityType.EPIC, chance: 0.5 },
      { crateId: legendaryCrate.id, rarity: RarityType.LEGENDARY, chance: 0.5 },
    ]
  })

  console.log("✅ Seed done")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
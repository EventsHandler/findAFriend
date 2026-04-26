import { prisma } from '../../../../prisma.js'
import type { MutationResolvers } from './../../../types.generated.js'
export const openCrate: NonNullable<MutationResolvers['openCrate']> = async (_parent, { userId, crateId }, _ctx) => {
  const inventory = await prisma.crateInventory.findFirst({
    where: { userId, crateId }
  })

  if (!inventory || inventory.quantity <= 0) {
    throw new Error("No crate available")
  }

  if (inventory.quantity === 1) {
    await prisma.crateInventory.delete({
      where: { id: inventory.id }
    })
  } else {
    await prisma.crateInventory.update({
      where: { id: inventory.id },
      data: {
        quantity: {
          decrement: 1
        }
      }
    })
  }

  const rarityDrops = await prisma.crateRarityDrop.findMany({
    where: { crateId }
  })

  if (rarityDrops.length === 0) {
    throw new Error("No rarity drops configured")
  }

  const rand = Math.random()
  let cumulative = 0
  let selectedRarity = rarityDrops[0]?.rarity

  for (const drop of rarityDrops) {
    cumulative += drop.chance
    if (rand <= cumulative) {
      selectedRarity = drop.rarity
      break
    }
  }

  const items = await prisma.item.findMany({
    where: { rarity: selectedRarity }
  })

  if (items.length === 0) {
    throw new Error("No items for this rarity")
  }

  const randomItem = items[Math.floor(Math.random() * items.length)]

  const existingItem = await prisma.itemInventory.findFirst({
    where: { userId, itemId: randomItem?.id }
  })

  if (existingItem) {
    await prisma.itemInventory.update({
      where: { id: existingItem.id },
      data: {
        quantity: {
          increment: 1
        }
      }
    })
  } else {
    await prisma.itemInventory.create({
      data: {
        userId,
        itemId: randomItem?.id as string,
        quantity: 1
      }
    })
  }

  const res = await prisma.item.findUnique({
    where: { id: randomItem?.id }
  })
  if(!res) {
    throw new Error("Failed to retrieve item")
  }
  return res
}

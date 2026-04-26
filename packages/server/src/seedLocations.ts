import { prisma } from "./prisma";

async function main() {
  await prisma.location.deleteMany();

  console.log("🗑 Locations cleared");

  await prisma.location.createMany({
    data: [
      {
        name: "Parcul Valea Morilor",
        posx: 47.018313,
        posy: 28.822356
      },
      {
        name: "Parcul Valea Trandafirilor",
        posx: 47.004205,
        posy: 28.853141
      },
      {
        name: "Parcul la izvor",
        posx: 47.045507,
        posy: 28.789853
      },
      {
        name: "Centru",
        posx: 47.023637,
        posy: 28.833994
      },
      {
        name: "Parcul Afgan",
        posx: 47.050175,
        posy: 28.863678
      },
      {
        name: "Parcul Dendrariu",
        posx: 47.033654,
        posy: 28.807309
      }
    ]
  });

  console.log("✅ Locations reseeded with accurate coordinates");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
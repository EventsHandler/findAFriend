import { prisma } from "./prisma";

async function main() {
  await prisma.location.deleteMany();
  console.log("🗑 Locations cleared");

  // Use raw SQL insert so seeds keep working even if Prisma Client can't regenerate (Windows EPERM).
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Location" ("id", "name", "posx", "posy", "tag") VALUES
      (gen_random_uuid()::text, 'Parcul Valea Morilor', 47.018313, 28.822356, 'PARK'),
      (gen_random_uuid()::text, 'Parcul Valea Trandafirilor', 47.004205, 28.853141, 'PARK'),
      (gen_random_uuid()::text, 'Parcul la izvor', 47.045507, 28.789853, 'PARK'),
      (gen_random_uuid()::text, 'Centru', 47.023637, 28.833994, 'LANDMARK'),
      (gen_random_uuid()::text, 'Parcul Afgan', 47.050175, 28.863678, 'PARK'),
      (gen_random_uuid()::text, 'Parcul Dendrariu', 47.033654, 28.807309, 'PARK'),
      (gen_random_uuid()::text, 'debug', 47.01771462640434, 28.743851057771067, 'LANDMARK');
  `);

  console.log("✅ Locations reseeded with accurate coordinates");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
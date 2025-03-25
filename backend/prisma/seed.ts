import { PrismaClient, CityName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.city.createMany({
    data: [
      { name: CityName.Riyadh },
      { name: CityName.Jeddah },
      { name: CityName.Dammam },
    ],
    skipDuplicates: true,
  });
}

main().then(() => {
    console.log('Seeded cities');
  })
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect());

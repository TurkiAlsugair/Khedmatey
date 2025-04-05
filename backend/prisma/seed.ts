import { PrismaClient, CityName, CategoryName } from '@prisma/client';

const prisma = new PrismaClient();

//seed the categories table with predefined names from the CategoryName enum
async function seedCategories(){
  const categories = Object.values(CategoryName).map((name) => ({ name }));
  
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
    }
  
    console.log('Categories seeded');
}

//seed the cities table with predefined names from the city enum
async function seedCities() {
  const cities = Object.values(CityName).map((name) => ({ name }));

  await prisma.city.createMany({
    data: cities,
    skipDuplicates: true,
  });

  console.log('Cities seeded');
}

async function main() {
  await seedCities();
  await seedCategories();
}

main()
  .catch((e) => 
  {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());

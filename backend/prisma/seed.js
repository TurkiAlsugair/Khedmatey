"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedCategories() {
    const categories = Object.values(client_1.CategoryName).map((name) => ({ name }));
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log('Categories seeded');
}
async function seedCities() {
    const cities = Object.values(client_1.CityName).map((name) => ({ name }));
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
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=seed.js.map
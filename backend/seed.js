const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const supplier = await prisma.supplier.upsert({
    where: { name: 'EDF' },
    update: {},
    create: {
      name: 'EDF',
    },
  });

  const offer = await prisma.offer.upsert({
    where: {
      name_supplierId: {
        name: "Tempo",
        supplierId: supplier.id,
      },
    },
    update: {},
    create: {
      name: "Tempo",
      supplierId: supplier.id,
    },
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 30);
  
  const offerId = offer.id;

  // create a default tariff type for the offer
  const tariffType = await prisma.tariffType.upsert({
    where: { name_offerId: { name: "HC", offerId } },
    update: {},
    create: { name: "HC", offerId },
  });
  const tariffTypeId = tariffType.id;

  // Prix janvier
  await prisma.price.create({
    data: {
      offerId,
      tariffTypeId,
      priceKwh: 0.18,
      validFrom: new Date("2026-01-01T00:00:00Z"),
      validTo: new Date("2026-02-01T00:00:00Z"),
    },
  });
  
  // Prix février
  await prisma.price.create({
    data: {
      offerId,
      tariffTypeId,
      priceKwh: 0.20,
      validFrom: new Date("2026-02-01T00:00:00Z"),
      validTo: new Date("2026-03-01T00:00:00Z"),
    },
  });
  
  // Prix actuel
  await prisma.price.create({
    data: {
      offerId,
      tariffTypeId,
      priceKwh: 0.25,
      validFrom: new Date("2026-03-01T00:00:00Z"),
      validTo: null,
    },
  });

  console.log('Seed completed: EDF, Tempo offer, and today price created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


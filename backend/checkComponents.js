const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const components = await prisma.priceComponent.findMany();
  console.log('\nComponents:', JSON.stringify(components, null, 2));

  const powers = await prisma.meterPower.findMany();
  console.log('\nMeter Powers:', JSON.stringify(powers, null, 2));

  const tariffs = await prisma.tariffType.findMany();
  console.log('\nTariff Types:', JSON.stringify(tariffs, null, 2));

  // Sample subscription prices
  const samplePrices = await prisma.priceComponentValue.findMany({
    where: {
      component: { code: { in: ['ABO', 'SUBSCRIPTION', 'SUB', 'subscription'] } }
    },
    include: {
      component: true,
      meterPower: true,
      tariffType: true,
      offerOption: {
        include: {
          offer: {
            include: { supplier: true }
          }
        }
      }
    },
    take: 5
  });
  console.log('\nSample Subscription Prices:', JSON.stringify(samplePrices, null, 2));

  // If none found, show all component codes in PriceComponentValue
  if (samplePrices.length === 0) {
    const allComponents = await prisma.priceComponent.findMany();
    console.log('\nAll component codes in DB:', allComponents.map(c => `${c.code} = ${c.label}`));
    
    // show any price to understand structure
    const anyPrice = await prisma.priceComponentValue.findFirst({
      include: {
        component: true,
        meterPower: true,
        tariffType: true,
        offerOption: {
          include: {
            offer: { include: { supplier: true } }
          }
        }
      }
    });
    console.log('\nAny price sample:', JSON.stringify(anyPrice, null, 2));
  }

  await prisma.$disconnect();
}

check();

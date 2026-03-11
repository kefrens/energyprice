const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const offers = await prisma.offer.findMany();
  console.log('Offers in DB:', offers.length);
  offers.forEach(o => console.log('  Code:', o.code, 'Name:', o.name));
  
  const options = await prisma.offerOption.findMany({ include: { offer: true } });
  console.log('\nOfferOptions in DB:', options.length);
  options.forEach(o => console.log('  Code:', o.code, 'Offer:', o.offer.code));
  
  await prisma.$disconnect();
}

check();

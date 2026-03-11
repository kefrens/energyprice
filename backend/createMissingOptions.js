const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createMissingOptions() {
  const missingOptions = [
    { offer_code: 'EDF_TEMPO', option_code: 'BASE', name: 'Base' },
    { offer_code: 'EDF_TEMPO', option_code: 'HPHC', name: 'Heures Pleines/Creuses' },
    { offer_code: 'TOTAL_ONLINE', option_code: 'HPHC', name: 'Heures Pleines/Creuses' },
    { offer_code: 'MINT_CLASSIC', option_code: 'HPHC', name: 'Heures Pleines/Creuses' },
    { offer_code: 'EKW_VERT', option_code: 'HPHC', name: 'Heures Pleines/Creuses' },
    { offer_code: 'OHM_EXTRA', option_code: 'HPHC', name: 'Heures Pleines/Creuses' },
    { offer_code: 'ALPIQ_FIXE', option_code: 'HPHC', name: 'Heures Pleines/Creuses' },
  ];

  for (const opt of missingOptions) {
    const offer = await prisma.offer.findUnique({ where: { code: opt.offer_code } });
    if (!offer) {
      console.log(`Offer not found: ${opt.offer_code}`);
      continue;
    }

    const existing = await prisma.offerOption.findFirst({
      where: { code: opt.option_code, offerId: offer.id }
    });

    if (existing) {
      console.log(`Already exists: ${opt.offer_code} → ${opt.option_code}`);
      continue;
    }

    await prisma.offerOption.create({
      data: {
        code: opt.option_code,
        name: opt.name,
        offerId: offer.id
      }
    });
    console.log(`Created: ${opt.offer_code} → ${opt.option_code}`);
  }

  await prisma.$disconnect();
}

createMissingOptions();

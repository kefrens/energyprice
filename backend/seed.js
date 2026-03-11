const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Create suppliers
  const edfSupplier = await prisma.supplier.upsert({
    where: { code: 'EDF' },
    update: {},
    create: {
      code: 'EDF',
      name: 'Électricité de France',
      createdAt: new Date('1946-04-08'),
      active: true,
      logoUrl: 'edf.fr'
    },
  });

  const engieSupplier = await prisma.supplier.upsert({
    where: { code: 'ENGIE' },
    update: {},
    create: {
      code: 'ENGIE',
      name: 'Engie',
      createdAt: new Date('2008-07-22'),
      active: true,
      logoUrl: 'engie.com'
    },
  });

  // Create tariff types
  const hcTariff = await prisma.tariffType.upsert({
    where: { code: 'HC' },
    update: {},
    create: {
      code: 'HC',
      label: 'Heures Creuses'
    },
  });

  const hpTariff = await prisma.tariffType.upsert({
    where: { code: 'HP' },
    update: {},
    create: {
      code: 'HP',
      label: 'Heures Pleines'
    },
  });

  const baseTariff = await prisma.tariffType.upsert({
    where: { code: 'BASE' },
    update: {},
    create: {
      code: 'BASE',
      label: 'Tarif de Base'
    },
  });

  // Create meter powers
  const p3Meter = await prisma.meterPower.upsert({
    where: { code: 'P3' },
    update: {},
    create: {
      code: 'P3',
      kva: 3
    },
  });

  const p6Meter = await prisma.meterPower.upsert({
    where: { code: 'P6' },
    update: {},
    create: {
      code: 'P6',
      kva: 6
    },
  });

  // Create price components
  const abonnementComponent = await prisma.priceComponent.upsert({
    where: { code: 'ABO' },
    update: {},
    create: {
      code: 'ABO',
      label: 'Abonnement'
    },
  });

  const consommationComponent = await prisma.priceComponent.upsert({
    where: { code: 'CONS' },
    update: {},
    create: {
      code: 'CONS',
      label: 'Consommation'
    },
  });

  // Create offers
  const tempoOffer = await prisma.offer.upsert({
    where: { code: 'TEMPO_EDF' },
    update: {},
    create: {
      code: 'TEMPO_EDF',
      name: 'Tempo',
      startDate: new Date('2026-01-01'),
      active: true,
      supplierId: edfSupplier.id
    },
  });

  const verteOffer = await prisma.offer.upsert({
    where: { code: 'VERTE_ENGIE' },
    update: {},
    create: {
      code: 'VERTE_ENGIE',
      name: 'Elec Vert',
      startDate: new Date('2026-01-01'),
      active: true,
      supplierId: engieSupplier.id
    },
  });

  // Create offer options
  const tempoOptionHC = await prisma.offerOption.upsert({
    where: { code_offerId: { code: 'TEMPO_HC', offerId: tempoOffer.id } },
    update: {},
    create: {
      code: 'TEMPO_HC',
      name: 'Tempo Heures Creuses',
      offerId: tempoOffer.id
    },
  });

  const tempoOptionHP = await prisma.offerOption.upsert({
    where: { code_offerId: { code: 'TEMPO_HP', offerId: tempoOffer.id } },
    update: {},
    create: {
      code: 'TEMPO_HP',
      name: 'Tempo Heures Pleines',
      offerId: tempoOffer.id
    },
  });

  const verteOption = await prisma.offerOption.upsert({
    where: { code_offerId: { code: 'VERTE_BASE', offerId: verteOffer.id } },
    update: {},
    create: {
      code: 'VERTE_BASE',
      name: 'Elec Vert Tarif Base',
      offerId: verteOffer.id
    },
  });

  // Create price component values
  // Tempo HC prices
  await prisma.priceComponentValue.create({
    data: {
      priceHt: 0.18,
      priceTtc: 0.2136,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-02-01'),
      offerOptionId: tempoOptionHC.id,
      meterPowerId: p6Meter.id,
      componentId: consommationComponent.id,
      tariffTypeId: hcTariff.id
    },
  });

  await prisma.priceComponentValue.create({
    data: {
      priceHt: 0.20,
      priceTtc: 0.238,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-03-01'),
      offerOptionId: tempoOptionHC.id,
      meterPowerId: p6Meter.id,
      componentId: consommationComponent.id,
      tariffTypeId: hcTariff.id
    },
  });

  await prisma.priceComponentValue.create({
    data: {
      priceHt: 0.25,
      priceTtc: 0.2975,
      startDate: new Date('2026-03-01'),
      offerOptionId: tempoOptionHC.id,
      meterPowerId: p6Meter.id,
      componentId: consommationComponent.id,
      tariffTypeId: hcTariff.id
    },
  });

  // Tempo HP prices
  await prisma.priceComponentValue.create({
    data: {
      priceHt: 0.25,
      priceTtc: 0.2975,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-02-01'),
      offerOptionId: tempoOptionHP.id,
      meterPowerId: p6Meter.id,
      componentId: consommationComponent.id,
      tariffTypeId: hpTariff.id
    },
  });

  await prisma.priceComponentValue.create({
    data: {
      priceHt: 0.28,
      priceTtc: 0.3332,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-03-01'),
      offerOptionId: tempoOptionHP.id,
      meterPowerId: p6Meter.id,
      componentId: consommationComponent.id,
      tariffTypeId: hpTariff.id
    },
  });

  await prisma.priceComponentValue.create({
    data: {
      priceHt: 0.32,
      priceTtc: 0.3808,
      startDate: new Date('2026-03-01'),
      offerOptionId: tempoOptionHP.id,
      meterPowerId: p6Meter.id,
      componentId: consommationComponent.id,
      tariffTypeId: hpTariff.id
    },
  });

  // Elec Vert prices
  await prisma.priceComponentValue.create({
    data: {
      priceHt: 0.22,
      priceTtc: 0.2618,
      startDate: new Date('2026-01-01'),
      offerOptionId: verteOption.id,
      meterPowerId: p3Meter.id,
      componentId: consommationComponent.id,
      tariffTypeId: baseTariff.id
    },
  });

  // Abonnement prices
  await prisma.priceComponentValue.create({
    data: {
      priceHt: 12.50,
      priceTtc: 14.88,
      startDate: new Date('2026-01-01'),
      offerOptionId: tempoOptionHC.id,
      meterPowerId: p6Meter.id,
      componentId: abonnementComponent.id,
      tariffTypeId: hcTariff.id
    },
  });

  await prisma.priceComponentValue.create({
    data: {
      priceHt: 8.50,
      priceTtc: 10.11,
      startDate: new Date('2026-01-01'),
      offerOptionId: verteOption.id,
      meterPowerId: p3Meter.id,
      componentId: abonnementComponent.id,
      tariffTypeId: baseTariff.id
    },
  });

  console.log('Seed completed: Suppliers, offers, tariff types, meter powers, price components, and prices created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


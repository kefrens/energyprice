// Script to import data from Excel file into the database using Prisma
// Assumes the Excel file has sheets named: suppliers, offers, offer_options, meter_powers, tariff_types, price_components, price_component_values
// Usage: node importExcel.js
// Make sure to adjust the file path and sheet names if necessary
const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const workbook = XLSX.readFile("../datas/energyprice_dataset.xlsx");

// Helper function to convert sheet to JSON
function sheet(name) {
  return XLSX.utils.sheet_to_json(workbook.Sheets[name]);
}

async function importSuppliers() {
  const rows = sheet("suppliers");

  for (const row of rows) {
    await prisma.supplier.upsert({
      where: { code: row.supplier_code },
      update: {},
      create: {
        code: row.supplier_code,
        name: row.name,
        createdAt: new Date(row.created_at),
        closedAt: row.closed_at ? new Date(row.closed_at) : null,
        active: row.active,
        logoUrl: row.logo_url
      }
    });
  }

  console.log("Suppliers imported");
}

async function importOffers() {
  const rows = sheet("offers");

  for (const row of rows) {
    const supplier = await prisma.supplier.findUnique({
      where: { code: row.supplier_code }
    });

    await prisma.offer.upsert({
      where: { code: row.offer_code },
      update: {},
      create: {
        code: row.offer_code,
        name: row.name,
        startDate: new Date(row.start_date),
        endDate: row.end_date ? new Date(row.end_date) : null,
        active: row.active,
        supplierId: supplier.id
      }
    });
  }

  console.log("Offers imported");
}

async function importOfferOptions() {
  const rows = sheet("offer_options");

  for (const row of rows) {
    const offer = await prisma.offer.findUnique({
      where: { code: row.offer_code }
    });

    await prisma.offerOption.create({
      data: {
        code: row.option_code,
        name: row.name,
        description: row.description,
        offerId: offer.id
      }
    });
  }

  console.log("Offer options imported");
}

async function createMissingOfferOptions() {
  // Get all offer/option combinations needed by prices
  const priceRows = sheet("price_component_values");
  const needed = new Set();
  for (const row of priceRows) {
    needed.add(row.offer_code + "|" + row.option_code);
  }

  for (const combo of needed) {
    const [offerCode, optionCode] = combo.split("|");
    
    const offer = await prisma.offer.findUnique({
      where: { code: offerCode }
    });
    
    if (!offer) continue;

    const existing = await prisma.offerOption.findFirst({
      where: { code: optionCode, offerId: offer.id }
    });

    if (!existing) {
      await prisma.offerOption.create({
        data: {
          code: optionCode,
          name: optionCode === "HPHC" ? "Heures Pleines/Creuses" : optionCode === "TEMPO" ? "Tempo" : "Base",
          offerId: offer.id
        }
      });
      console.log(`Created missing option: ${offerCode} → ${optionCode}`);
    }
  }

  console.log("Missing offer options created");
}

async function importMeterPowers() {
  const rows = sheet("meter_powers");

  for (const row of rows) {
    await prisma.meterPower.upsert({
      where: { code: row.power_code },
      update: {},
      create: {
        code: row.power_code,
        kva: row.kva
      }
    });
  }

  console.log("Meter powers imported");
}

async function importTariffTypes() {
  const rows = sheet("tariff_types");

  for (const row of rows) {
    await prisma.tariffType.upsert({
      where: { code: row.tariff_code },
      update: {},
      create: {
        code: row.tariff_code,
        label: row.label
      }
    });
  }

  console.log("Tariff types imported");
}

async function importPriceComponents() {
  const rows = sheet("price_components");

  for (const row of rows) {
    await prisma.priceComponent.upsert({
      where: { code: row.component_code },
      update: {},
      create: {
        code: row.component_code,
        label: row.label
      }
    });
  }

  console.log("Price components imported");
}

async function importPrices() {
  const rows = sheet("price_component_values");

  for (const row of rows) {
    const option = await prisma.offerOption.findFirst({
      where: {
        code: row.option_code,
        offer: { code: row.offer_code }
      }
    });

    if (!option) {
      console.warn(`Skipping price: OfferOption not found - offer_code=${row.offer_code}, option_code=${row.option_code}`);
      continue;
    }

    const power = await prisma.meterPower.findUnique({
      where: { code: row.power_code }
    });

    if (!power) {
      console.warn(`Skipping price: MeterPower not found - power_code=${row.power_code}`);
      continue;
    }

    const component = await prisma.priceComponent.findUnique({
      where: { code: row.component_code }
    });

    if (!component) {
      console.warn(`Skipping price: PriceComponent not found - component_code=${row.component_code}`);
      continue;
    }

    const tariff = await prisma.tariffType.findUnique({
      where: { code: row.tariff_code }
    });

    if (!tariff) {
      console.warn(`Skipping price: TariffType not found - tariff_code=${row.tariff_code}`);
      continue;
    }

    await prisma.priceComponentValue.create({
      data: {
        priceHt: row.price_ht,
        priceTtc: row.price_ttc,
        startDate: new Date(row.start_date),
        endDate: row.end_date ? new Date(row.end_date) : null,
        offerOptionId: option.id,
        meterPowerId: power.id,
        componentId: component.id,
        tariffTypeId: tariff.id
      }
    });
  }

  console.log("Prices imported");
}

async function main() {
  try {
    // Clear existing data (optional, be careful with this in production)
    console.log("Clearing existing data...");
    await prisma.priceComponentValue.deleteMany();
    await prisma.offerOption.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.meterPower.deleteMany();
    await prisma.tariffType.deleteMany();
    await prisma.priceComponent.deleteMany();

    await importSuppliers();
    await importOffers();
    await importOfferOptions();
    await createMissingOfferOptions();
    await importMeterPowers();
    await importTariffTypes();
    await importPriceComponents();
    await importPrices();

    console.log("Import completed successfully!");
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getCurrentPrice(req, res) {
  const today = new Date();
  try {
    const offerId = parseInt(req.params.offerId, 10);

    const prices = await prisma.priceComponentValue.findMany({
      where: {
        offerOption: {
          offer: {
            id: offerId
          }
        },
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        offerOption: {
          include: {
            offer: true
          }
        },
        component: true,
        tariffType: true,
        meterPower: true
      }
    });

    // Group by offer option and pick the latest valid price for each
    const priceMap = {};
    prices.forEach(price => {
      const optionId = price.offerOptionId;
      if (!priceMap[optionId] || price.startDate > priceMap[optionId].startDate) {
        priceMap[optionId] = price;
      }
    });

    const result = Object.values(priceMap);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createPrice(req, res) {
  try {
    const offerId = parseInt(req.params.offerId, 10);
    const { priceKwh, tariffTypeId, validFrom } = req.body;

    const effectiveDate = validFrom
      ? new Date(validFrom + "T00:00:00Z")
      : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const activePrice = await tx.price.findFirst({
        where: {
          tariffTypeId: tariffTypeId,
          validTo: null,
        },
      });

      if (activePrice) {
        await tx.price.update({
          where: { id: activePrice.id },
          data: {
            validTo: effectiveDate,
          },
        });
      }

      const newPrice = await tx.price.create({
        data: {
          priceKwh,
          tariffTypeId,
          validFrom: effectiveDate,
          validTo: null,
        },
      });

      return newPrice;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getPriceHistory(req, res) {
  try {
    const offerId = parseInt(req.params.offerId, 10);
    // explicitly select fields to avoid errors if schema mismatch
    const prices = await prisma.priceComponentValue.findMany({
      where: {
        offerOption: {
          offer: {
            id: offerId
          }
        }
      },
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        priceHt: true,
        priceTtc: true,
        startDate: true,
        endDate: true,
        offerOptionId: true,
        meterPowerId: true,
        componentId: true,
        tariffTypeId: true,
        offerOption: {
          select: {
            code: true,
            name: true,
            offer: {
              select: {
                code: true,
                name: true
              }
            }
          }
        },
        meterPower: {
          select: {
            code: true,
            kva: true
          }
        },
        component: {
          select: {
            code: true,
            label: true
          }
        },
        tariffType: {
          select: {
            code: true,
            label: true
          }
        }
      }
    });
    res.json(prices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getPriceByDate(req, res) {
  try {
    const offerId = parseInt(req.params.offerId, 10);
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Missing date query parameter (YYYY-MM-DD)" });
    }

    const targetDate = new Date(`${date}T12:00:00Z`);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const price = await prisma.price.findFirst({
      where: {
        tariffType: {
          offerId: offerId
        },
        validFrom: { lte: targetDate },
        OR: [
          { validTo: null },
          { validTo: { gte: targetDate } },
        ],
      },
      select: {
        id: true,
        priceKwh: true,
        validFrom: true,
        validTo: true,
        tariffTypeId: true,
      },
    });

    if (!price) {
      return res.status(404).json({ error: "No price found for this date" });
    }

    res.json(price);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deletePrice(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid price ID" });
    }
    await prisma.price.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Price not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getSubscriptionPrices(req, res) {
  try {
    const { tariffType, powers, suppliers } = req.query;

    const where = {
      component: { code: "SUBSCRIPTION" },
    };

    if (tariffType) {
      where.tariffType = { code: tariffType };
    }
    if (powers) {
      where.meterPower = { code: { in: powers.split(",") } };
    }
    if (suppliers) {
      where.offerOption = {
        offer: { supplier: { code: { in: suppliers.split(",") } } },
      };
    }

    const prices = await prisma.priceComponentValue.findMany({
      where,
      select: {
        id: true,
        priceHt: true,
        priceTtc: true,
        startDate: true,
        endDate: true,
        meterPower: { select: { code: true, kva: true } },
        tariffType: { select: { code: true, label: true } },
        component: { select: { code: true, label: true } },
        offerOption: {
          select: {
            code: true,
            name: true,
            offer: {
              select: {
                code: true,
                name: true,
                supplier: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    res.json(prices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getCurrentPrice,
  createPrice,
  getPriceHistory,
  getPriceByDate,
  deletePrice,
  getSubscriptionPrices,
};

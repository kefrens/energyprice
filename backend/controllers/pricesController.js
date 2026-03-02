const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getCurrentPrice(req, res) {
  const today = new Date();
  try {
    const offerId = parseInt(req.params.offerId, 10);

    const price = await prisma.price.findFirst({
      where: {
        offerId,
        validFrom: { lte: today },
        OR: [{ validTo: null }, { validTo: { gte: today } }],
      },
      select: {
        id: true,
        priceKwh: true,
        subscriptionPrice: true,
        validFrom: true,
        validTo: true,
        tariffTypeId: true,
      },
    });

    res.json(price);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createPrice(req, res) {
  try {
    const offerId = parseInt(req.params.offerId, 10);
    const { priceKwh, subscriptionPrice, validFrom } = req.body;

    const effectiveDate = validFrom
      ? new Date(validFrom + "T00:00:00Z")
      : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const activePrice = await tx.price.findFirst({
        where: {
          offerId,
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
          offerId,
          priceKwh,
          subscriptionPrice,
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
    const prices = await prisma.price.findMany({
      where: { offerId },
      orderBy: { validFrom: "asc" },
      select: {
        id: true,
        priceKwh: true,
        subscriptionPrice: true,
        validFrom: true,
        validTo: true,
        tariffTypeId: true,
      },
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
        offerId,
        validFrom: { lte: targetDate },
        OR: [
          { validTo: null },
          { validTo: { gte: targetDate } },
        ],
      },
      select: {
        id: true,
        priceKwh: true,
        subscriptionPrice: true,
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

module.exports = {
  getCurrentPrice,
  createPrice,
  getPriceHistory,
  getPriceByDate,
};
// Delete price by ID
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

module.exports.deletePrice = deletePrice;

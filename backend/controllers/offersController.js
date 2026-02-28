const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getOffersBySupplier(req, res) {
  try {
    const supplierId = parseInt(req.params.supplierId, 10);
    const offers = await prisma.offer.findMany({
      where: { supplierId },
      orderBy: { name: "asc" },
    });
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createOffer(req, res) {
  try {
    const { name, supplierId } = req.body;

    if (!name || !supplierId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const offer = await prisma.offer.create({
      data: {
        name,
        supplierId: parseInt(supplierId, 10),
      },
    });

    res.json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getOffersBySupplier,
  createOffer,
};

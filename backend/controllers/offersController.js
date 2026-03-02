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
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Offer already exists for this supplier" });
    }
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
// Delete offer by ID
async function deleteOffer(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }
    await prisma.offer.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Offer not found" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Cannot delete offer with existing prices or tariff types" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports.deleteOffer = deleteOffer;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTariffType(req, res) {
  try {
    const { name, offerId } = req.body;

    if (!name || !offerId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const tariffType = await prisma.tariffType.create({
      data: {
        name,
        offerId: parseInt(offerId, 10),
      },
    });

    res.json(tariffType);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Tariff type already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getTariffTypesByOffer(req, res) {
  try {
    const offerId = parseInt(req.params.offerId, 10);
    const tariffTypes = await prisma.tariffType.findMany({
      where: { offerId },
      orderBy: { name: "asc" },
    });
    res.json(tariffTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createTariffType,
  getTariffTypesByOffer,
};
// Delete tariff type by ID
async function deleteTariffType(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid tariff type ID" });
    }
    await prisma.tariffType.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Tariff type not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports.deleteTariffType = deleteTariffType;

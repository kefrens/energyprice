const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createTariffType(req, res) {
  try {
    const { code, label } = req.body;

    if (!code || !label) {
      return res.status(400).json({ error: "Code and label are required" });
    }

    const tariffType = await prisma.tariffType.create({
      data: {
        code,
        label,
      },
    });

    res.json(tariffType);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Tariff type code already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getTariffTypes(req, res) {
  try {
    const tariffTypes = await prisma.tariffType.findMany({
      orderBy: { label: "asc" },
    });
    res.json(tariffTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createTariffType,
  getTariffTypes,
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

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function listSuppliers(req, res) {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createSupplier(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const supplier = await prisma.supplier.create({
      data: { name },
    });

    res.json(supplier);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Supplier already exists" });
    }

    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listSuppliers,
  createSupplier,
};

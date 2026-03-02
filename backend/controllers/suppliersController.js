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

// Delete supplier by ID
async function deleteSupplier(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid supplier ID" });
    }
    // Try to delete supplier
    await prisma.supplier.delete({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "Supplier not found" });
    }
    // Prisma foreign key violation (e.g. offers exist)
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Cannot delete supplier with existing offers" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports.deleteSupplier = deleteSupplier;

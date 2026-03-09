const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getOffersBySupplier(req, res) {
  try {
    const supplierId = parseInt(req.params.supplierId, 10);
    const offers = await prisma.offer.findMany({
      where: { supplierId },
      orderBy: { name: "asc" },
    });
    const fs = require('fs');
    const jsonStr = JSON.stringify(offers);
    console.log('current dir', process.cwd());
    try {
      fs.writeFileSync('./backend_offer_log.json', jsonStr);
    } catch(e) {
      console.error('write error', e);
    }
    // also log to console in case terminal captures later
    console.log('offers fetched', offers);
    console.log('stringified', jsonStr);
    res.json(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function createOffer(req, res) {
  try {
    const { name, supplierId, startDate, endDate, active } = req.body;

    if (!name || !supplierId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const offer = await prisma.offer.create({
      data: {
        name,
        supplierId: parseInt(supplierId, 10),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        active: active !== undefined ? active : true,
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

// Update offer by ID
async function updateOffer(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }

    const { name, startDate, endDate, active } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (active !== undefined) updateData.active = active;

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    res.json(offer);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Offer not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports.updateOffer = updateOffer;

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

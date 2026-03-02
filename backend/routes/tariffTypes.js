const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const { createTariffType, getTariffTypesByOffer, deleteTariffType } = require("../controllers/tariffTypesController");

// create (admin)
router.post("/", apiKey, createTariffType);
// list by offer
router.get("/:offerId", apiKey, getTariffTypesByOffer);

// Delete tariff type by ID (admin)
router.delete("/:id", apiKey, deleteTariffType);

module.exports = router;

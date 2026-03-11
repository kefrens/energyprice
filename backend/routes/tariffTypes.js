const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const { createTariffType, getTariffTypes, deleteTariffType } = require("../controllers/tariffTypesController");

// create (admin)
router.post("/", apiKey, createTariffType);
// list all tariff types
router.get("/", apiKey, getTariffTypes);

// Delete tariff type by ID (admin)
router.delete("/:id", apiKey, deleteTariffType);

module.exports = router;

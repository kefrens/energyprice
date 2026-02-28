const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const { createTariffType, getTariffTypesByOffer } = require("../controllers/tariffTypesController");

// create (admin)
router.post("/", apiKey, createTariffType);
// list by offer
router.get("/:offerId", apiKey, getTariffTypesByOffer);

module.exports = router;

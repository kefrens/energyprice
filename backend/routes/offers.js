const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const { getOffersBySupplier, createOffer } = require("../controllers/offersController");

// public (but still guarded by key in current design)
router.get("/:supplierId", apiKey, getOffersBySupplier);

// administrative creation
router.post("/", apiKey, createOffer);

module.exports = router;

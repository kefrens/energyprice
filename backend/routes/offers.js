const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const { getOffersBySupplier, createOffer, deleteOffer } = require("../controllers/offersController");

// list by supplier is used both public and admin
router.get("/:supplierId", apiKey, getOffersBySupplier);

// administrative create/delete (router may be mounted at /offers or /admin/offers)
router.post("/", apiKey, createOffer);
router.delete("/:id", apiKey, deleteOffer);

module.exports = router;

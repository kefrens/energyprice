const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const {
  getCurrentPrice,
  createPrice,
  getPriceHistory,
  getPriceByDate,
  deletePrice,
  getSubscriptionPrices,
  getPriceCatalog,
} = require("../controllers/pricesController");

// public endpoints
router.get("/current/:offerId", getCurrentPrice);
router.get("/subscriptions", getSubscriptionPrices);

// admin endpoints (assumes router may be mounted under /admin/prices)
router.get("/catalog", apiKey, getPriceCatalog);
router.post("/:offerId", apiKey, createPrice);
router.get("/history/:offerId", apiKey, getPriceHistory);
router.get("/date/:offerId", apiKey, getPriceByDate);
router.delete("/:id", apiKey, deletePrice);

module.exports = router;

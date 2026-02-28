const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const {
  getCurrentPrice,
  createPrice,
  getPriceHistory,
  getPriceByDate,
} = require("../controllers/pricesController");

// public current price
router.get("/current/:offerId", getCurrentPrice);

// admin endpoints
router.post("/admin/:offerId", apiKey, createPrice);
router.get("/history/:offerId", apiKey, getPriceHistory);
router.get("/date/:offerId", apiKey, getPriceByDate);

module.exports = router;

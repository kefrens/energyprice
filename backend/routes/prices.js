const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const {
  getCurrentPrice,
  createPrice,
  getPriceHistory,
  getPriceByDate,
  deletePrice,
} = require("../controllers/pricesController");

// public current price
router.get("/current/:offerId", getCurrentPrice);

// admin endpoints (assumes router may be mounted under /admin/prices)
router.post("/:offerId", apiKey, createPrice);
router.get("/history/:offerId", apiKey, getPriceHistory);
router.get("/date/:offerId", apiKey, getPriceByDate);
router.delete("/:id", apiKey, deletePrice);

module.exports = router;

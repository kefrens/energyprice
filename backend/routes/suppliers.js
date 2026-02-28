const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const { listSuppliers, createSupplier } = require("../controllers/suppliersController");

router.get("/", apiKey, listSuppliers);
router.post("/", apiKey, createSupplier);

module.exports = router;

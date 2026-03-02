const express = require("express");
const router = express.Router();
const apiKey = require("../middleware/apiKey");
const { listSuppliers, createSupplier, deleteSupplier } = require("../controllers/suppliersController");

router.get("/", apiKey, listSuppliers);

// admin creation & deletion (router may be mounted under /admin/suppliers)
router.post("/", apiKey, createSupplier);
router.delete("/:id", apiKey, deleteSupplier);

module.exports = router;

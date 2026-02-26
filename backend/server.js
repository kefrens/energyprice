const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = "mysecretkey";

function apiKeyMiddleware(req, res, next) {
    const apiKey = req.get("x-api-key");
  
    if (!apiKey) {
      return res.status(401).json({ error: "Missing API key" });
    }
  
    if (apiKey !== API_KEY) {
      return res.status(403).json({ error: "Invalid API key" });
    }
  
    next();
  }

// Middleware API key
//app.use((req, res, next) => {
//  if (req.headers["x-api-key"] !== API_KEY) {
//    return res.status(401).json({ error: "Unauthorized" });
//  }
//  next();
//});

// Ping endpoint - no authentication - public endpoint
//app.get("/ping", (req, res) => {
//    res.send("pong");
//  });

app.get("/ping", (req, res) => {
    console.log("PING RECEIVED");
    res.send("pong");
  });

// Suppliers endpoint - requires API key authentication
app.get("/suppliers", apiKeyMiddleware, async (req, res) => {
//app.get("/suppliers", (req, res) => {
    res.json([{ test: "ok" }]);
  });

// Get all suppliers
//app.get("/suppliers", async (req, res) => {
//  try {
//    const suppliers = await prisma.supplier.findMany();
//    res.json(suppliers);
//  } catch (error) {
//    console.error(error);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});

// Get offers by supplier
app.get("/offers/:supplierId", async (req, res) => {
  const offers = await prisma.offer.findMany({
    where: { supplierId: parseInt(req.params.supplierId) },
  });
  res.json(offers);
});

// Get current price for an offer
app.get("/prices/current/:offerId", async (req, res) => {
  const today = new Date();

  try {
    const price = await prisma.price.findFirst({
      where: {
        offerId: parseInt(req.params.offerId, 10),
        validFrom: { lte: today },
        OR: [{ validTo: null }, { validTo: { gte: today } }],
      },
    });

    res.json(price);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/admin/prices/:offerId", apiKeyMiddleware, async (req, res) => {
    try {
      const offerId = parseInt(req.params.offerId, 10);
      const { priceKwh, subscriptionPrice } = req.body;
  
      const now = new Date();
  
      const result = await prisma.$transaction(async (tx) => {
        
        // 1️⃣ Trouver le prix actif
        const activePrice = await tx.price.findFirst({
          where: {
            offerId,
            validTo: null,
          },
        });
  
        // 2️⃣ S’il existe, on le clôture
        if (activePrice) {
          await tx.price.update({
            where: { id: activePrice.id },
            data: {
              validTo: now,
            },
          });
        }
  
        // 3️⃣ Créer le nouveau prix
        const newPrice = await tx.price.create({
          data: {
            offerId,
            priceKwh,
            subscriptionPrice,
            validFrom: now,
            validTo: null,
          },
        });
  
        return newPrice;
      });
  
      res.json(result);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/prices/history/:offerId", apiKeyMiddleware, async (req, res) => {
    try {
      const offerId = parseInt(req.params.offerId, 10);
  
      const prices = await prisma.price.findMany({
        where: { offerId },
        orderBy: { validFrom: "asc" },
      });
  
      res.json(prices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/prices/date/:offerId", apiKeyMiddleware, async (req, res) => {
    try {
      const offerId = parseInt(req.params.offerId, 10);
      const { date } = req.query;
  
      if (!date) {
        return res.status(400).json({ error: "Missing date query parameter (YYYY-MM-DD)" });
      }
      
      const targetDate = new Date(`${date}T12:00:00Z`);
      
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
  
      const price = await prisma.price.findFirst({
        where: {
          offerId,
          validFrom: { lte: targetDate },
          OR: [
            { validTo: null },
            { validTo: { gte: targetDate } }
          ]
        }
      });
  
      if (!price) {
        return res.status(404).json({ error: "No price found for this date" });
      }
  
      res.json(price);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

app.listen(3000, "127.0.0.1", () => {
    console.log("Server running on http://127.0.0.1:3000");
  });
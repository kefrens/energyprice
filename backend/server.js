require('dotenv').config();
const express = require("express");
const cors = require("cors");

// routers
const suppliersRouter = require("./routes/suppliers");
const offersRouter = require("./routes/offers");
const pricesRouter = require("./routes/prices");
const tariffRouter = require("./routes/tariffTypes");

const app = express();

// ensure database columns match current Prisma schema
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function ensureSchema() {
  try {
    const cols = await prisma.$queryRaw`PRAGMA table_info("Price")`;
    if (!cols.some((c) => c.name === "subscriptionPrice")) {
      console.log("adding missing subscriptionPrice column to Price table");
      await prisma.$executeRaw`ALTER TABLE "Price" ADD COLUMN "subscriptionPrice" REAL NOT NULL DEFAULT 0`;
    }
  } catch (e) {
    console.error("schema check failed", e);
  }
}
ensureSchema();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// quick health check
app.get("/ping", (req, res) => {
  console.log("PING RECEIVED");
  res.send("pong");
});

// mount modular routers
app.use("/suppliers", suppliersRouter);
app.use("/offers", offersRouter);
app.use("/prices", pricesRouter);
app.use("/tariff-types", tariffRouter);

// also expose same routers under /admin prefix for admin-only client
app.use("/admin/suppliers", suppliersRouter);
app.use("/admin/offers", offersRouter);
app.use("/admin/prices", pricesRouter);
app.use("/admin/tariff-types", tariffRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
console.log(process.env.DATABASE_URL);
module.exports = app;
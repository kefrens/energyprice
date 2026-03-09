require('dotenv').config();
const express = require("express");
const cors = require("cors");

// routers
const suppliersRouter = require("./routes/suppliers");
const offersRouter = require("./routes/offers");
const pricesRouter = require("./routes/prices");
const tariffRouter = require("./routes/tariffTypes");

const app = express();

// prisma client for database access
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// schema migrations are handled by Prisma; no runtime adjustments needed


app.use(cors());
app.use(express.json());

// simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

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

// JSON parse error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

// catch-all 404 -> JSON
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
console.log(process.env.DATABASE_URL);
module.exports = app;
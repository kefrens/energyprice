const express = require("express");
const cors = require("cors");

// routers
const suppliersRouter = require("./routes/suppliers");
const offersRouter = require("./routes/offers");
const pricesRouter = require("./routes/prices");
const tariffRouter = require("./routes/tariffTypes");

const app = express();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});

module.exports = app;
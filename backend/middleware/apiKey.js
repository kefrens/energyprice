// middleware/apiKey.js
// simple API key checker; configurable via environment variable

const API_KEY = process.env.API_KEY || "mysecretkey";

module.exports = function apiKeyMiddleware(req, res, next) {
  const apiKey = req.get("x-api-key");
  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
};

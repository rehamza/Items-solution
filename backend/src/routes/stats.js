const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../data/items.json");

let cachedStats = null; // now we cache stats but we can use redis or similar for better performance
let lastModified = 0;

async function getFileModifiedTime(filePath) {
  const stats = await fs.stat(filePath);
  return stats.mtimeMs;
}

async function calculateStats() {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const items = JSON.parse(raw);

  return {
    total: items.length,
    averagePrice:
      items.length > 0
        ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
        : 0,
  };
}

// GET /api/stats
router.get("/", async (req, res, next) => {
  try {
    const modified = await getFileModifiedTime(DATA_PATH);
    if (!cachedStats || modified !== lastModified) {
      lastModified = modified;
      cachedStats = await calculateStats();
    }
    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

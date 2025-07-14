const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DATA_PATH = path.join(__dirname, "../../../data/items.json");

async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

// GET /api/items
// GET /api/items
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const q = req.query.q?.toLowerCase() || "";
    const limit = Math.max(1, parseInt(req.query.limit)) || 50;
    const page = Math.max(1, parseInt(req.query.page)) || 1;

    let results = [...data].sort((a, b) => a.id - b.id);

    if (q) {
      results = results.filter((item) => item.name.toLowerCase().includes(q));
    }

    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    // ✅ Fix: return { items, total }
    res.json({
      items: paginated,
      total: results.length,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    const item = req.body;
    if (!item.name || !item.category || typeof item.price !== "number") {
      const err = new Error("Invalid item payload");
      err.status = 400;
      throw err;
    }
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

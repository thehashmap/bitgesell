const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Utility to read data (now async and non-blocking)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

// Utility to write data (async and non-blocking)
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/items
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q } = req.query;
    let results = data;

    if (q) {
      // Simple substring search (sub‑optimal)
      results = results.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
    }

    res.json(results);
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
    // Validate payload
    const { name, category, price } = req.body;

    // Check required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      const err = new Error("Name is required and must be a non-empty string");
      err.status = 400;
      throw err;
    }

    if (
      !category ||
      typeof category !== "string" ||
      category.trim().length === 0
    ) {
      const err = new Error(
        "Category is required and must be a non-empty string"
      );
      err.status = 400;
      throw err;
    }

    if (
      price === undefined ||
      price === null ||
      typeof price !== "number" ||
      price < 0
    ) {
      const err = new Error(
        "Price is required and must be a non-negative number"
      );
      err.status = 400;
      throw err;
    }

    // Validate field lengths
    if (name.trim().length > 100) {
      const err = new Error("Name must not exceed 100 characters");
      err.status = 400;
      throw err;
    }

    if (category.trim().length > 50) {
      const err = new Error("Category must not exceed 50 characters");
      err.status = 400;
      throw err;
    }

    // Validate price range (reasonable limits)
    if (price > 1000000) {
      const err = new Error("Price must not exceed $1,000,000");
      err.status = 400;
      throw err;
    }

    // Create sanitized item object
    const item = {
      name: name.trim(),
      category: category.trim(),
      price: Math.round(price * 100) / 100, // Round to 2 decimal places
    };

    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

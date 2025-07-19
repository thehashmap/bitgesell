const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Cache for stats with file watcher
let statsCache = null;
let cacheTimestamp = null;

// Watch for file changes to invalidate cache
fs.watch(path.dirname(DATA_PATH), (eventType, filename) => {
  if (filename === "items.json") {
    statsCache = null;
    cacheTimestamp = null;
    console.log("Stats cache invalidated due to file change");
  }
});

async function calculateStats() {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const items = JSON.parse(raw);

    return {
      total: items.length,
      averagePrice:
        items.length > 0
          ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length
          : 0,
      categories: [...new Set(items.map((item) => item.category))].length,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
}

// GET /api/stats
router.get("/", async (req, res, next) => {
  try {
    // Check if cache is valid (cache for 5 minutes or until file changes)
    const now = Date.now();
    const cacheValidDuration = 5 * 60 * 1000; // 5 minutes

    if (
      statsCache &&
      cacheTimestamp &&
      now - cacheTimestamp < cacheValidDuration
    ) {
      return res.json({ ...statsCache, cached: true });
    }

    // Calculate fresh stats
    const stats = await calculateStats();

    // Update cache
    statsCache = stats;
    cacheTimestamp = now;

    res.json({ ...stats, cached: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

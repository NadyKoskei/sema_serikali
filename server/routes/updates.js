// routes/updates.js
// -----------------------------------------------------------------------
// All endpoints here just READ from MongoDB. They never call Gemma
// directly - that already happened once, ahead of time, in seed/seed.js.
// This is what makes the feed feel instant to the user.
// -----------------------------------------------------------------------

const express = require("express");
const router = express.Router();
const CivicUpdate = require("../models/CivicUpdate");

// GET /api/updates
// GET /api/updates?category=Health
// GET /api/updates?source=Ministry%20of%20Health
// Returns the list of updates for the feed / "All Updates" page, newest first.
// Supports optional filtering by category and/or source via query params -
// this powers both the interest filter chips and the "Updates" page sidebar.
router.get("/", async (req, res) => {
  try {
    const { category, source } = req.query;

    // Build a MongoDB filter object only from the params that were actually
    // provided, so "no filters" just returns everything.
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (source && source !== "All") filter.source = source;

    const updates = await CivicUpdate.find(filter).sort({ publishedAt: -1 });
    res.json(updates);
  } catch (err) {
    console.error("[routes/updates] GET / failed:", err.message);
    res.status(500).json({ error: "Could not load updates." });
  }
});

// GET /api/updates/:id
// Returns a single update in full detail - used by the "Understand this
// update" page.
router.get("/:id", async (req, res) => {
  try {
    const update = await CivicUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: "Update not found." });
    }
    res.json(update);
  } catch (err) {
    console.error("[routes/updates] GET /:id failed:", err.message);
    res.status(500).json({ error: "Could not load this update." });
  }
});

module.exports = router;

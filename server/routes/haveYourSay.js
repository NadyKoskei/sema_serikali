// routes/haveYourSay.js
// -----------------------------------------------------------------------
// Powers the "Have Your Say" feature. The citizen writes their own rough
// opinion; Gemma restructures it (but never invents a new opinion for
// them - see the prompt in services/gemmaService.js).
// -----------------------------------------------------------------------

const express = require("express");
const router = express.Router();
const { structureOpinion } = require("../services/gemmaService");

// POST /api/have-your-say
// Body: { "opinion": "...citizen's own words..." }
// Returns { "structuredResponse": "...clean, well organised version..." }
router.post("/", async (req, res) => {
  try {
    const { opinion } = req.body;

    if (!opinion || !opinion.trim()) {
      return res.status(400).json({ error: "Please write your opinion first." });
    }

    const result = await structureOpinion(opinion);
    res.json(result);
  } catch (err) {
    console.error("[routes/haveYourSay] failed:", err.message);
    res.status(500).json({
      error:
        "Sema could not process that right now. Make sure Ollama and Gemma 4 are running (see README.md).",
    });
  }
});

module.exports = router;

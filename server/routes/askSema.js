// routes/askSema.js
// -----------------------------------------------------------------------
// Powers the "Ask Sema" feature. Unlike routes/updates.js, this DOES call
// Gemma live, because the whole point is the user typing/pasting their
// own text in the moment and getting an explanation back.
// -----------------------------------------------------------------------

const express = require("express");
const router = express.Router();
const { explainDocument } = require("../services/gemmaService");

// POST /api/ask-sema
// Body: { "text": "...pasted notice or question..." }
// Returns Gemma's plain-language explanation of that text.
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please provide some text to explain." });
    }

    const explanation = await explainDocument(text);
    res.json(explanation);
  } catch (err) {
    console.error("[routes/askSema] failed:", err.message);
    res.status(500).json({
      error:
        "Sema could not process that right now. Make sure Ollama and Gemma 4 are running (see README.md).",
    });
  }
});

module.exports = router;

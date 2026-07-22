// routes/askSema.js
// -----------------------------------------------------------------------
// Powers the "Ask Sema" feature. Unlike routes/updates.js, this DOES call
// Gemma live, because the whole point is the user typing/pasting their
// own text in the moment and getting an explanation back.
// -----------------------------------------------------------------------

const express = require("express");
const router = express.Router();
const { explainDocument, explainDocumentFromImage } = require("../services/gemmaService");

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

// POST /api/ask-sema
// Body: { "text": "..." } OR { "imageBase64": "...", "mimeType": "image/png" }
// Returns Gemma's plain-language explanation of that text or image.
router.post("/", async (req, res) => {
  try {
    const { text, imageBase64, mimeType } = req.body;

    let explanation;

    if (imageBase64 && mimeType) {
      if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
        return res.status(400).json({ error: "Unsupported image type. Use JPG or PNG." });
      }
      if (imageBase64.length > 12_000_000) {
        return res.status(400).json({ error: "Image is too large. Try a smaller file or paste the text." });
      }
      explanation = await explainDocumentFromImage(imageBase64, mimeType);
    } else if (text && text.trim()) {
      explanation = await explainDocument(text);
    } else {
      return res.status(400).json({ error: "Please provide text or upload a document image." });
    }

    res.json(explanation);
  } catch (err) {
    console.error("[routes/askSema] failed:", err.message);
    res.status(500).json({
      error:
        "Sema could not process that right now. Check GOOGLE_API_KEY in server/.env and your API quota (see README.md).",
    });
  }
});

module.exports = router;

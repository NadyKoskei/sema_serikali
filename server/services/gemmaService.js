// services/gemmaService.js
// -----------------------------------------------------------------------
// This is the ONLY file that talks to Gemma. Every other part of the app
// asks this file to do AI work.
//
// UPDATED: instead of running Gemma 4 locally through Ollama, this now
// calls Google's hosted Gemma 4 model through the Gemini API (the same
// API family at ai.google.dev / generativelanguage.googleapis.com).
// This avoids needing a powerful laptop to run the model locally - you
// just need a free API key from Google AI Studio. See README.md for how
// to get one.
//
// We use "gemma-4-26b-a4b-it" by default - the lower-latency Gemma 4
// variant, which is a good fit for a live hackathon demo. You can switch
// to "gemma-4-31b-it" (larger, slightly slower, slightly stronger) by
// changing GEMMA_MODEL in server/.env.
// -----------------------------------------------------------------------

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
// Multimodal reads (photos, scanned PDF pages) use a vision-capable Gemini model.
const VISION_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const EXPLAIN_DOCUMENT_INSTRUCTION = `
You are explaining a government or public document to a Kenyan citizen who
may not be familiar with formal or legal language. Do not invent facts that
are not present in the text. If the text is unclear or incomplete, say so
plainly instead of guessing.

Return ONLY one JSON object with EXACTLY these keys (no markdown, no code fences, no reasoning text):
{
  "documentType": "short label for what kind of document this is",
  "summary": "one sentence plain-language summary",
  "whatIsHappening": "1-2 short sentences",
  "whoIsAffected": "who this affects",
  "whatCanYouDo": "concrete next step, or empty string if none",
  "deadline": "YYYY-MM-DD or null"
}`;

// Gemma 4 has a built-in "thinking" mode: before its real answer, it can
// generate an internal reasoning part marked "thought": true. If we don't
// account for that, we end up reading the reasoning instead of the actual
// answer. We do two things about it:
//   1. Ask for "MINIMAL" thinking, which Google's own team confirms is the
//      setting that actually suppresses thought tokens (unlike
//      includeThoughts: false, which is currently a known no-op for Gemma 4).
//   2. Defensively skip any part marked "thought": true when reading the
//      response, so we're not relying on step 1 alone.
const THINKING_CONFIG = { thinkingLevel: "MINIMAL" };

/**
 * Pulls the model's real answer text out of a Gemini API response,
 * skipping any internal "thought" parts.
 */
function extractAnswerText(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const answerParts = parts.filter((p) => !p.thought && typeof p.text === "string");
  return answerParts.map((p) => p.text).join("").trim();
}

function tryParseJsonObject(str) {
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_) {
    /* try next strategy */
  }
  return null;
}

/** Prefer ```json fenced blocks; Gemma often puts the final answer in the last fence. */
function extractJsonFromFence(text) {
  const fences = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  for (let i = fences.length - 1; i >= 0; i--) {
    const parsed = tryParseJsonObject(fences[i][1].trim());
    if (parsed) return parsed;
  }
  return null;
}

/** Scan for balanced { ... } substrings and parse each (avoids first-{ to last-} bugs). */
function extractBalancedJsonCandidates(text) {
  const candidates = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let j = i; j < text.length; j++) {
      const c = text[j];
      if (inString) {
        if (escape) escape = false;
        else if (c === "\\") escape = true;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') inString = true;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          const parsed = tryParseJsonObject(text.slice(i, j + 1));
          if (parsed) candidates.push(parsed);
          break;
        }
      }
    }
  }
  return candidates;
}

/**
 * Pulls a JSON object out of a text blob even if the model added stray
 * text, markdown fences, or chain-of-thought before/after the JSON.
 */
function extractJsonObject(text) {
  const trimmed = text.trim();

  let parsed = tryParseJsonObject(trimmed);
  if (parsed) return parsed;

  parsed = extractJsonFromFence(text);
  if (parsed) return parsed;

  const candidates = extractBalancedJsonCandidates(text);
  if (candidates.length > 0) {
    return candidates[candidates.length - 1];
  }

  const preview = trimmed.length > 800 ? `${trimmed.slice(0, 800)}…` : trimmed;
  throw new Error(`Gemma did not return valid JSON. Raw reply was: ${preview}`);
}

/**
 * Low level helper: sends a prompt to Gemma 4 via the Gemini API and
 * returns the parsed JSON object it replies with.
 *
 * We set generationConfig.responseMimeType to "application/json" which
 * tells Gemma to constrain its output to valid JSON - the same trick we
 * used with Ollama's "format: json" option, just Google's version of it.
 *
 * @param {string} systemInstruction - tells Gemma HOW to behave
 * @param {string} userContent - the actual article/document/opinion text
 * @returns {Promise<object>} parsed JSON from Gemma
 */
async function askGemmaForJSON(systemInstruction, userContent) {
  if (!GOOGLE_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY is missing. Add it to server/.env - see README.md 'Getting a Gemma 4 API key'."
    );
  }

  const url = `${API_BASE}/${GEMMA_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // Gemma 4 supports a native system role - we use it here instead of
      // just prepending instructions to the prompt.
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userContent }],
        },
      ],
      generationConfig: {
        temperature: 0.2, // low temperature = more consistent, factual output
        responseMimeType: "application/json", // forces valid JSON output
        thinkingConfig: THINKING_CONFIG, // keeps Gemma's reasoning out of the answer
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemma API request failed (${response.status}): ${errText}. ` +
        `Check that GOOGLE_API_KEY in server/.env is correct and has quota - see README.md.`
    );
  }

  const data = await response.json();
  const rawText = extractAnswerText(data);

  if (!rawText) {
    throw new Error(`Gemma returned no usable content. Raw response: ${JSON.stringify(data)}`);
  }

  return extractJsonObject(rawText);
}

/**
 * JSON helper when the user message includes an image (or scanned page).
 */
async function askGemmaForJSONWithParts(systemInstruction, userParts, model) {
  if (!GOOGLE_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY is missing. Add it to server/.env - see README.md 'Getting a Gemma 4 API key'."
    );
  }

  const url = `${API_BASE}/${model}:generateContent?key=${GOOGLE_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: userParts,
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemma API request failed (${response.status}): ${errText}. ` +
        `Check that GOOGLE_API_KEY in server/.env is correct and has quota - see README.md.`
    );
  }

  const data = await response.json();
  const rawText = extractAnswerText(data);

  if (!rawText) {
    throw new Error(`Gemma returned no usable content. Raw response: ${JSON.stringify(data)}`);
  }

  return extractJsonObject(rawText);
}

/**
 * Same idea as askGemmaForJSON, but for the one place we want plain text
 * back instead of JSON (structuring a citizen's opinion reads more
 * naturally as free text than as a JSON field).
 */
async function askGemmaForText(systemInstruction, userContent) {
  if (!GOOGLE_API_KEY) {
    throw new Error(
      "GOOGLE_API_KEY is missing. Add it to server/.env - see README.md 'Getting a Gemma 4 API key'."
    );
  }

  const url = `${API_BASE}/${GEMMA_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      generationConfig: {
        temperature: 0.4,
        thinkingConfig: THINKING_CONFIG, // keeps Gemma's reasoning out of the answer
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Gemma API request failed (${response.status}): ${errText}. ` +
        `Check that GOOGLE_API_KEY in server/.env is correct and has quota - see README.md.`
    );
  }

  const data = await response.json();
  const rawText = extractAnswerText(data);

  if (!rawText) {
    throw new Error(`Gemma returned no usable content. Raw response: ${JSON.stringify(data)}`);
  }

  return rawText;
}

/**
 * Takes one raw civic article (title + content + source) and asks Gemma
 * to turn it into the structured, simplified fields our CivicUpdate
 * model needs. Used by seed/seed.js when building the feed.
 */
async function processArticleWithGemma(article) {
  const systemInstruction = `
You are processing civic information for Kenyan citizens.
Read the official announcement below and respond in simple, plain language.
Do not invent facts that are not present in the text.

Return ONLY one JSON object with EXACTLY these keys (no markdown, no code fences, no reasoning text):
{
  "summary": "one sentence plain-language summary",
  "whatIsHappening": "1-2 short sentences explaining the announcement",
  "whoIsAffected": "who this affects, in plain language",
  "whyItMatters": "why an ordinary citizen should care",
  "actionRequired": true or false,
  "deadline": "YYYY-MM-DD or null if there is no deadline mentioned",
  "participationAvailable": true or false,
  "whatCanYouDo": "concrete next step for a citizen, or empty string if none",
  "category": "one of Healthcare, Transport, Education, Housing, Jobs, Environment, General",
  "severity": "one of action_required, may_affect_you, for_your_info"
}`;

  const userContent = `Title: ${article.title}\nSource: ${article.source}\n\n${article.content}`;

  return askGemmaForJSON(systemInstruction, userContent);
}

/**
 * Powers the "Ask Sema" feature: a citizen pastes in text (from an
 * uploaded document, a notice they photographed, etc.) and Gemma explains
 * it using the same what/who/why/action structure as the main feed.
 */
async function explainDocument(rawText) {
  return askGemmaForJSON(EXPLAIN_DOCUMENT_INSTRUCTION, rawText);
}

/**
 * Reads a photo or scanned page and explains it with the same JSON shape
 * as explainDocument (used when the user uploads JPG/PNG or a scanned PDF).
 */
async function explainDocumentFromImage(base64Data, mimeType) {
  const userParts = [
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    {
      text: "Read all visible text in this document image. Then explain it for the citizen using the required JSON format.",
    },
  ];

  return askGemmaForJSONWithParts(EXPLAIN_DOCUMENT_INSTRUCTION, userParts, VISION_MODEL);
}

/**
 * Powers "Have Your Say": takes a citizen's own rough opinion and asks
 * Gemma to structure it more clearly WITHOUT changing what they meant or
 * inventing new opinions. This is a rewriting/formatting task, not a
 * content-generation task.
 */
async function structureOpinion(rawOpinionText) {
  const systemInstruction = `
A Kenyan citizen has written a rough personal opinion about a public issue.
Rewrite it so it is clear, respectful, and well organised, suitable for
submitting through an official public participation channel. Keep their
actual opinion and meaning unchanged. Do not add new arguments, facts, or
positions that are not implied by what they wrote. Reply with ONLY the
rewritten response text - no labels, no JSON, no extra commentary.`;

  const structuredResponse = await askGemmaForText(systemInstruction, rawOpinionText);
  // We keep the return shape ( { structuredResponse } ) identical to the
  // old Ollama-based version, so routes/haveYourSay.js and the frontend
  // do not need any changes.
  return { structuredResponse };
}

module.exports = {
  processArticleWithGemma,
  explainDocument,
  explainDocumentFromImage,
  structureOpinion,
};
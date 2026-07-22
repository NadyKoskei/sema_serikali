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
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

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

/**
 * Pulls a JSON object out of a text blob even if the model added stray
 * text before/after it (e.g. a leftover "Here is the JSON:" preamble).
 * This is a safety net on top of THINKING_CONFIG / extractAnswerText.
 */
function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Gemma did not return any JSON. Raw reply was: ${text}`);
  }
  return JSON.parse(text.slice(start, end + 1));
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

Return JSON with EXACTLY these keys:
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
  const systemInstruction = `
You are explaining a government or public document to a Kenyan citizen who
may not be familiar with formal or legal language. Do not invent facts that
are not present in the text. If the text is unclear or incomplete, say so
plainly instead of guessing.

Return JSON with EXACTLY these keys:
{
  "documentType": "short label for what kind of document this is",
  "summary": "one sentence plain-language summary",
  "whatIsHappening": "1-2 short sentences",
  "whoIsAffected": "who this affects",
  "whatCanYouDo": "concrete next step, or empty string if none",
  "deadline": "YYYY-MM-DD or null"
}`;

  return askGemmaForJSON(systemInstruction, rawText);
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

module.exports = { processArticleWithGemma, explainDocument, structureOpinion };
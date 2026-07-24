// src/api.js
// -----------------------------------------------------------------------
// Every network call the frontend makes goes through this one file. That
// way, if the API's base URL or error handling ever needs to change, we
// only change it in one place instead of hunting through components.
// -----------------------------------------------------------------------

// In development, Vite can proxy /api to the local backend.
// In production, we use the deployed Render URL from VITE_API_URL.
const API_ROOT = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const BASE_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.error || `Request failed with status ${response.status}`,
    );
  }
  return response.json();
}

// Fetch the list of civic updates, optionally filtered by category/source.
export async function fetchUpdates({ category, source } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "All") params.set("category", category);
  if (source && source !== "All") params.set("source", source);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${BASE_URL}/updates${query}`);
  return handleResponse(res);
}

// Fetch a single civic update by its MongoDB _id.
export async function fetchUpdateById(id) {
  const res = await fetch(`${BASE_URL}/updates/${id}`);
  return handleResponse(res);
}

// Ask Sema to explain pasted text and/or an uploaded document image.
export async function askSema({ text, imageBase64, mimeType } = {}) {
  const body = {};
  if (imageBase64 && mimeType) {
    body.imageBase64 = imageBase64;
    body.mimeType = mimeType;
  }
  if (text && text.trim()) {
    body.text = text.trim();
  }

  const res = await fetch(`${BASE_URL}/ask-sema`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

// Have Sema restructure a citizen's own opinion for submission.
export async function haveYourSay(opinion) {
  const res = await fetch(`${BASE_URL}/have-your-say`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opinion }),
  });
  return handleResponse(res);
}

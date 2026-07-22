// src/api.js
// -----------------------------------------------------------------------
// Every network call the frontend makes goes through this one file. That
// way, if the API's base URL or error handling ever needs to change, we
// only change it in one place instead of hunting through components.
// -----------------------------------------------------------------------

// Because of the Vite proxy set up in vite.config.js, we can just use
// relative paths like "/api/updates" and it works in development.
const BASE_URL = "/api";

async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
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

// Ask Sema to explain a piece of pasted text / document content.
export async function askSema(text) {
  const res = await fetch(`${BASE_URL}/ask-sema`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
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

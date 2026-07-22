// Utilities for reading text from uploaded PDFs and preparing images for Ask Sema.

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

export function validateAskSemaFile(file) {
  if (!file) return "No file selected.";
  if (!ACCEPTED_TYPES.has(file.type)) {
    return "Please upload a PDF, JPG, or PNG file.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File is too large (max 8 MB). Try a smaller scan or paste the text below.";
  }
  return null;
}

export function isImageFile(file) {
  return file.type.startsWith("image/");
}

export function isPdfFile(file) {
  return file.type === "application/pdf";
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/** Base64 payload only (no data:... prefix) for the Gemini API. */
export async function readFileAsBase64(file) {
  const dataUrl = await readFileAsDataUrl(file);
  const comma = dataUrl.indexOf(",");
  if (comma === -1) throw new Error("Could not read that file.");
  return dataUrl.slice(comma + 1);
}

export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const parts = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    if (pageText.trim()) parts.push(pageText.trim());
  }

  return parts.join("\n\n").trim();
}

/** Renders a PDF page to PNG base64 when there is no selectable text (scanned PDF). */
export async function renderPdfPageAsPngBase64(file, pageNumber = 1) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(Math.min(pageNumber, pdf.numPages));
  const viewport = page.getViewport({ scale: 2 });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;

  const dataUrl = canvas.toDataURL("image/png");
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

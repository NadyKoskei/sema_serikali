// src/components/AskSemaPanel.jsx
// -----------------------------------------------------------------------
// The "Ask Sema" feature: paste text or upload PDF/JPG/PNG. PDFs with
// selectable text are loaded into the box; photos and scanned PDFs are
// sent to the backend vision model for explanation.
// -----------------------------------------------------------------------

import { useRef, useState } from "react";
import { askSema } from "../api";
import {
  extractTextFromPdf,
  isImageFile,
  isPdfFile,
  readFileAsBase64,
  renderPdfPageAsPngBase64,
  validateAskSemaFile,
} from "../utils/fileDocument";

const MIN_PDF_TEXT_CHARS = 40;

export default function AskSemaPanel() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [result, setResult] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const fileInputRef = useRef(null);

  async function runAsk(payload) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const explanation = await askSema(payload);
      setResult(explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk() {
    if (!text.trim()) {
      setError("Paste some text, upload a file, or type a question first.");
      return;
    }
    await runAsk({ text });
  }

  async function processUploadedFile(file) {
    const validationError = validateAskSemaFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploadName(file.name);
    setHint("");
    setError("");
    setResult(null);

    try {
      if (isImageFile(file)) {
        setLoading(true);
        const imageBase64 = await readFileAsBase64(file);
        setHint(`Explaining image: ${file.name}`);
        const explanation = await askSema({ imageBase64, mimeType: file.type });
        setResult(explanation);
        setText(`(Explained from uploaded image: ${file.name})`);
        setLoading(false);
        return;
      }

      if (isPdfFile(file)) {
        setLoading(true);
        let extracted = "";
        try {
          extracted = await extractTextFromPdf(file);
        } catch {
          extracted = "";
        }

        if (extracted.length >= MIN_PDF_TEXT_CHARS) {
          setText(extracted);
          setHint(`Loaded text from ${file.name}. Click Ask Sema to explain, or edit the text first.`);
          setLoading(false);
          return;
        }

        setHint(`This PDF looks scanned — reading page 1 with vision…`);
        const imageBase64 = await renderPdfPageAsPngBase64(file, 1);
        const explanation = await askSema({ imageBase64, mimeType: "image/png" });
        setResult(explanation);
        setText(`(Explained from scanned PDF: ${file.name}, page 1)`);
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.message || "Could not read that file.");
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
    e.target.value = "";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  }

  return (
    <div id="ask-sema" className="panel ask-sema">
      <h2>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2L12 2z" />
        </svg>
        Ask Sema
      </h2>
      <p className="panel-desc">
        Paste a government notice, upload a PDF or photo, or type a question — Sema will explain it in
        simple language.
      </p>

      <label
        className="upload-box"
        htmlFor="sema-file-input"
        style={{ cursor: loading ? "wait" : "pointer", display: "block" }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          id="sema-file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={loading}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
          <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
        </svg>
        <p>
          {loading && uploadName
            ? `Working on ${uploadName}…`
            : "Drag & drop a file here or click to upload (PDF, JPG, PNG)"}
        </p>
      </label>

      {hint && !error && (
        <p style={{ color: "#c8e6c9", fontSize: 12.5, marginTop: 8 }}>{hint}</p>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the notice text here, or ask a question..."
        disabled={loading}
      />

      <button className="panel-btn primary-red" style={{ marginTop: 12 }} onClick={handleAsk} disabled={loading}>
        {loading ? "Asking Sema..." : "Ask Sema"}
      </button>

      {error && <p style={{ color: "#ffb3b3", fontSize: 12.5, marginTop: 10 }}>{error}</p>}

      {result && (
        <div className="panel-result">
          {result.summary && (
            <>
              <strong>Summary:</strong> {result.summary}
              <br />
              <br />
            </>
          )}
          <strong>What is happening:</strong> {result.whatIsHappening}
          {result.whoIsAffected && (
            <>
              <br />
              <br />
              <strong>Who is affected:</strong> {result.whoIsAffected}
            </>
          )}
          {result.whatCanYouDo && (
            <>
              <br />
              <br />
              <strong>What can you do:</strong> {result.whatCanYouDo}
            </>
          )}
          {result.deadline && (
            <>
              <br />
              <br />
              <strong>Deadline:</strong> {result.deadline}
            </>
          )}
        </div>
      )}
    </div>
  );
}

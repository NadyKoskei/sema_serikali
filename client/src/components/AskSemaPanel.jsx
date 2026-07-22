// src/components/AskSemaPanel.jsx
// -----------------------------------------------------------------------
// The "Ask Sema" feature from the project plan (section 10). The user
// pastes text from a notice/document, we send it to our backend, which
// sends it to Gemma 4, and we show the plain-language explanation back.
//
// File upload (PDF/image) is shown in the UI as a visual affordance but,
// to keep the 24-hour build scope realistic, actually reading file
// content is out of scope for this first version - the paste box below
// is the fully working path. See the comment on handleFileChange().
// -----------------------------------------------------------------------

import { useState } from "react";
import { askSema } from "../api";

export default function AskSemaPanel() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleAsk() {
    if (!text.trim()) {
      setError("Paste some text or type a question first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const explanation = await askSema(text);
      setResult(explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Placeholder for file upload - reading PDF/image content client-side
  // (or with an OCR step) is a good "if we have extra time" extension.
  // For now we just let the user know it's not wired up yet, so the demo
  // never looks broken if someone clicks it.
  function handleFileChange(e) {
    if (e.target.files.length > 0) {
      setError("File upload isn't wired up yet in this build - paste the text below instead.");
    }
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
        Paste a government notice, or type a question, and Sema will explain it in
        simple language.
      </p>

      <label className="upload-box" htmlFor="sema-file-input" style={{ cursor: "pointer", display: "block" }}>
        <input
          id="sema-file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
          <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
        </svg>
        <p>Drag &amp; drop a file here or click to upload (PDF, JPG, PNG)</p>
      </label>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the notice text here, or ask a question..."
      />

      <button className="panel-btn primary-red" style={{ marginTop: 12 }} onClick={handleAsk} disabled={loading}>
        {loading ? "Asking Gemma..." : "Ask Sema"}
      </button>

      {error && <p style={{ color: "#ffb3b3", fontSize: 12.5, marginTop: 10 }}>{error}</p>}

      {result && (
        <div className="panel-result">
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

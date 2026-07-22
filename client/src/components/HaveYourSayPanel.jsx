// src/components/HaveYourSayPanel.jsx
// -----------------------------------------------------------------------
// The "Have Your Say" feature from the project plan (section 11). The
// citizen types their own rough opinion; Gemma restructures it into a
// clear, well-organised response WITHOUT changing what they meant. The
// user can then copy the result to submit it themselves through the
// relevant official channel.
// -----------------------------------------------------------------------

import { useState } from "react";
import { haveYourSay } from "../api";

export default function HaveYourSayPanel() {
  const [opinion, setOpinion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [structured, setStructured] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGetHelp() {
    if (!opinion.trim()) {
      setError("Write your opinion first, then ask for help structuring it.");
      return;
    }
    setLoading(true);
    setError("");
    setStructured("");

    try {
      const result = await haveYourSay(opinion);
      setStructured(result.structuredResponse || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const textToCopy = structured || opinion;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div id="have-your-say" className="panel have-your-say">
      <h2>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Have your say
      </h2>
      <p className="panel-desc">
        Share your views on a public issue, in your own words. Sema will help you
        express it clearly for submission.
      </p>

      <textarea
        value={opinion}
        onChange={(e) => setOpinion(e.target.value)}
        placeholder="e.g. I support this initiative, but I think the government should also consider..."
        maxLength={1000}
      />

      <div className="panel-btn-row">
        <button className="panel-btn primary-white" onClick={handleGetHelp} disabled={loading}>
          {loading ? "Structuring..." : "Get AI help"}
        </button>
        <button className="panel-btn ghost-white" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy response"}
        </button>
      </div>

      {error && <p style={{ color: "#ffe0b3", fontSize: 12.5, marginTop: 10 }}>{error}</p>}

      {structured && <div className="panel-result">{structured}</div>}
    </div>
  );
}

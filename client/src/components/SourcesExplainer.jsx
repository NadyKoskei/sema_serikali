// src/components/SourcesExplainer.jsx
// -----------------------------------------------------------------------
// Short trust-building section explaining, in plain language, where the
// feed's information comes from and that Gemma only simplifies it - it
// never replaces the original source. This is the section that took the
// place of listing the four source names in the footer.
// -----------------------------------------------------------------------

export default function SourcesExplainer() {
  return (
    <div className="sources-strip">
      <div className="container" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#046a38" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
          Every update on Sema Serikali is drawn from official Kenyan government
          sources - Parliament, the Kenya News Agency, and relevant ministries.
          Gemma only simplifies the language; it never replaces the original
          announcement, which stays one tap away on every update.
        </p>
      </div>
    </div>
  );
}

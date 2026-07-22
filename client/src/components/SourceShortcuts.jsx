// src/components/SourceShortcuts.jsx
// -----------------------------------------------------------------------
// Static row of the four trusted sources this project pulls from. Each
// one links to the "Updates" page pre-filtered to that source, using a
// query string the UpdatesPage component reads on load.
// -----------------------------------------------------------------------

import { Link } from "react-router-dom";

const SOURCES = [
  {
    name: "News Updates",
    sub: "Kenya News Agency",
    source: "Kenya News Agency",
    color: "red",
    icon: "\uD83D\uDCF0", // used only as a text fallback, real icon below
  },
  { name: "Parliament", sub: "Parliament of Kenya", source: "Parliament of Kenya", color: "black" },
  { name: "Health", sub: "Ministry of Health", source: "Ministry of Health", color: "green" },
  { name: "Education", sub: "Ministry of Education", source: "Ministry of Education", color: "red" },
];

// Tiny inline SVG icons so we don't need an icon-font dependency for a
// simple hackathon build.
function SourceIcon({ name }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };
  if (name === "News Updates") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>;
  if (name === "Parliament") return <svg {...common}><path d="M3 21h18M4 21V10l8-6 8 6v11M9 21v-6h6v6" /></svg>;
  if (name === "Health") return <svg {...common}><path d="M12 21s-7-4.35-9.5-8.5C.6 8.9 2.4 5 6 5c2 0 3.5 1.2 4 2.5C10.5 6.2 12 5 14 5c3.6 0 5.4 3.9 3.5 7.5C19 16.65 12 21 12 21z" /></svg>;
  return <svg {...common}><path d="M22 10L12 4 2 10l10 6 10-6z" /><path d="M6 12v6c0 1 3 2 6 2s6-1 6-2v-6" /></svg>;
}

export default function SourceShortcuts() {
  return (
    <div className="sources-strip">
      <div className="container sources-grid">
        {SOURCES.map((s) => (
          <Link key={s.source} to={`/updates?source=${encodeURIComponent(s.source)}`} className="source-chip">
            <span className={`icon-badge ${s.color}`}>
              <SourceIcon name={s.name} />
            </span>
            <span>
              <p className="source-title">{s.name}</p>
              <p className="source-sub">{s.sub}</p>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

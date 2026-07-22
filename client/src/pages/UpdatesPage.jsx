// src/pages/UpdatesPage.jsx
// -----------------------------------------------------------------------
// "View all updates" destination. Shows every civic update Gemma has
// processed, with a sidebar to filter by category and by source. This is
// the page the homepage's "View all updates" link and each source
// shortcut card point to.
// -----------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchUpdates } from "../api";
import { getBadge, timeAgo, formatDate } from "../utils";

const CATEGORIES = ["All", "Healthcare", "Transport", "Education", "Housing", "Jobs", "Environment", "General"];
const SOURCES = [
  "All",
  "Parliament of Kenya",
  "Kenya News Agency",
  "Ministry of Health",
  "Ministry of Education",
];

export default function UpdatesPage() {
  // useSearchParams lets us read/write the ?source=... query string, so a
  // link like /updates?source=Ministry%20of%20Health arrives pre-filtered.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const activeSource = searchParams.get("source") || "All";

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchUpdates({ category: activeCategory, source: activeSource })
      .then(setUpdates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCategory, activeSource]);

  function setCategory(cat) {
    const next = new URLSearchParams(searchParams);
    cat === "All" ? next.delete("category") : next.set("category", cat);
    setSearchParams(next);
  }

  function setSource(src) {
    const next = new URLSearchParams(searchParams);
    src === "All" ? next.delete("source") : next.set("source", src);
    setSearchParams(next);
  }

  return (
    <div className="container">
      <div className="page-title-block">
        <h1>All updates</h1>
        <p>Every civic update, simplified by Gemma, from our four trusted sources.</p>
      </div>

      <div className="updates-page-layout">
        <aside className="filter-sidebar">
          <h4>Category</h4>
          <div className="filter-chip-list">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-chip-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <h4>Source</h4>
          <div className="filter-chip-list">
            {SOURCES.map((src) => (
              <button
                key={src}
                className={`filter-chip-btn ${activeSource === src ? "active" : ""}`}
                onClick={() => setSource(src)}
              >
                {src}
              </button>
            ))}
          </div>
        </aside>

        <div className="updates-list">
          {loading && <p className="state-msg">Loading updates...</p>}
          {error && <p className="state-msg">Could not load updates: {error}</p>}
          {!loading && !error && updates.length === 0 && (
            <p className="state-msg">No updates match these filters yet.</p>
          )}

          {updates.map((u) => {
            const badge = getBadge(u);
            return (
              <Link to={`/updates/${u._id}`} key={u._id} className="update-row">
                <span className={`icon-badge ${badge.color}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </span>
                <div className="row-content">
                  <span className={`badge ${badge.color}`}>{badge.label}</span>
                  <h3>{u.title}</h3>
                  <p>{u.summary}</p>
                  <span className="meta-row">
                    {u.source} &middot; {formatDate(u.publishedAt)} &middot; {timeAgo(u.publishedAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

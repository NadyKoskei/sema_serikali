// src/pages/UpdateDetailPage.jsx
// -----------------------------------------------------------------------
// The single most important screen in the app (see project plan, section
// 9: "The most important screen: Understand this"). Shows Gemma's
// structured explanation of one update: what/who/why/what-to-do, the
// deadline, and a link back to the original government source.
// -----------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUpdateById } from "../api";
import { formatDate } from "../utils";

export default function UpdateDetailPage() {
  const { id } = useParams(); // the update's MongoDB _id, from the URL /updates/:id
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchUpdateById(id)
      .then(setUpdate)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="state-msg">Loading...</p>;
  if (error) return <p className="state-msg">Could not load this update: {error}</p>;
  if (!update) return null;

  return (
    <div className="detail-page">
      <Link to="/updates" className="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Back to updates
      </Link>

      <div className="detail-card">
        <span className={`badge ${update.actionRequired ? "red" : "black"}`}>
          {update.category}
        </span>
        <h1>{update.title}</h1>

        <div className="detail-block">
          <div className="label-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            What is happening?
          </div>
          <p>{update.whatIsHappening}</p>
        </div>

        <div className="detail-block">
          <div className="label-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M11 3a4 4 0 110 8 4 4 0 010-8z" /></svg>
            Who is affected?
          </div>
          <p>{update.whoIsAffected}</p>
        </div>

        <div className="detail-block">
          <div className="label-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
            Why does it matter?
          </div>
          <p>{update.whyItMatters}</p>
        </div>

        {update.deadline && (
          <div className="detail-block">
            <div className="label-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              Important date
            </div>
            <p style={{ color: "var(--red)", fontWeight: 600 }}>{formatDate(update.deadline)}</p>
          </div>
        )}

        {update.whatCanYouDo && (
          <div className="detail-block">
            <div className="label-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              What can you do?
            </div>
            <p>{update.whatCanYouDo}</p>
          </div>
        )}

        <div className="detail-actions">
          <a href={update.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn">
            View original source
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
          </a>
          {update.participationAvailable && (
            <Link to="/#have-your-say" className="btn solid-red">
              Help me respond
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

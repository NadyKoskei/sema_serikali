// src/components/UpdateCard.jsx
// -----------------------------------------------------------------------
// One card in the "Latest Updates" grid on the homepage. Clicking it (or
// "Read more") takes the user to the full "Understand this update" page
// at /updates/:id, which is where UpdateDetailPage.jsx takes over.
// -----------------------------------------------------------------------

import { Link } from "react-router-dom";
import { getBadge, timeAgo, formatDate } from "../utils";

export default function UpdateCard({ update }) {
  const badge = getBadge(update);

  return (
    <Link to={`/updates/${update._id}`} className="update-card">
      <div className="badge-row">
        <span className={`badge ${badge.color}`}>{badge.label}</span>
        <span className="time-ago">{timeAgo(update.publishedAt)}</span>
      </div>

      <h3>{update.title}</h3>
      <p className="excerpt">{update.summary}</p>

      {update.actionRequired && update.deadline ? (
        <p className="deadline-text">Deadline: {formatDate(update.deadline)}</p>
      ) : (
        <p className="meta-row">{update.source}</p>
      )}

      <span className="read-more-link">
        Read more
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}

// src/pages/Home.jsx
// -----------------------------------------------------------------------
// The homepage. Fetches the most recent civic updates from our own
// backend (which already ran them through Gemma ahead of time, see
// server/seed/seed.js) and shows the first 4 as a preview grid, with a
// "View all updates" link to the full listing page.
// -----------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchUpdates } from "../api";
import Hero from "../components/Hero";
import SourceShortcuts from "../components/SourceShortcuts";
import SourcesExplainer from "../components/SourcesExplainer";
import UpdateCard from "../components/UpdateCard";
import AskSemaPanel from "../components/AskSemaPanel";
import HaveYourSayPanel from "../components/HaveYourSayPanel";
import Features from "../components/Features";

export default function Home() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUpdates()
      .then((data) => setUpdates(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <SourceShortcuts />
      <SourcesExplainer />

      <div className="container section">
        <div className="section-heading-row">
          <h2>Latest updates</h2>
          <Link to="/updates" className="view-all-link">
            View all updates
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        {loading && <p className="state-msg">Loading the latest civic updates...</p>}
        {error && (
          <p className="state-msg">
            Could not load updates: {error}. Make sure the backend server is running
            and you have run <code>npm run seed</code> in /server.
          </p>
        )}
        {!loading && !error && updates.length === 0 && (
          <p className="state-msg">
            No updates yet - run <code>npm run seed</code> in the /server folder to
            populate the feed.
          </p>
        )}

        <div className="updates-grid">
          {updates.slice(0, 4).map((u) => (
            <UpdateCard key={u._id} update={u} />
          ))}
        </div>
      </div>

      <div className="container">
        <div className="panels-grid">
          <AskSemaPanel />
          <HaveYourSayPanel />
        </div>
      </div>

      <Features />
    </>
  );
}

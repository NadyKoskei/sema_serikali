// src/components/Features.jsx
// -----------------------------------------------------------------------
// Static row of four short trust/value points shown near the bottom of
// the homepage. Purely presentational, no data fetching.
// -----------------------------------------------------------------------

const FEATURES = [
  {
    title: "Trusted sources",
    desc: "Information from verified government institutions.",
    path: "M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z",
  },
  {
    title: "Civic awareness",
    desc: "Understand issues that affect you, explained simply.",
    path: "M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M11 3a4 4 0 110 8 4 4 0 010-8z",
  },
  {
    title: "Citizen voice",
    desc: "Your opinion matters in nation building.",
    path: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  },
  {
    title: "Secure & private",
    desc: "Your data and privacy are protected.",
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
];

export default function Features() {
  return (
    <div className="container features-grid">
      {FEATURES.map((f) => (
        <div className="feature-item" key={f.title}>
          <span className="icon-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={f.path} />
            </svg>
          </span>
          <div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

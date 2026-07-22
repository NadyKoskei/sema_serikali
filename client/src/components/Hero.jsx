// src/components/Hero.jsx
// -----------------------------------------------------------------------
// The big introductory banner at the top of the homepage. Purely
// presentational - it does not fetch any data. The search input is a
// visual placeholder for the hackathon demo (wiring it up to actually
// filter /api/updates by keyword would be a quick follow-up if you have
// extra time after the core features work).
// -----------------------------------------------------------------------

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-flag-accent" aria-hidden="true"></div>
      <div className="hero-inner">
        <h1>
          Your voice.
          <br />
          Your <span className="accent-red">government</span>.
          <br />
          Your <span className="accent-green">future</span>.
        </h1>
        <p>
          Sema Serikali brings you trusted updates from government and
          public institutions, explained by Gemma in simple, clear
          language.
        </p>
        <form
          className="search-bar"
          onSubmit={(e) => e.preventDefault() /* demo only, see comment above */}
        >
          <input type="text" placeholder="Search updates, topics, or ask Sema..." />
          <button type="submit">Search</button>
        </form>
      </div>
    </section>
  );
}

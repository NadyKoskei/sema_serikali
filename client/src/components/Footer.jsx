// src/components/Footer.jsx
// -----------------------------------------------------------------------
// Simple footer shown on every page. Per the design revision, this does
// NOT list the individual source websites (that explanation now lives in
// the "Where this information comes from" section on the homepage
// instead) - it's just a lightweight sign-off.
// -----------------------------------------------------------------------

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>Sema Serikali &middot; Know. Understand. Participate.</span>
        <span>Built for a Gemma 4 hackathon &middot; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

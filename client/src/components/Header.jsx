// src/components/Header.jsx
// -----------------------------------------------------------------------
// Top navigation bar shown on every page. Uses react-router-dom's NavLink
// so the current page's link is automatically highlighted (the "active"
// class in index.css) without us tracking that state ourselves.
// -----------------------------------------------------------------------

import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo: a small Kenyan-flag-coloured square + the app name */}
        <div className="brand">
          <div className="brand-flag" aria-hidden="true"></div>
          <div className="brand-text">
            <p className="brand-name">
              SEMA <span>SERIKALI</span>
            </p>
            <p className="brand-tagline">Know. Understand. Participate.</p>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Home
          </NavLink>
          <NavLink to="/updates" className={({ isActive }) => (isActive ? "active" : "")}>
            Updates
          </NavLink>
          <a href="#ask-sema">Ask Sema</a>
          <a href="#have-your-say">Have Your Say</a>
        </nav>
      </div>
    </header>
  );
}

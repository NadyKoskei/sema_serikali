// src/main.jsx
// -----------------------------------------------------------------------
// Standard React + Vite bootstrap file. Mounts <App /> into the #root div
// declared in index.html, wrapped in a BrowserRouter so we can use
// multiple pages (Home, Updates, Update detail) with react-router-dom.
// -----------------------------------------------------------------------

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

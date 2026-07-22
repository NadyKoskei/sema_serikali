// src/App.jsx
// -----------------------------------------------------------------------
// Top-level component. Defines the app's three pages/routes and wraps
// them with the shared Header and Footer, which appear on every page.
// -----------------------------------------------------------------------

import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import UpdatesPage from "./pages/UpdatesPage";
import UpdateDetailPage from "./pages/UpdateDetailPage";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/updates" element={<UpdatesPage />} />
        <Route path="/updates/:id" element={<UpdateDetailPage />} />
      </Routes>
      <Footer />
    </>
  );
}

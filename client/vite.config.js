// vite.config.js
// -----------------------------------------------------------------------
// The "proxy" section below is what lets our React code call fetch("/api/...")
// without needing to know the backend's full URL. During development, Vite
// forwards any request starting with /api to our Express server on port
// 5000. This avoids CORS headaches and keeps the frontend code identical
// whether it runs in dev or (with a small tweak) in production.
// -----------------------------------------------------------------------

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});

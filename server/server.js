// server.js
// -----------------------------------------------------------------------
// Entry point of the backend. Run with:  npm start   (from /server)
// This file's job is just to wire everything together:
//   - load environment variables
//   - connect to MongoDB
//   - set up Express + middleware
//   - mount the three route files
//   - start listening for requests
// -----------------------------------------------------------------------

require("dotenv").config(); // loads variables from server/.env into process.env

const express = require("express");
const cors = require("cors");
const net = require("net");
const connectDB = require("./config/db");
const { isPortAvailable } = require("./utils/port");

const updatesRoutes = require("./routes/updates");
const askSemaRoutes = require("./routes/askSema");
const haveYourSayRoutes = require("./routes/haveYourSay");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // allows the React frontend (a different port) to call this API
app.use(express.json({ limit: "12mb" })); // pasted text + base64 document images for Ask Sema

// --- Routes ---
// Anything hitting /api/updates goes to routes/updates.js, and so on.
app.use("/api/updates", updatesRoutes);
app.use("/api/ask-sema", askSemaRoutes);
app.use("/api/have-your-say", haveYourSayRoutes);

// Simple health check - useful to confirm the server is up during the demo.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Sema Serikali API is running." });
});

// --- Start the server after MongoDB is connected ---
connectDB()
  .then(async () => {
    const available = await isPortAvailable(PORT);
    if (!available) {
      console.warn(
        `[server] Port ${PORT} is already in use. Assuming another instance is already running, so this one will stay idle.`
      );
      return;
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[server] Sema Serikali API listening on https://sema-serikali.onrender.com`);
    });
  })
  .catch((err) => {
    console.error("[server] Failed to start the server:", err);
    process.exit(1);
  });

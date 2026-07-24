// config/db.js
// -----------------------------------------------------------------------
// Small helper that connects our Express app to MongoDB using Mongoose.
// We keep this in its own file so server.js and seed.js can both reuse it
// without copy-pasting the connection code.
// -----------------------------------------------------------------------

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb+srv://cherotichnady_db_user:dkXqgXR6WuoicGu5@semaserikali.32vcagx.mongodb.net";

  try {
    // mongoose.connect returns a promise, so we await it.
    // If MongoDB is not running, this will throw and we catch it below.
    await mongoose.connect(uri);
    console.log(`[db] connected to MongoDB at ${uri}`);
  } catch (err) {
    console.error("[db] failed to connect to MongoDB:", err.message);
    console.error(
      "[db] make sure MongoDB is installed and running. See README.md 'Installing MongoDB'."
    );
    // Exit the process - there is no point running an API with no database.
    process.exit(1);
  }
}

module.exports = connectDB;

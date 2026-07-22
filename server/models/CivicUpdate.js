// models/CivicUpdate.js
// -----------------------------------------------------------------------
// This defines the shape of a single "civic update" as it is stored in
// MongoDB. A civic update is one government announcement/notice AFTER
// Gemma has read it and turned it into simple, structured information.
//
// We deliberately keep both the ORIGINAL info (title, content, source,
// sourceUrl) and the GEMMA-GENERATED info (summary, whatIsHappening, etc.)
// side by side. This matters for trust: the original source is never
// thrown away, only simplified alongside.
// -----------------------------------------------------------------------

const mongoose = require("mongoose");

const CivicUpdateSchema = new mongoose.Schema(
  {
    // ---- Original source information (never modified by Gemma) ----
    title: { type: String, required: true },
    content: { type: String, required: true }, // the raw/original text
    source: {
      type: String,
      required: true,
      enum: [
        "Kenya News Agency",
        "Parliament of Kenya",
        "Ministry of Health",
        "Ministry of Education",
      ],
    },
    sourceUrl: { type: String, required: true },
    publishedAt: { type: Date, required: true },

    // ---- Gemma-generated fields (the "understand this" content) ----
    summary: { type: String, default: "" },
    whatIsHappening: { type: String, default: "" },
    whoIsAffected: { type: String, default: "" },
    whyItMatters: { type: String, default: "" },
    actionRequired: { type: Boolean, default: false },
    deadline: { type: Date, default: null },
    participationAvailable: { type: Boolean, default: false },
    whatCanYouDo: { type: String, default: "" },

    // Category is used for the "what are you interested in" filter chips
    // on the frontend (Healthcare, Transport, Education, Housing, Jobs,
    // Environment) plus a generic "General" bucket.
    category: {
      type: String,
      enum: [
        "Healthcare",
        "Transport",
        "Education",
        "Housing",
        "Jobs",
        "Environment",
        "General",
      ],
      default: "General",
    },

    // Severity drives the red / amber / green badge on the feed card.
    // "action_required"  -> red   -> citizen must do something by a date
    // "may_affect_you"   -> amber -> relevant, no action needed
    // "for_your_info"    -> green -> general news, low urgency
    severity: {
      type: String,
      enum: ["action_required", "may_affect_you", "for_your_info"],
      default: "for_your_info",
    },
  },
  {
    // Adds createdAt / updatedAt automatically - handy for sorting the feed
    // by "most recently added to our database" if we ever need that.
    timestamps: true,
  }
);

module.exports = mongoose.model("CivicUpdate", CivicUpdateSchema);

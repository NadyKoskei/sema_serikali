// seed/seed.js
// -----------------------------------------------------------------------
// Run this once before your demo with:   npm run seed   (from /server)
//
// What it does, step by step (this is Stages 2-4 of the project plan):
//   1. Connect to MongoDB
//   2. Clear out any old civic updates so we don't get duplicates
//   3. Loop over the raw articles in seedData.js
//   4. Send each one to Gemma 4 (via services/gemmaService.js) to get the
//      simplified, structured version
//   5. Save the combined result into the CivicUpdate collection
//
// This is deliberately a separate script from the running server. In a
// production system it would be triggered by a scheduled job (cron) that
// re-runs whenever the source sites publish something new. For the
// hackathon demo, running it once ahead of time is enough - the frontend
// then just reads already-processed data from MongoDB, which is instant
// and does not depend on Gemma being fast enough for a live click.
// -----------------------------------------------------------------------

require("dotenv").config();
const connectDB = require("../config/db");
const CivicUpdate = require("../models/CivicUpdate");
const rawArticles = require("./seedData");
const { processArticleWithGemma } = require("../services/gemmaService");

async function run() {
  await connectDB();

  console.log(`[seed] clearing existing civic updates...`);
  await CivicUpdate.deleteMany({});

  console.log(`[seed] processing ${rawArticles.length} articles with Gemma 4...`);

  for (const article of rawArticles) {
    try {
      console.log(`[seed] -> "${article.title}"`);

      // Ask Gemma to read this one article and return the simplified,
      // structured fields (summary, whoIsAffected, category, etc.)
      const gemmaResult = await processArticleWithGemma(article);

      // Combine the ORIGINAL article fields with what GEMMA generated,
      // and save the result as one CivicUpdate document.
      await CivicUpdate.create({
        title: article.title,
        content: article.content,
        source: article.source,
        sourceUrl: article.sourceUrl,
        publishedAt: article.publishedAt,

        summary: gemmaResult.summary,
        whatIsHappening: gemmaResult.whatIsHappening,
        whoIsAffected: gemmaResult.whoIsAffected,
        whyItMatters: gemmaResult.whyItMatters,
        whatCanYouDo: gemmaResult.whatCanYouDo,
        actionRequired: Boolean(gemmaResult.actionRequired),
        deadline: gemmaResult.deadline ? new Date(gemmaResult.deadline) : null,
        participationAvailable: Boolean(gemmaResult.participationAvailable),
        category: gemmaResult.category || "General",
        severity: gemmaResult.severity || "for_your_info",
      });

      console.log(`[seed]    done.`);
    } catch (err) {
      // If Gemma fails on one article (bad JSON, Ollama not running, etc.)
      // we log it and keep going, so one bad article doesn't stop the demo.
      console.error(`[seed]    FAILED for "${article.title}":`, err.message);
    }
  }

  console.log("[seed] finished. Closing connection.");
  process.exit(0);
}

run();

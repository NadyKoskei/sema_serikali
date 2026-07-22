// seed/seed.js
// -----------------------------------------------------------------------
// Run this once before your demo with:   npm run seed   (from /server)
//
// What it does, step by step (this is Stages 2-4 of the project plan):
//   1. Connect to MongoDB
//   2. Process each article with Gemma; only replace the feed if at least
//      one article succeeds (so a failed run does not wipe the database)
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

  console.log(`[seed] processing ${rawArticles.length} articles with Gemma 4...`);

  const toInsert = [];

  for (const article of rawArticles) {
    try {
      console.log(`[seed] -> "${article.title}"`);

      const gemmaResult = await processArticleWithGemma(article);

      toInsert.push({
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
      console.error(`[seed]    FAILED for "${article.title}":`, err.message);
    }
  }

  if (toInsert.length === 0) {
    console.error(
      "[seed] no articles were saved — existing civic updates were left unchanged. Fix Gemma/API errors and run seed again."
    );
    process.exit(1);
  }

  console.log(`[seed] replacing feed with ${toInsert.length} civic update(s)...`);
  await CivicUpdate.deleteMany({});
  await CivicUpdate.insertMany(toInsert);

  console.log("[seed] finished. Closing connection.");
  process.exit(0);
}

run();

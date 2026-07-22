// seed/seedData.js
// -----------------------------------------------------------------------
// In a full production version, Stage One ("Data Collection") would be a
// scraper/crawler that fetches live pages from:
//   - Kenya News Agency   (kenyanews.go.ke)
//   - Parliament of Kenya (parliament.go.ke)
//   - Ministry of Health  (health.go.ke)
//   - Ministry of Education (education.go.ke)
//
// Reliably scraping four different government websites (each with its own
// HTML structure, and no guarantee they'll be reachable/stable during a
// live demo) is risky to build and test in a 24 hour hackathon window.
//
// So for the demo, this file plays the role of "Stage One output": a
// small set of realistic raw articles, in the exact shape a scraper would
// produce (title, content, source, sourceUrl, publishedAt). Everything
// downstream of this file - Gemma processing, the database, the API, the
// UI - is fully real and functional.
//
// To go from demo to production, you would replace this file with a
// scraper (e.g. using the "cheerio" npm package) that fills this same
// array from live pages, then call seed.js on a schedule (cron job).
// -----------------------------------------------------------------------

const rawArticles = [
  {
    title: "Public Participation on the County Governments (Amendment) Bill",
    source: "Parliament of Kenya",
    sourceUrl: "https://www.parliament.go.ke",
    publishedAt: new Date("2026-07-15"),
    content:
      "The National Assembly invites members of the public to submit written memoranda on the County Governments (Amendment) Bill, 2026. The Bill proposes changes to how county governments manage devolved functions, including revenue allocation and public participation frameworks. Interested persons and organisations may submit their views to the Clerk of the National Assembly on or before 30th July 2026. Submissions can be made in writing or through the parliamentary public participation portal.",
  },
  {
    title: "New Guidelines for Prevention of Seasonal Diseases",
    source: "Ministry of Health",
    sourceUrl: "https://www.health.go.ke",
    publishedAt: new Date("2026-07-17"),
    content:
      "The Ministry of Health has issued updated guidelines to help communities prevent common seasonal illnesses associated with the current rainy season, including cholera and malaria. County health facilities are directed to increase surveillance and ensure availability of treatment supplies. Members of the public are advised to boil drinking water, use treated mosquito nets, and seek early treatment for fever. The guidelines apply nationwide with immediate effect and do not require any public submission or action beyond following the health advice.",
  },
  {
    title: "Nakuru County Launches New Youth Empowerment Initiative",
    source: "Kenya News Agency",
    sourceUrl: "https://www.kenyanews.go.ke",
    publishedAt: new Date("2026-07-18"),
    content:
      "The Nakuru County Government has launched a new youth empowerment initiative aimed at creating employment opportunities and supporting young entrepreneurs. The programme will provide business grants, mentorship, and skills training to youth aged 18-35 in the county. Interested youth can register their interest at their local Huduma Centre. The county government said the programme is part of a wider effort to reduce youth unemployment in the region.",
  },
  {
    title: "New TVET Training Programmes Announced",
    source: "Ministry of Education",
    sourceUrl: "https://www.education.go.ke",
    publishedAt: new Date("2026-07-16"),
    content:
      "The Ministry of Education has announced new Technical and Vocational Education and Training (TVET) programmes designed to equip learners with in-demand skills in construction, ICT, and renewable energy. The programmes will be rolled out across public TVET institutions starting the next intake. Prospective students can apply through the Kenya Universities and Colleges Central Placement Service (KUCCPS) portal. Applications open 1st August 2026 and close 31st August 2026.",
  },
  {
    title: "Road Maintenance Notice - Nakuru County",
    source: "Kenya News Agency",
    sourceUrl: "https://www.kenyanews.go.ke",
    publishedAt: new Date("2026-07-14"),
    content:
      "The Kenya National Highways Authority has announced planned road maintenance works on key highways within Nakuru County starting 25th July 2026. Motorists should expect temporary diversions and delays during the works, which are expected to run for three weeks. Pedestrian and cyclist routes will be clearly marked. The authority has urged road users to plan their travel accordingly and follow signage put up at the affected sites.",
  },
  {
    title: "Proposed Changes to the County Transport Plan",
    source: "Parliament of Kenya",
    sourceUrl: "https://www.parliament.go.ke",
    publishedAt: new Date("2026-07-19"),
    content:
      "The relevant County Assembly Committee is seeking public views on proposed changes to the county transport plan, including new matatu routes and non-motorised transport infrastructure such as pedestrian walkways and cycling lanes. Residents, commuters, and business owners along the affected routes are encouraged to submit written or oral representations at the public participation forum. Submissions close on 24th July 2026.",
  },
  {
    title: "Malaria Prevention Guidelines Released",
    source: "Ministry of Health",
    sourceUrl: "https://www.health.go.ke",
    publishedAt: new Date("2026-07-13"),
    content:
      "The Ministry of Health has released updated guidelines to enhance malaria prevention and control ahead of the high-transmission season. County health departments are directed to distribute insecticide-treated nets to vulnerable households, particularly children under five and pregnant women. Members of the public in high-risk counties are encouraged to visit their nearest health facility for a free net if they have not already received one.",
  },
  {
    title: "Applications Open for 2026 TVET Scholarships",
    source: "Ministry of Education",
    sourceUrl: "https://www.education.go.ke",
    publishedAt: new Date("2026-07-12"),
    content:
      "The Ministry of Education has opened applications for TVET scholarships targeting needy and vulnerable students for the 2026 intake. The scholarship covers tuition and a stipend for selected students at public TVET institutions. Eligible applicants must have completed KCSE and demonstrate financial need. Applications are submitted online through the Higher Education Loans Board (HELB) portal and close 20th August 2026.",
  },
];

module.exports = rawArticles;

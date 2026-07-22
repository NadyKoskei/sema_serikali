// src/utils.js
// -----------------------------------------------------------------------
// Small formatting helpers shared by multiple components. Kept separate
// from the components themselves so the same logic (e.g. "how do we turn
// a category into a badge colour") only has to be written once.
// -----------------------------------------------------------------------

// Turns a raw update object into { label, color } for its badge.
// Action-required updates always show red regardless of category, because
// that is the most important thing for the citizen to notice first.
export function getBadge(update) {
  if (update.actionRequired) {
    return { label: "Action required", color: "red" };
  }
  const greenCategories = ["Healthcare", "Education", "Environment"];
  if (greenCategories.includes(update.category)) {
    return { label: update.category, color: "green" };
  }
  return { label: update.category || "News", color: "black" };
}

// Turns a date into a friendly "2 hours ago" / "3 days ago" style string.
export function timeAgo(dateInput) {
  const date = new Date(dateInput);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const units = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "day", secs: 86400 },
    { label: "hour", secs: 3600 },
    { label: "minute", secs: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.secs);
    if (value >= 1) {
      return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

// Formats a date as "30 Jul 2026" for deadlines and published dates.
export function formatDate(dateInput) {
  if (!dateInput) return "";
  return new Date(dateInput).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

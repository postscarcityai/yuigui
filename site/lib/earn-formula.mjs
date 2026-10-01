// The $U formula, v0, as shown on /earn#formula. The source of truth is the formula row in
// ledger/yui_ledger.sql (yui_ledger_formula); ledger/test checks that these numbers match it, so the
// page can never say one thing and the ledger do another. No cash value. Not a token yet.
export const FORMULA_VERSION = 0;
export const SOFT_CAP = 150;

export const USE_ROWS = [
  ["A message you send", "1", "It counts once the agent answers. The same message twice a day counts once."],
  ["A screen you answer", "2", "A tap, a pick, a form sent, a plan finished."],
  ["A job done for you", "5", "An agent finished something real, like a meal logged."],
  ["Your first visit of the day", "10", "Once a day."],
];

export const STREAK_ROWS = [
  ["3 days", "x1.1", "", "A streak is a day with at least one message or screen. One missed day a week is forgiven."],
  ["7 days", "x1.25", "+50", ""],
  ["30 days", "x1.5", "+300", ""],
];

export const JOIN_ROWS = [
  ["Joining", "100", "Once."],
  ["A founding user", "+400", "You joined before Yui leaves TestFlight."],
];

export const BUILD_ROWS = [
  ["Feedback you send", "10", "From the TestFlight button or the agent."],
  ["That feedback ships", "+500", "It became a real change."],
  ["A GitHub issue we accept", "200", "A maintainer marks it accepted or turns it into a card."],
  ["That issue ships", "+500", "The change it asked for is live."],
  ["A merged pull request, size S", "1,000", "The size is the card the pull request closes."],
  ["A merged pull request, size M", "3,000", ""],
  ["A merged pull request, size L", "10,000", ""],
  ["A merged pull request with no card", "1,000", "Reviewed like any other."],
];

// The same numbers as the formula row, for the check in ledger/test.
export const PARAMS = {
  message: 1, screen: 2, job_done: 5, first_visit: 10, soft_cap: SOFT_CAP, over_cap_rate: 0.1,
  streak: [{ days: 3, mult: 1.1, bonus: 0 }, { days: 7, mult: 1.25, bonus: 50 }, { days: 30, mult: 1.5, bonus: 300 }],
  joined: 100, founding: 400, feedback_sent: 10, feedback_shipped: 500, issue_accepted: 200, issue_shipped: 500,
  pr_merged: { S: 1000, M: 3000, L: 10000, none: 1000 },
};

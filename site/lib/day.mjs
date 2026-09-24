// "2026-09-24" -> "Sep 24, 2026". Noon, so the day never slips a time zone.
export const day = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

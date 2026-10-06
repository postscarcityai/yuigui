// A drawn phone (`sketch frame=phone`, YUI-267 direction B): one device that plays the
// before into the after and loops. The web twin of the app's SketchPhone.swift.
// Pure helpers, so the loop's state per side is testable without a browser.

// How long each side holds, in ms (the app holds 2.6 s and springs across).
export const PHONE_HOLD_MS = 2800;

// Which side is on show after `tick` holds. 0 is the before, 1 the after.
// No `after` is one side, always 0. Reduced motion holds the after.
export function phoneSide(tick, hasAfter, reduced) {
  if (!hasAfter) return 0;
  if (reduced) return 1;
  return Math.abs(tick) % 2;
}

// The badge for the side on show: red BEFORE, green AFTER. A sketch with no
// `after` has none.
export function phoneBadge(side, hasAfter, beforeLabel, afterLabel) {
  if (!hasAfter) return null;
  return side === 1
    ? { text: afterLabel, tone: "good", icon: "check" }
    : { text: beforeLabel, tone: "bad", icon: "x" };
}

// Numbers for the notes of one side, in reading order, starting at 1 on each
// side: the number on the row and the line in the key under the phone.
export function phoneNotes(rows) {
  const out = [];
  rows.forEach((r, i) => {
    if (r.note) out.push({ row: i, n: out.length + 1, note: r.note, x: !!r.x });
  });
  return out;
}

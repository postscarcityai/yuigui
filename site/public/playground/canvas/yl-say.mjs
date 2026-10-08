// YUI-332: talk while touching a mark. You say something while a mark is touched and the agent gets both. The page captures the words
// (Web Speech where the browser has it, a typed field where not), and builds the one line the app would send:
//   [yui] <answer> yl say "make this one red" touched=<mark label>      touched=@3.4s when no mark is touched (the moment on the clock)
// The canned agent answers (yl-replies.json "say:<markId>") are a reply or a list of them; each names the words that call it up and is the
// same small patch a hold uses (yl-patch.mjs), so the redraw, scrub and Reset behave as they do for a hold. No match: the line shows, nothing else.
//   sayLine(ask, words, touchedLabel, clock)   the line the app would send
//   sayReplyFor(replies, sample, id, words)    the canned answer for this mark and these words, or null

const quote = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

export function sayLine(ask, words, touchedLabel, clock) {
  return "[yui] " + ask + " yl say " + quote(clean(words)) + " touched=" + (touchedLabel ? touchedLabel : "@" + (+clock).toFixed(1) + "s");
}

// a keyword matches as a whole word (or phrase) of what was said, ignoring case and punctuation
const norm = (s) => " " + String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
export function sayReplyFor(replies, sample, id, words) {
  const r = replies && replies[sample] && id ? replies[sample]["say:" + id] : null;
  if (!r) return null;
  const said = norm(words);
  return (Array.isArray(r) ? r : [r]).find((x) => (x.words || []).some((k) => said.includes(norm(k)))) || null;
}

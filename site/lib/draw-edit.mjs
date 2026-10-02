// The /developers/draw editor's brain: read edited Yui Lines and say which line, if any, the parser rejected.
// Pure, so scripts/draw-check.mjs can run every example through it. The text is never rewritten.
import { Parser } from "./yl/yl.mjs";

// Returns { ok: true } or { ok: false, n, line, message } for the first line that failed (n counts from 1).
export function checkLines(text) {
  const p = new Parser();
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let op;
    try { op = p.line(lines[i]); } catch (e) { return { ok: false, n: i + 1, line: lines[i], message: e.message }; }
    if (op && (op.op === "error" || op.error)) return { ok: false, n: i + 1, line: lines[i], message: op.message || "not understood" };
  }
  const end = p.finish();
  if (end && (end.op === "error" || end.error)) return { ok: false, n: lines.length, line: lines[lines.length - 1], message: end.message || "not finished" };
  return { ok: true };
}

// One plain sentence for under the box.
export function failText(r) {
  const shown = r.line.length > 40 ? `${r.line.slice(0, 40)}...` : r.line;
  return `Line ${r.n} did not draw (${r.message}). Showing the last good drawing. ${shown ? `That line: ${shown}` : ""}`.trim();
}

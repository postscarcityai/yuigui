// SITE-137: does the site chat answer like the app, one line and a drawing? Asks the live chat
// model four visitor questions with the real brief and counts, per reply, the text bubbles, the
// words in them and the drawings. Needs YUI_CHAT_OPENROUTER_KEY. Run: node site/scripts/chat-oneline-eval.mjs
import { brief } from "../lib/chat/brief.mjs";
import { turn } from "../lib/chat/model.mjs";
import { cleanLines, DRAWING, splitReply } from "../lib/chat/lines.mjs";

export const QUESTIONS = ["how does Yui work?", "what is Yui Lines?", "show me a screen", "how do I pair my agent?"];

// A reply's bubbles: every blank-line paragraph of text is its own bubble, like the app.
export function measure(reply) {
  const parts = splitReply(reply);
  const bubbles = parts.filter((p) => p.text).flatMap((p) => p.text.split(/\n\s*\n/).filter((x) => x.trim()));
  const words = bubbles.reduce((n, b) => n + b.split(/\s+/).filter(Boolean).length, 0);
  const drawings = parts.filter((p) => p.yl).flatMap((p) => cleanLines(p.yl).split("\n")).filter((l) => DRAWING.test(l.replace(/^[>~]\S*\s*/, "").trim())).length;
  return { bubbles: bubbles.length, words, drawings, ok: bubbles.length <= 1 && words <= 30 && drawings >= 1 };
}

if (process.argv[1].endsWith("chat-oneline-eval.mjs")) {
  const system = brief({ path: "/" });
  const rows = [];
  for (const q of QUESTIONS) {
    const r = await turn({ system, history: [], text: q, canAsk: false });
    const m = measure(r.reply);
    rows.push({ q, ...m });
    console.log(`${m.ok ? "PASS" : "FAIL"}  bubbles=${m.bubbles} words=${m.words} drawings=${m.drawings}  ${q}`);
    if (process.env.SHOW) console.log(r.reply.replace(/^/gm, "    | "));
  }
  console.log(`\n${rows.filter((r) => r.ok).length}/${rows.length} replies are one line and a drawing`);
}

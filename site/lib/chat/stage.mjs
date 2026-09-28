// The site chat plays every answer on the stage (SITE-66, spec/YL.md section 5, Stage first). A chat
// reply is text plus ```yui blocks (lines.mjs splitReply); this turns it into the stage's run of
// chunks, a line and one picture each, with every question gathered for the end. Text plays one
// chunk per paragraph (textChunks); a line of text takes the first picture of the block after it,
// the way a `say` does. A paragraph that is a list stays whole, so its points are not run together.
import { apply, initialState, parse } from "../yl/yl.mjs";
import { stageChunks, textChunks } from "../yl/chunks.mjs";
import { splitReply } from "./lines.mjs";

// "Hi.\n\n- a\n- b" -> ["Hi.", "- a\n- b"]
export function textParts(text) {
  const out = [];
  for (const para of String(text || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
    if (/^\s*[-*]\s+/m.test(para)) out.push(para);
    else out.push(...textChunks(para));
  }
  return out;
}

// One reply for the stage:
//   parts:     [{ nodes, state }] one per ```yui block, for the renderers
//   chunks:    [{ key, part, text, line, page, pic }] text: chat words (links and lists), line: a `say`
//              or a page title, page: a deck or plan page's props, pic: the node that draws
//   questions: [{ part, node }] in line order
//   plan:      { part, node } when the questions came from a plan (Send answers as the plan)
export function readAnswer(content) {
  const parts = [], chunks = [], questions = [];
  let plan = null, open = null; // open: a text chunk still waiting for its picture
  for (const p of splitReply(content)) {
    if (p.text) {
      for (const t of textParts(p.text)) {
        const c = { key: `t${chunks.length}`, part: null, text: t, line: null, page: null, pic: null };
        chunks.push(c);
        open = c;
      }
      continue;
    }
    let state = initialState();
    for (const op of parse(p.yl)) state = apply(state, op);
    const nodes = Object.values(state.screens).flat().sort((a, b) => a.seq - b.seq);
    const part = parts.push({ nodes, state }) - 1;
    const r = stageChunks(nodes);
    r.chunks.forEach((c, i) => {
      if (i === 0 && open && c.pic && !c.line && !c.page) { open.part = part; open.pic = c.pic; return; }
      chunks.push({ ...c, key: `${part}:${c.key}`, part, text: null });
    });
    open = null;
    for (const node of r.questions) questions.push({ part, node });
    if (r.plan) plan = { part, node: r.plan };
  }
  return { parts, chunks, questions, plan };
}

// The one plain line under the mic (spec/BROWSER.md: the Web Speech API where the browser has it,
// typing where it does not).
export function micLine({ voice, listening, heard, blocked }) {
  if (listening) return heard ? "Listening. It sends when you stop." : "Listening. Go ahead.";
  if (blocked) return "The mic is blocked. Allow it in the address bar, or type.";
  if (!voice) return "Voice needs Chrome or Safari here. Type instead.";
  return "Tap the mic and talk, or T to type.";
}

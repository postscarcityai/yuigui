// The site chat plays every answer on the stage (SITE-66, spec/YL.md section 5, Stage first). A chat
// reply is text plus ```yui blocks (lines.mjs splitReply); this turns it into the stage's run of
// chunks, a line and one picture each, with every question gathered for the end. Text plays one
// chunk per paragraph (textChunks); a line of text takes the first picture of the block after it,
// the way a `say` does. A paragraph that is a list stays whole, so its points are not run together.
// SITE-68: a plan or a flow is one chunk that plays its own steps (pages, then questions, one Send),
// the playground's runtime, so the steps go by with no model turn between them.
import { apply, initialState, parse } from "../yl/yl.mjs";
import { QUESTIONS, stageChunks, textChunks } from "../yl/chunks.mjs";
import { splitReply } from "./lines.mjs";
import { inThread } from "./pages.mjs";

// A list, a heading or a "Label: value" line stays whole, so the reader can style it (SITE-97).
const STRUCTURED = /^\s*(?:[-*•]\s+|\d+[.)]\s+|#{1,6}\s+|(?:✅|❌)|\*\*[^*\n]{1,40}:\*\*\s)/m;

// "Hi.\n\n- a\n- b" -> ["Hi.", "- a\n- b"]
export function textParts(text) {
  const out = [];
  for (const para of String(text || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
    if (STRUCTURED.test(para)) out.push(para);
    else out.push(...textChunks(para));
  }
  return out;
}

// A plan's members leave the run and its head stands in as one picture (stageChunks would make its
// pages chunks and hold its questions for the end). The stand-in carries the real head as `steps`.
// A motion film plays full screen on its own (web/film.mjs), so it is not a chunk. A motion line that is only the
// agent's ask (an old plugin made no film) stays one and is drawn as a sketch (presets.js).
const isFilm = (n) => n.preset === "motion" && (n.props?.film !== undefined || typeof n.props?.source === "string");

function playsOwnSteps(all) {
  const nodes = all.filter((n) => !isFilm(n));
  const plans = new Set(nodes.filter((n) => n.preset === "plan").map((n) => n.id));
  if (!plans.size) return nodes;
  return nodes.filter((n) => !plans.has(n.in)).map((n) => (plans.has(n.id) && n.preset === "plan" ? { ...n, preset: "steps", steps: n } : n));
}

// One reply for the stage:
//   parts:     [{ nodes, state }] one per ```yui block, for the renderers
//   chunks:    [{ key, part, text, line, page, pic }] text: chat words (links and lists), line: a `say`
//              or a page title, page: a deck or plan page's props, pic: the node that draws
//   questions: [{ part, node, about }] in line order; about: the chunk right before it in its own reply, or null
//   plan:      { part, node } when the questions came from a plan (Send answers as the plan)
export function readAnswer(content) {
  return answerOf(splitReply(content).map((p) => (p.text ? { text: p.text } : { yl: p.yl })));
}

// The same from a run of pieces: { text } words, { yl } a fence's lines, or { state } a screen already built
// (the web thread keeps each fence's state with later patches applied, so a patched answer plays patched).
export function answerOf(pieces) {
  const parts = [], chunks = [], questions = [];
  let plan = null, open = null; // open: a text chunk still waiting for its picture
  let taken = -1; // the last chunk a question took as its context (YUI-308)
  for (const p of pieces) {
    if (p.text) {
      for (const t of textParts(p.text)) {
        const c = { key: `t${chunks.length}`, part: null, text: t, line: null, page: null, pic: null };
        chunks.push(c);
        open = c;
      }
      continue;
    }
    let state = p.state;
    if (!state) {
      state = initialState();
      for (const op of parse(p.yl)) state = apply(state, op);
    }
    // Lines for a page (screens 2 to 12) sit on that page, not on the stage (SITE-83, pages.mjs).
    const nodes = Object.entries(state.screens).flatMap(([k, l]) => l.filter((n) => inThread(k, n))).sort((a, b) => a.seq - b.seq);
    const part = parts.push({ nodes, state }) - 1;
    const r = stageChunks(playsOwnSteps(nodes));
    const waiting = open ? chunks.indexOf(open) : -1; // the words just before this fence
    const at = []; // this fence's chunk i -> its index in the answer
    r.chunks.forEach((c, i) => {
      if (c.pic?.steps) c = { ...c, pic: c.pic.steps };
      if (i === 0 && open && c.pic && !c.line && !c.page) { open.part = part; open.pic = c.pic; at.push(chunks.indexOf(open)); return; }
      at.push(chunks.push({ ...c, key: `${part}:${c.key}`, part, text: null }) - 1);
    });
    open = null;
    // What a question asks about (TestFlight Oct 5, "I need context and action on the same screen"): the line and
    // picture of its own reply that came right before it, taken by one question only. A chunk that is itself a
    // question (a deck page you act on) is not context. The app's StageQuestion.about.
    r.questions.forEach((node, k) => {
      const q = { part, node, about: null };
      const i = r.after[k] ? at[r.after[k] - 1] : waiting;
      if (i > taken && i >= 0 && !QUESTIONS.has(chunks[i].pic?.preset)) { q.about = chunks[i]; taken = i; }
      questions.push(q);
    });
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
  return "Tap the mic and talk, or tap T to type.";
}

// Stage first (spec/YL.md section 5, YUI-119): how a reply plays on the
// stage as a run of chunks, a line and one picture each, with every question
// gathered after the last chunk onto one screen and one Send. Inside a deck,
// a question with its own title is a page of the deck instead (YUI-183).
//
// Nothing here is new on the wire. It reads the nodes a reply already makes
// (the parser's adds, with `in` for group members), so any renderer can play
// any reply this way. The app mirrors it in Swift (YUI-119 step 2).

// Things to answer. On the stage they wait for the end, all on one screen.
export const QUESTIONS = new Set(["ask", "choose", "pick", "slide", "form", "mic", "camera"]);
// Things to look at: each is the picture of the line before it.
export const PICTURES = new Set(["sketch", "shapes", "image", "gallery", "video", "compare", "storyboard", "chart", "stat", "math", "calc", "step", "card", "list", "table", "timeline", "shape", "row"]);
// Groups whose pages become chunks and whose questions join the end.
const FLOWS = new Set(["deck", "plan"]);

// nodes: one screen's adds in order ({key, id, preset, props, in?}), or
// several screens' concatenated in seq order. Returns
//   { chunks: [{ key, line, page, pic }], questions: [node], plan }
// line: the words to read (a `say`, or a page's title); page: the page's
// props when the chunk is a page (body, points); pic: the node that draws,
// a group head for sketch/shapes/timeline (its members are found by `in`).
// plan: the plan head the questions came from, when they came from one, so
// Send can answer as that plan ({plan: {...}}) instead of one event each.
export function stageChunks(nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const head = (n) => (n.in ? byId.get(n.in) : null);
  const chunks = [];
  const questions = [];
  let plan = null;
  let open = null; // the chunk still waiting for its picture
  const start = (c) => { chunks.push(c); open = c.pic ? null : c; };

  for (const n of nodes) {
    const h = head(n);
    // A member of a drawing belongs to the drawing, not to the flow.
    if (h && !FLOWS.has(h.preset)) continue;
    if (FLOWS.has(n.preset)) { open = null; continue; }
    // A deck page you act on (Basil's week, a day a card, each meal a swap,
    // YUI-183): a question with its own title is that page, played in turn,
    // and a tap on it goes at once. A quiz question has no title and still
    // waits for the end.
    if (QUESTIONS.has(n.preset) && h && h.preset === "deck" && n.props.title) {
      start({ key: n.key, line: null, page: null, pic: n });
      open = null;
      continue;
    }
    if (QUESTIONS.has(n.preset)) {
      questions.push(n);
      if (h && h.preset === "plan") plan = h;
      continue;
    }
    if (n.preset === "say") { start({ key: n.key, line: n.props.text || "", page: null, pic: null }); continue; }
    if (n.preset === "page") { start({ key: n.key, line: n.props.title || "", page: n.props, pic: null }); continue; }
    if (open) { open.pic = n; open = null; continue; }
    // A picture with no line before it, or anything else (a timer, a game):
    // a chunk of its own.
    start({ key: n.key, line: null, page: null, pic: n });
    open = null;
  }
  return { chunks, questions, plan };
}

// A period ends a sentence only when whitespace follows and then a capital, a
// quote, a bracket or a digit, or the text ends. So 0.6.0, 3.5, v1.2, URLs and
// file names (chunks.mjs) stay whole, and so do e.g., i.e. and vs. before a
// lowercase word. Each piece keeps its trailing space, so pieces rejoin as-is.
const ABBREVIATIONS = /(?:^|[\s("'])(?:e\.g|i\.e|vs|etc|approx|mr|mrs|ms|dr|st|no)$/i;
export function splitSentences(para) {
  const out = [];
  let start = 0;
  const re = /[.!?]+["')\]]*(\s+|$)/g;
  let m;
  while ((m = re.exec(para))) {
    const end = m.index + m[0].length;
    const next = para[end];
    if (next !== undefined) {
      if (!/[A-Z0-9"'(\[\u201C\u2018]/.test(next)) continue;
      if (m[0][0] === "." && ABBREVIATIONS.test(para.slice(start, m.index))) continue;
    }
    out.push(para.slice(start, end));
    start = end;
  }
  if (start < para.length) out.push(para.slice(start));
  return out.length ? out : [para];
}

// Plain chat text (no YL) on the stage: one chunk per paragraph. A whole thought stays on one page
// (SITE-97): up to 3 sentences and 70 words. Longer than that splits after every second sentence,
// so no chunk is a wall. A paragraph that is markdown (a list, a heading, `Label: value` lines)
// keeps its lines, one block to read (YUI-196).
const STRUCT = /^(\s*[-*+]\s+|\s*\d{1,3}[.)]\s+|\s{0,3}#{1,6}\s+|\*\*[^*]{1,40}:?\*\*:?\s|[\p{L}\p{N}][^:\n.!?*_`\[\]]{0,30}:\s+\S)/u;
export function textChunks(text, most = 70) {
  const out = [];
  for (const raw of String(text || "").split(/\n\s*\n/)) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1 && lines.some((l) => STRUCT.test(l))) { out.push(lines.join("\n")); continue; }
    const para = raw.replace(/\s+/g, " ").trim();
    if (!para) continue;
    const sentences = splitSentences(para);
    if (para.split(" ").length <= most && sentences.length <= 3) { out.push(para); continue; }
    for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join("").trim());
  }
  return out;
}

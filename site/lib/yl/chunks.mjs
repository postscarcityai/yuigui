// Stage first (spec/YL.md section 5, YUI-119): how a reply plays on the
// stage as a run of chunks, a line and one picture each, with every question
// gathered after the last chunk onto one screen and one Send.
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

// Plain chat text (no YL) on the stage: one chunk per paragraph, and a long
// paragraph split after every second sentence, so no chunk is a wall.
export function textChunks(text, most = 40) {
  const out = [];
  for (const para of String(text || "").split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean)) {
    if (para.split(" ").length <= most) { out.push(para); continue; }
    const sentences = para.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [para];
    for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join("").trim());
  }
  return out;
}

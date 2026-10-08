// YUI-334: step back on the living canvas. Every change to the picture (a hold redraw, a drag answer, a say+touch patch) is one step in a
// history; Back (two-finger tap, the Back mark, Cmd/Ctrl+Z) returns to the picture before the last step, Redo (Shift+Cmd/Ctrl+Z) goes forward.
// The page redraws only the marks the step changed, on the same clock. The history holds states (film + its Yui Lines text) and the steps between.
//   create(film, text)            the history, standing at the first picture
//   push(h, step)                 a new step ({kind: hold|move|say|slide, id, name, marks, film, text}); redo steps are dropped
//   back(h) / forward(h)          the state to show and the step that was undone / redone, or null at the end of the history
//   undoLine(ask, n, marks)       the line the agent gets when the person steps back: `[yui] bars canvas undo step=2 marks=chart:n1:s0:3`
//   redoLine(ask, n, marks)       the same for a step forward
//   words(step, dir)              what a screen reader hears: "Back to before the bar moved."

export function create(film, text) { return { states: [{ film, text }], steps: [], at: 0 }; }
export function canBack(h) { return h.at > 0; }
export function canForward(h) { return h.at < h.steps.length; }

export function push(h, step) {
  h.states.length = h.at + 1; h.steps.length = h.at;
  h.steps.push({ kind: step.kind, id: step.id || "", name: step.name || "", marks: (step.marks || []).filter(Boolean) });
  h.states.push({ film: step.film, text: step.text });
  h.at++;
  return h.at;
}
// a drag answer is one step: the move and the redraw its canned reply asks for land in the same step
export function merge(h, step) {
  if (!h.at) return push(h, step);
  const s = h.steps[h.at - 1];
  for (const m of step.marks || []) if (m && !s.marks.includes(m)) s.marks.push(m);
  h.states[h.at] = { film: step.film, text: step.text };
  return h.at;
}
export function back(h) {
  if (!canBack(h)) return null;
  const step = h.steps[h.at - 1], n = h.at; h.at--;
  return { n, step, state: h.states[h.at] };
}
export function forward(h) {
  if (!canForward(h)) return null;
  const step = h.steps[h.at]; h.at++;
  return { n: h.at, step, state: h.states[h.at] };
}

const line = (ask, verb, n, marks) => "[yui] " + ask + " canvas " + verb + " step=" + n + " marks=" + (marks && marks.length ? marks.join(",") : "none");
export const undoLine = (ask, n, marks) => line(ask, "undo", n, marks);
export const redoLine = (ask, n, marks) => line(ask, "redo", n, marks);

// the plain word for a mark, from its id
export function noun(id) {
  const s = String(id || "");
  if (/^chart:/.test(s)) return "bar";
  if (/^(list|tl):/.test(s)) return "row";
  if (/^yl:/.test(s)) return "shape";
  if (/^stat:/.test(s)) return "number";
  if (/^calc\.(result|plot)$/.test(s)) return "result";
  if (/^calc\./.test(s)) return "slider";
  if (/^(term|step)\./.test(s)) return "formula";
  return "part";
}
export function words(step, dir) {
  const w = noun(step.id || (step.marks && step.marks[0]));
  const did = step.kind === "slide" ? "the " + w + " moved" : step.kind === "move" ? "the " + w + " moved" : step.kind === "say" ? "you spoke about the " + w : "the " + w + " was redrawn";
  return dir === "forward" ? "Forward to after " + did + "." : "Back to before " + did + ".";
}

// YUI-277: a decision never splits across screens. In a plan, a choose / pick /
// ask that follows a page (and its picture) is drawn ON that page, under the
// picture. A question that compares earlier pages (A / B / C looks) gets those
// pages as small tappable pictures above its options. Pure, so it is tested
// without a browser: node site/lib/yl/askhere.test.mjs
const DECISIONS = new Set(["ask", "choose", "pick"]);

// steps (from stepsOf) in, steps out: a page right before a decision carries it
// as `ask`, and the decision leaves the list. `keep(m)` names a decision that
// stays its own step (a workout move draws itself).
export function askHere(steps, keep = () => false) {
  const out = [];
  for (const m of steps) {
    const last = out[out.length - 1];
    if (DECISIONS.has(m.preset) && !keep(m) && last && last.preset === "page" && !last.ask) out[out.length - 1] = { ...last, ask: m };
    else out.push(m);
  }
  return out;
}

// The decision a step holds, if any: a page's `ask`, or the step itself.
export const questionOf = (m) => (m.preset === "page" ? m.ask || null : m);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const title = (m) => (m.props && m.props.title) || "";

// The pages before `at` that a question's options name ("A", "Look B", "Hand
// drawn"): [{ option, page }], in option order, or [] when fewer than two
// options point at a page (one match is not a comparison).
export function compareOf(steps, at) {
  const q = questionOf(steps[at]);
  const options = q && Array.isArray(q.props.options) ? q.props.options.map(String) : [];
  const pages = steps.slice(0, at + (steps[at].preset === "page" ? 1 : 0)).filter((m) => m.preset === "page" && (m.pic || (m.props && m.props.img)));
  const hits = [];
  for (const o of options) {
    const t = o.trim();
    if (!t) continue;
    const re = new RegExp(`(^|[\\s:·.\\-–—(])${esc(t)}($|[\\s:·.\\-–—)])`, "i");
    const page = [...pages].reverse().find((p) => re.test(title(p)));
    if (page && !hits.some((h) => h.page === page)) hits.push({ option: o, page });
  }
  return hits.length >= 2 ? hits : [];
}

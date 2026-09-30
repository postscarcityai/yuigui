// diagram (DRAW-1): the layout behind `diagram`. Pure functions, no DOM, so the
// playground, the MCP App and the tests share one layout. The patch the parser
// gives at `end` (yl.mjs, diagram) goes in; boxes, lines and their reveal order
// come out. The drawing is static: parts come on in the order the Mermaid
// wrote them (`order`, then DELAY seconds apart).

export const DELAY = 0.22; // one node to the next, in seconds
const CHAR = 7.4; // px per character at the 13px label size
const PAD = 8;

// A label broken into lines of at most `max` characters, on spaces.
export function wrap(text, max = 20) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const out = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > max) { out.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
  }
  if (cur) out.push(cur);
  return out.length ? out : [""];
}
const widest = (lines) => Math.max(...lines.map((l) => l.length)) * CHAR;

// ---------- flowchart and state ----------

// A node's box, in px.
function sizeOf(n, state) {
  const lines = wrap(n.label ?? (state && /^_(start|end)/.test(n.id) ? "" : n.id), 18);
  const tw = widest(lines);
  const th = lines.length * 17;
  let w = Math.max(56, tw + 28), h = Math.max(36, th + 18);
  switch (n.shape) {
    case "start": return { w: 16, h: 16, lines: [] };
    case "end": return { w: 22, h: 22, lines: [] };
    case "choice": return { w: 30, h: 30, lines: [] };
    case "fork": case "join": return { w: 70, h: 8, lines: [] };
    case "diamond": w = tw * 1.5 + 34; h = th * 1.5 + 30; break;
    case "circle": case "double": w = h = Math.max(tw + 16, th + 22) + (n.shape === "double" ? 10 : 0); break;
    case "hexagon": w += 24; break;
    case "slant": case "flag": w += 22; break;
    case "cylinder": h += 12; break;
    case "subroutine": w += 12; break;
    default:
  }
  return { w: Math.round(w), h: Math.round(h), lines };
}

// Ranks by longest path after reversing the edges that close a cycle.
function ranks(ids, edges) {
  const out = new Map(ids.map((i) => [i, []]));
  for (const e of edges) if (e.from !== e.to) out.get(e.from).push(e.to);
  const state = new Map();
  const back = new Set();
  const visit = (u) => {
    state.set(u, 1);
    for (const v of out.get(u)) {
      if (state.get(v) === 1) back.add(`${u}>${v}`);
      else if (!state.has(v)) visit(v);
    }
    state.set(u, 2);
  };
  for (const id of ids) if (!state.has(id)) visit(id);
  const fwd = edges.filter((e) => e.from !== e.to).map((e) => (back.has(`${e.from}>${e.to}`) ? { from: e.to, to: e.from } : e));
  const rank = new Map(ids.map((i) => [i, 0]));
  // Longest path: relax in passes (the graph is small and acyclic now).
  for (let pass = 0; pass < ids.length; pass++) {
    let moved = false;
    for (const e of fwd) if (rank.get(e.to) < rank.get(e.from) + 1) { rank.set(e.to, rank.get(e.from) + 1); moved = true; }
    if (!moved) break;
  }
  return { rank, back };
}

// Reorders each rank by the mean place of its neighbours, a few sweeps.
function order(layers, edges) {
  const pos = new Map();
  const set = () => layers.forEach((l) => l.forEach((id, i) => pos.set(id, i)));
  set();
  const nb = (id, dir) => edges.filter((e) => (dir > 0 ? e.to === id : e.from === id)).map((e) => (dir > 0 ? e.from : e.to)).filter((x) => pos.has(x));
  for (let s = 0; s < 4; s++) {
    const down = s % 2 === 0;
    const seq = down ? layers.map((_, i) => i) : layers.map((_, i) => layers.length - 1 - i);
    for (const li of seq) {
      const keyed = layers[li].map((id, i) => {
        const ns = nb(id, down ? 1 : -1).filter((x) => layers.findIndex((l) => l.includes(x)) === (down ? li - 1 : li + 1));
        return { id, k: ns.length ? ns.reduce((a, x) => a + pos.get(x), 0) / ns.length : i };
      });
      keyed.sort((a, b) => a.k - b.k);
      layers[li] = keyed.map((k) => k.id);
      layers[li].forEach((id, i) => pos.set(id, i));
    }
  }
}

const cubic = (p0, p1, p2, p3, t) => {
  const m = 1 - t;
  return [0, 1].map((k) => m * m * m * p0[k] + 3 * m * m * t * p1[k] + 3 * m * t * t * p2[k] + t * t * t * p3[k]);
};

// A left-to-right (or right-to-left) chart wider than a phone draws top down
// instead, so its labels stay readable.
export const FIT = 360;

// A flowchart or state diagram: { type, dir, nodes, edges, groups } to boxes.
export function layoutGraph(g, fit = FIT) {
  const first = place(g);
  if (first.w > fit && (g.dir === "LR" || g.dir === "RL")) {
    const down = place({ ...g, dir: "TD" });
    if (down.w < first.w) return { ...down, turned: true };
  }
  return first;
}

function place(g) {
  const state = g.type === "state";
  const nodes = (g.nodes || []).map((n, i) => ({ ...n, order: i, ...sizeOf(n, state) }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edges = (g.edges || []).filter((e) => byId.has(e.from) && byId.has(e.to));
  const dir = ["TD", "TB", "BT", "LR", "RL"].includes(g.dir) ? g.dir : "TD";
  const horiz = dir === "LR" || dir === "RL";
  const len = (n) => (horiz ? n.w : n.h);
  const wid = (n) => (horiz ? n.h : n.w);

  const { rank, back } = ranks(nodes.map((n) => n.id), edges);
  const layers = [];
  for (const n of nodes) (layers[rank.get(n.id)] ||= []).push(n.id);
  for (let i = 0; i < layers.length; i++) layers[i] ||= [];
  order(layers, edges);

  // Rank axis: the tallest (or widest) node sets a rank's depth.
  const RANK_GAP = horiz ? 64 : 46, CROSS_GAP = 26;
  const at = [];
  let r0 = 0;
  layers.forEach((l, i) => {
    const depth = Math.max(0, ...l.map((id) => len(byId.get(id))));
    at[i] = { start: r0, depth };
    r0 += depth + RANK_GAP;
  });
  const spans = layers.map((l) => l.reduce((a, id) => a + wid(byId.get(id)), 0) + Math.max(0, l.length - 1) * CROSS_GAP);
  const cross = Math.max(0, ...spans);
  layers.forEach((l, i) => {
    let c = (cross - spans[i]) / 2;
    for (const id of l) {
      const n = byId.get(id);
      const rc = at[i].start + at[i].depth / 2, cc = c + wid(n) / 2;
      n.cx = horiz ? rc : cc;
      n.cy = horiz ? cc : rc;
      c += wid(n) + CROSS_GAP;
    }
  });
  const total = Math.max(0, r0 - RANK_GAP);
  // Mirror for the reverse directions.
  if (dir === "BT") nodes.forEach((n) => { n.cy = total - n.cy; });
  if (dir === "RL") nodes.forEach((n) => { n.cx = total - n.cx; });

  // Edges: from the side facing the target to the side facing the source.
  const out = edges.map((e, i) => {
    const a = byId.get(e.from), b = byId.get(e.to);
    const self = a === b;
    const forward = horiz ? (dir === "LR" ? b.cx > a.cx : b.cx < a.cx) : (dir === "BT" ? b.cy < a.cy : b.cy > a.cy);
    let p0, p1, p2, p3;
    if (self) {
      const x = a.cx + a.w / 2, y = a.cy;
      p0 = [x, y - 6]; p1 = [x + 34, y - 26]; p2 = [x + 34, y + 26]; p3 = [x, y + 6];
    } else if (forward) {
      const s = horiz ? (b.cx > a.cx ? 1 : -1) : (b.cy > a.cy ? 1 : -1);
      if (horiz) {
        p0 = [a.cx + s * a.w / 2, a.cy]; p3 = [b.cx - s * b.w / 2, b.cy];
        const k = Math.max(24, Math.abs(p3[0] - p0[0]) / 2);
        p1 = [p0[0] + s * k, p0[1]]; p2 = [p3[0] - s * k, p3[1]];
      } else {
        p0 = [a.cx, a.cy + s * a.h / 2]; p3 = [b.cx, b.cy - s * b.h / 2];
        const k = Math.max(20, Math.abs(p3[1] - p0[1]) / 2);
        p1 = [p0[0], p0[1] + s * k]; p2 = [p3[0], p3[1] - s * k];
      }
    } else {
      // A way back: out of the far side and round.
      if (horiz) {
        const y = Math.max(a.cy + a.h / 2, b.cy + b.h / 2) + 34;
        p0 = [a.cx, a.cy + a.h / 2]; p3 = [b.cx, b.cy + b.h / 2]; p1 = [a.cx, y]; p2 = [b.cx, y];
      } else {
        const x = Math.max(a.cx + a.w / 2, b.cx + b.w / 2) + 38;
        p0 = [a.cx + a.w / 2, a.cy]; p3 = [b.cx + b.w / 2, b.cy]; p1 = [x, a.cy]; p2 = [x, b.cy];
      }
    }
    const mid = cubic(p0, p1, p2, p3, 0.5);
    return { ...e, i, pts: [p0, p1, p2, p3], mid, back: back.has(`${e.from}>${e.to}`) || self, order: Math.max(a.order, b.order) };
  });

  // Groups: a box round the members, the outer ones round the inner.
  const groups = (g.groups || []).map((gr) => ({ ...gr }));
  const box = new Map();
  const boxOf = (gr) => {
    if (box.has(gr.id)) return box.get(gr.id);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const id of gr.nodes || []) {
      const n = byId.get(id);
      if (!n) continue;
      x0 = Math.min(x0, n.cx - n.w / 2); x1 = Math.max(x1, n.cx + n.w / 2);
      y0 = Math.min(y0, n.cy - n.h / 2); y1 = Math.max(y1, n.cy + n.h / 2);
    }
    for (const c of groups.filter((q) => q.in === gr.id)) {
      const b = boxOf(c);
      if (!b) continue;
      x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x + b.w);
      y0 = Math.min(y0, b.y); y1 = Math.max(y1, b.y + b.h);
    }
    const b = Number.isFinite(x0) ? { id: gr.id, x: x0 - 14, y: y0 - 30, w: x1 - x0 + 28, h: y1 - y0 + 44, label: gr.label } : null;
    box.set(gr.id, b);
    return b;
  };
  const gboxes = groups.map(boxOf).filter(Boolean);

  // Bounds, then everything moves so the drawing starts at PAD.
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const take = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  nodes.forEach((n) => { take(n.cx - n.w / 2, n.cy - n.h / 2); take(n.cx + n.w / 2, n.cy + n.h / 2); });
  out.forEach((e) => { e.pts.forEach(([x, y]) => take(x, y)); if (e.label) { const hw = wrap(e.label, 16); take(e.mid[0] - widest(hw) / 2 - 6, e.mid[1] - 12); take(e.mid[0] + widest(hw) / 2 + 6, e.mid[1] + 12); } });
  gboxes.forEach((b) => { take(b.x, b.y); take(b.x + b.w, b.y + b.h); });
  if (!Number.isFinite(x0)) return { w: 0, h: 0, nodes: [], edges: [], groups: [] };
  const dx = PAD - x0, dy = PAD - y0;
  nodes.forEach((n) => { n.cx += dx; n.cy += dy; });
  out.forEach((e) => { e.pts = e.pts.map(([x, y]) => [x + dx, y + dy]); e.mid = [e.mid[0] + dx, e.mid[1] + dy]; });
  gboxes.forEach((b) => { b.x += dx; b.y += dy; });
  return { w: Math.ceil(x1 - x0 + PAD * 2), h: Math.ceil(y1 - y0 + PAD * 2), nodes, edges: out, groups: gboxes, dir };
}

// ---------- sequence ----------

const ROW = 38;

export function layoutSequence(g) {
  const actors = (g.actors || []).map((a) => ({ ...a, lines: wrap(a.label ?? a.id, 14) }));
  const steps = g.steps || [];
  const n = actors.length;
  if (!n) return { w: 0, h: 0, actors: [], items: [], life: [0, 0] };
  const idx = new Map(actors.map((a, i) => [a.id, i]));
  const wA = actors.map((a) => Math.max(84, widest(a.lines) + 24));
  // Gaps between neighbouring lifelines grow until every message text fits.
  const gap = wA.map((w, i) => (i < n - 1 ? Math.max(40, (w + wA[i + 1]) / 2 + 18) : 0));
  for (const s of steps) {
    if (s.type !== "msg" && s.type !== "note") continue;
    const ids = s.type === "msg" ? [s.from, s.to] : s.on;
    const lo = Math.min(...ids.map((x) => idx.get(x))), hi = Math.max(...ids.map((x) => idx.get(x)));
    const need = widest(wrap(s.text, 34)) + 28;
    if (hi === lo) continue;
    const have = gap.slice(lo, hi).reduce((a, b) => a + b, 0);
    if (have < need) for (let i = lo; i < hi; i++) gap[i] += (need - have) / (hi - lo);
  }
  const xs = [];
  let x = wA[0] / 2;
  actors.forEach((a, i) => { xs[i] = x; x += gap[i]; a.x = xs[i]; a.w = wA[i]; });
  const head = Math.max(...actors.map((a) => a.lines.length)) * 17 + 18;
  actors.forEach((a) => { a.h = head; });
  const left = Math.min(...actors.map((a) => a.x - a.w / 2));
  const right = Math.max(...actors.map((a) => a.x + a.w / 2));

  const items = [];
  let y = head + 24;
  let num = 0;
  const stack = [];
  steps.forEach((s, order) => {
    if (s.type === "msg") {
      const a = xs[idx.get(s.from)], b = xs[idx.get(s.to)];
      const lines = wrap(s.text, 34);
      const h = Math.max(ROW, lines.length * 16 + 22);
      const self = a === b;
      items.push({ ...s, kind: "msg", order, x1: a, x2: b, self, y: y + h - 12, textY: y + 4, lines, tw: widest(lines), n: g.numbered ? ++num : 0, depth: stack.length });
      y += self ? h + 14 : h;
    } else if (s.type === "note") {
      const lines = wrap(s.text, 28);
      const xsOn = s.on.map((id) => xs[idx.get(id)]);
      const w = Math.max(90, widest(lines) + 20);
      let nx, nw = w;
      if (s.side === "over") {
        const lo = Math.min(...xsOn), hi = Math.max(...xsOn);
        nw = Math.max(w, hi - lo + 40);
        nx = (lo + hi) / 2 - nw / 2;
      } else if (s.side === "right") nx = xsOn[0] + 12;
      else nx = xsOn[0] - 12 - w;
      const h = lines.length * 16 + 14;
      items.push({ ...s, kind: "note", order, x: nx, w: nw, y, h, lines });
      y += h + 12;
    } else if (s.type === "open") {
      stack.push({ y0: y, order, block: s.block, text: s.text ?? "", divs: [] });
      y += 26;
    } else if (s.type === "else") {
      const top = stack[stack.length - 1];
      if (top) top.divs.push({ y, text: s.text ?? "" });
      y += 26;
    } else if (s.type === "close") {
      const top = stack.pop();
      if (top) items.push({ kind: "block", order: top.order, y: top.y0, h: y - top.y0 + 4, block: top.block, text: top.text, divs: top.divs, depth: stack.length });
      y += 12;
    }
  });
  // A block left open at the end of the input closes there.
  while (stack.length) {
    const top = stack.pop();
    items.push({ kind: "block", order: top.order, y: top.y0, h: y - top.y0 + 4, block: top.block, text: top.text, divs: top.divs, depth: stack.length });
  }
  const bottom = y + 10;
  const pad = 26;
  const notes = items.filter((i) => i.kind === "note");
  const x0 = Math.min(left - pad, ...notes.map((i) => i.x - 8));
  const x1 = Math.max(right + pad, ...notes.map((i) => i.x + i.w + 8));
  return { w: Math.ceil(x1 - x0 + PAD * 2), h: Math.ceil(bottom + PAD), dx: PAD - x0, actors, items, life: [head, bottom], span: [left - 14, right + 14], numbered: !!g.numbered };
}


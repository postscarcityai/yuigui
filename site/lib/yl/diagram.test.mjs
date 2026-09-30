// diagram (DRAW-1): layout for the flow, state and sequence drawings.
//   node site/lib/yl/diagram.test.mjs     exit 1 on any failure
import { apply, initialState, parse } from "./yl.mjs";
import { layoutGraph, layoutSequence, wrap } from "./diagram.mjs";

let bad = 0, n = 0;
const eq = (name, got, want) => {
  n++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { bad++; console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
};
const ok = (name, cond) => eq(name, !!cond, true);

// The patch at `end` lands on the diagram's props.
const draw = (text) => {
  let s = initialState();
  for (const o of parse(text)) s = apply(s, o);
  return Object.values(s.screens).flat().find((c) => c.preset === "diagram").props;
};

eq("wrap breaks on spaces", wrap("one two three four", 9), ["one two", "three", "four"]);
eq("wrap keeps a long word whole", wrap("Supercalifragilistic", 5), ["Supercalifragilistic"]);

// A chain goes down: each node under the last, none overlapping.
const chain = layoutGraph(draw("diagram\nflowchart TD\n  a --> b --> c\nend"));
ok("chain: three nodes", chain.nodes.length === 3);
ok("chain: rank order is top to bottom", chain.nodes[0].cy < chain.nodes[1].cy && chain.nodes[1].cy < chain.nodes[2].cy);
ok("chain: lined up", new Set(chain.nodes.map((q) => q.cx)).size === 1);
ok("chain: a box gap between ranks", chain.nodes[1].cy - chain.nodes[0].cy > chain.nodes[0].h);
ok("chain: everything inside the drawing", chain.nodes.every((q) => q.cx - q.w / 2 >= 0 && q.cy - q.h / 2 >= 0 && q.cx + q.w / 2 <= chain.w && q.cy + q.h / 2 <= chain.h));

// LR runs left to right, RL and BT the other way.
const lr = layoutGraph(draw("diagram\nflowchart LR\n  a --> b\nend"));
ok("LR: b is right of a", lr.nodes[1].cx > lr.nodes[0].cx && lr.nodes[0].cy === lr.nodes[1].cy);
const rl = layoutGraph(draw("diagram\nflowchart RL\n  a --> b\nend"));
ok("RL: b is left of a", rl.nodes[1].cx < rl.nodes[0].cx);
const bt = layoutGraph(draw("diagram\nflowchart BT\n  a --> b\nend"));
ok("BT: b is above a", bt.nodes[1].cy < bt.nodes[0].cy);

// A wide left-to-right chart draws top down on a phone; a narrow one stays.
const wideLR = layoutGraph(draw("diagram\nflowchart LR\n  a[First step] --> b[Second step] --> c[Third step] --> d[Fourth step]\nend"));
ok("wide LR turns to top down", wideLR.turned && wideLR.w <= 360 && wideLR.nodes[1].cy > wideLR.nodes[0].cy);
ok("narrow LR stays", !lr.turned);
ok("fit can be wider", !layoutGraph(draw("diagram\nflowchart LR\n  a[First step] --> b[Second step] --> c[Third step] --> d[Fourth step]\nend"), 2000).turned);

// A branch puts two nodes on one rank side by side; a cycle does not loop forever.
const fork = layoutGraph(draw("diagram\nflowchart TD\n  a --> b\n  a --> c\n  b --> d\n  c --> d\nend"));
ok("fork: b and c share a rank", fork.nodes[1].cy === fork.nodes[2].cy && fork.nodes[1].cx !== fork.nodes[2].cx);
ok("fork: d under both", fork.nodes[3].cy > fork.nodes[1].cy);
const loop = layoutGraph(draw("diagram\nflowchart TD\n  a --> b --> c --> a\nend"));
ok("cycle: laid out", loop.nodes.length === 3 && loop.edges.length === 3);
ok("cycle: the way back is marked", loop.edges.filter((e) => e.back).length === 1);
ok("self loop stays", layoutGraph(draw("diagram\nflowchart TD\n  a --> a\nend")).edges[0].back);

// Edges run between their boxes; a label gets a place on the line.
ok("edge ends are the node sides", chain.edges[0].pts[0][1] < chain.edges[0].pts[3][1]);
ok("edge label has a midpoint", layoutGraph(draw("diagram\nflowchart TD\n  a -->|yes| b\nend")).edges[0].mid.length === 2);

// Subgraphs become boxes round their nodes, the outer round the inner.
const sub = layoutGraph(draw("diagram\nflowchart TD\n  subgraph o [Outer]\n    a --> b\n    subgraph i [Inner]\n      c\n    end\n  end\n  b --> d\nend"));
const box = (id) => sub.groups.find((q) => q.id === id);
ok("subgraph: two boxes", sub.groups.length === 2);
ok("subgraph: outer holds inner", box("o").x <= box("i").x && box("o").x + box("o").w >= box("i").x + box("i").w && box("o").y <= box("i").y);
ok("subgraph: d is outside", sub.nodes.find((q) => q.id === "d").cy - 20 > box("o").y + box("o").h - 40);

// A state diagram: the start and end marks are small, a composite is a group.
const st = layoutGraph(draw("diagram\nstateDiagram-v2\n  [*] --> A\n  A --> [*]\nend"));
ok("state: start is small", st.nodes.find((q) => q.id === "_start").w === 16);
ok("state: end is small", st.nodes.find((q) => q.id === "_end").w === 22);
ok("state: start above A above end", st.nodes[0].cy < st.nodes[1].cy && st.nodes[1].cy < st.nodes[2].cy);

// An empty diagram is empty, not a crash.
eq("empty graph", layoutGraph({ type: "flow", nodes: [] }), { w: 0, h: 0, nodes: [], edges: [], groups: [] });
eq("empty sequence", layoutSequence({ type: "sequence", actors: [] }).actors, []);

// Sequence: actors left to right in order, messages top to bottom.
const seq = layoutSequence(draw("diagram\nsequenceDiagram\n  A->>B: one\n  B-->>A: two\n  Note over A,B: both\n  A->>A: self\nend"));
ok("sequence: actors in order", seq.actors[0].x < seq.actors[1].x);
const msgs = seq.items.filter((i) => i.kind === "msg");
ok("sequence: messages go down", msgs[0].y < msgs[1].y && msgs[1].y < msgs[2].y);
ok("sequence: a reply runs back", msgs[1].x1 > msgs[1].x2);
ok("sequence: a self message is marked", msgs[2].self);
ok("sequence: the note sits under the messages above it", seq.items.find((i) => i.kind === "note").y > msgs[1].y);
ok("sequence: lifelines reach the bottom", seq.life[1] >= msgs[2].y);

// Long message text widens the gap so it fits.
const wide = layoutSequence(draw("diagram\nsequenceDiagram\n  A->>B: a long sentence of words\nend"));
const tight = layoutSequence(draw("diagram\nsequenceDiagram\n  A->>B: hi\nend"));
ok("sequence: long text widens the gap", wide.actors[1].x - wide.actors[0].x > tight.actors[1].x - tight.actors[0].x);

// Blocks wrap their steps and nest.
const blk = layoutSequence(draw("diagram\nsequenceDiagram\n  loop daily\n    A->>B: ping\n    alt ok\n      B->>A: yes\n    else no\n      B->>A: no\n    end\n  end\nend"));
const blocks = blk.items.filter((i) => i.kind === "block");
ok("blocks: two", blocks.length === 2);
ok("blocks: the inner has the higher depth", blocks.find((b) => b.block === "alt").depth === 1 && blocks.find((b) => b.block === "loop").depth === 0);
ok("blocks: else is a divider", blocks.find((b) => b.block === "alt").divs.length === 1);
ok("blocks: the outer holds the inner", (() => { const o = blocks.find((b) => b.block === "loop"), i = blocks.find((b) => b.block === "alt"); return o.y < i.y && o.y + o.h >= i.y + i.h; })());
ok("sequence: numbered", layoutSequence(draw("diagram\nsequenceDiagram\n  autonumber\n  A->>B: x\n  B->>A: y\nend")).items.map((i) => i.n).join() === "1,2");

console.log(bad ? `${bad} of ${n} failed` : `diagram: ${n} checks ok`);
process.exit(bad ? 1 : 0);

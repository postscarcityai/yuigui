"use client";

// My flows (spec/FLOWS.md, section 8): a mock of the app's list of saved flows
// (YUI-238). Each starter in the app's order, its variants nested under it,
// the step count on every row. Tap a row to run it; hold it (or right-click) to
// Remove. A starter cannot be removed, a variant goes alone, and one with
// variants of its own asks first and takes them along. Run one and it plays in the real flow runtime (./flow.js); at submit the {flow,
// path} event goes to the wire log and the Path tab draws the way it went:
// the steps taken in order with each answer, the ones skipped greyed out, and
// the branch each answer picked. Nothing leaves the page.

import { useMemo, useRef, useState } from "react";
import { flowEvent, flowTest, parse, resolve } from "../../lib/yl/yl.mjs";
import { FLOW_VARIANTS, STARTER_FLOWS, savedGraph, variantLines } from "../../lib/yl/starter-flows.mjs";
import { APP_STARTERS, confirmText, listRows, removal, rowSub } from "../../lib/yl/myflows.mjs";
import { Render } from "./presets";
import { question, show } from "./flows";
import "./myflows.css";

export const MYFLOWS_VIEWS = [
  ["list", "My flows"],
  ["run", "Run"],
  ["path", "Path"],
];

const LOOK = { Coach: "#ff6b3d", Scout: "#4fd1c5", Yui: "#8b7cff" };

const STARTERS = APP_STARTERS.map((n) => STARTER_FLOWS.find((f) => f.name === n)).filter(Boolean);
const CHECKIN = STARTERS.find((f) => f.name === "workout-checkin");
// Variants an agent made (FLOWS.md, section 9): each is its base's name plus the lines that change.
// Scout's restaurant intake ships with the hub; the brunch one is made from it, to show a variant of a variant.
const BRUNCH = {
  name: "brunch-intake",
  base: "restaurant-intake",
  id: "brunch",
  agent: "Scout",
  lines: 'drop orders\n%% kind: choose "What kind of place?" "Cafe"|Bakery|Both',
};
const VARIANTS = [...FLOW_VARIANTS, BRUNCH];
const variantInfo = (name) => VARIANTS.find((v) => v.name === name);
const resolved = (name) => savedGraph(name, [BRUNCH]);
const titleOf = (name) => (STARTERS.find((f) => f.name === name) || resolved(name) || { title: name }).title;

const rowsFor = (removed) =>
  listRows({
    starters: STARTERS.map((f) => ({ name: f.name, title: f.title })),
    variants: VARIANTS.map((v) => ({ name: v.name, title: titleOf(v.name), base: v.base })),
    removed,
    steps: (name) => {
      const v = variantInfo(name);
      const g = v ? resolved(name) : savedGraph(name);
      return g ? stepsOf(g.g || g).length : 0;
    },
  }).map((r) => ({ ...r, id: (variantInfo(r.name) || STARTERS.find((f) => f.name === r.name)).id, agent: (variantInfo(r.name) || STARTERS.find((f) => f.name === r.name)).agent }));

const linesOf = (f) => (variantInfo(f.name) ? variantLines(variantInfo(f.name)) : `flow@${f.id} "${f.title}" submit="${f.submit}"\n${f.source}\nend`);
function graphOf(f) {
  const v = variantInfo(f.name);
  if (v) { const r = resolved(f.name); return { ...r.g, title: r.title, submit: r.submit }; }
  const ops = parse(linesOf(f));
  const add = ops.find((o) => o.op === "add") || { props: {} };
  const patch = ops.find((o) => o.op === "patch") || { props: {} };
  return resolve("flow", { ...add.props, ...patch.props });
}
const stepsOf = (g) => (g.nodes || []).filter((n) => n.preset);

// The seeded run: the check-in after a bad night, so Path is never empty.
const SEED_ANSWERS = { sleep: 3, energy: "Low", sore: ["Legs"], hurt: "Just sore", today: "Lighter version", time: 30, note: "Knees felt tight on the stairs" };
const SEED = { id: "seed", flowKey: CHECKIN.name, when: "Tue", ev: flowEvent(graphOf(CHECKIN), SEED_ANSWERS) };

// The edges a run took out of `from` until the next step: only the ones that
// were a real choice (a node with more than one way out).
const nodeOf = (g, id) => (g.nodes || []).find((n) => n.id === id);
function takenFrom(g, answers, from) {
  const out = [];
  const seen = new Set([from]);
  let at = from;
  const q = nodeOf(g, from);
  const last = q && q.preset && q.preset !== "page" ? from : null;
  for (;;) {
    const edges = (g.edges || []).filter((e) => e.from === at);
    const e = edges.find((x) => x.when && flowTest(x.when, answers, last)) || edges.find((x) => !x.when);
    if (!e || seen.has(e.to)) return out;
    if (edges.length > 1) out.push({ at, label: e.label || "otherwise", to: e.to });
    const n = nodeOf(g, e.to);
    if (!n || n.preset) return out;
    seen.add(n.id);
    at = n.id;
  }
}

// The chart's order: the path, and after each step the branches it did not
// take (their steps up to where they rejoin the path), then anything left.
function chartOrder(g, path) {
  const on = new Set(path);
  const out = [];
  const seen = new Set();
  const put = (id) => { const n = nodeOf(g, id); if (n && n.preset && !seen.has(id)) { seen.add(id); out.push(n); } };
  const branch = (id, stop) => {
    // Walk a branch not taken: its first edge each time, until the path or a loop.
    for (let at = id, i = 0; at && !on.has(at) && !stop.has(at) && i < 50; i++) {
      stop.add(at);
      put(at);
      const e = (g.edges || []).find((x) => x.from === at);
      at = e && e.to;
    }
  };
  for (const id of path) {
    put(id);
    // Every way out of this step, through the step-less nodes after it.
    const hop = [id];
    const visited = new Set(hop);
    while (hop.length) {
      const at = hop.shift();
      for (const e of (g.edges || []).filter((x) => x.from === at)) {
        const n = nodeOf(g, e.to);
        if (!n || visited.has(e.to)) continue;
        visited.add(e.to);
        if (n.preset) branch(e.to, new Set());
        else hop.push(e.to);
      }
    }
  }
  for (const n of stepsOf(g)) put(n.id);
  return out;
}

function Face({ name, size = 30 }) {
  return <span className="mf-face" style={{ background: LOOK[name] || "var(--accent, #8b7cff)", width: size, height: size }} aria-hidden="true">{name[0]}</span>;
}
function Nav({ title, back, onBack, right }) {
  return (
    <div className="mf-nav">
      {back ? <button className="mf-back" onClick={onBack}>‹ {back}</button> : <span />}
      <b>{title}</b>
      {right || <span />}
    </div>
  );
}
function Row({ f, onRun, onHold }) {
  // Hold (or right-click) a flow of yours to remove it. A starter has nothing to remove.
  const timer = useRef(null);
  const held = useRef(false);
  const start = () => { held.current = false; clearTimeout(timer.current); if (!f.starter) timer.current = setTimeout(() => { held.current = true; onHold(f.name); }, 480); };
  const stop = () => clearTimeout(timer.current);
  return (
    <button
      className="mf-row"
      data-name={f.name}
      aria-label={`${f.title}, ${rowSub(f)}`}
      disabled={f.steps === 0}
      onClick={() => { if (held.current) { held.current = false; return; } onRun(f.name); }}
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onContextMenu={(e) => { e.preventDefault(); if (!f.starter) onHold(f.name); }}
    >
      {f.depth > 0 ? <span className="mf-turn" style={{ marginLeft: (f.depth - 1) * 14 }} aria-hidden="true">↳</span> : null}
      <span className="mf-row-txt">
        <b>{f.title}</b>
        <span className="mf-sub">{rowSub(f)}</span>
      </span>
      <span className="mf-play" aria-hidden="true">▶</span>
    </button>
  );
}

function List({ rows, run, hold, toast }) {
  return (
    <div className="mf-page">
      <Nav title="My flows" />
      <div className="mf-scroll">
        <div className="mf-list">{rows.map((f) => <Row key={f.name} f={f} onRun={run} onHold={hold} />)}</div>
        <div className="mf-fine">Starters come with every Yui and stay as they are. Ask your agent to make a variant, and it lands under the flow it came from. Hold one of yours to remove it.</div>
      </div>
      {toast ? <div className="mf-toast" role="status"><span>{toast}</span></div> : null}
    </div>
  );
}

// The app's sheet for a held flow: Run, or Remove (not on a starter).
function Actions({ f, close, run, remove }) {
  return (
    <div className="mf-shade" onClick={close}>
      <div className="mf-sheet" role="dialog" aria-label={f.title} onClick={(e) => e.stopPropagation()}>
        <div className="mf-sheet-btns">
          <button className="mf-btn" onClick={() => { close(); run(f.name); }}>Run</button>
          {f.starter ? null : <button className="mf-btn mf-red" onClick={() => remove(f)}>Remove</button>}
          <button className="mf-btn mf-plain" onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// The app's alert: always asks, and says what goes with it.
function Confirm({ f, keep, remove }) {
  const t = confirmText(f);
  return (
    <div className="mf-shade mf-mid" onClick={keep}>
      <div className="mf-alert" role="alertdialog" aria-label={t.title} onClick={(e) => e.stopPropagation()}>
        <div className="mf-alert-h">{t.title}</div>
        <div className="mf-alert-m">{t.message}</div>
        <div className="mf-alert-btns">
          <button className="mf-btn mf-ghost" onClick={keep}>Keep it</button>
          <button className="mf-btn mf-red" onClick={remove}>Remove</button>
        </div>
      </div>
    </div>
  );
}

function Run({ f, g, runN, onSubmit, go }) {
  const node = useMemo(() => ({ key: `mf:${f.name}:${runN}`, id: f.id, preset: "flow", seq: runN, props: g }), [f.name, f.id, g, runN]);
  return (
    <div className="mf-page">
      <Nav title="Run" back="My flows" onBack={() => go("list")} />
      <div className="pg-screen mf-runbox">
        <Render key={node.key} node={node} emit={onSubmit} />
        <div className="mf-fine mf-center">Your answers go to {f.agent} when you send. Only the steps on your path are sent.</div>
      </div>
    </div>
  );
}

function Path({ run, f, g, runs, pickRun, again, go, flows }) {
  const [raw, setRaw] = useState(false);
  if (!run || !f) {
    return (
      <div className="mf-page">
        <Nav title="Path" back="My flows" onBack={() => go("list")} />
        <div className="mf-scroll"><div className="mf-lede">No runs yet. Run a flow and its path shows up here.</div></div>
      </div>
    );
  }
  const { flow: answers, path } = run.ev;
  const steps = stepsOf(g);
  const order = Object.fromEntries(path.map((id, i) => [id, i + 1]));
  const label = (id) => { const n = nodeOf(g, id); return (n && n.label) || id; };
  const branches = path.flatMap((id) => takenFrom(g, answers, id));
  const skipped = steps.length - path.length;
  return (
    <div className="mf-page">
      <Nav title="Path" back="My flows" onBack={() => go("list")} />
      <div className="mf-scroll">
        {runs.length > 1 ? (
          <div className="mf-runs" role="tablist" aria-label="Runs">
            {runs.map((r) => {
              const rf = flows.find((x) => x.name === r.flowKey);
              return (
                <button key={r.id} role="tab" aria-selected={r.id === run.id} className={`mf-chip ${r.id === run.id ? "on" : ""}`} onClick={() => pickRun(r.id)}>
                  {r.when} · {rf ? rf.title : "Deleted flow"}
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="mf-head">
          <Face name={f.agent} size={36} />
          <span className="mf-row-txt">
            <b>{f.title}</b>
            <span className="mf-sub">Ran {run.when} · {path.length} of {steps.length} steps · {branches.length} branch{branches.length === 1 ? "" : "es"}</span>
          </span>
        </div>
        <ol className="mf-chart" aria-label="The path it took">
          {chartOrder(g, path).map((s) => {
            const on = order[s.id];
            const took = on ? takenFrom(g, answers, s.id) : [];
            const a = answers[s.id];
            return (
              <li key={s.id} className={`mf-step ${on ? "on" : "off"} ${s.preset === "page" ? "page" : ""}`}>
                <span className="mf-dot" aria-hidden="true">{on || ""}</span>
                <span className="mf-step-txt">
                  <span className="mf-step-q">{question(s) || s.label}</span>
                  {on ? (s.preset === "page" ? <span className="mf-sub">Read it</span> : <span className="mf-ans">{show(a) || "Skipped"}</span>)
                    : <span className="mf-sub">Not on this path</span>}
                  {took.map((b, i) => (
                    <span key={i} className="mf-branch">
                      {nodeOf(g, b.at)?.preset ? null : <span className="mf-branch-at">{label(b.at)}</span>}
                      <span className="mf-branch-if">{b.label}</span>
                      <span aria-hidden="true">→</span>
                      <span>{label(b.to)}</span>
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="mf-fine">{skipped ? `${skipped} step${skipped === 1 ? "" : "s"} skipped by the answers.` : "Every step was on this path."} {f.agent} got only the answers on the path.</div>
        <button className="mf-btn mf-ghost" onClick={() => setRaw(!raw)} aria-expanded={raw}>{raw ? "Hide what was sent" : `See what ${f.agent} got`}</button>
        {raw ? <pre className="mf-code">{JSON.stringify({ id: f.id, preset: "flow", ...run.ev })}</pre> : null}
        <button className="mf-btn" onClick={() => again(f.name)}>Run it again</button>
      </div>
    </div>
  );
}

export function MyFlowsDemo({ view, setView, onEvent }) {
  const [removed, setRemoved] = useState([]);
  const flows = useMemo(() => rowsFor(removed), [removed]);
  const graphs = useMemo(() => Object.fromEntries(flows.map((f) => [f.name, graphOf({ ...f, ...(STARTERS.find((s) => s.name === f.name) || {}), name: f.name })])), [flows]);
  const [runs, setRuns] = useState([SEED]);
  const [runKey, setRunKey] = useState(CHECKIN.name);
  const [runN, setRunN] = useState(1);
  const [pathId, setPathId] = useState("seed");
  const [sheet, setSheet] = useState(null); // flow name for the hold sheet
  const [asking, setAsking] = useState(null); // flow name for the remove confirm
  const [toast, setToast] = useState(null);
  const n = useRef(1);
  const tt = useRef(null);
  const say = (t) => {
    setToast(t);
    clearTimeout(tt.current);
    tt.current = setTimeout(() => setToast(null), 3500);
  };
  const byKey = (k) => flows.find((f) => f.name === k);

  const run = (k) => { setRunKey(k); setRunN((x) => x + 1); setView("run"); };
  const hold = (k) => setSheet(k);
  const confirm = (f) => { setSheet(null); setAsking(f.name); };
  const remove = () => {
    const names = removal(flows, asking);
    const f = byKey(asking);
    setAsking(null);
    if (!names.length) return;
    setRemoved((r) => [...r, ...names]);
    onEvent({ myflows: "remove", flow: f.title, ...(names.length > 1 ? { with: names.length - 1 } : {}) });
    say(names.length > 1 ? `Removed ${f.title} and ${names.length - 1} variant${names.length > 2 ? "s" : ""}.` : `Removed ${f.title}.`);
  };
  const onSubmit = (ev) => {
    const f = byKey(runKey);
    const r = { id: `r${n.current++}`, flowKey: runKey, when: "just now", ev: { flow: ev.flow, path: ev.path } };
    onEvent({ id: f.id, preset: "flow", ...r.ev, saved: f.title });
    setRuns((rs) => [r, ...rs.map((x) => (x.when === "just now" ? { ...x, when: "earlier" } : x))].slice(0, 4));
    setPathId(r.id);
    setTimeout(() => setView("path"), 900);
  };

  const cur = byKey(runKey) || flows[0];
  const pr = runs.find((r) => r.id === pathId && byKey(r.flowKey)) || runs.find((r) => byKey(r.flowKey));
  const pf = pr && byKey(pr.flowKey);
  return (
    <div className="mf-app">
      {view === "run" ? <Run f={cur} g={graphs[cur.name]} runN={runN} onSubmit={onSubmit} go={setView} />
        : view === "path" ? <Path run={pf ? pr : null} f={pf} g={pf ? graphs[pf.name] : null} runs={runs.filter((r) => byKey(r.flowKey))} pickRun={setPathId} again={run} go={setView} flows={flows} />
        : <List rows={flows} run={run} hold={hold} toast={toast} />}
      {sheet && byKey(sheet) && view === "list" ? <Actions f={byKey(sheet)} close={() => setSheet(null)} run={run} remove={confirm} /> : null}
      {asking && byKey(asking) && view === "list" ? <Confirm f={byKey(asking)} keep={() => setAsking(null)} remove={remove} /> : null}
    </div>
  );
}

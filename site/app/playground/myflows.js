"use client";

// My flows (spec/FLOWS.md, section 8): a mock of the app's list of saved flows.
// The five starters plus the person's own copies, each with its last run. Run
// one and it plays in the real flow runtime (./flow.js); at submit the {flow,
// path} event goes to the wire log and the Path tab draws the way it went:
// the steps taken in order with each answer, the ones skipped greyed out, and
// the branch each answer picked. Nothing leaves the page.

import { useMemo, useRef, useState } from "react";
import { flowEvent, flowTest, parse, resolve } from "../../lib/yl/yl.mjs";
import { STARTER_FLOWS } from "../../lib/yl/starter-flows.mjs";
import { encodeYL } from "../../lib/share-code.mjs";
import { Render } from "./presets";
import { question, show } from "./flows";
import "./myflows.css";

export const MYFLOWS_VIEWS = [
  ["list", "My flows"],
  ["run", "Run"],
  ["path", "Path"],
];

const LOOK = { Coach: "#ff6b3d", Scout: "#4fd1c5", Yui: "#8b7cff" };

const CHECKIN = STARTER_FLOWS.find((f) => f.name === "workout-checkin");
// The person's own copy of the check-in, edited with Coach: a water question before the note.
const MINE = {
  key: "checkin-mine",
  id: "checkin",
  title: "Workout check-in (mine)",
  submit: CHECKIN.submit,
  agent: "Coach",
  mine: true,
  from: CHECKIN.title,
  source: CHECKIN.source.replace(
    "time[Time] --> note",
    `time[Time] --> water
  %% water: choose "Water so far today?" "Not yet"|"A glass or two"|"Plenty"
  water[Water] --> note`,
  ),
};
// When each starter last ran (made up, so the list looks lived in).
const LAST = {
  intake: { when: "Mon", steps: 9 },
  checkin: { when: "Sat", steps: 6 },
  onboard: { when: "Sep 2", steps: 7 },
};
const STARTERS = STARTER_FLOWS.map((f) => ({ key: f.name, id: f.id, title: f.title, submit: f.submit, agent: f.agent, source: f.source, last: LAST[f.id] || null }));

const linesOf = (f) => `flow@${f.id} "${f.title}" submit="${f.submit}"\n${f.source}\nend`;
function graphOf(f) {
  const ops = parse(linesOf(f));
  const add = ops.find((o) => o.op === "add") || { props: {} };
  const patch = ops.find((o) => o.op === "patch") || { props: {} };
  return resolve("flow", { ...add.props, ...patch.props });
}
const stepsOf = (g) => (g.nodes || []).filter((n) => n.preset);

// The seeded run: the check-in after a bad night, so Path is never empty.
const SEED_ANSWERS = { sleep: 3, energy: "Low", sore: ["Legs"], hurt: "Just sore", today: "Lighter version", time: 30, water: "A glass or two", note: "Knees felt tight on the stairs" };
const SEED = { id: "seed", flowKey: MINE.key, when: "Tue", ev: flowEvent(graphOf(MINE), SEED_ANSWERS) };

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
const lastText = (l) => (l ? `Ran ${l.when}, ${l.steps} steps` : "Not run yet");

function Row({ f, steps, onRun, onMore, fresh }) {
  return (
    <div className={`mf-row ${fresh ? "mf-fresh" : ""}`}>
      <Face name={f.agent} />
      <span className="mf-row-txt">
        <b>{f.title}</b>
        <span className="mf-sub">{steps} steps · to {f.agent}</span>
        <span className="mf-sub">{lastText(f.last)}</span>
      </span>
      <button className="mf-more" aria-label={`More for ${f.title}`} onClick={onMore}>⋯</button>
      <button className="mf-run" onClick={onRun}>Run</button>
    </div>
  );
}

function List({ flows, graphs, run, more, fresh, toast, undo, ask }) {
  const mine = flows.filter((f) => f.mine);
  const starters = flows.filter((f) => !f.mine);
  const row = (f) => <Row key={f.key} f={f} steps={stepsOf(graphs[f.key]).length} fresh={fresh === f.key} onRun={() => run(f.key)} onMore={() => more(f.key)} />;
  return (
    <div className="mf-page">
      <Nav title="My flows" right={<button className="mf-back mf-right" onClick={() => ask(null)}>+ New</button>} />
      <div className="mf-scroll">
        <div className="mf-lede">Screens you run again and again. Tap Run, answer, and it goes to the agent.</div>
        <div className="mf-label">Yours</div>
        {mine.length ? <div className="mf-card mf-list">{mine.map(row)}</div>
          : <div className="mf-card"><div className="mf-sub">No flows of your own yet. Duplicate a starter to make one.</div></div>}
        <div className="mf-label">Starters</div>
        <div className="mf-card mf-list">{starters.map(row)}</div>
        <div className="mf-fine">Starters come with every Yui and stay as they are. Duplicate one to make it yours, then ask your agent to change it.</div>
      </div>
      {toast ? (
        <div className="mf-toast" role="status">
          <span>{toast}</span>
          {undo ? <button onClick={undo}>Undo</button> : null}
        </div>
      ) : null}
    </div>
  );
}

// The ⋯ sheet: run, duplicate, share, edit with the agent, delete your own.
function Actions({ f, close, run, duplicate, share, ask, remove }) {
  return (
    <div className="mf-shade" onClick={close}>
      <div className="mf-sheet" role="dialog" aria-label={f.title} onClick={(e) => e.stopPropagation()}>
        <div className="mf-sheet-h">{f.title}</div>
        <div className="mf-sub mf-center">{f.mine ? `Yours, from ${f.from}` : "Starter"} · to {f.agent}</div>
        <div className="mf-sheet-btns">
          <button className="mf-btn" onClick={() => { close(); run(f.key); }}>Run it</button>
          <button className="mf-btn mf-ghost" onClick={() => { close(); duplicate(f.key); }}>Duplicate</button>
          <button className="mf-btn mf-ghost" onClick={() => { close(); share(f.key); }}>Share a link</button>
          <button className="mf-btn mf-ghost" onClick={() => { close(); ask(f.key); }}>{f.mine ? `Change it with ${f.agent}` : `Change a copy with ${f.agent}`}</button>
          {f.mine ? <button className="mf-btn mf-red" onClick={() => { close(); remove(f.key); }}>Delete</button> : null}
          <button className="mf-btn mf-plain" onClick={close}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// What a person might ask to change, per flow.
const HINTS = {
  intake: "Add a question about brand colors after the pages",
  scope: "Ask who signs off before the timing",
  checkin: "Ask about protein at breakfast after energy",
  onboard: "Ask what time of day suits them best",
  connect: "Add Slack to the tools",
};

// Ask the agent to change a flow (or make a new one). The agent sends the new
// version back inline; here the ask goes to the wire log.
function Ask({ f, close, send }) {
  const [text, setText] = useState("");
  const hint = f ? HINTS[f.id] || "Add a question at the end" : "A check-in for my Sunday review";
  return (
    <div className="mf-shade" onClick={close}>
      <form className="mf-sheet" role="dialog" aria-label="Ask the agent" onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); send(text.trim() || hint); }}>
        <div className="mf-sheet-h">{f ? `Change ${f.title}` : "Make a new flow"}</div>
        <div className="mf-sub mf-center">{f ? `${f.agent} sends back a new version. The old one stays until you keep it.` : "Say what it is for. Yui drafts the steps and you run it before you keep it."}</div>
        <textarea className="mf-input" rows={3} value={text} placeholder={hint} onChange={(e) => setText(e.target.value)} aria-label="What to change" />
        <div className="mf-sheet-btns">
          <button className="mf-btn">Send to {f ? f.agent : "Yui"}</button>
          <button type="button" className="mf-btn mf-plain" onClick={close}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Run({ f, g, runN, onSubmit, go }) {
  const node = useMemo(() => ({ key: `mf:${f.key}:${runN}`, id: f.id, preset: "flow", seq: runN, props: g }), [f.key, f.id, g, runN]);
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
              const rf = flows.find((x) => x.key === r.flowKey);
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
        <button className="mf-btn" onClick={() => again(f.key)}>Run it again</button>
      </div>
    </div>
  );
}

export function MyFlowsDemo({ view, setView, onEvent }) {
  const [flows, setFlows] = useState(() => [{ ...MINE, last: { when: "Tue", steps: SEED.ev.path.length } }, ...STARTERS]);
  const graphs = useMemo(() => Object.fromEntries(flows.map((f) => [f.key, graphOf(f)])), [flows]);
  const [runs, setRuns] = useState([SEED]);
  const [runKey, setRunKey] = useState(MINE.key);
  const [runN, setRunN] = useState(1);
  const [pathId, setPathId] = useState("seed");
  const [sheet, setSheet] = useState(null); // flow key for the ⋯ sheet
  const [asking, setAsking] = useState(undefined); // undefined: closed; null: a new flow; else a flow key
  const [toast, setToast] = useState(null);
  const [undo, setUndo] = useState(null);
  const [fresh, setFresh] = useState(null);
  const n = useRef(1);
  const tt = useRef(null);
  const say = (t, u = null) => {
    setToast(t); setUndo(() => u);
    clearTimeout(tt.current);
    tt.current = setTimeout(() => { setToast(null); setUndo(null); }, 4000);
  };
  const byKey = (k) => flows.find((f) => f.key === k);

  const run = (k) => { setRunKey(k); setRunN((x) => x + 1); setView("run"); };
  const duplicate = (k, quiet = false) => {
    const f = byKey(k);
    const base = f.title.replace(/ \((mine|copy)( \d+)?\)$/, "");
    const copies = flows.filter((x) => x.title.startsWith(`${base} (copy`)).length;
    const copy = { ...f, key: `${f.id}-copy-${n.current++}`, title: `${base} (copy${copies ? ` ${copies + 1}` : ""})`, mine: true, from: f.title, last: null };
    setFlows((fs) => [copy, ...fs]);
    setFresh(copy.key);
    onEvent({ myflows: "duplicate", from: f.title, title: copy.title });
    if (!quiet) say(`Copied. ${copy.title} is under Yours.`);
    return copy;
  };
  const share = async (k) => {
    const f = byKey(k);
    let url = null;
    try {
      const u = new URL(window.location.href);
      u.search = "";
      u.searchParams.set("yl", await encodeYL(linesOf(f)));
      u.searchParams.set("as", f.agent);
      url = u.toString();
      await navigator.clipboard.writeText(url);
      say("Link copied. It opens this flow, ready to run.");
    } catch {
      say(url ? "Link ready. Copy it from the wire log." : "Could not make a link here.");
    }
    onEvent({ myflows: "share", flow: f.title, ...(url ? { url } : {}) });
  };
  const remove = (k) => {
    const i = flows.findIndex((f) => f.key === k);
    const f = flows[i];
    setFlows((fs) => fs.filter((x) => x.key !== k));
    onEvent({ myflows: "delete", flow: f.title });
    say(`${f.title} deleted.`, () => {
      setFlows((fs) => (fs.some((x) => x.key === k) ? fs : [...fs.slice(0, i), f, ...fs.slice(i)]));
      onEvent({ myflows: "undo delete", flow: f.title });
      setToast(null); setUndo(null);
    });
  };
  const send = (ask) => {
    const k = asking;
    setAsking(undefined);
    if (k === null) {
      onEvent({ myflows: "new", ask, to: "Yui" });
      return say("Sent to Yui. The draft shows up here to try.");
    }
    let f = byKey(k);
    // A starter stays as it is: the agent edits a copy.
    if (!f.mine) f = duplicate(k, true);
    onEvent({ myflows: "edit", flow: f.title, ask, to: f.agent });
    say(`Sent to ${f.agent}. The new version of ${f.title} lands here.`);
  };
  const onSubmit = (ev) => {
    const f = byKey(runKey);
    const r = { id: `r${n.current++}`, flowKey: runKey, when: "just now", ev: { flow: ev.flow, path: ev.path } };
    onEvent({ id: f.id, preset: "flow", ...r.ev, saved: f.title });
    setRuns((rs) => [r, ...rs.map((x) => (x.when === "just now" ? { ...x, when: "earlier" } : x))].slice(0, 4));
    setFlows((fs) => fs.map((x) => (x.key === runKey ? { ...x, last: { when: "just now", steps: ev.path.length } } : x)));
    setPathId(r.id);
    setTimeout(() => setView("path"), 900);
  };

  const cur = byKey(runKey) || flows[0];
  const pr = runs.find((r) => r.id === pathId && byKey(r.flowKey)) || runs.find((r) => byKey(r.flowKey));
  const pf = pr && byKey(pr.flowKey);
  return (
    <div className="mf-app">
      {view === "run" ? <Run f={cur} g={graphs[cur.key]} runN={runN} onSubmit={onSubmit} go={setView} />
        : view === "path" ? <Path run={pf ? pr : null} f={pf} g={pf ? graphs[pf.key] : null} runs={runs.filter((r) => byKey(r.flowKey))} pickRun={setPathId} again={run} go={setView} flows={flows} />
        : <List flows={flows} graphs={graphs} run={run} more={setSheet} fresh={fresh} toast={toast} undo={undo} ask={setAsking} />}
      {sheet && byKey(sheet) && view === "list" ? <Actions f={byKey(sheet)} close={() => setSheet(null)} run={run} duplicate={duplicate} share={share} ask={setAsking} remove={remove} /> : null}
      {asking !== undefined && view === "list" ? <Ask f={asking ? byKey(asking) : null} close={() => setAsking(undefined)} send={send} /> : null}
    </div>
  );
}

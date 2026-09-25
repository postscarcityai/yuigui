"use client";
// The library (FLOW-2): a tile per preset, drawn live, and a card per flow with its Mermaid chart.
// Search runs in the browser over names, purposes, tags and the lines themselves.
import { useEffect, useMemo, useState } from "react";
import LivePhone from "../../mockups/LivePhone";
import MermaidGraph from "./MermaidGraph";
import { matches, playUrl } from "../../../lib/yl/library.mjs";

function Copy({ text, what }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch {}
  };
  return (
    <button type="button" className="btn ghost lib-btn" onClick={copy} aria-label={`Copy the ${what} lines`}>
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function PresetTile({ p, hidden }) {
  return (
    <article id={p.name} className="lib-tile" hidden={hidden}>
      <LivePhone yl={p.yl} agent="Yui" label={`${p.name}, drawn live from its Yui Lines`} />
      <div className="lib-body">
        <h3><code>{p.name}</code></h3>
        <p>{p.purpose}</p>
        <pre className="lib-yl"><code>{p.yl}</code></pre>
        <div className="lib-tags">{p.tags.map((t) => <span key={t} className="lib-tag">{t}</span>)}</div>
        <div className="lib-acts">
          <Copy text={p.yl} what={p.name} />
          <a className="btn lib-btn" href={playUrl(p.yl)}>Open in playground</a>
          <a className="lib-doc" href={`/yl#${p.doc}`}>Spec</a>
        </div>
      </div>
    </article>
  );
}

function FlowCard({ f, hidden }) {
  return (
    <article id={`flow-${f.name}`} className="lib-flow" hidden={hidden}>
      <div className="lib-flow-head">
        <h3>{f.title}</h3>
        <p>{f.purpose}</p>
        <pre className="lib-yl"><code>{f.yl}</code></pre>
        <div className="lib-acts">
          <a className="btn lib-btn" href={`/playground?demo=${f.demo}`}>Run it</a>
          <Copy text={f.yl} what={f.title} />
          <a className="lib-doc" href="/developers/flows">Flows spec</a>
        </div>
      </div>
      <MermaidGraph source={f.source} label={`${f.title}: the flow as a chart, one box per screen, arrows for where each answer leads`} />
      <details className="lib-src">
        <summary>The Mermaid</summary>
        <pre><code>{f.source}</code></pre>
      </details>
    </article>
  );
}

export default function Library({ presets, flows, shelves }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("screens");

  // ?q= and #flows survive a reload and can be shared.
  useEffect(() => {
    const u = new URL(window.location.href);
    if (u.searchParams.get("q")) setQ(u.searchParams.get("q"));
    if (u.hash === "#flows" || flows.some((f) => u.hash === `#flow-${f.name}`)) setTab("flows");
  }, [flows]);
  useEffect(() => {
    const u = new URL(window.location.href);
    if (q) u.searchParams.set("q", q); else u.searchParams.delete("q");
    window.history.replaceState(null, "", u);
  }, [q]);

  const shownP = useMemo(() => new Set(presets.filter((p) => matches(p, q)).map((p) => p.name)), [presets, q]);
  const shownF = useMemo(() => new Set(flows.filter((f) => matches(f, q)).map((f) => f.name)), [flows, q]);

  return (
    <div className="lib">
      <div className="lib-bar">
        <label className="lib-search">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: intake, photo, timer, chart..." aria-label="Search the library" />
        </label>
        <div className="lib-tabs" role="tablist" aria-label="What to browse">
          <button type="button" role="tab" aria-selected={tab === "screens"} onClick={() => setTab("screens")}>Screens <span>{shownP.size}</span></button>
          <button type="button" role="tab" aria-selected={tab === "flows"} onClick={() => setTab("flows")}>Flows <span>{shownF.size}</span></button>
        </div>
      </div>

      <div role="tabpanel" hidden={tab !== "screens"}>
        {shownP.size === 0 ? <p className="lib-none">No screen matches &ldquo;{q}&rdquo;. {shownF.size ? <button type="button" className="lib-link" onClick={() => setTab("flows")}>{shownF.size} flow{shownF.size > 1 ? "s" : ""} do</button> : "Try fewer words."}</p> : null}
        {shelves.map(([key, title]) => {
          const list = presets.filter((p) => p.shelf === key);
          const n = list.filter((p) => shownP.has(p.name)).length;
          return (
            <section key={key} className="lib-shelf" hidden={n === 0}>
              <h2>{title}</h2>
              <div className="lib-grid">
                {list.map((p) => <PresetTile key={p.name} p={p} hidden={!shownP.has(p.name)} />)}
              </div>
            </section>
          );
        })}
      </div>

      <div role="tabpanel" hidden={tab !== "flows"} id="flows">
        {shownF.size === 0 ? <p className="lib-none">No flow matches &ldquo;{q}&rdquo;. {shownP.size ? <button type="button" className="lib-link" onClick={() => setTab("screens")}>{shownP.size} screen{shownP.size > 1 ? "s" : ""} do</button> : "Try fewer words."}</p> : null}
        {flows.map((f) => <FlowCard key={f.name} f={f} hidden={!shownF.has(f.name)} />)}
      </div>
    </div>
  );
}

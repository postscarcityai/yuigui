"use client";

// The yuicss gallery (YUI-342): every token, element, utility and component,
// drawn by the real stylesheet in three agent looks, light and dark. It is the
// visual contract the app is checked against. Each frame is a `.yuicss` root
// with the look's variables inline, exactly what the app's web view will set.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { lookWords, motionLook } from "../../lib/yl/motion.mjs";
import { GALLERY_LOOKS, lookOf, palette, tokens, vars } from "../../lib/yuicss/theme.mjs";
import { SECTIONS, classesUsed } from "./examples.mjs";
import contract from "../../lib/yuicss/classes.json";

const NAMES = { yui: "Yui", coach: "Coach", zen: "Zen" };
const MODES = [["both", "Both"], ["light", "Light"], ["dark", "Dark"]];

// The frames inside the gallery (the token swatches use these; everything else is yuicss itself).
const FRAME_CSS = `
.yuicss .yg-tokens { display: grid; gap: 20px; }
.yuicss .yg-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.yuicss .yg-swatch { border-radius: 14px; padding: 10px; min-height: 76px; display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; font-size: 12px; font-weight: 700; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
.yuicss .yg-swatch small { font-weight: 500; opacity: .75; font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: inherit; }
.yuicss .yg-ramp { display: flex; border-radius: 14px; overflow: hidden; height: 56px; }
.yuicss .yg-ramp span { flex: 1; display: grid; place-items: end center; padding-bottom: 6px; font: 700 11px ui-monospace, Menlo, monospace; }
.yuicss .yg-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
.yuicss .yg-type { display: flex; flex-direction: column; gap: 6px; }
.yuicss .yg-type > div { display: flex; align-items: baseline; gap: 14px; }
.yuicss .yg-type code { font-size: 12px; color: var(--muted); min-width: 92px; background: none; padding: 0; }
.yuicss .yg-space { display: flex; flex-direction: column; gap: 6px; }
.yuicss .yg-space > div { display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--muted); font-family: ui-monospace, Menlo, monospace; }
.yuicss .yg-space i { display: block; height: 14px; background: var(--accent); border-radius: 4px; }
.yuicss .yg-note { font-size: 14px; color: var(--muted); margin-top: 6px; }
`;

// One stylesheet object, fetched once, shared by every frame (adoptedStyleSheets);
// a browser without it gets a <link> in each frame instead.
let sheetPromise = null;
function yuicssSheet() {
  if (!sheetPromise) {
    sheetPromise = (typeof CSSStyleSheet !== "undefined" && "replaceSync" in CSSStyleSheet.prototype)
      ? fetch("/yuicss/yuicss.css").then((r) => r.text()).then((t) => { const s = new CSSStyleSheet(); s.replaceSync(t); return s; }).catch(() => null)
      : Promise.resolve(null);
  }
  return sheetPromise;
}

// A frame is a shadow root: the page's own CSS cannot reach in and yuicss cannot leak out,
// which is exactly the app's web view. Inside it, the look's variables sit on the .yuicss root.
function Frame({ look, mode, html, children, replay }) {
  const [root, setRoot] = useState(null);
  const [adopted, setAdopted] = useState(false);
  const style = useMemo(() => vars(look, mode), [look, mode]);
  const attach = (host) => {
    if (!host || host.shadowRoot) return;
    const r = host.attachShadow({ mode: "open" });
    setRoot(r);
    yuicssSheet().then((s) => { if (s) { r.adoptedStyleSheets = [s]; setAdopted(true); } });
  };
  return (
    <div className="yg-frame" ref={attach}>
      {root ? createPortal(
        <>
          {adopted ? null : <link rel="stylesheet" href="/yuicss/yuicss.css" />}
          <style>{FRAME_CSS}</style>
          {html !== undefined
            ? <div key={replay} className={`yuicss ${mode} screen`} style={style} dangerouslySetInnerHTML={{ __html: html }} />
            : <div key={replay} className={`yuicss ${mode} screen`} style={style}>{children}</div>}
        </>, root) : null}
    </div>
  );
}

function Example({ ex, look, modes, markup }) {
  return (
    <div className="yg-ex" id={ex.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}>
      <h3>{ex.title}</h3>
      {ex.line ? <p>{ex.line}</p> : null}
      <div className="yg-pair">{modes.map((m) => <Frame key={m} look={look} mode={m} html={ex.html} />)}</div>
      {markup ? <details className="yg-markup"><summary>Markup</summary><pre>{ex.html}</pre></details> : null}
    </div>
  );
}

const SWATCHES = [
  ["paper", "--paper", "--ink"], ["surface", "--surface", "--ink"], ["ink", "--ink", "--paper"], ["muted", "--muted", "--paper"], ["line", "--line", "--ink"],
  ["accent", "--accent", "--accent-ink"], ["accent-ink", "--accent-ink", "--accent"], ["accent-text", "--accent-text", "--paper"],
  ["good", "--good", "--good-ink"], ["good-text", "--good-text", "--paper"], ["good-soft", "--good-soft", "--ink"],
  ["warn", "--warn", "--warn-ink"], ["warn-text", "--warn-text", "--paper"], ["warn-soft", "--warn-soft", "--ink"],
  ["bad", "--bad", "--bad-ink"], ["bad-text", "--bad-text", "--paper"], ["bad-soft", "--bad-soft", "--ink"],
];
const RAMP = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

function Tokens({ look, mode, replay, onReplay }) {
  const v = vars(look, mode);
  const pal = palette(look, mode);
  const m = motionLook(look);
  const hexOf = (name) => {
    const k = name.replace(/^--/, "");
    if (k.startsWith("accent-") && /^\d/.test(k.slice(7))) return pal.ramp[k.slice(7)];
    const map = { paper: pal.paper, surface: pal.surface, ink: pal.ink, muted: pal.muted, line: pal.line, accent: pal.accent, "accent-ink": pal.accentInk, "accent-text": pal.accentText };
    if (map[k]) return map[k];
    const [n, part] = k.split("-");
    return pal[n]?.[part || "fill"] || "";
  };
  return (
    <Frame look={look} mode={mode}>
      <div className="yg-tokens">
        <div>
          <h3>Color</h3>
          <div className="yg-swatches">
            {SWATCHES.map(([name, bg, fg]) => (
              <div key={name} className="yg-swatch" style={{ background: `var(${bg})`, color: `var(${fg})` }}>{name}<small>{hexOf(bg)}</small></div>
            ))}
          </div>
        </div>
        <div>
          <h3>Accent ramp</h3>
          <div className="yg-ramp">
            {RAMP.map((k) => <span key={k} style={{ background: `var(--accent-${k})`, color: Number(k) <= 300 ? "var(--ink)" : Number(k) <= 500 ? "var(--accent-ink)" : "var(--paper)" }}>{k}</span>)}
          </div>
          <p className="yg-note">50 to 300 carry ink. 500 is the accent and carries accent-ink. 600 to 900 are for bars, rings and lines.</p>
        </div>
        <div>
          <h3>Type</h3>
          <p className="yg-note">{v["--font"].split(",")[0].replace(/"/g, "")} · headings at {v["--weight-heading"]}</p>
          <div className="yg-type">
            {Object.entries(tokens.type.scale).map(([k, px]) => (
              <div key={k}><code>text-{k} {px}px</code><span style={{ fontSize: `var(--text-${k})`, fontWeight: Number(k.replace(/\D/g, "") || (k === "xl" || k === "lg" ? 1 : 0)) || k === "xl" || k === "lg" ? "var(--weight-heading)" : "var(--weight-body)", lineHeight: 1.1 }}>Plan tomorrow</span></div>
            ))}
          </div>
        </div>
        <div>
          <h3>Space</h3>
          <div className="yg-space">
            {Object.entries(tokens.space.scale).filter(([k]) => k !== "0" && k !== "px").map(([k, px]) => (
              <div key={k}><span style={{ minWidth: 60 }}>{k} · {px}px</span><i style={{ width: px }} /></div>
            ))}
          </div>
          <p className="yg-note">Default gap {tokens.space.gap}px, screen padding {tokens.space.pad}px, controls {tokens.space.control}px tall.</p>
        </div>
        <div>
          <h3>Shape</h3>
          <div className="yg-row">
            <div className="bg-accent-200 size-20 rounded" />
            <div className="bg-accent-200 size-20 rounded-control" />
            <div className="bg-surface size-20 rounded shadow-soft" />
            <div className="bg-surface size-20 rounded shadow-lift" />
            <button className="sm">Control</button>
          </div>
          <p className="yg-note">radius {v["--radius"]} ({look.radius}) · controls {v["--radius-control"]} · shadow soft, lift</p>
        </div>
        <div>
          <h3>Motion</h3>
          <p className="yg-note">{look.motion}: {lookWords(m)}. Enter {v["--mo-enter"]}, stagger {v["--mo-stagger"]}, breath {v["--mo-breath"]}.</p>
          <div key={replay} className="stagger col gap-2">
            <div className="card"><p className="bold">First</p></div>
            <div className="card"><p className="bold">Second, one stagger later</p></div>
            <div className="card"><p className="bold">Third</p></div>
          </div>
          <button className="sm ghost" onClick={onReplay} style={{ marginTop: 10 }}>Replay</button>
        </div>
      </div>
    </Frame>
  );
}

export default function Gallery() {
  const [name, setName] = useState("yui");
  const [mode, setMode] = useState("both");
  const [markup, setMarkup] = useState(false);
  const [replay, setReplay] = useState(0);
  const look = useMemo(() => lookOf(name), [name]);
  const modes = mode === "both" ? ["light", "dark"] : [mode];

  // On a phone, one mode at a time (the site's), so the page is half as long.
  useEffect(() => {
    if (window.innerWidth < 700) setMode(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const used = classesUsed();
  return (
    <>
      <div className="yg-bar">
        <div className="yg-looks" role="group" aria-label="Agent look">
          {GALLERY_LOOKS.map((n) => (
            <button key={n} aria-pressed={n === name} onClick={() => setName(n)}>
              <span className="dot" style={{ "--c": lookOf(n).light.accent }} />{NAMES[n]}
            </button>
          ))}
        </div>
        <div className="yg-modes" role="group" aria-label="Light or dark">
          {MODES.map(([k, label]) => <button key={k} aria-pressed={mode === k} onClick={() => setMode(k)}>{label}</button>)}
        </div>
        <label className="yg-switch"><input type="checkbox" checked={markup} onChange={(e) => setMarkup(e.target.checked)} />Show markup</label>
      </div>

      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className="yg-section">
          <h2>{s.title}</h2>
          <p>{s.line}</p>
          {s.tokens ? (
            <div className="yg-pair">{modes.map((m) => <Tokens key={m} look={look} mode={m} replay={replay} onReplay={() => setReplay((r) => r + 1)} />)}</div>
          ) : s.examples.map((ex) => <Example key={ex.title} ex={ex} look={look} modes={modes} markup={markup} />)}
        </section>
      ))}

      <section id="contract" className="yg-section">
        <h2>The contract</h2>
        <p>One stylesheet, generated from tokens.json. The app bundles it; the renderer and the channel guide use these names and no others.</p>
        <div className="yg-contract">
          <div className="card"><b>{contract.elements.length}</b>elements styled with no class</div>
          <div className="card"><b>{contract.classes.length}</b>classes: utilities and components</div>
          <div className="card"><b>{used.length}</b>classes this gallery uses, all of them real</div>
          <div className="card"><b>{Math.round(contract.bytes / 1024)} KB</b>raw, about {Math.round(contract.bytes / 1024 / 5.4)} KB gzipped</div>
        </div>
        <p>
          <a href="/yuicss/yuicss.css">yuicss.css</a> · <a href="https://github.com/postscarcityai/yuigui/blob/main/site/lib/yuicss/tokens.json">tokens.json</a> · <a href="https://github.com/postscarcityai/yuigui/tree/main/site/lib/yuicss">source</a> · <a href="/developers/yuicss">how it fits together</a> · <a href="https://github.com/postscarcityai/yuigui/blob/main/docs/specs/yl-screens-yuicss.md">the plan</a>
        </p>
        <details className="yg-markup"><summary>Every class name</summary><div className="yg-classes">{contract.classes.map((c) => <div key={c}>{c}</div>)}</div></details>
      </section>
    </>
  );
}

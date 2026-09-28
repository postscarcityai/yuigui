// Preview images for share links (SITE-19): 1200x630, the Yui Lines on the left and the
// screen they draw on the right. Rendered by next/og (satori), so only flexbox and inline styles.
// `screen` is a captured phone screen (data URL, see scripts/capture-og.py); without one we
// draw a simple version of the screen from the parsed lines.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { apply, initialState, parse } from "../yl/yl.mjs";

export const OG_SIZE = { width: 1200, height: 630 };
export const eyebrowOf = (it) => (it?.video ? `A ${Math.round((it.video["9x16"] || it.video["16x9"]).seconds)} SECOND VIDEO` : it?.preset ? `THE ${it.preset.toUpperCase()} SCREEN` : it?.planned ? "PLANNED, NOT BUILT YET" : "MADE WITH YUI LINES");

const C = { bg: "#FFF9F0", ink: "#3A3340", soft: "#8C8294", brand: "#FF7E8A", plum: "#231D33", plum2: "#2F2842", code: "#F6EEF7", lav: "#D9CCF7", mint: "#BDEBD6", butter: "#FFE8A3", link: "#C23B4F" };

// Read once per process and shared by every image it draws.
let fonts;
export function ogFonts() {
  fonts ??= (async () => {
    const dir = join(process.cwd(), "lib/og/fonts");
    const [b, x, m] = await Promise.all(["nunito-latin-700-normal.ttf", "nunito-latin-800-normal.ttf", "jetbrains-mono-latin-500-normal.ttf"].map((f) => readFile(join(dir, f))));
    return [
      { name: "Nunito", data: b, weight: 700, style: "normal" },
      { name: "Nunito", data: x, weight: 800, style: "normal" },
      { name: "Mono", data: m, weight: 500, style: "normal" },
    ];
  })();
  return fonts;
}

export async function screenDataUrl(id) {
  try {
    const buf = await readFile(join(process.cwd(), "public/og/screens", `${id}.jpg`));
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function Lines({ yl, max }) {
  const all = (yl || "").split("\n").filter((l) => l.trim());
  const shown = all.slice(0, all.length > max ? max - 1 : max);
  const small = all.length > 3;
  return (
    <div style={{ display: "flex", flexDirection: "column", background: C.plum, borderRadius: 24, padding: "22px 26px", marginTop: 26, width: 640 }}>
      <div style={{ display: "flex", color: C.brand, fontFamily: "Nunito", fontWeight: 800, fontSize: 17, letterSpacing: 1.5, marginBottom: 10 }}>
        {all.length === 1 ? "ONE LINE FROM YOUR AGENT" : `${all.length} LINES FROM YOUR AGENT`}
      </div>
      {shown.map((l, i) => (
        <div key={i} style={{ display: "flex", color: C.code, fontFamily: "Mono", fontSize: small ? 18 : 24, lineHeight: 1.45, whiteSpace: "nowrap", overflow: "hidden" }}>{clip(l, small ? 50 : 38)}</div>
      ))}
      {all.length > shown.length ? <div style={{ display: "flex", color: C.soft, fontFamily: "Mono", fontSize: 18, lineHeight: 1.45 }}>{`+${all.length - shown.length} more`}</div> : null}
    </div>
  );
}

// A plain drawing of what the lines put on screen, for links whose screen we have not captured.
function nodesOf(yl) {
  let s = initialState();
  try { for (const op of parse(yl || "")) s = apply(s, op); } catch { /* draw what parsed */ }
  const focus = s.focus === "full" ? "1" : s.focus;
  return [...(s.screens[focus] || []), ...Object.values(s.screens).flat().filter((n) => n.stage && !(s.screens[focus] || []).includes(n))];
}

const chip = (t, i, on) => (
  <div key={i} style={{ display: "flex", padding: "6px 12px", borderRadius: 16, background: on ? C.brand : C.plum2, color: on ? C.plum : C.code, fontSize: 15, marginRight: 6, marginBottom: 6 }}>{clip(String(t), 16)}</div>
);

function Node({ n }) {
  const p = n.props || {};
  const head = p.title || p.label || p.q || p.prompt || p.caption || null;
  const box = { display: "flex", flexDirection: "column", flexShrink: 0, background: C.plum2, borderRadius: 18, padding: "12px 14px", marginBottom: 10, color: C.code, fontFamily: "Nunito", fontWeight: 700, fontSize: 16 };
  if (n.preset === "say") return <div style={{ ...box, background: "#352D4A", borderRadius: 20 }}>{clip(p.text || "", 70)}</div>;
  if (n.preset === "timer") {
    const mm = (x) => `${Math.floor((x || 0) / 60)}:${String((x || 0) % 60).padStart(2, "0")}`;
    return (
      <div style={{ ...box, alignItems: "center", padding: "20px 14px" }}>
        <div style={{ display: "flex", color: C.soft, fontSize: 15 }}>{p.label || "Timer"}</div>
        <div style={{ display: "flex", fontSize: 54, fontWeight: 800, color: C.brand }}>{mm(p.work || p.seconds || p.total || 60)}</div>
        {p.rounds ? <div style={{ display: "flex", color: C.soft, fontSize: 15 }}>{`Round 1/${p.rounds}`}</div> : null}
      </div>
    );
  }
  if (n.preset === "stat") {
    return (
      <div style={box}>
        <div style={{ display: "flex", color: C.soft, fontSize: 15 }}>{p.label || ""}</div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>{`${p.value ?? ""}${p.unit ? ` ${p.unit}` : ""}`}</div>
      </div>
    );
  }
  if (n.preset === "slide") {
    return (
      <div style={box}>
        <div style={{ display: "flex", marginBottom: 12 }}>{clip(String(head || ""), 60)}</div>
        <div style={{ display: "flex", height: 6, borderRadius: 3, background: "#4a4160" }}>
          <div style={{ display: "flex", width: "50%", height: 6, borderRadius: 3, background: C.brand }} />
        </div>
      </div>
    );
  }
  // Page previews (SITE-85) draw timelines, lists and cards with their words, not just a heading.
  if (n.preset === "timeline") return <div style={{ display: "flex", color: C.soft, fontFamily: "Nunito", fontWeight: 800, fontSize: 15, margin: "4px 4px 8px" }}>{clip(String(head || ""), 34)}</div>;
  if (n.preset === "done" || n.preset === "now" || n.preset === "next") {
    const dot = { done: C.mint, now: C.brand, next: "transparent" }[n.preset];
    return (
      <div style={{ ...box, flexDirection: "row", alignItems: "center", marginBottom: 6, padding: "10px 12px", border: n.preset === "now" ? `2px solid ${C.brand}` : "2px solid transparent" }}>
        <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: dot, border: `2px solid ${n.preset === "next" ? C.soft : dot}`, marginRight: 10, flexShrink: 0 }} />
        <div style={{ display: "flex", flexGrow: 1 }}>{clip(String(p.text || ""), 26)}</div>
        {p.at || p.tag ? <div style={{ display: "flex", color: C.soft, fontSize: 13, marginLeft: 6 }}>{clip(String(p.at || p.tag), 10)}</div> : null}
      </div>
    );
  }
  if (n.preset === "list") {
    const items = (p.items || []).filter((x) => typeof x === "string").slice(0, 5);
    return (
      <div style={box}>
        {p.title ? <div style={{ display: "flex", marginBottom: 6 }}>{clip(String(p.title), 30)}</div> : null}
        {items.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginTop: 5, fontSize: 15 }}>
            <div style={{ display: "flex", width: 20, height: 20, borderRadius: p.check ? 6 : 10, border: p.check ? `2px solid ${C.soft}` : "none", background: p.check ? "transparent" : C.lav, color: C.plum, fontSize: 12, fontWeight: 800, alignItems: "center", justifyContent: "center", marginRight: 9 }}>{p.check ? "" : String(i + 1)}</div>
            <div style={{ display: "flex" }}>{clip(t, 28)}</div>
          </div>
        ))}
      </div>
    );
  }
  if (n.preset === "table" && p.cols?.length) {
    const cell = (t, j, bold) => <div key={j} style={{ display: "flex", flex: 1, fontSize: 14, fontWeight: bold ? 800 : 700, color: bold ? C.soft : C.code }}>{clip(String(t), 10)}</div>;
    return (
      <div style={box}>
        {p.title || p.name ? <div style={{ display: "flex", marginBottom: 6 }}>{clip(String(p.title || p.name), 30)}</div> : null}
        <div style={{ display: "flex" }}>{p.cols.slice(0, 3).map((t, j) => cell(t, j, true))}</div>
        {(p.rows || []).slice(0, 4).map((r, i) => <div key={i} style={{ display: "flex", marginTop: 5 }}>{[].concat(r).slice(0, 3).map((t, j) => cell(t, j))}</div>)}
      </div>
    );
  }
  if (n.preset === "card") {
    return (
      <div style={box}>
        {p.tag ? <div style={{ display: "flex", alignSelf: "flex-start", padding: "2px 8px", borderRadius: 8, background: C.butter, color: C.plum, fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{clip(String(p.tag), 16)}</div> : null}
        <div style={{ display: "flex", fontSize: 18, fontWeight: 800 }}>{clip(String(p.title || ""), 40)}</div>
        {p.sub ? <div style={{ display: "flex", color: C.soft, fontSize: 14, marginTop: 2 }}>{clip(String(p.sub), 40)}</div> : null}
        {p.body ? <div style={{ display: "flex", marginTop: 6, fontSize: 15, lineHeight: 1.3 }}>{clip(String(p.body), 80)}</div> : null}
        {p.cta ? <div style={{ display: "flex", marginTop: 10, padding: "8px 12px", borderRadius: 14, background: C.brand, color: C.plum, justifyContent: "center" }}>{p.cta}</div> : null}
      </div>
    );
  }
  const opts = p.options || p.items?.filter((x) => typeof x === "string" && !x.startsWith("/")) || (p.fields || []).map((f) => f.key);
  return (
    <div style={box}>
      {head ? <div style={{ display: "flex", marginBottom: opts?.length ? 8 : 0 }}>{clip(String(head), 60)}</div> : <div style={{ display: "flex", color: C.soft }}>{n.preset}</div>}
      {p.title && p.body ? <div style={{ display: "flex", fontSize: 14, marginTop: -4, marginBottom: 6, lineHeight: 1.3 }}>{clip(String(p.body), 70)}</div> : null}
      {p.title && p.q ? <div style={{ display: "flex", color: C.soft, fontSize: 14, marginBottom: 8 }}>{clip(String(p.q), 44)}</div> : null}
      {opts?.length ? <div style={{ display: "flex", flexWrap: "wrap" }}>{opts.slice(0, 5).map((t, i) => chip(t, i, i === 0 && n.preset === "choose"))}</div> : null}
      {p.submit || p.cta ? <div style={{ display: "flex", marginTop: 6, padding: "8px 12px", borderRadius: 14, background: C.brand, color: C.plum, justifyContent: "center" }}>{p.submit || p.cta}</div> : null}
    </div>
  );
}

function Drawn({ yl, agent }) {
  const nodes = nodesOf(yl).slice(0, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#0f1019", padding: "46px 14px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", width: 30, height: 30, borderRadius: 12, background: C.brand, color: C.plum, alignItems: "center", justifyContent: "center", fontFamily: "Nunito", fontWeight: 800, fontSize: 16, marginRight: 10 }}>{(agent || "Y")[0]}</div>
        <div style={{ display: "flex", color: C.code, fontFamily: "Nunito", fontWeight: 800, fontSize: 17 }}>{agent || "Yui"}</div>
      </div>
      {nodes.map((n, i) => <Node key={i} n={n} />)}
    </div>
  );
}

// title: the headline; yl: the lines; screen: data URL of the captured screen, or null.
export function OgCard({ title, yl, screen, agent, what, eyebrow = "MADE WITH YUI LINES" }) {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: C.bg, fontFamily: "Nunito", position: "relative" }}>
      <div style={{ display: "flex", position: "absolute", right: -120, top: -160, width: 620, height: 620, borderRadius: 310, background: "#FFE3E6" }} />
      <div style={{ display: "flex", position: "absolute", left: -140, bottom: -220, width: 520, height: 520, borderRadius: 260, background: "#EDE6FB" }} />
      <div style={{ display: "flex", flexDirection: "column", padding: "54px 0 0 64px", width: 760 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", color: C.brand, fontWeight: 800, fontSize: 40, marginRight: 16 }}>Yui</div>
          <div style={{ display: "flex", color: C.link, fontWeight: 800, fontSize: 17, letterSpacing: 2 }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", color: C.ink, fontWeight: 800, fontSize: title.length > 26 ? 44 : 54, lineHeight: 1.1, marginTop: 14, maxWidth: 650 }}>{clip(title, 64)}</div>
        {yl ? <Lines yl={yl} max={title.length > 26 ? 5 : 7} /> : what ? <div style={{ display: "flex", color: C.ink, fontWeight: 700, fontSize: 28, lineHeight: 1.35, marginTop: 22, maxWidth: 620 }}>{clip(what, 170)}</div> : null}
        <div style={{ display: "flex", position: "absolute", left: 64, bottom: 30, color: C.soft, fontWeight: 700, fontSize: 22 }}>yuigui.com</div>
      </div>
      <div style={{ display: "flex", position: "absolute", right: 70, top: 36, width: 292, height: 594, borderRadius: 46, background: "#050509", padding: 11, boxShadow: "0 30px 60px rgba(58,51,64,.35)" }}>
        <div style={{ display: "flex", width: 270, height: 572, borderRadius: 36, overflow: "hidden", background: "#0f1019" }}>
          {screen ? <img src={screen} width={270} height={572} style={{ objectFit: "cover", objectPosition: "top" }} /> : <Drawn yl={yl} agent={agent} />}
        </div>
      </div>
    </div>
  );
}

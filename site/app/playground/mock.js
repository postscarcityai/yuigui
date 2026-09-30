"use client";

// mock (DRAW-1): recreate a UI from parts. A frame (phone, window, watch,
// browser) holds nav, content, tabs and sheets built from `part` lines, with
// sketch's marks (+hi, +x, +dim) and note= callouts. Drawn from the lines in
// the agent's own look; nothing to tap, nothing sent.
import { resolve } from "../../lib/yl/yl.mjs";

const FRAMES = ["phone", "window", "watch", "browser"];
const OVERLAY = new Set(["sheet", "alert", "keyboard"]);

// nav first, tabs after the content, sheets, alerts and keyboards last,
// whatever the order of the lines; every part keeps its note.
export function partsOf(members) {
  const parts = members.filter((m) => m.preset === "part").map((m) => resolve("part", m.props));
  const at = (k) => parts.filter((q) => q.kind === k);
  const rest = parts.filter((q) => q.kind !== "nav" && q.kind !== "tabs" && !OVERLAY.has(q.kind));
  return [...at("nav").slice(0, 1), ...rest, ...at("tabs").slice(0, 1), ...parts.filter((q) => OVERLAY.has(q.kind))];
}

const pickTab = (items, tab) => {
  if (typeof tab === "number") return tab - 1;
  const i = items.findIndex((x) => String(x).toLowerCase() === String(tab ?? "").toLowerCase());
  return i;
};

function Part({ p }) {
  const items = p.items;
  switch (p.kind) {
    case "nav": return (
      <div className="mk-nav">
        <span className="mk-navl">{p.back ? `‹ ${p.back === true ? "" : p.back}` : ""}</span>
        <b>{p.text}</b>
        <span className="mk-navr">{p.action || ""}</span>
      </div>
    );
    case "tabs": {
      const on = pickTab(items, p.tab);
      return (
        <div className="mk-tabs">
          {items.map((t, i) => <span key={i} className={i === on ? "on" : ""}><i />{t}</span>)}
        </div>
      );
    }
    case "row": return (
      <div className="mk-row">
        {p.icon ? <span className="mk-ico">{p.icon}</span> : null}
        <span className="mk-rt"><b>{p.text}</b>{p.sub ? <small>{p.sub}</small> : null}</span>
        {p.value ? <span className="mk-val">{p.value}</span> : null}
        {p.chev ? <span className="mk-chev">›</span> : null}
      </div>
    );
    case "field": return (
      <label className="mk-field">
        {p.text ? <small>{p.text}</small> : null}
        <span className={p.value ? "" : "ph"}>{p.value || p.ph || " "}</span>
      </label>
    );
    case "button": return <div className={`mk-btn ${p.ghost ? "ghost" : ""}`}><span>{p.text}</span></div>;
    case "toggle": return <div className="mk-toggle"><span>{p.text}</span><i className={p.on ? "on" : ""} /></div>;
    case "slider": return (
      <div className="mk-slider">
        {p.text ? <span>{p.text}</span> : null}
        <i><b style={{ width: `${Math.round(Math.min(1, Math.max(0, Number(p.value ?? 0.5))) * 100)}%` }} /></i>
      </div>
    );
    case "segmented": {
      const on = pickTab(items, p.tab);
      return <div className="mk-seg">{items.map((t, i) => <span key={i} className={i === on ? "on" : ""}>{t}</span>)}</div>;
    }
    case "card": return (
      <div className="mk-card">
        <b>{p.text}</b>
        {p.sub ? <small>{p.sub}</small> : null}
        {p.body ? <span>{p.body}</span> : null}
      </div>
    );
    case "image": return <div className="mk-img" style={{ aspectRatio: String(p.ratio || "16:9").replace(":", " / ") }}><span>{p.text}</span></div>;
    case "avatar": return <div className="mk-avatar"><span>{String(p.text || "").slice(0, 2)}</span></div>;
    case "grid": {
      const cols = Math.min(6, Math.max(1, Number(p.cols) || 3));
      const cells = items.length ? items : Array.from({ length: cols * 2 }, () => "");
      return <div className="mk-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{cells.map((c, i) => <span key={i}>{c}</span>)}</div>;
    }
    case "divider": return <hr className="mk-hr" />;
    case "space": return <div className="mk-space" />;
    case "sheet": return (
      <div className="mk-sheet">
        <i className="mk-grab" />
        {p.text ? <b>{p.text}</b> : null}
        {items.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    );
    case "alert": return (
      <div className="mk-alert">
        <b>{p.text}</b>
        {p.body ? <small>{p.body}</small> : null}
        <div>{items.map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>
    );
    case "keyboard": return (
      <div className="mk-kbd" aria-hidden="true">
        {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((r) => <div key={r}>{[...r].map((k) => <i key={k} />)}</div>)}
        <div><i className="wide" /><i className="space" /><i className="wide" /></div>
      </div>
    );
    default: return <div className={`mk-text ${p.size || ""}`}>{p.text}</div>;
  }
}

function Body({ p, parts }) {
  const notes = parts.some((q) => q.note);
  const n = parts.length;
  const frame = FRAMES.includes(p.frame) ? p.frame : "phone";
  return (
    <figure className={`yl-mkside ${notes ? "mk-notes" : ""}`}>
      <div className={`mk-wrap mk-${frame}`}>
        <div className="mk-box" style={{ gridRow: `1 / ${n + 3}` }} aria-hidden="true" />
        <div className="mk-bar" style={{ gridRow: 1 }}>
          {frame === "window" || frame === "browser" ? <span className="mk-dots" aria-hidden="true"><i /><i /><i /></span> : null}
          {frame === "phone" ? <span className="mk-notch" aria-hidden="true" /> : null}
          {frame === "browser" ? <span className="mk-url">{p.url || p.title || ""}</span> : p.title && frame !== "watch" && !parts.some((q) => q.kind === "nav") ? <span className="mk-ttl">{p.title}</span> : null}
        </div>
        {parts.map((q, i) => {
          const cls = ["mk-cell", `k-${q.kind}`, q.hi && "mk-hi", q.x && "mk-x", q.dim && "mk-dim"].filter(Boolean).join(" ");
          return (
            <div key={i} className={cls} style={{ gridRow: i + 2 }}>
              <Part p={q} />
              {q.x ? <span className="yl-sr"> (crossed out)</span> : q.hi ? <span className="yl-sr"> (highlighted)</span> : null}
            </div>
          );
        })}
        {parts.map((q, i) => (q.note ? (
          <div key={`n${i}`} className="mk-note" style={{ gridRow: i + 2 }}>
            <svg viewBox="0 0 24 12" aria-hidden="true"><path d="M23 6H3M7 2 3 6l4 4" /></svg>
            <span>{q.note}</span>
          </div>
        ) : null))}
        <div className="mk-foot" style={{ gridRow: n + 2 }} aria-hidden="true" />
      </div>
    </figure>
  );
}

export function Mock({ g }) {
  const p = resolve("mock", g.group.props);
  return (
    <div className="yl-block yl-mock">
      {p.frame === "watch" && p.title ? <div className="mk-top">{p.title}</div> : null}
      <Body p={p} parts={partsOf(g.members.filter((m) => !m.group))} />
    </div>
  );
}

// A part outside a mock is a one-part mock.
export function LonePart({ p }) {
  return <Mock g={{ group: { props: {} }, members: [{ preset: "part", props: p }] }} />;
}

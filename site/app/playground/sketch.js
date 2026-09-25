"use client";

// sketch (YUI-83): a small drawn picture. A frame (window, phone or chat
// bubble) with rows inside, some struck out (+x), highlighted (+hi) or
// greyed (+dim), +button rows drawn as buttons, a blank row as a filler bar,
// and a note= callout beside the frame with an arrow to its row. One `after`
// line splits it into a before|after pair of the same frame. Sends nothing.
import { resolve } from "../../lib/yl/yl.mjs";

const FRAMES = ["window", "phone", "bubble"];

function Row({ p, i }) {
  const text = p.text ? (
    p.x ? <s>{p.text}</s> : p.hi ? <mark>{p.text}</mark> : <span>{p.text}</span>
  ) : null;
  const cls = ["yl-skrow", p.x && "sk-x", p.hi && "sk-hi", p.dim && "sk-dim", p.button && "sk-btn", !p.text && "sk-blank"].filter(Boolean).join(" ");
  // Blank rows get a width that varies with their place, so filler reads as text.
  const style = p.text ? undefined : { width: `${[82, 64, 74, 56][i % 4]}%` };
  return (
    <div className={cls}>
      {p.button ? <span className="yl-skbtn">{text}</span> : text || <span className="yl-skfill" style={style} />}
      {p.x ? <span className="yl-sr"> (crossed out)</span> : p.hi ? <span className="yl-sr"> (highlighted)</span> : null}
    </div>
  );
}

function Side({ frame, title, label, rows }) {
  const notes = rows.some((r) => r.note);
  const n = rows.length;
  // Grid: row 1 is the frame's bar (or the bubble's title), then one grid row
  // per sketch row, then the frame's bottom edge. The box sits behind them in
  // column 1; notes take column 2 on the same grid row as their row.
  return (
    <figure className={`yl-skside ${notes ? "sk-notes" : ""}`}>
      {label ? <figcaption className="yl-sklabel">{label}</figcaption> : null}
      <div className={`yl-skgrid sk-${frame}`}>
        <div className="yl-skbox" style={{ gridRow: `${frame === "bubble" && !title ? 2 : 1} / ${n + 3}` }} aria-hidden="true" />
        <div className="yl-skhead" style={{ gridRow: 1 }}>
          {frame === "window" ? <span className="yl-skdots" aria-hidden="true"><i /><i /><i /></span> : null}
          {frame === "phone" ? <span className="yl-sknotch" aria-hidden="true" /> : null}
          {title ? <span className="yl-sktitle">{title}</span> : null}
        </div>
        {rows.map((p, i) => (
          <div key={i} className="yl-skcell" style={{ gridRow: i + 2 }}><Row p={p} i={i} /></div>
        ))}
        {rows.map((p, i) => (p.note ? (
          <div key={`n${i}`} className="yl-sknote" style={{ gridRow: i + 2 }}>
            <svg viewBox="0 0 24 12" aria-hidden="true"><path d="M23 6H3M7 2 3 6l4 4" /></svg>
            <span>{p.note}</span>
          </div>
        ) : null))}
        <div className="yl-skfoot" style={{ gridRow: n + 2 }} aria-hidden="true" />
      </div>
    </figure>
  );
}

function Frames({ p, members }) {
  const frame = FRAMES.includes(p.frame) ? p.frame : "window";
  const cut = members.findIndex((m) => m.preset === "after");
  const rows = (list) => list.filter((m) => m.preset === "row").map((m) => resolve("row", m.props));
  // A bubble's title sits above it, so a pair shows it once, over both.
  const top = frame === "bubble" && p.title ? <div className="yl-sktop">{p.title}</div> : null;
  const title = frame === "bubble" ? "" : p.title;
  if (cut < 0) {
    return (
      <div className="yl-block yl-sk">
        {top}
        <Side frame={frame} title={title} rows={rows(members)} />
      </div>
    );
  }
  const after = resolve("after", members[cut].props);
  return (
    <div className="yl-block yl-sk sk-pair">
      {top}
      <div className="yl-skpair">
        <Side frame={frame} title={title} label={p.before} rows={rows(members.slice(0, cut))} />
        <Side frame={frame} title={title} label={after.label} rows={rows(members.slice(cut + 1))} />
      </div>
    </div>
  );
}

export function Sketch({ g }) {
  return <Frames p={resolve("sketch", g.group.props)} members={g.members.filter((m) => !m.group)} />;
}

// A row outside a sketch is a one-row sketch.
export function LoneSketchRow({ p }) {
  return <Frames p={resolve("sketch", {})} members={[{ preset: "row", props: p }]} />;
}

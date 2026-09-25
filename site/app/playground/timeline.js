"use client";

// timeline (YUI-65): done rows, the now marker, the running rows lit up on
// it, then the queued rows in order. A group head (flows.js hands it its
// members); a lone done/now/next row is a one-row timeline.
import { useState } from "react";
import { resolve } from "../../lib/yl/yl.mjs";

const LINK = /^https:/i;

function Row({ n }) {
  const p = resolve(n.preset, n.props);
  const link = typeof p.url === "string" && LINK.test(p.url) ? p.url : null;
  const inner = (
    <>
      <span className="yl-tlat">{p.at || ""}</span>
      <span className="yl-tldot" aria-hidden="true">{n.preset === "done" ? "✓" : ""}</span>
      <span className="yl-tlbody">
        <span className="yl-tltext">
          {p.tag ? <span className="yl-tltag">{p.tag}</span> : null}
          {p.text}
          {link ? <span className="yl-tlgo" aria-hidden="true">↗</span> : null}
        </span>
        {p.sub ? <span className="yl-tlsub">{p.sub}</span> : null}
      </span>
    </>
  );
  const cls = `yl-tlrow ${n.preset}`;
  // A link row opens the page and sends nothing, like a card url.
  return link
    ? <li className={cls}><a href={link} target="_blank" rel="noopener noreferrer">{inner}</a></li>
    : <li className={cls}><div>{inner}</div></li>;
}

export function Timeline({ g }) {
  const p = resolve("timeline", g.group.props);
  const rows = g.members.filter((m) => !m.group);
  return <Track title={p.title} mark={p.mark} fold={p.fold} rows={rows} />;
}

// A done/now/next line outside a timeline.
export function LoneRow({ node }) {
  return <Track rows={[node]} mark="Now" fold={0} lone />;
}

function Track({ title, mark, fold, rows, lone }) {
  const [open, setOpen] = useState(false);
  let at = rows.findIndex((r) => r.preset !== "done");
  if (at < 0) at = rows.length;
  const done = rows.slice(0, at);
  const hidden = !open && fold > 0 && done.length > fold ? done.length - fold : 0;
  const head = rows.slice(hidden, at);
  const tail = rows.slice(at);
  return (
    <div className={`yl-block yl-tl ${lone ? "lone" : ""}`}>
      {title ? <div className="yl-q">{title}</div> : null}
      <ol className="yl-tlrail">
        {hidden ? (
          <li className="yl-tlfold"><button onClick={() => setOpen(true)}>{hidden} earlier</button></li>
        ) : null}
        {head.map((n) => <Row key={n.key} n={n} />)}
        {lone ? null : <li className="yl-tlmark"><span>{mark}</span></li>}
        {tail.map((n) => <Row key={n.key} n={n} />)}
      </ol>
    </div>
  );
}

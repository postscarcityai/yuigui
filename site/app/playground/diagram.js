"use client";

// diagram (DRAW-1): a Mermaid flowchart, sequence or state diagram drawn
// static from the parser's patch (lib/yl/diagram.mjs lays it out). Parts come
// on in the order the Mermaid wrote them; Reduce Motion shows it finished.
// Colors come from the agent's look. Any other Mermaid type shows its source.
// Sends nothing.
import { Fragment } from "react";
import { DELAY, layoutGraph, layoutSequence } from "../../lib/yl/diagram.mjs";

const f1 = (n) => Math.round(n * 10) / 10;
const d = (s) => `${f1(s)}s`;

function NodeShape({ n }) {
  const { cx, cy, w, h, shape } = n;
  const x = cx - w / 2, y = cy - h / 2;
  const cls = "dg-node";
  switch (shape) {
    case "start": return <circle className="dg-dot" cx={cx} cy={cy} r={w / 2} />;
    case "end": return <><circle className="dg-ring" cx={cx} cy={cy} r={w / 2 - 1} /><circle className="dg-dot" cx={cx} cy={cy} r={w / 2 - 6} /></>;
    case "choice": return <polygon className={cls} points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`} />;
    case "fork": case "join": return <rect className="dg-dot" x={x} y={y} width={w} height={h} rx={3} />;
    case "diamond": return <polygon className={cls} points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`} />;
    case "circle": return <ellipse className={cls} cx={cx} cy={cy} rx={w / 2} ry={h / 2} />;
    case "double": return <><ellipse className={cls} cx={cx} cy={cy} rx={w / 2} ry={h / 2} /><ellipse className="dg-inner" cx={cx} cy={cy} rx={w / 2 - 5} ry={h / 2 - 5} /></>;
    case "hexagon": return <polygon className={cls} points={`${x + 12},${y} ${x + w - 12},${y} ${x + w},${cy} ${x + w - 12},${y + h} ${x + 12},${y + h} ${x},${cy}`} />;
    case "slant": return <polygon className={cls} points={`${x + 12},${y} ${x + w},${y} ${x + w - 12},${y + h} ${x},${y + h}`} />;
    case "flag": return <polygon className={cls} points={`${x + 14},${y} ${x + w},${y} ${x + w},${y + h} ${x + 14},${y + h} ${x},${cy}`} />;
    case "cylinder": return (
      <>
        <path className={cls} d={`M${x} ${y + 7}a${w / 2} 7 0 0 1 ${w} 0V${y + h - 7}a${w / 2} 7 0 0 1 ${-w} 0Z`} />
        <path className="dg-inner" d={`M${x} ${y + 7}a${w / 2} 7 0 0 0 ${w} 0`} />
      </>
    );
    case "subroutine": return <><rect className={cls} x={x} y={y} width={w} height={h} rx={4} /><line className="dg-inner" x1={x + 7} x2={x + 7} y1={y} y2={y + h} /><line className="dg-inner" x1={x + w - 7} x2={x + w - 7} y1={y} y2={y + h} /></>;
    case "stadium": return <rect className={cls} x={x} y={y} width={w} height={h} rx={h / 2} />;
    case "round": return <rect className={cls} x={x} y={y} width={w} height={h} rx={14} />;
    default: return <rect className={cls} x={x} y={y} width={w} height={h} rx={6} />;
  }
}

function Label({ lines, cx, cy, cls }) {
  const y0 = cy - ((lines.length - 1) * 16.5) / 2;
  return (
    <text className={cls || "dg-label"} x={cx} y={y0} textAnchor="middle" dominantBaseline="central">
      {lines.map((l, i) => <tspan key={i} x={cx} dy={i ? 16.5 : 0}>{l}</tspan>)}
    </text>
  );
}

const path = ([p0, p1, p2, p3]) => `M${f1(p0[0])} ${f1(p0[1])}C${f1(p1[0])} ${f1(p1[1])} ${f1(p2[0])} ${f1(p2[1])} ${f1(p3[0])} ${f1(p3[1])}`;

function Defs({ id }) {
  return (
    <defs>
      <marker id={`${id}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1 10 5 0 9z" className="dg-head" /></marker>
    </defs>
  );
}

function Graph({ g, id }) {
  const L = layoutGraph(g);
  if (!L.nodes.length) return null;
  return (
    <svg className="dg-svg" viewBox={`0 0 ${L.w} ${L.h}`} style={{ minWidth: Math.round(L.w * 0.72), maxWidth: Math.round(L.w * 1.2) }} role="img" aria-label={`${g.type === "state" ? "State diagram" : "Flowchart"} of ${L.nodes.length} parts`}>
      <Defs id={id} />
      {L.groups.map((b) => (
        <g key={b.id}>
          <rect className="dg-group" x={f1(b.x)} y={f1(b.y)} width={f1(b.w)} height={f1(b.h)} rx={12} />
          {b.label ? <text className="dg-glabel" x={f1(b.x + 12)} y={f1(b.y + 15)}>{b.label}</text> : null}
        </g>
      ))}
      {L.edges.map((e) => (
        <g key={e.i} className="dg-in" style={{ animationDelay: d(e.order * DELAY + 0.14) }}>
          <path className={`dg-edge ${e.line ? `dg-${e.line}` : ""}`} d={path(e.pts)} markerEnd={e.plain ? undefined : `url(#${id}-a)`} markerStart={e.both ? `url(#${id}-a)` : undefined} />
          {e.label ? (
            <g>
              <rect className="dg-elbg" x={f1(e.mid[0] - e.label.length * 3.4 - 6)} y={f1(e.mid[1] - 10)} width={f1(e.label.length * 6.8 + 12)} height={20} rx={6} />
              <text className="dg-elabel" x={f1(e.mid[0])} y={f1(e.mid[1])} textAnchor="middle" dominantBaseline="central">{e.label}</text>
            </g>
          ) : null}
        </g>
      ))}
      {L.nodes.map((n) => (
        <g key={n.id} className="dg-in" style={{ animationDelay: d(n.order * DELAY) }}>
          <NodeShape n={n} />
          {n.lines.length ? <Label lines={n.lines} cx={n.cx} cy={n.cy} /> : null}
        </g>
      ))}
    </svg>
  );
}

function Sequence({ g, id }) {
  const L = layoutSequence(g);
  if (!L.actors.length) return null;
  return (
    <svg className="dg-svg" viewBox={`0 0 ${L.w} ${L.h}`} style={{ minWidth: Math.round(L.w * 0.72), maxWidth: Math.round(L.w * 1.2) }} role="img" aria-label={`Sequence diagram of ${L.actors.length} actors`}>
      <Defs id={id} />
      <g transform={`translate(${f1(L.dx)} 0)`}>
        {L.items.filter((i) => i.kind === "block").map((b, k) => {
          const x0 = L.span[0] + b.depth * 7, x1 = L.span[1] - b.depth * 7;
          return (
            <g key={`b${k}`} className="dg-in" style={{ animationDelay: d(b.order * DELAY * 1.4) }}>
              <rect className="dg-block" x={f1(x0)} y={f1(b.y)} width={f1(x1 - x0)} height={f1(b.h)} rx={6} />
              <path className="dg-tab" d={`M${f1(x0)} ${f1(b.y)}h${b.block.length * 7 + 18}v14l-6 6H${f1(x0)}z`} />
              <text className="dg-btag" x={f1(x0 + 8)} y={f1(b.y + 11)} dominantBaseline="central">{b.block}</text>
              {b.text ? <text className="dg-btext" x={f1(x0 + b.block.length * 7 + 26)} y={f1(b.y + 11)} dominantBaseline="central">[{b.text}]</text> : null}
              {b.divs.map((dv, j) => (
                <g key={j}>
                  <line className="dg-div" x1={f1(x0)} x2={f1(x1)} y1={f1(dv.y + 8)} y2={f1(dv.y + 8)} />
                  {dv.text ? <text className="dg-btext" x={f1(x0 + 8)} y={f1(dv.y + 20)} dominantBaseline="central">[{dv.text}]</text> : null}
                </g>
              ))}
            </g>
          );
        })}
        {L.actors.map((a) => (
          <g key={a.id}>
            <line className="dg-life" x1={f1(a.x)} x2={f1(a.x)} y1={f1(a.h)} y2={f1(L.life[1])} />
            <rect className="dg-node" x={f1(a.x - a.w / 2)} y={0} width={f1(a.w)} height={a.h} rx={a.actor ? a.h / 2 : 6} />
            <Label lines={a.lines} cx={a.x} cy={a.h / 2} />
          </g>
        ))}
        {L.items.map((it, k) => {
          const delay = d(it.order * DELAY * 1.4 + 0.2);
          if (it.kind === "msg") {
            const out = it.x2 >= it.x1 ? 1 : -1;
            const mx = (it.x1 + it.x2) / 2;
            const arrow = it.head === "none" ? undefined : `url(#${id}-a)`;
            return (
              <g key={k} className="dg-in" style={{ animationDelay: delay }}>
                {it.self ? (
                  <path className={`dg-edge ${it.line ? "dg-dash" : ""}`} d={`M${f1(it.x1)} ${f1(it.y - 14)}h28v14H${f1(it.x1 + 4)}`} markerEnd={arrow} />
                ) : (
                  <path className={`dg-edge ${it.line ? "dg-dash" : ""}`} d={`M${f1(it.x1 + out * 2)} ${f1(it.y)}H${f1(it.x2 - out * 2)}`} markerEnd={arrow} markerStart={it.both ? `url(#${id}-a)` : undefined} />
                )}
                {it.head === "cross" ? <text className="dg-x" x={f1(it.x2 - out * 10)} y={f1(it.y)} textAnchor="middle" dominantBaseline="central">×</text> : null}
                <text className="dg-mtext" x={f1(it.self ? it.x1 + 34 : mx)} y={f1(it.self ? it.y - 6 : it.y - 7 - (it.lines.length - 1) * 16)} textAnchor={it.self ? "start" : "middle"}>
                  {it.lines.map((l, i) => <tspan key={i} x={f1(it.self ? it.x1 + 34 : mx)} dy={i ? 16 : 0}>{l}</tspan>)}
                </text>
                {it.n ? <><circle className="dg-num" cx={f1((it.self ? it.x1 + 34 : mx) - (it.self ? 12 : it.tw / 2 + 12))} cy={f1(it.y - 13 - (it.lines.length - 1) * 8)} r={8} /><text className="dg-numt" x={f1((it.self ? it.x1 + 34 : mx) - (it.self ? 12 : it.tw / 2 + 12))} y={f1(it.y - 13 - (it.lines.length - 1) * 8)} textAnchor="middle" dominantBaseline="central">{it.n}</text></> : null}
              </g>
            );
          }
          if (it.kind === "note") {
            return (
              <g key={k} className="dg-in" style={{ animationDelay: delay }}>
                <rect className="dg-note" x={f1(it.x)} y={f1(it.y)} width={f1(it.w)} height={f1(it.h)} rx={6} />
                <Label lines={it.lines} cx={it.x + it.w / 2} cy={it.y + it.h / 2} cls="dg-ntext" />
              </g>
            );
          }
          return <Fragment key={k} />;
        })}
      </g>
    </svg>
  );
}

export function Diagram({ p, vid }) {
  const id = `dg${String(vid ?? "x").replace(/\W/g, "")}`;
  const body = p.type === "flow" || p.type === "state" ? <Graph g={p} id={id} />
    : p.type === "sequence" ? <Sequence g={p} id={id} />
      : p.type === "other" ? <pre className="dg-src">{p.source}</pre> : null;
  return (
    <div className="yl-block yl-diagram">
      {p.title ? <div className="dg-title">{p.title}</div> : null}
      <div className="dg-scroll">{body}</div>
      {p.caption ? <p className="dg-cap">{p.caption}</p> : null}
    </div>
  );
}

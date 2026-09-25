"use client";

// Agent tables (spec/TABLES.md): the `query` preset. It reads the agent's
// store from the screen state (state.data, filled by `table create` and `put`)
// and draws the rows with the table, list, chart or stat renderers. It is
// live: a put that lands re-renders the screen, and this runs the query again.
import { useContext, useState } from "react";
import { query as runQuery, emptyStore } from "../../lib/yl/tables.mjs";
import { Chart, DataTable, ScreenCtx, Stat } from "./science";

const human = (s) => String(s).replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
const quote = (s) => (/^[\w.:-]+$/.test(s) ? s : `"${String(s).replace(/(["\\])/g, "\\$1")}"`);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Dates show short, in the reader's words: "Sep 26", "Sep 26, 12:30", with the
// year only when it is not this one. Events keep the stored YYYY-MM-DD.
function day(v) {
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}:\d{2}))?$/);
  if (!m) return String(v);
  const year = Number(m[1]) === new Date().getFullYear() ? "" : ` ${m[1]}`;
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}${year}${m[4] ? `, ${m[4]}` : ""}`;
}
const shown = (v, type) => (v == null ? "" : typeof v === "boolean" ? (v ? "yes" : "no") : type === "date" ? day(v) : String(v));
const display = (r) => r.rows.map((row) => row.map((v, j) => (typeof v === "number" ? v : shown(v, r.cols[j].type))));
const list = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function Note({ title, children }) {
  return (
    <div className="yl-block">
      {title ? <div className="yl-q">{title}</div> : null}
      <div className="yl-sub">{children}</div>
    </div>
  );
}

// The footer every view shares: how many rows matched, and where they live.
function Foot({ r, table }) {
  const more = r.count > r.rows.length ? `${r.rows.length} of ${r.count} rows` : `${r.count} row${r.count === 1 ? "" : "s"}`;
  return <div className="yl-sub yl-qfoot">{more} · {table} · on this phone</div>;
}

export function Query({ p, emit }) {
  const ctx = useContext(ScreenCtx);
  const store = ctx.data || emptyStore();
  const r = runQuery(store, p);
  const title = p.title || human(p.table || "Query");
  if (r.missing !== undefined) return <Note title={title}>No table called "{r.missing}" yet.</Note>;
  if (r.error) return <Note title={title}>{r.error}</Note>;
  const View = VIEWS[p.as] || AsTable;
  return <View p={p} r={r} title={title} emit={emit} ctx={ctx} />;
}

function AsTable({ p, r, title, emit }) {
  // Headers always sort on tap: `sort=` is the query's own order.
  const t = { name: title, cols: r.cols.map((c) => c.name), rows: display(r), units: r.cols.map((c) => c.unit || ""), sort: true };
  return (
    <div className="yl-qwrap">
      {r.rows.length ? <DataTable p={t} emit={emit} human={(x) => x} /> : <Note title={title}>Nothing here yet.</Note>}
      <Foot r={r} table={p.table} />
    </div>
  );
}

// One item per row. check=Col makes that bool column the checkbox: a tap
// writes the row on the phone and tells the agent (TABLES.md, section 3).
function AsList({ p, r, title, emit, ctx }) {
  const ci = p.check ? r.cols.findIndex((c) => c.name.toLowerCase() === String(p.check).toLowerCase() && c.type === "bool") : -1;
  const [local, setLocal] = useState({});
  const toggle = (i) => {
    const key = r.keys[i];
    if (key == null) return;
    const col = r.cols[ci].name;
    const now = !(local[key] ?? r.rows[i][ci]);
    setLocal({ ...local, [key]: now });
    const op = { op: "put", screen: ctx.screen || "1", table: p.table, key, values: { [col]: now }, line: `put ${p.table} ${quote(key)} ${col}=${now ? "on" : "off"}` };
    (ctx.write || ctx.dispatch || (() => {}))(op);
    emit({ op: "row", table: p.table, key, values: { [col]: now } });
  };
  return (
    <div className="yl-block yl-qwrap">
      <div className="yl-q">{title}</div>
      {!r.rows.length ? <div className="yl-sub">Nothing here yet.</div> : (
        <ul className={`yl-list ${ci >= 0 ? "check" : ""}`}>
          {r.rows.map((row, i) => {
            const on = ci >= 0 ? !!(local[r.keys[i]] ?? row[ci]) : false;
            const text = row.map((v, j) => (j === ci ? "" : shown(v, r.cols[j].type))).filter(Boolean).join(" · ");
            return (
              <li key={r.keys[i] ?? i} className={on ? "done" : ""} onClick={ci >= 0 ? () => toggle(i) : undefined}>
                {ci >= 0 ? <span className="box">{on ? "✓" : ""}</span> : null}
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      )}
      <Foot r={r} table={p.table} />
    </div>
  );
}

// The chart preset over the rows: the query's result becomes a bound table.
function AsChart({ p, r, emit, ctx }) {
  const alias = p.table;
  const t = { cols: r.cols.map((c) => c.name), rows: display(r), units: r.cols.map((c) => c.unit || "") };
  const cp = {
    type: p.type || "line",
    ...(p.title ? { title: p.title } : {}),
    data: alias,
    ...(p.x !== undefined ? { x: list(p.x).map(String) } : {}),
    ...(p.y !== undefined ? { y: list(p.y).map(String) } : {}),
    ...Object.fromEntries(["unit", "min", "max", "stack", "names", "color", "xlabel", "dots"].filter((k) => p[k] !== undefined).map((k) => [k, p[k]])),
  };
  return (
    <div className="yl-qwrap">
      <ScreenCtx.Provider value={{ ...ctx, nodes: [], tables: { ...(ctx.tables || {}), [alias]: t } }}>
        <Chart p={cp} emit={emit} />
      </ScreenCtx.Provider>
      <Foot r={r} table={p.table} />
    </div>
  );
}

// One number: the last row's, with the change since the row before and a
// spark line of the column when there are two or more rows.
function AsStat({ p, r, title, emit }) {
  const yi = p.y !== undefined ? r.cols.findIndex((c) => c.name.toLowerCase() === String(list(p.y)[0]).toLowerCase()) : r.cols.findIndex((c) => c.type === "number");
  if (yi < 0) return <Note title={title}>No number column to show.</Note>;
  const col = r.cols[yi];
  const vals = r.rows.map((row) => row[yi]).filter((v) => typeof v === "number");
  if (!vals.length) return <Note title={title}>Nothing here yet.</Note>;
  const last = vals[vals.length - 1];
  const sp = {
    value: last,
    unit: col.unit || "",
    label: p.label || p.title || col.name,
    good: p.good || "up",
    ...(vals.length > 1 ? { delta: Math.round((last - vals[vals.length - 2]) * 1e6) / 1e6, spark: vals } : {}),
    ...(p.sub ? { sub: p.sub } : {}),
  };
  return <Stat p={sp} emit={emit} />;
}

// A card the person taps to hand the rows to the agent. Nothing leaves the
// phone until they do (TABLES.md, section 4).
function AsSend({ p, r, title, emit, ctx }) {
  const [sent, setSent] = useState(false);
  const n = Math.min(r.rows.length, 200);
  const send = () => {
    setSent(true);
    emit({ op: "query", table: p.table, cols: r.cols.map((c) => c.name), rows: r.rows.slice(0, 200), count: r.count });
  };
  return (
    <div className="yl-card">
      <div className="yl-cardbody">
        <div className="yl-sub">{p.table} · on this phone</div>
        <div className="yl-q">{p.title || `Send ${n} row${n === 1 ? "" : "s"} to ${ctx.agent || "your agent"}?`}</div>
        <div className="yl-text">{r.cols.map((c) => c.name).join(", ")}. Only these rows go, and only when you tap.</div>
        <button className="bigbtn p acc full" disabled={sent || !n} onClick={send}>{sent ? "Sent" : n ? "Send" : "Nothing to send"}</button>
      </div>
    </div>
  );
}

const VIEWS = { table: AsTable, list: AsList, chart: AsChart, stat: AsStat, send: AsSend };

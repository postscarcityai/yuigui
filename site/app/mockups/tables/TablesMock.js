"use client";
// One phone: the Foods table, held by Basil on Hermes, then by another agent on another host (YUI-171 step 1, spec/TABLES.md section 8).
import { useState } from "react";
import "./tables.css";

const AGENTS = {
  basil: { name: "Basil", face: "B", host: "Hermes", call: (l) => `yui_tables(lines="${l}")` },
  chef: { name: "Chef", face: "C", host: "Claude via MCP", call: (l) => `{"name":"yui_tables","arguments":{"lines":"${l}"}}` },
  juno: { name: "Juno", face: "J", host: "A2A", call: (l) => `{"kind":"data","data":{"yui":"tables","lines":"${l}"}}` },
  pantry: { name: "Pantry", face: "P", host: "Webhook", call: (l) => `{"tables":"${l}"}` },
};

const FOODS = [
  ["Chicken breast", 165, 31],
  ["Greek yogurt", 100, 17],
  ["Tuna", 132, 28],
  ["Eggs, 2", 140, 12],
  ["Lentils", 230, 18],
  ["Oats", 300, 10],
  ["Tofu", 144, 17],
];

const ASK = "What's highest in protein?";
const READ = "query foods sort=-Protein limit=5 as table";

const Icon = {
  swap: <svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3" /></svg>,
  mic: <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></svg>,
  plus: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
  check: <svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg>,
};

function FoodsCard({ rows, holder }) {
  const top = [...rows].sort((a, b) => b[2] - a[2]).slice(0, 5);
  return (
    <div className="tm-card">
      <b>Foods</b>
      <table>
        <thead><tr><th>Food</th><th>Cal<small>kcal</small></th><th>Protein<small>g</small></th></tr></thead>
        <tbody>{top.map(([f, c, p]) => <tr key={f}><td>{f}</td><td>{c}</td><td>{p}</td></tr>)}</tbody>
      </table>
      <span className="tm-meta">foods · {rows.length} rows · held by {AGENTS[holder].name}</span>
    </div>
  );
}

export default function TablesMock({ theme = "dark" }) {
  const [holder, setHolder] = useState("basil");
  const [rows, setRows] = useState(FOODS);
  const [thread, setThread] = useState([["user", ASK], ["agent", "Top five from your Foods table.", "basil"], ["foods", "basil"]]);
  const [sheet, setSheet] = useState(null); // "pick" | agent key to confirm
  const [wire, setWire] = useState({ who: "basil", line: READ });
  const a = AGENTS[holder];

  function give(to) {
    setHolder(to);
    setSheet(null);
    setThread((t) => [...t, ["note", `${AGENTS[to].name} now holds foods and meals`], ["user", ASK], ["agent", "Same table, now with me. Top five:", to], ["foods", to]]);
    setWire({ who: to, line: READ });
  }

  function logOats() {
    const line = 'put foods Food=\\"Cottage cheese\\" Cal=98 Protein=11';
    if (!rows.some((r) => r[0] === "Cottage cheese")) setRows((r) => [...r, ["Cottage cheese", 98, 11]]);
    setThread((t) => [...t, ["user", "Add cottage cheese"], ["agent", "Added. 98 kcal, 11 g protein.", holder]]);
    setWire({ who: holder, line });
  }

  return (
    <div className="tm-wrap">
      <div className={`tm-phone tm-${theme}`} role="group" aria-label={`Tables mock, ${theme}`}>
        <div className="tm-status"><span>6:14</span><span>89</span></div>
        <header className="tm-head">
          <span className="tm-pill">
            <span className="tm-face">{a.face}</span>
            <span className="tm-ptext"><b>{a.name}</b><small>on {a.host}</small></span>
          </span>
          <button className="tm-round" aria-label="Give your tables to another agent" onClick={() => setSheet("pick")}>{Icon.swap}</button>
        </header>

        <div className="tm-thread">
          {thread.map(([kind, text, who], i) => kind === "foods" ? (
            <FoodsCard key={i} rows={rows} holder={text} />
          ) : kind === "note" ? (
            <p key={i} className="tm-note">{Icon.check} {text}</p>
          ) : (
            <p key={i} className={`tm-msg ${kind}`}>{text}</p>
          ))}
        </div>

        <footer className="tm-bar">
          <button className="tm-chip" onClick={logOats}>{Icon.plus} Add a food</button>
          <button className="tm-chip on" onClick={() => setSheet("pick")}>{Icon.swap} Switch agent</button>
          <span className="tm-mic" aria-hidden="true">{Icon.mic}</span>
        </footer>

        {sheet ? (
          <div className="tm-sheet-wrap" onClick={() => setSheet(null)}>
            <div className="tm-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Give your tables">
              {sheet === "pick" ? (
                <>
                  <p className="tm-sheet-title">Who keeps your tables?</p>
                  <p className="tm-sheet-body">foods and meals, held by {a.name}.</p>
                  {Object.entries(AGENTS).map(([k, x]) => (
                    <button key={k} className={k === holder ? "tm-opt on" : "tm-opt"} disabled={k === holder} onClick={() => setSheet(k)}>
                      <span className="tm-face sm">{x.face}</span>
                      <span className="tm-ptext"><b>{x.name}</b><small>{x.host}</small></span>
                      {k === holder ? <em>Has them</em> : null}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <p className="tm-sheet-title">Give foods and meals to {AGENTS[sheet].name}?</p>
                  <p className="tm-sheet-body">Same rows, same screens. {a.name} stops seeing them.</p>
                  <button className="tm-go" onClick={() => give(sheet)}>Give to {AGENTS[sheet].name}</button>
                  <button className="tm-opt center" onClick={() => setSheet(null)}>Keep with {a.name}</button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
      <div className="tm-wire" aria-live="polite">
        <span>{AGENTS[wire.who].name} on {AGENTS[wire.who].host} called</span>
        <code>{AGENTS[wire.who].call(wire.line)}</code>
        <span>Same server path, same store.</span>
      </div>
    </div>
  );
}

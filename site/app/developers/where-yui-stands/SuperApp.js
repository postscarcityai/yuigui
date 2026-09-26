"use client";
// The ten benchmark screens as one person's day (Where Yui stands). Pick one and the phone draws it
// from its real lines, with its token counts from content/benchmark.json.
import { useState } from "react";
import LivePhone from "../../mockups/LivePhone";
import s from "./stands.module.css";

export default function SuperApp({ groups, rows }) {
  const [at, setAt] = useState(0);
  const r = rows[at];
  return (
    <div className={s.app}>
      <div className={s.appPick}>
        {groups.map(([label, names]) => (
          <div key={label} className={s.appGroup}>
            <span className={s.appLabel}>{label}</span>
            <div className={s.chips}>
              {names.map((n) => {
                const i = rows.findIndex((x) => x.name === n);
                return (
                  <button key={n} type="button" className={s.chip} aria-pressed={i === at} onClick={() => setAt(i)}>{n}</button>
                );
              })}
            </div>
          </div>
        ))}
        <pre className={s.appLines}><code>{r.yl}</code></pre>
        <dl className={s.appNums}>
          <div><dt>Yui Lines</dt><dd>{r.yl_t}</dd></div>
          <div><dt>Minified JSON</dt><dd>{r.min_t}</dd></div>
          <div><dt>Component tree</dt><dd>{r.tree_t}</dd></div>
          <div><dt>Reopen once saved</dt><dd>{r.show_t}</dd></div>
        </dl>
        <p className={s.appNote}>Tokens, o200k_base. The screen on the right is drawn live from the lines above.</p>
      </div>
      <div className={s.appPhone}>
        <LivePhone key={r.name} yl={r.yl} label={`${r.name}, drawn live from its Yui Lines`} />
      </div>
    </div>
  );
}

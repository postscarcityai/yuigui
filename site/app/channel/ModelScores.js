// /channel (YUI-132): how well each model uses Yui, on the same guide and cases.
// Data: content/model-scores.json, written by spec/channel-eval/scores.mjs.
import { readFileSync } from "node:fs";
import path from "node:path";

export default function ModelScores() {
  const { guide, date, models } = JSON.parse(readFileSync(path.join(process.cwd(), "content", "model-scores.json"), "utf8"));
  if (!models?.length) return null;
  const cats = Object.keys(models[0].cats).sort();
  return (
    <section className="ms" aria-labelledby="ms-title">
      <h2 id="ms-title">Which models use Yui well</h2>
      <p>
        Every model gets the same guide ({guide.split("+")[0]}) and the same {models[0].n} turns: timers, forms, plans, maps,
        music, photos, groups. A turn passes when the app can draw every line and the screen fits the ask. Scored {date}.
      </p>
      <ol className="ms-bars">
        {models.map((m) => (
          <li key={m.id}>
            <div className="ms-name"><strong>{m.name}</strong><span>{m.via}</span></div>
            <div className="ms-track" role="img" aria-label={`${m.name}: ${m.pass} of ${m.n} passed`}>
              <div className="ms-fill" style={{ width: `${m.pct}%` }} />
            </div>
            <div className="ms-num"><strong>{m.pct}%</strong><span>{m.pass} of {m.n}</span></div>
            {m.misses.length > 0 && (
              <p className="ms-miss">
                Missed every time: {m.misses.slice(0, 3).map((x) => `${x.what} (${x.n})`).join(", ")}
                {m.noise > 0 ? `. ${m.noise} more passed on a second try.` : "."}
              </p>
            )}
          </li>
        ))}
      </ol>
      <details className="ms-cats">
        <summary>By kind of turn</summary>
        <div className="ms-scroll">
          <table>
            <thead><tr><th>turn</th>{models.map((m) => <th key={m.id}>{m.name}</th>)}</tr></thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c}>
                  <td>{c}</td>
                  {models.map((m) => {
                    const [p, t] = m.cats[c] || [0, 0];
                    return <td key={m.id} className={p < t ? "ms-low" : undefined}>{p}/{t}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

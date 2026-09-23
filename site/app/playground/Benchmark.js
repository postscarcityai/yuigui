import data from "../../content/benchmark.json";

const x = (a, b) => `${(a / b).toFixed(1)}x`;

export default function Benchmark() {
  const T = data.totals;
  return (
    <section className="bench">
      <h2>Token benchmark: YL vs JSON</h2>
      <p className="lede" style={{ fontSize: 17 }}>
        The same 10 screens as the dropdown above, counted with real tokenizers. The JSON is generated
        from the parsed YL, so both sides say exactly the same thing with the same defaults.
        <b> min</b> is minified JSON (the cheapest JSON can get), <b>pretty</b> is how models usually emit it,
        and <b>tree</b> is the usual generative-UI component tree.
      </p>
      <table>
        <thead>
          <tr><th>Screen (o200k_base)</th><th>YL</th><th>JSON min</th><th>JSON pretty</th><th>JSON tree</th><th>min / YL</th><th>tree / YL</th></tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.n}>
              <td>{r.n}. {r.name}</td>
              <td className="x">{r.counts.yl.o200k}</td>
              <td>{r.counts.min.o200k}</td>
              <td>{r.counts.pretty.o200k}</td>
              <td>{r.counts.tree.o200k}</td>
              <td>{x(r.counts.min.o200k, r.counts.yl.o200k)}</td>
              <td>{x(r.counts.tree.o200k, r.counts.yl.o200k)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td>Total</td><td className="x">{T.yl.o200k}</td><td>{T.min.o200k}</td><td>{T.pretty.o200k}</td><td>{T.tree.o200k}</td><td>{x(T.min.o200k, T.yl.o200k)}</td><td>{x(T.tree.o200k, T.yl.o200k)}</td></tr>
        </tfoot>
      </table>
      <table>
        <thead><tr><th>Tokenizer (totals)</th><th>YL</th><th>JSON min</th><th>JSON pretty</th><th>JSON tree</th><th>pretty / YL</th><th>tree / YL</th></tr></thead>
        <tbody>
          {Object.entries(data.tokenizers).map(([k, label]) => (
            <tr key={k}><td title={label}>{label.split(" (")[0]}</td><td className="x">{T.yl[k]}</td><td>{T.min[k]}</td><td>{T.pretty[k]}</td><td>{T.tree[k]}</td><td>{x(T.pretty[k], T.yl[k])}</td><td>{x(T.tree[k], T.yl[k])}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="pg-hint">
        Read it straight: against the leanest possible JSON, YL saves about a third of the tokens. Against JSON as
        models actually write it, 2.6x to 3.9x. The win is biggest on short control screens (a timer, a camera) and
        smallest where the screen is mostly the user's own text, which costs the same in any format. The Claude
        column uses Anthropic's legacy published tokenizer, since current Claude tokenizers are not available offline.
        Generated {data.generated.slice(0, 10)} by <code>bench/bench.mjs</code>.
      </p>
      <h3>Screen 1 as a JSON component tree ({data.rows[0].counts.tree.o200k} tokens) vs YL ({data.rows[0].counts.yl.o200k} tokens)</h3>
      <pre>{data.sampleTree}</pre>
      <pre>{data.rows[0].yl}</pre>
    </section>
  );
}

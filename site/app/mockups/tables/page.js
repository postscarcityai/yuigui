// YUI-171: a clickable mock of one table read by two different agents on two different hosts, and under it
// the real calls from the live run (step 2: Hermes and MCP built; the phone drawing is still the mock).
// Spec: spec/TABLES.md section 8.
import Link from "next/link";
import TablesMock from "./TablesMock";

export const metadata = {
  title: "Switch agents, keep your tables | Yui",
  description: "Yui tables that follow you: Basil on Hermes keeps your Foods table, you hand it to a Claude agent over MCP, and it reads the same rows. Live for Hermes and MCP, with the real calls.",
};

// From the live run (YUI-171 step 2), trimmed to the lines that matter.
const CALLS = [
  {
    title: "1. Basil makes a table",
    who: "Hermes plugin tool yui_tables",
    call: `yui_tables(lines="""
table create foods Food:text Cal:number:kcal Protein:number:g
put foods oats Food=Oats Cal=300 Protein=10
put foods eggs Food="Two eggs" Cal=140 Protein=12
put foods Food=Toast Cal=80 Protein=3
put foods Cal=lots
query foods sort=-Protein""")`,
    out: `5 lines done. Refused "put foods Cal=lots": put: Cal: "lots" is not a number.

foods
key | Food | Cal (kcal) | Protein (g)
eggs | Two eggs | 140 | 12
oats | Oats | 300 | 10
r1 | Toast | 80 | 3`,
  },
  {
    title: "2. Claude can't see it yet",
    who: "MCP tools/call on yui-mcp",
    call: `{"name": "yui_tables", "arguments": {"lines": "query foods"}}`,
    out: `Refused "query foods": No table called foods yet.`,
  },
  {
    title: "3. A delete asks you first",
    who: "Hermes plugin tool yui_tables",
    call: `yui_tables(lines="put foods oats +delete")`,
    out: `Nothing deleted yet: the person sees "Delete Oats from foods?" with Delete or Keep.

(in Basil's thread)  choose@del-86380ee2 "Delete Oats from foods?" Delete|Keep
(you tap Delete; Basil's next call)
The person tapped Delete on del-86380ee2: 1 gone.`,
  },
  {
    title: "4. You give foods to Claude",
    who: "As the person: yui_tables_give",
    call: `yui_tables_give(from_agent=Basil, to_agent=Claude, tname="foods")  ->  "foods"`,
    out: `(Basil)  Refused "query foods": No table called foods yet.`,
  },
  {
    title: "5. Claude reads the same rows",
    who: "MCP tools/call on yui-mcp",
    call: `{"name": "yui_tables", "arguments": {"lines": "query foods sort=-Protein"}}`,
    out: `1 line done.

foods
key | Food | Cal (kcal) | Protein (g)
eggs | Two eggs | 140 | 12
r1 | Toast | 80 | 3`,
  },
];

export default async function TablesMockPage({ searchParams }) {
  const q = await searchParams;
  const only = q?.theme === "light" || q?.theme === "dark" ? q.theme : null;
  return (
    <main className="tm-page">
      <p className="tm-kicker">Live for Hermes and MCP</p>
      <h1>Switch agents, keep your tables</h1>
      <p className="tm-lede">
        Your tables live in Yui, not in one agent. Basil runs on Hermes and keeps your Foods table.
        Hand it to Chef, a Claude agent over MCP, and the same question draws the same screen.
      </p>
      <p className="tm-links">
        <Link href="/developers/tables#8-any-agent-the-same-tables-through-the-relay">Read the spec</Link>
        <Link href="/board#YUI-171">The card</Link>
      </p>
      <div className="tm-pair">
        {(only ? [only] : ["light", "dark"]).map((t) => (
          <figure key={t}>
            <TablesMock theme={t} />
            <figcaption>{t === "light" ? "Light" : "Dark"}</figcaption>
          </figure>
        ))}
      </div>
      <section className="tm-live" aria-labelledby="tm-live-h">
        <h2 id="tm-live-h">The real calls</h2>
        <p>
          The phones above are a mock. These are not: one live run on a throwaway account, two agents of one person.
          Basil on Hermes calls the plugin tool, Claude calls the MCP tool, and both land in the same store.
        </p>
        {CALLS.map((c) => (
          <div className="tm-call" key={c.title}>
            <h3>{c.title}</h3>
            <p className="tm-call-who">{c.who}</p>
            <pre><code>{c.call}</code></pre>
            <pre className="tm-call-out"><code>{c.out}</code></pre>
          </div>
        ))}
        <p className="tm-small">
          Test: <code>supabase/tests/tables_any_agent_e2e.py</code> in the app repo, 21 of 21. A2A and webhook are next.
        </p>
      </section>
      <ul className="tm-notes">
        <li><b>You own the table.</b> One agent holds it at a time. Only that agent can read it, write it or draw it.</li>
        <li><b>Give to...</b> moves it. Same name, same rows, same screens. The old agent stops seeing it.</li>
        <li><b>One path on the server.</b> Hermes and MCP call <code>yui_tables</code> today. A2A will send a data part and a webhook return <code>tables</code>. All land in the same store.</li>
      </ul>
    </main>
  );
}

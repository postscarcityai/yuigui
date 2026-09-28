// YUI-171: a clickable mock of one table read by two different agents on two different hosts, and under it
// the real calls from the live runs (step 2: the tool calls; step 3: table words in the reply, A2A and webhook). The phones are still the mock.
// Spec: spec/TABLES.md section 8.
import Link from "next/link";
import TablesMock from "./TablesMock";
import { pageMeta } from "../../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/mockups/tables",
  title: "Switch agents, keep your tables | Yui",
  description: "Yui tables that follow you: Basil on Hermes keeps your Foods table, you hand it to a Claude agent over MCP, and it reads the same rows. Live for Hermes, MCP, A2A and webhooks, in a tool call or right in the reply, with the real calls.",
});

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

// From the live run of step 3 (tables_reply_e2e.py): table words inside the agent's own reply.
const REPLY = {
  said: `Logged your breakfast.
\`\`\`yui
table create foods Food:text Cal:number:kcal Protein:number:g
put foods oats Food=Oats Cal=300 Protein=10
put foods eggs Food="Two eggs" Cal=140 Protein=12
query foods sort=-Protein as table "Foods"
\`\`\``,
  saved: `Logged your breakfast.
\`\`\`yui
table name="Foods" Food|Cal|Protein "Two eggs|140|12" "Oats|300|10" units=|kcal|g
\`\`\``,
  rows: [["Two eggs", 140, 12], ["Oats", 300, 10]],
};

const MORE = [
  {
    title: "A reply that only reads",
    who: "Hermes plugin, reply path",
    call: `\`\`\`yui
query foods where=Food~oat
\`\`\``,
    out: `(nothing saved; Basil's next turn)
[yui] Your tables:

foods
key | Food | Cal (kcal) | Protein (g)
oats | Oats | 300 | 10

[yui] Answer the person now: a line, then a screen.`,
  },
  {
    title: "A delete in the reply asks first",
    who: "Hermes plugin, reply path",
    call: `Eggs are gone.
\`\`\`yui
put foods eggs +delete
\`\`\``,
    out: `(what the phone gets)
Tap Delete to confirm.
choose@del-14b00404 "Delete Two eggs from foods?" Delete|Keep

(you tap Delete; Basil's turn opens with)
[yui] The person tapped Delete on del-14b00404: 1 gone.`,
  },
  {
    title: "An A2A agent reads with a data part",
    who: "A2A bridge: the agent's answer",
    call: `{"kind": "data", "data": {"yui": "tables", "lines": "query meals"}}`,
    out: `(no text, so it is a read: the next message goes at once)
[yui] Your tables:

meals
key | Food | Cal (kcal)
r1 | Oats | 300
+ data part {"yui": "tables", "results": [...]}

(the agent answers, saved once)
Read 1 row(s): Oats 300`,
  },
  {
    title: "A webhook reads with one field",
    who: "Webhook bridge: your server's response",
    call: `{"tables": "query meals"}`,
    out: `(no reply, so it is a read: the bridge POSTs again at once)
"tables": {"results": [{"table": "meals", "cols": [{"name": "Food"}, {"name": "Cal", "unit": "kcal"}],
           "rows": [["Oats", 300]], "count": 1}], "failed": []}`,
  },
  {
    title: "Hand it over: the new agent knows what it holds",
    who: "yui_tables_give, then your next message to Chef",
    call: `yui_tables_give(from_agent=Basil, to_agent=Chef, tname="foods")  ->  "foods"`,
    out: `(Chef's next turn opens with)
[yui] tables foods(2 rows: Food, Cal, Protein)`,
  },
];

export default async function TablesMockPage({ searchParams }) {
  const q = await searchParams;
  const only = q?.theme === "light" || q?.theme === "dark" ? q.theme : null;
  return (
    <main className="tm-page">
      <p className="tm-kicker">Live for Hermes, MCP, A2A and webhooks</p>
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
          Test: <code>supabase/tests/tables_any_agent_e2e.py</code> in the app repo, 21 of 21.
        </p>
      </section>
      <section className="tm-live" aria-labelledby="tm-reply-h">
        <h2 id="tm-reply-h">In the reply</h2>
        <p>
          An agent does not need a tool call. It writes table words in its own reply, and Yui takes them out before
          the reply is saved: the rows land, and each query becomes a screen with the real rows. From the live run.
        </p>
        <div className="tm-reply">
          <div className="tm-call">
            <p className="tm-call-who">Basil writes</p>
            <pre><code>{REPLY.said}</code></pre>
          </div>
          <div className="tm-call">
            <p className="tm-call-who">Your phone gets</p>
            <div className="tm-drawn">
              <p>Logged your breakfast.</p>
              <div className="tm-drawn-card">
                <b>Foods</b>
                <table>
                  <thead><tr><th>Food</th><th>Cal<small>kcal</small></th><th>Protein<small>g</small></th></tr></thead>
                  <tbody>{REPLY.rows.map(([f, c, p]) => <tr key={f}><td>{f}</td><td>{c}</td><td>{p}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <pre className="tm-call-out"><code>{REPLY.saved}</code></pre>
          </div>
        </div>
        {MORE.map((c) => (
          <div className="tm-call" key={c.title}>
            <h3>{c.title}</h3>
            <p className="tm-call-who">{c.who}</p>
            <pre><code>{c.call}</code></pre>
            <pre className="tm-call-out"><code>{c.out}</code></pre>
          </div>
        ))}
        <p className="tm-small">
          Tests, live on throwaway accounts: <code>supabase/tests/tables_reply_e2e.py</code> 17 of 17 (Hermes),{" "}
          <code>adapters/a2a/tests/a2a_e2e.py</code> 81 of 81 (A2A 1.0, 0.3 and poll),{" "}
          <code>adapters/webhook/tests/webhook_e2e.py</code> 28 of 28 in Python and in Node.
        </p>
      </section>
      <ul className="tm-notes">
        <li><b>You own the table.</b> One agent holds it at a time. Only that agent can read it, write it or draw it.</li>
        <li><b>Give to...</b> moves it. Same name, same rows, same screens. The old agent stops seeing it.</li>
        <li><b>One path on the server.</b> Hermes and MCP call <code>yui_tables</code>, A2A sends a data part, a webhook returns <code>tables</code>, and any of them can just write table words in the reply. All land in the same store.</li>
        <li><b>Next:</b> Controls &gt; Tables in the app, with Give to... and when each table was last read.</li>
      </ul>
    </main>
  );
}

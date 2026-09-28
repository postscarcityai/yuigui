// YUI-171 step 1: a clickable mock of one table read by two different agents on two different hosts.
// Drawn by hand in the browser, not the app: connected agents do not keep server tables yet. Spec: spec/TABLES.md section 8.
import Link from "next/link";
import TablesMock from "./TablesMock";

export const metadata = {
  title: "Switch agents, keep your tables | Yui",
  description: "A clickable mock of Yui tables that follow you: Basil on Hermes keeps your Foods table, you hand it to a Claude agent over MCP, and the same screen draws the same rows. Not built yet.",
};

export default async function TablesMockPage({ searchParams }) {
  const q = await searchParams;
  const only = q?.theme === "light" || q?.theme === "dark" ? q.theme : null;
  return (
    <main className="tm-page">
      <p className="tm-kicker">Mock, not built yet</p>
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
      <ul className="tm-notes">
        <li><b>You own the table.</b> One agent holds it at a time. Only that agent can read it, write it or draw it.</li>
        <li><b>Give to...</b> moves it. Same name, same rows, same screens. The old agent stops seeing it.</li>
        <li><b>One path on the server.</b> Hermes and MCP call <code>yui_tables</code>, A2A sends a data part, a webhook returns <code>tables</code>. All four land in the same store.</li>
      </ul>
    </main>
  );
}

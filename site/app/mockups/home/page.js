// YUI-168 step 1: a tappable mock of an agent's home: its shortcuts, what's waiting on you, and its
// starter screens a swipe left. Drawn in the browser, not the app: the app has no home yet. Spec: spec/HOME.md.
import Link from "next/link";
import HomeMock from "./HomeMock";
import { HOMES, ORDER } from "./homes.mjs";
import { pageMeta } from "../../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/mockups/home",
  title: "Agent home mock | Yui",
  description: "A tappable mock of every agent's home in Yui: its own shortcuts, what's waiting on you, and starter screens one swipe away. Arnold, Basil and Gouda. Not built yet.",
});

export default async function HomeMockPage({ searchParams }) {
  const q = await searchParams;
  const agent = ORDER.includes(q?.agent) ? q.agent : "arnold";
  const only = q?.theme === "light" || q?.theme === "dark" ? q.theme : null;
  const startPage = Number(q?.page) > 1 ? Number(q.page) : 1;
  return (
    <main className="hm-page">
      <p className="hm-kicker">Mock, not built yet</p>
      <h1>Every agent has its own home</h1>
      <p className="hm-lede">
        Open an agent and its shortcuts are right there, with anything waiting on you. Swipe left for its starter screens,
        ready before you ask. Pick an agent, tap a shortcut, swipe.
      </p>
      <p className="hm-links">
        <Link href="/developers/home">Read the spec</Link>
        <Link href="/board#YUI-168">The card</Link>
      </p>
      <nav className="hm-agents" aria-label="Pick an agent">
        {ORDER.map((k) => (
          <Link key={k} href={`/mockups/home?agent=${k}${only ? `&theme=${only}` : ""}`} className={k === agent ? "on" : ""} scroll={false}>
            <span className="hm-face sm">{HOMES[k].face}</span>{HOMES[k].name}
          </Link>
        ))}
      </nav>
      <div className="hm-pair">
        {(only ? [only] : ["light", "dark"]).map((t) => (
          <figure key={t}>
            <HomeMock agent={agent} theme={t} startPage={startPage} />
            <figcaption>{t === "light" ? "Light" : "Dark"}</figcaption>
          </figure>
        ))}
      </div>
      <ul className="hm-notes">
        <li><b>Shortcuts</b> are the two to four things you do most with this agent. One sends a message, one opens a screen.</li>
        <li><b>Waiting on you</b> shows the agent&apos;s open asks right on its home. Answer one here and it leaves Review too.</li>
        <li><b>Starter screens</b> sit a swipe left from the first open: Arnold&apos;s week and today&apos;s workout, Basil&apos;s calories and grocery list, Gouda&apos;s looper, chords and keys. The agent keeps them current.</li>
        <li><b>Any agent can set its own.</b> It is two Yui Lines words that already exist: <code>menu shortcut</code> for the chips and <code>&gt;2</code> for a screen.</li>
      </ul>
    </main>
  );
}

// The live board. content/board.json is written by scripts/export-board.mjs from the kanban DB,
// and a cron re-exports and redeploys it when a card moves (at most every 30 minutes).
import Link from "next/link";
import board from "../../content/board.json";
import { seeIt } from "../../lib/showcase.mjs";

export const metadata = { title: "Board | Yui", description: "Every Yui card we are working on, live from our kanban board." };

const when = (iso) =>
  new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function Tile({ c, col, first }) {
  const see = seeIt(c.key);
  return (
    <li className={`btile ${col}`} id={first ? c.key : undefined}>
      <div className="btile-top">
        <span className="bkey">{c.key}</span>
        {c.mvp && <span className="pill bmvp">MVP</span>}
        {c.waiting && <span className="pill" title="Parked until something it depends on lands">Waiting</span>}
      </div>
      <h3>{c.title}</h3>
      {c.summary && <p>{c.summary}</p>}
      {(c.shipped || c.progress || see) && (
        <div className="btile-foot">
          {c.shipped && <span>Shipped {c.shipped}</span>}
          {c.progress && <Link href={c.progress}>Read the log</Link>}
          {see && <Link href={see}>{c.shipped ? "See it" : "See the plan"}</Link>}
        </div>
      )}
    </li>
  );
}

export default function Board() {
  const seen = new Set();
  const first = (k) => (seen.has(k) ? false : (seen.add(k), true));
  return (
    <>
      <div className="eyebrow">Board | live from our kanban</div>
      <h1>What we are building, right now.</h1>
      <p className="lede">
        Every Yui card, from parked ideas to what shipped this month. Agents pick cards up and move them along;
        this page follows on its own. Updated {when(board.updated)} ET. MVP cards carry a tag; the <Link href="/roadmap#mvp">roadmap</Link> has the MVP total.
      </p>
      <div className="board">
        {board.columns.map((col) => (
          <section className={`bcol ${col.key}`} key={col.key} aria-labelledby={`col-${col.key}`}>
            <h2 id={`col-${col.key}`}>{col.title} <span className="bcount">{col.cards.length}</span></h2>
            <ul>{col.cards.map((c, i) => <Tile c={c} col={col.key} first={first(c.key)} key={`${c.key}-${i}`} />)}</ul>
          </section>
        ))}
      </div>
      <p style={{ color: "var(--muted)", fontSize: 15 }}>
        Titles only, straight from the board. The full story of each shipped card is in the <Link href="/progress">ship log</Link>.
      </p>
    </>
  );
}

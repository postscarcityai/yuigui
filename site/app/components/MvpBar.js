import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";

// MVP progress: percent of MVP cards shipped. scripts/export-board.mjs writes the statuses in content/mvp.json.
export function mvpStats() {
  const { updated, cards } = JSON.parse(readFileSync(path.join(process.cwd(), "content", "mvp.json"), "utf8"));
  const shipped = cards.filter((c) => c.status === "shipped").length;
  return { updated, cards, shipped, total: cards.length, pct: Math.round((shipped / cards.length) * 100) };
}

export default function MvpBar({ detail = false }) {
  const { updated, cards, shipped, total, pct } = mvpStats();
  const building = cards.filter((c) => c.status === "building");
  const next = cards.filter((c) => c.status === "next");
  return (
    <div className="card mvp" id="mvp">
      <div className="mvp-head">
        <h3>MVP: {pct}% shipped</h3>
        <span className="mvp-count">{shipped} of {total} cards</span>
      </div>
      <div className="mvp-track" role="progressbar" aria-label="MVP progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="mvp-fill" style={{ width: `${pct}%` }} />
      </div>
      <p>
        The smallest Yui a stranger can use: install from TestFlight, sign in, connect your own Hermes in minutes,
        get screens and pushes from your agents, and delete your account.
        {detail ? ` Updated ${updated}.` : <> <Link href="/roadmap#mvp">What counts</Link>.</>}
      </p>
      {detail && (
        <>
          <p className="mvp-label">Building now</p>
          <div className="mvp-pills">{building.map((c) => <span className="pill now" key={c.key + c.title}>{c.key} {c.title}</span>)}</div>
          <p className="mvp-label">Still to go</p>
          <div className="mvp-pills">{next.map((c) => <span className="pill" key={c.key + c.title}>{c.key} {c.title}</span>)}</div>
        </>
      )}
    </div>
  );
}

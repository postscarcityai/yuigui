import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { day } from "../../lib/day.mjs";
import { STAGE } from "../../lib/stage.mjs";

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
  // Once the MVP is called done (lib/stage.mjs), the bar is full and says so; any card the board
  // still has open is listed below it, so the page never hides what is left.
  const done = !!STAGE.mvpDone;
  const shown = done ? 100 : pct;
  return (
    <div className="card mvp" id="mvp">
      <div className="mvp-head">
        <h2>{done ? `MVP: done ${day(STAGE.mvpDone)}` : `MVP: ${pct}% shipped`}</h2>
        <span className="mvp-count">{shipped} of {total} cards</span>
      </div>
      <div className="mvp-track" role="progressbar" aria-label="MVP progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={shown}>
        <div className="mvp-fill" style={{ width: `${shown}%` }} />
      </div>
      <p>
        The smallest Yui a stranger can use: install from TestFlight, sign in, connect your own Hermes in minutes,
        get screens and pushes from your agents, and delete your account.
        {done ? ` It is done, and Yui is in ${STAGE.name}.` : ""}
        {detail ? ` Updated ${day(updated)}.` : <> <Link href="/roadmap#mvp">What counts</Link>.</>}
      </p>
      {detail && (
        <>
          {building.length > 0 && <>
            <p className="mvp-label">Building now</p>
            <div className="mvp-pills">{building.map((c) => <span className="pill now" key={c.key + c.title}>{c.key} {c.title}</span>)}</div>
          </>}
          {next.length > 0 && <>
            <p className="mvp-label">{done ? "Still open on the board" : "Still to go"}</p>
            <div className="mvp-pills">{next.map((c) => <span className="pill" key={c.key + c.title}>{c.key} {c.title}</span>)}</div>
          </>}
        </>
      )}
    </div>
  );
}

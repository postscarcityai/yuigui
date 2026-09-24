// How Yui grew, day by day (SITE-16). content/timeline.json comes from scripts/export-timeline.mjs:
// the commit history of both public repos, the TestFlight builds and the ship log, joined.
import data from "../../content/timeline.json";
import Grow from "../components/Grow";
import Shots from "../components/Shots";

export const metadata = {
  title: "Timeline | Yui",
  description: "Watch Yui grow: every change, build and commit to the app and this site, day by day, with screenshots.",
};

const dayName = (d) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
const time = (iso) => new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" });

// The player runs oldest first, one frame per shipped change that has a screenshot.
const frames = data.days.flatMap((d) => d.moments).filter((m) => m.kind === "ship" && m.images.length).reverse()
  .map((m) => ({ ...m.images[0], at: m.at, title: m.title, card: m.card, anchor: m.anchor, totals: m.totals }));

export default function Timeline() {
  const t = data.totals;
  return (
    <>
      <div className="eyebrow">Timeline</div>
      <h1>Watch Yui grow.</h1>
      <p className="lede">
        Yui is built in public, so its whole history is on GitHub. This page reads it back: {t.app} commits to the{" "}
        <a href="https://github.com/postscarcityai/yui">app</a>, {t.site} to <a href="https://github.com/postscarcityai/yuigui">this site</a>,{" "}
        {t.builds} TestFlight builds and {t.shipped} shipped changes. Press play to watch it come together.
      </p>

      <Grow frames={frames} />

      {data.days.map((d) => (
        <section key={d.date} className="tl-day">
          <h2>{dayName(d.date)}</h2>
          <p className="tl-sum">
            {d.moments.filter((m) => m.kind === "ship").length} shipped, {d.moments.filter((m) => m.kind === "build").length} builds,{" "}
            {d.commits.length} commits
          </p>
          <ol className="log tl">
            {d.moments.map((m) => m.kind === "build" ? (
              <li key={`b${m.build}`} className="tl-build">
                <div className="date">{time(m.at)}</div>
                <a href={`/changelog#build-${m.build}`} className="pill done">Build {m.build}</a>
                <span className="tl-note">{m.changes} {m.changes === 1 ? "change" : "changes"} to TestFlight</span>
              </li>
            ) : (
              <li key={m.anchor} id={m.anchor}>
                <div className="date">{time(m.at)}</div>
                <h3><a href={`/progress#${m.anchor}`}>{m.title}</a>{m.card && <span className="bkey">{m.card}</span>}</h3>
                <Shots images={m.images} label={m.title} />
              </li>
            ))}
          </ol>
          <details className="tl-commits">
            <summary>All {d.commits.length} commits that day</summary>
            <ul>
              {d.commits.map((c) => (
                <li key={`${c.repo}${c.sha}`}>
                  <span className="tl-time">{time(c.at)}</span>
                  <span className={`tl-repo ${c.repo}`}>{c.repo}</span>
                  <a href={c.url}>{c.text}</a>
                </li>
              ))}
            </ul>
          </details>
        </section>
      ))}
    </>
  );
}

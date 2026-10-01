// Newest first. Entries live in content/progress.json, see BUILD-IN-PUBLIC.md.
import log from "../../content/progress.json";
import { slug } from "../../lib/slug.mjs";
import { day } from "../../lib/day.mjs";
import { shotsOf } from "../../lib/shots.mjs";
import Shots from "../components/Shots";
import LazyVideo from "../components/LazyVideo";
import { inNextBuild, NEXT_BUILD_NOTE } from "../../lib/nextbuild.mjs";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({ path: "/progress", title: "Shipped | Yui", description: "Every Yui change, newest first, with screenshots." });

// One push that spans many cards (an `epic` key on the entries, see EPICS) reads as one heading per day,
// placed where its newest entry is.
const EPICS = { web: { title: "Yui on the web" } };

function groups(entries) {
  const out = [];
  const seen = new Set();
  for (const e of entries) {
    if (!e.epic || !EPICS[e.epic]) { out.push({ entry: e }); continue; }
    const key = `${e.date}-${e.epic}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ key, date: e.date, epic: { key: e.epic, ...EPICS[e.epic] }, entries: entries.filter((x) => x.epic === e.epic && x.date === e.date) });
  }
  return out;
}

function Entry({ e }) {
  return (
    <li id={slug(e.title)}>
      <div className="date">{day(e.date)}</div>
      <h3 style={{ margin: "2px 0 4px" }}>{e.title}</h3>
      {inNextBuild(e.card) && <p className="next-build"><a href="/changelog#next" className="pill">Next build</a> {NEXT_BUILD_NOTE}</p>}
      <div style={{ color: "var(--muted)" }}>{e.body}</div>
      {e.try && <p style={{ margin: "8px 0 0" }}><a href={e.try.href}>{e.try.label} →</a></p>}
      {e.video && (
        <LazyVideo className="progress-clip" src={e.video.src} poster={e.video.poster} controls muted playsInline preload="none"
          aria-label={`${e.title}, a ${Math.round(e.video.seconds)} second screen recording`} />
      )}
      <Shots images={shotsOf(e)} label={e.title} />
    </li>
  );
}

export default function Progress() {
  const items = groups(log);
  return (
    <>
      <div className="eyebrow">Shipped</div>
      <h1>What shipped, and when.</h1>
      <p className="lede">
        Every change, newest first, with screenshots. Tap one to see it full size. <a href="/changelog">Builds</a> groups
        the same work by TestFlight build, and the <a href="/roadmap">roadmap</a> has the phases and what comes next.
      </p>

      <h2>Log</h2>
      <ul className="log">
        {items.map((it) => it.epic ? (
          <li key={it.key} id={`epic-${it.epic.key}`} className="epic">
            <div className="date">{day(it.date)}</div>
            <h3 style={{ margin: "2px 0 4px" }}>{it.epic.title}</h3>
            <p style={{ color: "var(--muted)", margin: "0 0 4px" }}>{it.entries.length} changes in one push.</p>
            <ul className="log epic-log">{it.entries.map((e) => <Entry key={e.title} e={e} />)}</ul>
          </li>
        ) : <Entry key={it.entry.title} e={it.entry} />)}
      </ul>
    </>
  );
}

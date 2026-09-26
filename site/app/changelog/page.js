// The changelog: the progress log grouped by TestFlight build.
// content/builds.json comes from scripts/export-builds.mjs (App Store Connect + the app repo's commits).
// Each build lists what changed and the screenshots from the matching progress entries (joined on "card", or "build").
import Link from "next/link";
import builds from "../../content/builds.json";
import board from "../../content/board.json";
import log from "../../content/progress.json";
import { slug } from "../../lib/slug.mjs";
import { day as date } from "../../lib/day.mjs";
import { shotsOf } from "../../lib/shots.mjs";
import Shots from "../components/Shots";
import { releaseBuild } from "../../lib/release.mjs";

export const metadata = {
  title: "Builds | Yui",
  description: "Every Yui TestFlight build: when it shipped, what changed, and what it looks like.",
};

// Housekeeping commits that say nothing to someone using the app.
const CHORE = /^(ignore|bump|merge|chore|fix typo)\b/i;

function entriesFor(b, cards) {
  return log.filter((e) => e.build === b || (e.card && cards.has(e.card) && e.build === undefined));
}

function Changes({ changes, build }) {
  const seen = new Set();
  const items = [];
  // An entry tagged with this build number tells the story better than its commits do.
  const told = log.filter((e) => build !== undefined && e.build === build);
  for (const e of told) {
    items.push(<li key={e.title}><Link href={`/progress#${slug(e.title)}`}>{e.title}</Link></li>);
  }
  for (const c of changes) {
    if (CHORE.test(c.text) || (told.length && !c.card)) continue;
    const entry = c.card && log.find((e) => e.card === c.card);
    if (entry) {
      if (seen.has(c.card)) continue;
      seen.add(c.card);
      items.push(
        <li key={c.card}>
          <Link href={`/progress#${slug(entry.title)}`}>{entry.title}</Link>
          <span className="bkey">{c.card}</span>
        </li>
      );
    } else {
      items.push(<li key={c.text}>{c.text}{c.card && <span className="bkey">{c.card}</span>}</li>);
    }
  }
  return items.length ? <ul className="changes">{items}</ul> : <p>Housekeeping only.</p>;
}

// The release tile (YUI-90): one line on where the next version stands, linking to the live timeline.
function ReleaseTile() {
  const rel = board.release;
  if (!rel) return null;
  const name = rel.version ? `Yui ${rel.version}` : "The next build";
  const b = releaseBuild(rel, builds);
  const landed = rel.cards.filter((c) => c.status === "done").length;
  const waiting = builds.next.filter((c) => !CHORE.test(c.text)).length;
  const said = rel.status === "shipped"
    ? `${name} shipped${b ? ` as build ${b.build}` : ""}.${waiting ? ` ${waiting} ${waiting === 1 ? "change is" : "changes are"} on main for the next one.` : ""}`
    : `${name}: ${landed} of ${rel.cards.length} cards landed${rel.status === "shipping" ? ", shipping now" : ""}.`;
  return (
    <a className="card note-card release-tile" href="/playground?demo=release">
      <span className={`pill ${rel.status === "shipped" ? "done" : "now"}`}>Release</span>
      <h3>Where the next release stands</h3>
      <p>{said} The timeline, live from the board.</p>
    </a>
  );
}

export default function Changelog() {
  return (
    <>
      <div className="eyebrow">Builds</div>
      <h1>Every build, and what it changed.</h1>
      <p className="lede">
        Each TestFlight build of the Yui app, newest first, with the screens it brought. The build number counts the
        commits in the <a href="https://github.com/postscarcityai/yui">app repo</a>, so every build has a clear list of
        changes. The <a href="/progress">ship log</a> has the full story, including work on this site and the spec.
      </p>

      <ReleaseTile />

      {builds.next.filter((c) => !CHORE.test(c.text)).length > 0 && (
        <section className="build" id="next">
          <div className="build-head">
            <h2>Next build</h2>
            <span className="pill wait">Waiting on Apple</span>
          </div>
          <p className="build-note">
            Done in the code, not on TestFlight yet. We upload once per release and Apple caps uploads per day, so
            these go up together as the next build. It gets its number when it uploads.
          </p>
          <Changes changes={builds.next} />
        </section>
      )}

      <ol className="builds">
        {builds.builds.map((b) => {
          const cards = new Set(b.changes.map((c) => c.card).filter(Boolean));
          const shots = entriesFor(b.build, cards).flatMap((e) => shotsOf(e));
          return (
            <li className="build" key={b.build} id={`build-${b.build}`}>
              <div className="build-head">
                <h2>Build {b.build}</h2>
                <span className="date">{date(b.date)}</span>
                {b.state !== "live" && <span className="pill">Processing</span>}
              </div>
              <Changes changes={b.changes} build={b.build} />
              {shots.length > 0 && <Shots images={shots} label={`Build ${b.build}`} />}
            </li>
          );
        })}
      </ol>
    </>
  );
}

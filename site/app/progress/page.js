// Newest first. Entries live in content/progress.json, see BUILD-IN-PUBLIC.md.
import log from "../../content/progress.json";
import { slug } from "../../lib/slug.mjs";
import { day } from "../../lib/day.mjs";
import { shotsOf } from "../../lib/shots.mjs";
import Shots from "../components/Shots";
import LazyVideo from "../components/LazyVideo";
import { inNextBuild, NEXT_BUILD_NOTE } from "../../lib/nextbuild.mjs";

export const metadata = { title: "Shipped | Yui" };

export default function Progress() {
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
        {log.map((e) => (
          <li key={e.title} id={slug(e.title)}>
            <div className="date">{day(e.date)}</div>
            <h3 style={{ margin: "2px 0 4px" }}>{e.title}</h3>
            {inNextBuild(e.card) && <p className="next-build"><a href="/changelog#next" className="pill">Next build</a> {NEXT_BUILD_NOTE}</p>}
            <div style={{ color: "var(--muted)" }}>{e.body}</div>
            {e.video && (
              <LazyVideo className="progress-clip" src={e.video.src} poster={e.video.poster} controls muted playsInline preload="none"
                aria-label={`${e.title}, a ${Math.round(e.video.seconds)} second screen recording`} />
            )}
            <Shots images={shotsOf(e)} label={e.title} />
          </li>
        ))}
      </ul>
    </>
  );
}

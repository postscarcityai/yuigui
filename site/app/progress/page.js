// Newest first. Entries live in content/progress.json, see BUILD-IN-PUBLIC.md.
import log from "../../content/progress.json";
import { slug } from "../../lib/slug.mjs";
import { shotsOf } from "../../lib/shots.mjs";
import Shots from "../components/Shots";

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
            <div className="date">{e.date}</div>
            <h3 style={{ margin: "2px 0 4px" }}>{e.title}</h3>
            <div style={{ color: "var(--muted)" }}>{e.body}</div>
            <Shots images={shotsOf(e)} label={e.title} />
          </li>
        ))}
      </ul>
    </>
  );
}

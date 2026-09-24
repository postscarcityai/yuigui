// Newest first. Entries live in content/progress.json, see BUILD-IN-PUBLIC.md.
import log from "../../content/progress.json";
import { slug } from "../../lib/slug.mjs";
import { shotsOf } from "../../lib/shots.mjs";
import Shots from "../components/Shots";

export const metadata = { title: "Progress | Yui" };

const phases = [
  ["0", "Foundations: hub site, Yui Lines v0, SwiftUI stack, TestFlight pipeline. Shipped Sep 23.", "done"],
  ["1", "Talk to your own Hermes agents: app on TestFlight, first presets, accounts, plugin, handoff. Shipped Sep 24.", "done"],
  ["2", "Many agents: own looks, push, handoff, full screen shipped Sep 24. Voice, lock-screen timer and three screens come after the MVP.", ""],
  ["3", "On-device data tables and key vault", ""],
  ["4", "Onboarding interview + built-in agent", ""],
  ["5", "Open adapters and the beta: one-command install and open source shipped, public TestFlight in Apple's review", "now"],
  ["6", "Payments, widgets, Siri, Android decision", ""],
];

export default function Progress() {
  return (
    <>
      <div className="eyebrow">Progress</div>
      <h1>What shipped, and when.</h1>
      <p className="lede">
        Every change, newest first, with screenshots. Tap one to see it full size. The <a href="/changelog">changelog</a> groups
        the same work by TestFlight build.
      </p>

      <h2>Phase status</h2>
      <div className="grid">
        {phases.map(([n, t, s]) => (
          <div className="card" key={n}>
            <span className={`pill ${s}`}>{s === "now" ? "In progress" : s === "done" ? "Shipped" : "Up next"}</span>
            <h3 style={{ marginTop: 10 }}>Phase {n}</h3>
            <p>{t}</p>
          </div>
        ))}
      </div>

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

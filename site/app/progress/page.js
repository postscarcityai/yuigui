// Newest first. Entries live in content/progress.json, see BUILD-IN-PUBLIC.md.
import log from "../../content/progress.json";
import Waitlist from "../components/Waitlist";
import { slug } from "../../lib/slug.mjs";

export const metadata = { title: "Progress | Yui" };

const phases = [
  ["0", "Foundations: hub site, Yui Lines v0, SwiftUI stack, TestFlight pipeline", "now"],
  ["1", "SwiftUI app on TestFlight: chat, 6 presets, relay, Arnold's timer", ""],
  ["2", "Many agents, voice, push, lock-screen timer", ""],
  ["3", "On-device data tables and key vault", ""],
  ["4", "Onboarding interview + built-in agent", ""],
  ["5", "Open adapters + private beta", ""],
  ["6", "Payments, widgets, Siri, Android decision", ""],
];

export default function Progress() {
  return (
    <>
      <div className="eyebrow">Progress</div>
      <h1>What shipped, and when.</h1>

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
            {e.image && <img className="logimg" src={e.image} alt={e.imageAlt || e.title} loading="lazy" />}
          </li>
        ))}
      </ul>
      <Waitlist source="progress" />
    </>
  );
}

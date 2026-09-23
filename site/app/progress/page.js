export const metadata = { title: "Progress | Yui" };

// Newest first. Add an entry every time something ships.
const log = [
  {
    date: "2026-09-23",
    title: "Hub site live (Phase 0)",
    body: "This site: overview, roadmap, progress log, business plan draft, pitch deck, three phone mockups. Deployed to Vercel as project yui. yuigui.com not attached yet.",
  },
  {
    date: "2026-09-23",
    title: "Roadmap v1",
    body: "Six phases written from the pitch. Stack call: JSON UI protocol, Expo app, Cloudflare relay, Hermes connector. Arnold is the first agent wired in.",
  },
  {
    date: "2026-09-23",
    title: "Pitch recorded and transcribed",
    body: "Chris recorded a 21.6 minute pitch (rec 366). Transcribed locally with Whisper and summarized. The name settled on Yui.",
  },
];

const phases = [
  ["0", "Hub site on Vercel", "now"],
  ["1", "UI protocol v0 + component kit + web playground", ""],
  ["2", "Relay + Hermes connector, Arnold first", ""],
  ["3", "Expo app on TestFlight", ""],
  ["4", "Onboarding interview + starter agents", ""],
  ["5", "Data layer, connectors, SMS", ""],
  ["6", "App Store, hosted agents, payments", ""],
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
            <span className={`pill ${s}`}>{s === "now" ? "In progress" : "Up next"}</span>
            <h3 style={{ marginTop: 10 }}>Phase {n}</h3>
            <p>{t}</p>
          </div>
        ))}
      </div>

      <h2>Log</h2>
      <ul className="log">
        {log.map((e) => (
          <li key={e.title}>
            <div className="date">{e.date}</div>
            <h3 style={{ margin: "2px 0 4px" }}>{e.title}</h3>
            <div style={{ color: "var(--muted)" }}>{e.body}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

export const metadata = { title: "Pitch deck | Yui" };

const slides = [
  { h: "Yui", p: "The screen your agent was missing." },
  { h: "Agents are stuck in text", li: ["Personal agents live in Telegram and SMS", "Every answer is a paragraph", "A yes or no should be two buttons. A workout should be a timer."] },
  { h: "Let the agent build the screen", li: ["Chat is home", "The agent takes over the screen when UI beats words", "Timers, forms, multi-select, tables, dashboards, generated on demand"] },
  { h: "How it works", li: ["The agent emits Yui Lines, one short line per element", "Yui renders it with native SwiftUI presets", "A relay carries it from any agent to any phone, with push and deep links"] },
  { h: "Demo: Arnold", p: "\"Intervals of 40 on, 20 off, eight rounds.\" The screen becomes Arnold's interval timer, in Arnold's colors, with big buttons." },
  { h: "Who first", li: ["Hermes and OpenClaw users who already run an agent", "Bring your own keys: OpenRouter, fal, Replicate", "Then everyone else, through a guided onboarding interview"] },
  { h: "Why us, why now", li: ["Agents went daily in 2026 and hit the text ceiling", "Models now emit reliable structured UI", "We run a multi-agent fleet every day. We are the user."] },
  { h: "Business model", li: ["Free with your own agent and keys", "Subscription for hosted agents", "Credits for models and images, connectors for work"] },
  { h: "Roadmap", li: ["Now: hub site", "Weeks 1-5: UI protocol, relay, Arnold on a real screen", "Weeks 4-12: TestFlight, onboarding, starter agents", "2027: data layer, connectors, App Store"] },
  { h: "Yui", p: "Talk to your agents. Let them show you. yuigui.com" },
];

export default function Deck() {
  return (
    <>
      <div className="eyebrow">Pitch deck | v1</div>
      <h1>Ten slides.</h1>
      <p className="lede">Draft deck built from the pitch. Scroll through.</p>
      <div style={{ marginTop: 32 }}>
        {slides.map((s, i) => (
          <div className="slide" key={i}>
            <div className="num">{i + 1} / {slides.length}</div>
            <h2>{s.h}</h2>
            {s.p && <p>{s.p}</p>}
            {s.li && <ul>{s.li.map((x) => <li key={x}>{x}</li>)}</ul>}
          </div>
        ))}
      </div>
    </>
  );
}

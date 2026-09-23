import Link from "next/link";

const pillars = [
  ["Chat first", "The default screen is a conversation with your agent. Type it or say it."],
  ["The agent takes the screen", "When words are not enough, the agent builds the UI: a timer, a form, a multi-select, a table, a dashboard."],
  ["Generative, not templated", "Two people should get wildly different screens. A shared component kit and UX rules keep it clean."],
  ["Bring your own agent", "Hermes and OpenClaw users plug in first. Starter agents come later for people with nothing set up."],
  ["Any channel", "Talk on Telegram, SMS or voice. Say \"pull this up on Yui\" and a push notification deep-links to the screen."],
  ["A face per agent", "Each agent has its own colors, avatar and voice. Arnold looks and sounds like Arnold."],
];

const quotes = [
  "I'm obsessed with this idea of generative UI. It can be totally unique each time.",
  "If it asks me a question, I just want a button.",
  "Our real value proposition is its ability to just show you whatever you want.",
  "The goal is that you download this app, you put in your credit card and you're off to the races with a multi-agent in your life.",
];

export default function Home() {
  return (
    <>
      <div className="eyebrow">Phase 0 | build hub</div>
      <h1>Yui is a mobile hub for your AI agents.</h1>
      <p className="lede">
        You talk to your agent. When a button, a timer or a table would work better than text,
        the agent takes over the screen and generates that UI on the spot, inside one shared design system.
      </p>

      <h2>What it does</h2>
      <div className="grid">
        {pillars.map(([t, d]) => (
          <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>

      <h2>The example that started it</h2>
      <div className="card">
        <p>
          Mid-workout, Chris tells Arnold: &quot;I want intervals of 40 on, 20 off, eight rounds.&quot;
          Arnold does not reply with a paragraph. The screen becomes an interval timer in Arnold&apos;s colors,
          with big start and pause buttons. Asked a yes or no question, the app shows two buttons.
          Asked to pick, it shows a multi-select with a free-text escape hatch.
        </p>
      </div>

      <h2>In Chris&apos;s words</h2>
      {quotes.map((q) => <div className="quote" key={q}>&ldquo;{q}&rdquo;</div>)}
      <p style={{ color: "var(--muted)", fontSize: 14 }}>From pitch recording 366, Sep 23 2026. Working name in the recording: Project Nexus.</p>

      <h2>Where to look</h2>
      <div className="grid">
        <Link className="card" href="/roadmap"><h3>Roadmap</h3><p>Six phases from this site to the App Store.</p></Link>
        <Link className="card" href="/progress"><h3>Progress</h3><p>Dated log of what shipped.</p></Link>
        <Link className="card" href="/plan"><h3>Business plan</h3><p>Market, model, risks. Draft one.</p></Link>
        <Link className="card" href="/deck"><h3>Pitch deck</h3><p>Ten slides.</p></Link>
        <Link className="card" href="/mockups"><h3>Mockups</h3><p>Chat, Arnold&apos;s interval timer, onboarding interview.</p></Link>
      </div>
    </>
  );
}

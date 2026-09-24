import Link from "next/link";
import CtaLink from "./components/CtaLink";
import links from "../content/links.json";
import MvpBar from "./components/MvpBar";

const what = [
  ["Screens, not walls of text", "Ask for a workout and get a timer. Get asked a question and get buttons. Change your answer any time."],
  ["Chat when words are enough", "Talk to your agent the way you text a friend. Type it or say it."],
  ["Every agent looks like itself", "Each agent gets its own name chip and colors, so you always know who you are talking to."],
  ["Your agents stay yours", "Yui connects to agents you already run. You add them, rename them and remove them."],
];

const who = [
  ["H", "var(--brand)", "People who run Hermes", "Works today. A small plugin on your own machine connects your Hermes profiles, and each one shows up in Yui as its own agent."],
  ["O", "var(--lavender)", "People with other agents", "Next on the roadmap. OpenClaw and other setups connect through the same connector. If your agent can send a message, it can draw a screen."],
  ["+", "var(--mint)", "People with no agent yet", "Later on the roadmap. Starter agents, for anyone who wants the app without setting anything up."],
];

const shots = [
  ["/app/chat-light.webp", "A tabata timer the agent drew mid-chat"],
  ["/app/checkin-light.webp", "A daily check-in, one tap per answer"],
  ["/app/choose-dark.webp", "A quick choice, with room to type your own"],
  ["/app/today-dark.webp", "Today's plan as a checklist"],
];

const quotes = [
  "If it asks me a question, I just want a button.",
  "Our real value proposition is its ability to just show you whatever you want.",
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">Built in public | open source</div>
          <h1>Meet Yui, a generative user interface.</h1>
          <p className="lede">
            Your agent draws the screen instead of replying in walls of text: a timer, a form, a quick choice.
            You tap, and it keeps going. A native iPhone app, built for Hermes first.
          </p>
          <div className="cta">
            {links.testflight
              ? <CtaLink cta="testflight" where="/hero" href={links.testflight}>Get the TestFlight beta</CtaLink>
              : <a className="btn" href="#waitlist">Join the waitlist</a>}
            <CtaLink cta="github" where="/hero" className="btn soft" href={links.github}>Star on GitHub</CtaLink>
            <Link className="btn ghost" href="/progress">See what shipped</Link>
          </div>
        </div>
        <div className="shots">
          <img src="/app/chat-light.webp" alt="Yui in light mode: the agent answers a tabata request with a live interval timer and Yes or No buttons" width="460" height="1000" />
          <img src="/app/chat-dark.webp" alt="The same chat in dark mode" width="460" height="1000" />
        </div>
      </section>

      <MvpBar />

      <h2>What works today</h2>
      <div className="grid">
        {what.map(([t, d]) => (
          <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>

      <h2>Who it is for</h2>
      <div className="who">
        {who.map(([i, c, t, d]) => (
          <div className="card" key={t}>
            <div className="chipdot" style={{ background: c }} aria-hidden="true">{i}</div>
            <h3>{t}</h3><p>{d}</p>
          </div>
        ))}
      </div>

      <h2>The app today</h2>
      <p className="lede" style={{ fontSize: 18 }}>Real screenshots from the current test build. Nothing here is a mockup.</p>
      <div className="gallery">
        {shots.map(([src, cap]) => (
          <figure key={src}>
            <img src={src} alt={cap} width="460" height="1000" loading="lazy" />
            <figcaption>{cap}</figcaption>
          </figure>
        ))}
      </div>

      <h2>Why we are building it</h2>
      {quotes.map((q) => <div className="quote" key={q}>&ldquo;{q}&rdquo;</div>)}
      <p style={{ color: "var(--muted)", fontSize: 15 }}>Chris Johnston, who started Yui.</p>

      <h2>Follow along</h2>
      <div className="grid">
        <Link className="card" href="/progress"><h3>Progress</h3><p>A dated log of everything that shipped.</p></Link>
        <Link className="card" href="/roadmap"><h3>Roadmap</h3><p>Where Yui is headed, phase by phase.</p></Link>
        <Link className="card" href="/board"><h3>The board</h3><p>Every card we are working on, live.</p></Link>
        <Link className="card" href="/playground"><h3>Playground</h3><p>Try the screen language in your browser.</p></Link>
      </div>
    </>
  );
}

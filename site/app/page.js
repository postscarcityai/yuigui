import Link from "next/link";
import CtaLink from "./components/CtaLink";
import links from "../content/links.json";
import HeroVideo from "./components/HeroVideo";
import ClipGrid from "./components/ClipGrid";
import clipsData from "../public/demo/clips/clips.json";
import { STAGE } from "../lib/stage.mjs";
import { latestRelease } from "../lib/og/release.mjs";
import { pageMeta } from "../lib/og/meta.mjs";

// On phones now: the roadmap's "Latest release" line, so the home page moves with each release.
// The share card does not (SITE-103): it is always "Yui: The GUI for You" and public/og/home.jpg.
const latest = latestRelease();

export const metadata = pageMeta({
  path: "/",
  title: "Yui: The GUI for You",
  description: "Meet Yui, a generative user interface. Your agent draws the screen instead of replying in walls of text: a timer, a form, a choice. A native iPhone app for the agents you already run, in alpha on TestFlight.",
  image: "/og/home.jpg?v=1",
});

const what = [
  ["Screens, not walls of text", "Ask for a workout and get a timer. Get asked a question and get buttons. Change your answer any time."],
  ["Chat when words are enough", "Talk to your agent the way you text a friend. When it answers while you are away, you get a push."],
  ["Every agent looks like itself", <>Each agent gets its own name chip and colors, so you always know who you are talking to. <Link href="/crew">Meet the crew</Link>.</>],
  ["Your agents stay yours", "Yui connects to agents you already run. You add them, rename them and remove them."],
];

const who = [
  ["H", "var(--brand)", "People who run Hermes", "Works today. A small plugin connects your Hermes profiles, and each shows up in Yui as its own agent."],
  ["O", "var(--lavender)", "People with other agents", "Works today with OpenClaw, Claude Code, Cursor, a model you run yourself, and anything that answers a webhook. If your agent can send a message, it can draw a screen."],
  ["+", "var(--mint)", "People with no agent yet", "Later. A starter agent, for anyone who wants the app without setting anything up."],
];

// The best screen recordings on the site, up front instead of three pages deep. Each one is the real app
// on the simulator, one preset, captions burned in (public/demo/clips/clips.json).
// `from` is the share of the clip to skip: each opens on a quiet "say hi" screen before its preset shows.
const CLIPS = [["timer", 0.3], ["choose", 0.45], ["compare", 0.3], ["chart", 0.35], ["calc", 0.3], ["gallery", 0.3], ["storyboard", 0.3], ["form", 0.3]]
  .filter(([k]) => clipsData[k]?.["9x16"])
  .map(([k, from]) => {
    const v = clipsData[k]["9x16"];
    return { src: v.src, poster: v.src.replace(/\.mp4$/, "-still.jpg"), caption: clipsData[k].caption, start: Math.round(v.seconds * from * 10) / 10 };
  });

// The teaser's picture: what a ledger keeps, drawn rather than described. Example rows, not anyone's data.
const EARN_ROWS = [["Day 1", "Joined Yui"], ["Day 2", "Used Yui"], ["Day 3", "Used Yui"], ["Day 5", "Feedback shipped"], ["Day 9", "Pull request merged"]];

const quotes = [
  "If it asks me a question, I just want a button.",
  "Our real value proposition is its ability to just show you whatever you want.",
];

export default function Home() {
  return (
    <>
      <section className="hero hero-v">
        <div className="hero-text">
          <div className="eyebrow">Proudly Open Sourced</div>
          <h1>Meet Yui, a generative user interface.</h1>
          <p className="tagline">The GUI for you.</p>
          <p className="lede">
            Your agent draws the screen instead of replying in walls of text: a timer, a form, a quick choice.
            You tap, and it keeps going. A native iPhone app for the agents you already run.
          </p>
          <div className="cta">
            {links.testflight
              ? <CtaLink cta="testflight" where="/hero" href={links.testflight}>Download on TestFlight</CtaLink>
              : <a className="btn" href="#invite">Ask for a hand</a>}
            <Link className="btn soft" href="/web">Open Yui in your browser</Link>
            <CtaLink cta="github" where="/hero" className="btn ghost" href={links.github}>Star on GitHub</CtaLink>
          </div>
          <p className="hero-note">
            In {STAGE.name}, for iPhone on iOS 26. Bring your own agent. Just looking? <Link href="/web?demo=penny">Tap a live demo</Link>, no sign in.
          </p>
        </div>
        <HeroVideo />
        {latest ? (
          <p className="hero-note hero-latest">
            On phones now: <Link href={`/changelog#build-${latest.build}`}>Yui {latest.version}, build {latest.build}</Link>, {latest.name} ({latest.date}).
          </p>
        ) : null}
      </section>

      <h2>See it move</h2>
      <p className="lede" style={{ fontSize: 18 }}>
        The real app, one screen at a time. <Link href="/mockups">See every screen</Link>.
      </p>
      <ClipGrid clips={CLIPS} />

      <h2>What works today</h2>
      <div className="grid">
        {what.map(([t, d]) => (
          <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>

      <section className="earn-tease" aria-labelledby="earn-tease-h">
        <div>
          <div className="eyebrow">Use to earn</div>
          <h2 id="earn-tease-h">Use Yui early. It counts.</h2>
          <p>
            Most AI apps ask you to pay and hand over your data. We think the people who use Yui early, and help build it,
            should earn a stake in it. So a private ledger counts how you use Yui, back to day one, and turns it into a score called $U. No cash value. Not a token yet.
          </p>
          <Link className="btn soft" href="/earn#use">How use to earn works</Link>
        </div>
        <figure className="earn-ledger" aria-label="An example of what a private ledger keeps">
          <ol>
            {EARN_ROWS.map(([d, t]) => <li key={d + t}><span>{t}</span><time>{d}</time></li>)}
          </ol>
          <figcaption>An example. Days and what you built, never what you said.</figcaption>
        </figure>
      </section>

      <h2>Who it is for</h2>
      <div className="who">
        {who.map(([i, c, t, d]) => (
          <div className="card" key={t}>
            <div className="chipdot" style={{ background: c }} aria-hidden="true">{i}</div>
            <h3>{t}</h3><p>{d}</p>
          </div>
        ))}
      </div>

      <h2>Why we are building it</h2>
      {quotes.map((q) => <div className="quote" key={q}>&ldquo;{q}&rdquo;</div>)}
      <p style={{ color: "var(--muted)", fontSize: "var(--fs-small)" }}>Chris Johnston, who started Yui.</p>

      <h2>Follow along</h2>
      <div className="grid">
        <Link className="card" href="/roadmap"><h3>Roadmap</h3><p>Where Yui is headed, with the live board and a dated log of what shipped.</p></Link>
        <Link className="card" href="/developers"><h3>Developers</h3><p>How it works, Yui Lines, every spec, and a playground to try it in your browser.</p></Link>
        <Link className="card" href="/films"><h3>Films</h3><p>Minute-long films of the real app, and three concepts we are building toward.</p></Link>
        <Link className="card" href="/thoughts"><h3>Thoughts, from Yui</h3><p>The agent that builds Yui writes what shipped and why. RSS too.</p></Link>
        <Link className="card" href="/developers/community"><h3>Community</h3><p>Draw your best screen in three lines. Every entry goes in a live gallery, open in the playground.</p></Link>
        <Link className="card" href="/business/gtm"><h3>The plan, in the open</h3><p>How Yui finds its first testers, and every business doc behind it.</p></Link>
      </div>
    </>
  );
}

import Link from "next/link";
import CtaLink from "./components/CtaLink";
import links from "../content/links.json";
import HeroVideo from "./components/HeroVideo";
import ClipGrid from "./components/ClipGrid";
import Films from "./components/Films";
import clipsData from "../public/demo/clips/clips.json";
import { STAGE } from "../lib/stage.mjs";
import LivePhone from "./mockups/LivePhone";
import bench from "../content/benchmark.json";
import { TAGS, niceDate, thoughts } from "../lib/thoughts.mjs";
import { readFileSync } from "node:fs";
import path from "node:path";

// On phones now: the roadmap's "Latest release" line, so the home page moves with each release.
const latest = (() => {
  const md = readFileSync(path.join(process.cwd(), "content", "ROADMAP.md"), "utf8");
  const m = md.match(/\*\*Latest release: Yui ([\d.]+), build (\d+), ([^:]+): ([^*]+?)\.?\*\*/);
  return m && { version: m[1], build: m[2], date: m[3], name: m[4] };
})();

const what = [
  ["Screens, not walls of text", "Ask for a workout and get a timer. Get asked a question and get buttons. Change your answer any time."],
  ["Chat when words are enough", "Talk to your agent the way you text a friend. When it answers while you are away, you get a push."],
  ["Every agent looks like itself", "Each agent gets its own name chip and colors, so you always know who you are talking to."],
  ["Your agents stay yours", "Yui connects to agents you already run. You add them, rename them and remove them."],
];

const who = [
  ["H", "var(--brand)", "People who run Hermes", "Works today. A small plugin on your own machine connects your Hermes profiles, and each one shows up in Yui as its own agent."],
  ["O", "var(--lavender)", "People with other agents", "Works today with OpenClaw, Claude Code, Cursor and other MCP clients, A2A and AG-UI agents, a model you run yourself, and anything that answers a webhook. If your agent can send a message, it can draw a screen."],
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

// How it works (SITE-15): the benchmark ratios come from the same file the playground reads.
const tokens = (k) => bench.rows.reduce((a, r) => a + r.counts[k].o200k, 0);
const vsMin = (tokens("min") / tokens("yl")).toFixed(1);
const vsTree = (tokens("tree") / tokens("yl")).toFixed(1);
const HOW = "timer 40/20x8 Tabata";

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
          <p className="lede">
            Your agent draws the screen instead of replying in walls of text: a timer, a form, a quick choice.
            You tap, and it keeps going. A native iPhone app for the agents you already run.
          </p>
          <div className="cta">
            {links.testflight
              ? <CtaLink cta="testflight" where="/hero" href={links.testflight}>Download on TestFlight</CtaLink>
              : <a className="btn" href="#invite">Ask for a hand</a>}
            <CtaLink cta="github" where="/hero" className="btn ghost" href={links.github}>Star on GitHub</CtaLink>
          </div>
          <p className="hero-note">
            Yui is in {STAGE.name}, open to anyone with an iPhone on iOS 26. Bring your own agent: Hermes, OpenClaw, Claude
            Code, a model you run, or anything behind a webhook.
          </p>
        </div>
        <HeroVideo />
        {latest ? (
          <p className="hero-note hero-latest">
            On phones now: <Link href={`/changelog#build-${latest.build}`}>Yui {latest.version}, build {latest.build}</Link>, {latest.name} ({latest.date}).
          </p>
        ) : null}
      </section>

      <Films
        id="concepts"
        layout="feature"
        eyebrow="Concept films"
        title="Where Yui is going."
        lede={<>Three ideas we are building toward, a minute each, sound on: history as a map that moves, a year of markets under one finger, and an outage fixed at 3 am with one Send. Not built yet. <Link href="/roadmap">See the roadmap</Link>.</>}
        ids={["film-mongols-by-map", "film-markets-2020", "film-3am-incident"]}
      />

      <h2>See it move</h2>
      <p className="lede" style={{ fontSize: 18 }}>
        The real app, one screen at a time. Each one started as a short line from an agent. <Link href="/mockups">See every screen</Link>, each with its own link to share.
      </p>
      <ClipGrid clips={CLIPS} />

      <Films
        title="Watch the films"
        lede="A minute each, sound on. One idea per film, all of it the real app on the demo account."
        ids={["film-meet-yui", "film-plan-to-launch", "film-agents", "film-tune-up"]}
      />

      <Films
        title="Dinner, a car, homework"
        lede="Three everyday moments, half a minute each, sound on. You talk, your agent answers on the whole screen."
        ids={["film-hands-full", "film-afford-it", "film-homework"]}
      />

      <h2>What works today</h2>
      <div className="grid">
        {what.map(([t, d]) => (
          <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>

      <section className="how" aria-labelledby="how-title">
        <div className="how-text">
          <div className="eyebrow">How it works | Yui Lines</div>
          <h2 id="how-title">One line of text. One whole screen.</h2>
          <p>Agents answer Yui in <strong>Yui Lines</strong>, a tiny screen language. This one line is the whole timer you see here, and it is live:</p>
          <pre className="how-line"><code>{HOW}</code></pre>
          <p>No code, no JSON, no layout. The app knows the presets and draws each one natively the moment its line arrives.</p>
          <div className="how-stats">
            <div><b>{vsMin}x</b><span>fewer tokens than minified JSON</span></div>
            <div><b>{vsTree}x</b><span>fewer than a component tree</span></div>
          </div>
          <p className="how-note">Measured on ten real screens. <Link href="/developers/benchmark">See the benchmark</Link>.</p>
          <div className="cta">
            <Link className="btn" href="/yl">Read the Yui Lines spec</Link>
            <Link className="btn soft" href="/playground">Try it in the playground</Link>
          </div>
        </div>
        <div className="how-phone">
          <LivePhone yl={HOW} label="A Tabata interval timer, drawn live from one line of Yui Lines" />
        </div>
      </section>

      <section className="earn-tease" aria-labelledby="earn-tease-h">
        <div>
          <div className="eyebrow">Use to earn</div>
          <h2 id="earn-tease-h">Use Yui early. It counts.</h2>
          <p>
            Most AI apps ask you to pay and hand over your data. We think the people who use Yui early, and help build it,
            should earn a stake in it. So we are starting a private ledger that counts every day you use Yui, back to day one.
          </p>
          <p className="earn-fine">What it turns into is being worked out in the open. No token exists and nothing is for sale.</p>
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

      <h2>Thoughts, from Yui</h2>
      <p className="lede" style={{ fontSize: 18 }}>The agent that builds Yui writes here: what shipped, why we built it that way, and open calls to people and agents. <Link href="/thoughts">Read them all</Link> or follow the <a href="/thoughts/feed.xml">RSS feed</a>.</p>
      <div className="th-grid">
        {thoughts().slice(0, 3).map((t) => (
          <Link className="card th-card" key={t.slug} href={`/thoughts/${t.slug}`}>
            <div className="th-lead">
              {t.lead?.src ? <img src={t.lead.src} alt={t.lead.alt || ""} loading="lazy" /> : <pre><code>{t.lead?.yl}</code></pre>}
            </div>
            <div className="th-meta"><span className={`pill th-tag ${t.tag}`}>{TAGS[t.tag]?.label}</span><time dateTime={t.date}>{niceDate(t.date)}</time></div>
            <h3>{t.title}</h3>
            <p>{t.dek}</p>
          </Link>
        ))}
      </div>

      <h2>Follow along</h2>
      <div className="grid">
        <Link className="card" href="/roadmap"><h3>Roadmap</h3><p>Where Yui is headed, with the live board and a dated log of what shipped.</p></Link>
        <Link className="card" href="/developers"><h3>Developers</h3><p>How it works, every spec, the Yui Lines screen language, and a playground to try it in your browser.</p></Link>
        <Link className="card" href="/developers/community"><h3>Community</h3><p>Draw your best screen in three lines. Every entry goes in a live gallery, open in the playground.</p></Link>
        <Link className="card" href="/business/gtm"><h3>The plan, in the open</h3><p>How Yui finds its first testers, and every business doc behind it.</p></Link>
      </div>
    </>
  );
}

// Community (OSS-5): who builds with Yui Lines, how to join in, and the open "three lines" challenge.
// The gallery comes from community/gallery.json at the repo root (copied by `npm run sync`, bad entries
// skipped); every entry is drawn live with the playground's renderers.
import Link from "next/link";
import links from "../../../content/links.json";
import gallery from "../../../content/gallery.json";
import LivePhone from "../../mockups/LivePhone";

export const metadata = {
  title: "Community | Yui",
  description: "Build with Yui Lines: who uses it today, how to contribute a parser, preset, renderer or adapter, and the open challenge to draw your best screen in three lines.",
};

const repo = links.github;
const app = links.appRepo;
const day = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const lines = (yl) => yl.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n");

const building = [
  ["The Yui app", "Our iPhone app. It draws every line natively, in SwiftUI.", app],
  ["Hermes plugin", "Hermes agents talk in Yui as a chat platform, one thread per profile.", "/start"],
  ["OpenClaw plugin", "OpenClaw agents get Yui as a channel, next to Telegram and Slack.", "/developers/openclaw"],
  ["Webhook bridge", "Any agent that answers an HTTP POST, in ten lines of Python or Node.", "/developers/webhook"],
  ["This website", "The playground and every phone on this page run the reference parser.", "/playground"],
];

const paths = [
  ["A parser", "Rust is next (OSS-4 on the board). Port the JavaScript reference, pass every file in spec/conformance, open a pull request. Any other language is welcome too.", `${repo}/tree/main/parsers`, "parsers/ on GitHub"],
  ["A preset idea", "Write the screen you wish an agent could put up, as Yui Lines, and open an issue. Shapes agents keep sending as custom screens get promoted too.", `${repo}/issues/new/choose`, "Open an issue"],
  ["A renderer", "The web renderers live in site/app/playground. Fix one, make one prettier, or start a new platform: Android (Kotlin and Compose) is on the roadmap.", `${repo}/tree/main/site/app/playground`, "Web renderers"],
  ["An adapter", "Hermes, OpenClaw and webhooks work today. MCP, A2A and more are planned. The adapter plan says which path fits your framework.", "/developers/adapters", "Adapter plan"],
  ["Conformance vectors", "Found a line the spec is vague about? Add a vector and say what you think it should parse to.", `${repo}/tree/main/spec/conformance`, "spec/conformance"],
  ["The app", "Presets, accessibility, Dynamic Type. The app repo has its own guide.", `${app}/blob/main/CONTRIBUTING.md`, "App CONTRIBUTING"],
];

export default function Community() {
  const { challenge, entries } = gallery;
  return (
    <>
      <div className="eyebrow">Developers | Community</div>
      <h1>Build with Yui Lines.</h1>
      <p className="lede">
        Yui Lines is a small, open screen language: one short line of text becomes a timer, a form, a chart. It is Apache-2.0, it has
        parsers in four languages, and it is early. That means your first pull request matters.
      </p>

      <h2 id="challenge">Open challenge: {challenge.title.toLowerCase()}</h2>
      <p>
        {challenge.rules} Entries land in the gallery below, drawn live, with your name on them. Open since {day(challenge.opened)}, no end date.
      </p>
      <ol>
        <li>Try your screen in the <Link href="/playground">playground</Link> until it looks right.</li>
        <li>Fork <a href={repo}>postscarcityai/yuigui</a> and add an entry to <a href={`${repo}/blob/main/community/gallery.json`}><code>community/gallery.json</code></a>: an <code>id</code>, a <code>title</code>, <code>by</code> (your name or handle), the <code>date</code> and your <code>yl</code>.</li>
        <li>Run <code>node community/check.mjs</code>. It says ok or tells you what to fix.</li>
        <li>Open a pull request. The same check runs on it, and once it is merged your screen shows up here.</li>
      </ol>
      <p><a href={`${repo}/blob/main/community/README.md`}>The full entry guide</a> has an example and the rules.</p>

      <h2 id="gallery">The gallery</h2>
      <p className="sc-lede">
        {entries.length} {entries.length === 1 ? "screen" : "screens"} so far. These first ones are ours, to set the bar. Each phone is live: tap it, it answers.
      </p>
      <div className="cm-gallery">
        {entries.map((e) => (
          <article key={e.id} id={e.id} className="cm-entry">
            <LivePhone yl={e.yl} label={`${e.title}, drawn live from Yui Lines`} />
            <h3>{e.title} <a href={`#${e.id}`} className="sc-hash" aria-label={`Link to ${e.title}`}>#</a></h3>
            <p className="cm-by">by {e.github ? <a href={`https://github.com/${e.github}`}>{e.by}</a> : e.by}, {day(e.date)}</p>
            <pre className="sc-yl"><code>{lines(e.yl)}</code></pre>
            <p className="sc-more"><Link href={`/playground?yl=${encodeURIComponent(e.yl)}`}>Open in the playground</Link></p>
          </article>
        ))}
      </div>

      <h2 id="building">Who builds with it</h2>
      <p>Honest answer: today it is us, and the adapters we shipped. Build the next thing on this list and it goes here.</p>
      <div className="grid">
        {building.map(([t, d, href]) => (
          href.startsWith("/") ? <Link className="card" key={t} href={href}><h3>{t}</h3><p>{d}</p></Link>
            : <a className="card" key={t} href={href}><h3>{t}</h3><p>{d}</p></a>
        ))}
      </div>

      <h2 id="contribute">Ways to contribute</h2>
      <div className="grid">
        {paths.map(([t, d, href, cta]) => (
          <div className="card" key={t}>
            <h3>{t}</h3>
            <p>{d}</p>
            <p className="cm-link">{href.startsWith("/") ? <Link href={href}>{cta}</Link> : <a href={href}>{cta}</a>}</p>
          </div>
        ))}
      </div>
      <p>
        Start with CONTRIBUTING.md in <a href={`${repo}/blob/main/CONTRIBUTING.md`}>the hub</a> or <a href={`${app}/blob/main/CONTRIBUTING.md`}>the app</a>.
        Questions go in <a href={`${repo}/issues`}>GitHub issues</a> for now.
      </p>
    </>
  );
}

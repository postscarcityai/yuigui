// See it (SITE-14): every shipped screen, live or recorded in the app, tied to its card and ship date.
// Entries live in content/showcase.json. Nothing here is drawn by hand: phones render real Yui Lines with
// the playground's renderers, clips and screenshots come from the iPhone simulator.
import Link from "next/link";
import showcase from "../../content/showcase.json";
import board from "../../content/board.json";
import progress from "../../content/progress.json";
import clips from "../../public/demo/clips/clips.json";
import { SCREENS, DEMOS, MEDIA, SCIENCE, FLOWS } from "../../lib/yl/samples.mjs";
import Shots from "../components/Shots";
import LivePhone from "./LivePhone";

export const metadata = {
  title: "See it | Yui",
  description: "Every screen Yui can draw today, live in your browser or recorded in the app, each tied to the card that built it and the day it shipped.",
};

const SAMPLES = [...SCREENS, ...DEMOS, ...MEDIA, ...SCIENCE, ...FLOWS];
const sample = (k) => SAMPLES.find((s) => s.slug === k || s.name === k);
const ALTS = Object.fromEntries(progress.flatMap((e) => (e.images || []).map((im) => [im.src, im.alt])));
const LOGS = Object.fromEntries(board.columns.flatMap((c) => c.cards).filter((c) => c.progress).map((c) => [c.key, c.progress]));
const day = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function clipOf(name) {
  if (!name) return null;
  const c = clips[name];
  return c ? { src: c["9x16"].src, poster: c["9x16"].poster } : { src: `/demo/clips/${name}.mp4`, poster: `/demo/clips/${name}.jpg` };
}

function CardRef({ k, planned }) {
  const c = showcase.cards[k] || {};
  return (
    <li>
      <Link href={`/board#${k}`} className="sc-key">{k}</Link>
      <span>{c.title}</span>
      {c.shipped ? <span className="sc-date">Shipped {day(c.shipped)}</span> : <span className="sc-date planned">{planned ? "Not built" : ""}</span>}
      {LOGS[k] ? <Link href={LOGS[k]}>Ship log</Link> : null}
    </li>
  );
}

function Entry({ e, planned }) {
  const s = e.demo ? sample(e.demo) : null;
  const yl = e.yl || s?.yl;
  const clip = clipOf(e.clip);
  const shots = (e.shots || []).map((src) => ({ src, alt: ALTS[src] || e.title }));
  const preset = /^[a-z]+$/.test(e.title);
  return (
    <article id={e.id} className={`sc-entry${planned ? " planned" : ""}`}>
      <div className="sc-media">
        {yl ? (
          <figure>
            <LivePhone yl={yl} agent={e.agent || "Yui"} label={`${e.title}, drawn live from Yui Lines`} />
            <figcaption>{planned ? "Planned: drawn on the web, not in the app" : "Live: tap it, it answers"}</figcaption>
          </figure>
        ) : null}
        {clip ? (
          <figure>
            <video className="sc-clip" src={clip.src} poster={clip.poster} controls muted loop playsInline preload="none" aria-label={`${e.title}, recorded in the iPhone app`} />
            <figcaption>Recorded in the iPhone app</figcaption>
          </figure>
        ) : null}
      </div>
      <div className="sc-text">
        <h3>{preset ? <code>{e.title}</code> : e.title} <a href={`#${e.id}`} className="sc-hash" aria-label={`Link to ${e.title}`}>#</a></h3>
        <p>{e.what}</p>
        {planned ? <span className="pill sc-planned">Planned, not built</span>
          : e.app === "later" ? <span className="pill">On the web now, in the app later</span>
          : e.app === "site" ? <span className="pill">On yuigui.com</span>
          : <span className="pill sc-native">In the iPhone app</span>}
        {yl ? <pre className="sc-yl"><code>{yl.split("\n").filter((l) => !l.trim().startsWith("#")).join("\n")}</code></pre> : null}
        <ul className="sc-cards">{e.cards.map((k) => <CardRef k={k} key={k} planned={planned} />)}</ul>
        {e.link ? <p className="sc-more"><Link href={e.link}>Open {e.link}</Link></p> : null}
        {s?.slug ? <p className="sc-more"><Link href={`/playground?demo=${s.slug}`}>Edit it in the playground</Link></p> : null}
        <p className="sc-more"><Link href={`/s/${e.id}`}>Share this screen</Link></p>
        {shots.length ? <Shots images={shots} label={e.title} /> : null}
      </div>
    </article>
  );
}

export default function SeeIt() {
  const shipped = showcase.groups.filter((g) => !g.planned);
  const nScreens = shipped.reduce((n, g) => n + g.entries.length, 0);
  const nCards = new Set(shipped.flatMap((g) => g.entries.flatMap((e) => e.cards))).size;
  return (
    <>
      <div className="eyebrow">See it | everything built so far</div>
      <h1>Every screen Yui can draw today.</h1>
      <p className="lede">
        {nScreens} things you can see, from {nCards} shipped cards. The phones below draw real Yui Lines in your browser, the same
        lines an agent sends, so you can tap them. Clips and screenshots are recorded in the iPhone app. Each one names the card that
        built it and the day it shipped; the card id opens it on the <Link href="/board">board</Link>.
      </p>
      <nav className="sc-index" aria-label="On this page">
        {showcase.groups.map((g) => (
          <div key={g.id}>
            <a href={`#${g.id}`} className="sc-gl">{g.title}</a>
            {g.entries.map((e) => <a key={e.id} href={`#${e.id}`}>{e.title}</a>)}
          </div>
        ))}
      </nav>
      {showcase.groups.map((g) => (
        <section key={g.id} className="sc-group" aria-labelledby={g.id}>
          <h2 id={g.id}>{g.title}</h2>
          <p className="sc-lede">{g.lede}</p>
          {g.entries.map((e) => <Entry e={e} key={e.id} planned={g.planned} />)}
        </section>
      ))}
    </>
  );
}

// Draw (SITE-174): every drawing part Yui has today, live, with the Yui Lines that draw it.
// The examples live in lib/draw-examples.mjs and are parsed by scripts/draw-check.mjs.
import Link from "next/link";
import AgentBox from "../../components/AgentBox";
import LivePhone from "../../mockups/LivePhone";
import { COMING, DRAWINGS, playgroundHref } from "../../../lib/draw-examples.mjs";
import { pageMeta } from "../../../lib/og/meta.mjs";
import "./draw.css";

export const metadata = pageMeta({
  path: "/developers/draw",
  title: "Everything Yui can draw | Yui",
  description: "Shapes, sketches, mocks, diagrams, charts, maps and math, each drawn live from the Yui Lines that make it. Open any one in the playground.",
});

// The gaps, drawn as dashed outlines. No dates.
function Ghost({ id }) {
  const g = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeDasharray: "6 5", strokeLinecap: "round" };
  return (
    <svg viewBox="0 0 120 80" className="dr-ghost" aria-hidden="true">
      {id === "closed" ? <path d="M18 56 C10 30 38 12 62 20 C92 14 110 40 96 60 C80 72 40 74 18 56Z" {...g} /> : null}
      {id === "venn" ? <><circle cx="45" cy="40" r="26" {...g} /><circle cx="75" cy="40" r="26" {...g} /></> : null}
      {id === "contour" ? <><ellipse cx="60" cy="40" rx="50" ry="30" {...g} /><ellipse cx="60" cy="40" rx="32" ry="18" {...g} /><ellipse cx="60" cy="40" rx="14" ry="7" {...g} /></> : null}
      {id === "doodle" ? <path d="M10 52 C22 20 30 70 46 38 S70 66 82 34 S104 52 112 28" {...g} /> : null}
    </svg>
  );
}

export default function Draw() {
  return (
    <>
      <AgentBox path="/developers/draw" title="Everything Yui can draw" how="Give this link to your agent. It gets every drawing part and the lines that draw it, and can start drawing on your phone." paths={["hermes", "connector"]} />
      <div className="eyebrow">Developers | Draw</div>
      <h1>Everything Yui can draw.</h1>
      <p className="lede">
        Your agent does not send a picture. It sends a few lines of text, and your phone draws them in your agent&apos;s colors. Each part below is live, with its lines beside it.
        Change a word in the playground and watch it redraw.
      </p>
      <nav className="dr-jump" aria-label="Drawing parts">
        {DRAWINGS.map((d) => <a key={d.id} href={`#${d.id}`}>{d.title}</a>)}
        <a href="#coming">Coming next</a>
      </nav>

      {DRAWINGS.map((d) => (
        <section key={d.id} id={d.id} className="dr-part" aria-labelledby={`${d.id}-h`}>
          <div className="dr-media">
            <LivePhone yl={d.yl} label={`${d.title}, drawn live from Yui Lines`} />
          </div>
          <div className="dr-text">
            <h2 id={`${d.id}-h`}>{d.title} <a href={`#${d.id}`} className="sc-hash" aria-label={`Link to ${d.title}`}>#</a></h2>
            <p>{d.what}</p>
            <p className="dr-parts"><b>Parts:</b> {d.parts}</p>
            <pre className="dr-yl"><code>{d.yl}</code></pre>
            <p className="dr-open"><Link href={playgroundHref(d.yl)}>Open in playground</Link></p>
          </div>
        </section>
      ))}

      <section id="coming" className="dr-coming" aria-labelledby="coming-h">
        <h2 id="coming-h">Coming next</h2>
        <p>Four things Yui cannot draw yet. Dashed means not built. No dates.</p>
        <ul className="dr-ghosts">
          {COMING.map((c) => (
            <li key={c.id}>
              <Ghost id={c.id} />
              <h3>{c.title}</h3>
              <p>{c.what}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="dr-more">
        Every line, option and preset is in the <Link href="/yl">Yui Lines spec</Link>. Try your own in the <Link href="/playground">playground</Link>.
      </p>
    </>
  );
}

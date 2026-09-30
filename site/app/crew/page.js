// Meet the crew (SITE-82): Yui and the five starter agents, each in their own colors and look, their real
// tools as short points and a live demo to tap (the saved flows of SITE-70 to SITE-74). Data: lib/crew-page.mjs,
// which /md/crew reads too. Every name is in the body; headings in shots and alts say "the trainer" (public guard).
import Link from "next/link";
import LivePhone from "../mockups/LivePhone";
import CrewVisual from "./CrewVisual";
import { CREW_VISUALS } from "../../lib/yl/visual.mjs";
import FirstRunHero from "../proposals/FirstRunHero";
import AgentBox from "../components/AgentBox";
import { MEMBERS, inNext, NEXT_LABEL, hearsLabel } from "../../lib/crew-page.mjs";
import { encodeYL } from "../../lib/share-code.mjs";
import "../proposals/proposals.css";
import "./crew.css";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/crew",
  title: "Meet the crew | Yui",
  description: "Yui and five starter agents: a trainer, a nutritionist, a musician, a planner and a study buddy. Each has real tools and a live demo you can tap.",
  openGraph: { title: "Meet the crew | Yui", description: "Yui and five starter agents, each with real tools and a live demo you can tap.", url: "https://www.yuigui.com/crew", siteName: "Yui", type: "website" },
});

const Face = ({ m, big }) => (
  <span className={`crew-face look-${m.look}${big ? " big" : ""}`} aria-hidden="true"><b>{m.name[0]}</b></span>
);

export default async function Crew() {
  const yuiCode = await encodeYL(MEMBERS[0].yl);
  const open = (m) => m.share
    ? [{ href: `/s/${m.share}`, label: "Open it big" }, { href: `/playground?demo=flow-${m.flow}`, label: "Play with the lines" }]
    : [{ href: `/playground?yl=${yuiCode}`, label: "Open it big" }];
  return (
    <>
      <AgentBox path="/crew" title="Meet the crew" how="Give this link to your agent. It learns who is on the crew, what each one does and the lines that draw their screens." />
      <div className="eyebrow">The crew</div>
      <h1>Meet the crew.</h1>
      <p className="lede">Yui, plus five agents with real tools. Each one answers with screens. Tap a phone to try one.</p>

      <nav className="crew-row" aria-label="The crew">
        {MEMBERS.map((m) => (
          <a key={m.handle} href={`#${m.handle}`} style={{ "--cm": m.c, "--cp": `var(--${m.color})` }}>
            <Face m={m} />
            <span>{m.name}</span>
          </a>
        ))}
      </nav>

      <FirstRunHero id="pick-your-crew" title="Pick your crew" start="pick">
        <div className="eyebrow">Try the first minute</div>
        <h2 id="prop-h">Pick your crew.</h2>
        <p className="lede">A new account does not get six threads. Yui asks who joins. Tap a row to add it, tap the i for a short page on what it does, or bring an agent you already run.</p>
        <p className="crew-links"><Link href="/proposals/pick-your-crew" prefetch={false}>Read the proposal</Link></p>
      </FirstRunHero>

      {MEMBERS.map((m, i) => (
        <section key={m.handle} id={m.handle} className={`crew-m${i % 2 ? " flip" : ""}`} style={{ "--cm": m.c, "--cp": `var(--${m.color})` }} aria-labelledby={`${m.handle}-h`}>
          <div className="crew-card">
            <div className={`crew-band look-${m.look}`} aria-hidden="true"><CrewVisual handle={m.handle} /></div>
            <div className="crew-head">
              <Face m={m} big />
              <div>
                <h2 id={`${m.handle}-h`}>{m.name}</h2>
                <span className="crew-role">{m.role}</span>
              </div>
            </div>
            <p className="crew-line">{m.line}</p>
            <p className="crew-hears">
              <span>{CREW_VISUALS[m.handle].look}</span> hears {hearsLabel(CREW_VISUALS[m.handle].hears)}, {CREW_VISUALS[m.handle].strength === "faint" ? "very quiet" : "quiet"}.{" "}
              <Link href={`/playground?demo=visual-defaults&agent=${m.name}`} prefetch={false}>Try its visualizer</Link>
            </p>
            <ul className="crew-tools">
              {m.tools.map((tool) => (
                <li key={tool.t}>
                  <span>{tool.t}</span>
                  {inNext(tool.card) ? <em className="crew-next">{NEXT_LABEL}</em> : null}
                </li>
              ))}
            </ul>
          </div>
          <div className="crew-demo">
            <LivePhone yl={m.yl} agent={m.name} label={`A live demo of the ${m.role.toLowerCase()}'s screens. ${m.try}.`} />
            <p className="crew-try">{m.try}</p>
            <p className="crew-links">
              {open(m).map((l) => <Link key={l.href} href={l.href} prefetch={false}>{l.label}</Link>)}
            </p>
          </div>
        </section>
      ))}

      <section className="crew-end">
        <h2>Want them on your phone?</h2>
        <p>The crew lives in the Yui app for iPhone. Every screen above draws there, natively.</p>
        <div className="cta">
          <Link className="btn" href="/start">Get Yui</Link>
          <Link className="btn soft" href="/mockups#crew-tools">See the crew's screens</Link>
        </div>
      </section>
    </>
  );
}

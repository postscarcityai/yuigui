// One proposal (SITE-87): a full-height hero with the idea working in a phone, then the assessment,
// the same fields in the same order every time (lib/proposals.mjs FIELDS).
// The hero slot: PROP-1 gets the first-run flow (SITE-88, FirstRunHero), PROP-2 the Jev layer (SITE-94, JevHero), PROP-5 $U trickling in (EarnHero), the rest draw their ```hero lines.
import Link from "next/link";
import { notFound } from "next/navigation";
import LivePhone from "../../mockups/LivePhone";
import AgentBox from "../../components/AgentBox";
import FirstRunHero from "../FirstRunHero";
import JevHero from "../JevHero";
import FirstPlanHero from "../FirstPlanHero";
import EarnHero from "../EarnHero";
import ProposalVote from "../ProposalVote";
import VoteTally from "../VoteTally";
import { renderMd } from "../../../lib/md.mjs";
import { slug as toSlug } from "../../../lib/slug.mjs";
import { CALLS, COSTS, niceDate, proposals } from "../../../lib/proposals.mjs";
import { pageMeta } from "../../../lib/og/meta.mjs";
import "../proposals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return proposals().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = proposals().find((x) => x.slug === slug);
  return pageMeta({ key: "/proposals", path: `/proposals/${slug}`, title: `${p?.title || "Proposal"} | Yui`, description: p?.summary || "A big idea for Yui, shown before it is built." });
}

const Md = ({ md }) => <div className="md" dangerouslySetInnerHTML={{ __html: renderMd(md) }} />;

export default async function Proposal({ params }) {
  const { slug } = await params;
  const p = proposals().find((x) => x.slug === slug);
  if (!p) notFound();
  const s = p.sections;
  const text = (
    <>
      <div className="eyebrow"><Link href="/proposals">Proposals</Link> | {p.id}</div>
      <h1 id="prop-h">{p.title}</h1>
      <p className="lede">{p.summary}</p>
      <p className="prop-chips">
        <span className={`pill prop-status ${toSlug(p.status)}`}>{p.status}</span>
        <span className={`pill prop-call ${p.call === "recommend" ? "yes" : "no"}`}>{CALLS[p.call]}</span>
      </p>
      <a className="prop-down" href="#proposal">Read the proposal</a>
    </>
  );
  // PROP-1's hero is the working first-run flow (SITE-88), PROP-2's the Jev layer routing turns (SITE-94); any other proposal draws its ```hero lines.
  const slot = p.slug === "pick-your-crew" ? (
    <FirstRunHero title={p.title}>{text}</FirstRunHero>
  ) : p.slug === "the-jev-layer" ? (
    <JevHero title={p.title}>{text}</JevHero>
  ) : p.slug === "first-plan-in-every-agent" ? (
    <FirstPlanHero>{text}</FirstPlanHero>
  ) : p.slug === "earn-u-by-using-yui" ? (
    <EarnHero>{text}</EarnHero>
  ) : (
    <section className="prop-hero" data-slot="hero" aria-labelledby="prop-h">
      <div className="prop-hero-text">{text}</div>
      <div className="prop-hero-phone">
        <LivePhone yl={p.hero} agent="Yui" eager label={`${p.title}, the first screen, drawn live. Tap to try it.`} />
      </div>
    </section>
  );
  return (
    <>
      {slot}

      <article className="prop" id="proposal" aria-label={`${p.id}, the proposal`}>
        <dl className="prop-facts">
          <div><dt>Status</dt><dd>{p.status}</dd></div>
          <div><dt>Cost</dt><dd>{p.cost}, {COSTS[p.cost].toLowerCase()}</dd></div>
          <div><dt>Date</dt><dd><time dateTime={p.date}>{niceDate(p.date)}</time></dd></div>
          <div><dt>Would become</dt><dd>{p.becomes}</dd></div>
          <div><dt>Votes</dt><dd className="prop-votes" data-prop={p.id}><VoteTally id={p.id} /></dd></div>
        </dl>

        <section className={`prop-callout ${p.call === "recommend" ? "yes" : "no"}`}>
          <h2>Yui's call</h2>
          <Md md={s.call} />
        </section>

        <div className="prop-body">
          <section className="prop-sec"><h2>The problem</h2><Md md={s.problem} /></section>
          <section className="prop-sec"><h2>Who it is for</h2><Md md={s.who} /></section>
          <section className="prop-sec wide"><h2>How it works</h2><Md md={s.how} /></section>
          <section className="prop-sec pros"><h2>Pros</h2><Md md={s.pros} /></section>
          <section className="prop-sec cons"><h2>Cons</h2><Md md={s.cons} /></section>
          <section className="prop-sec"><h2>Cost</h2><Md md={s.cost} /></section>
          <section className="prop-sec"><h2>Risks</h2><Md md={s.risks} /></section>
          <section className="prop-sec wide questions"><h2>Open questions</h2><Md md={s.questions} /></section>
        </div>

        <ProposalVote id={p.id} title={p.title} />

        <div className="prop-agent"><AgentBox path={`/proposals/${p.slug}`} title={p.title} how="Give this link to your agent. It gets the whole proposal as markdown, with the lines that draw its first screen." /></div>
        <p className="prop-back"><Link href="/proposals">All proposals</Link> | <Link href="/proposals#how">How proposals work</Link> | <Link href="/roadmap">Roadmap</Link></p>
      </article>
    </>
  );
}

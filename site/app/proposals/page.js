// Proposals (SITE-87): big ideas for Yui, each shown as a working mockup before any app code, then weighed
// the same way every time. Data: docs/proposals/*.md through lib/proposals.mjs; the system is docs/PROPOSALS.md.
// Votes (SITE-89): each card shows its counts; the vote itself is on the proposal page.
import Link from "next/link";
import AgentBox from "../components/AgentBox";
import { renderMd } from "../../lib/md.mjs";
import { slug as toSlug } from "../../lib/slug.mjs";
import { COSTS, howItWorks, niceDate, proposals } from "../../lib/proposals.mjs";
import { pageMeta } from "../../lib/og/meta.mjs";
import VoteTally from "./VoteTally";
import "./proposals.css";

export const metadata = pageMeta({
  path: "/proposals",
  title: "Proposals | Yui",
  description: "Big ideas for Yui, shown as working mockups before any app code. Each one weighed the same way: problem, pros, cons, cost, risks and Yui's call.",
});

export default function Proposals() {
  const all = proposals();
  return (
    <>
      <AgentBox path="/proposals" title="Proposals" how="Give this link to your agent. It gets every open proposal and how each one is weighed, as markdown." />
      <div className="eyebrow">Roadmap | Proposals</div>
      <h1>Big ideas, shown first.</h1>
      <p className="lede">Before a big idea gets built, Yui draws it as a working mockup and writes it up the same way every time. You weigh in. Chris decides.</p>

      <div className="prop-grid">
        {all.map((p) => (
          <Link key={p.slug} className="card prop-card" href={`/proposals/${p.slug}`}>
            <div className="prop-top">
              <span className={`pill prop-status ${toSlug(p.status)}`}>{p.status}</span>
              <span className="prop-id">{p.id}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.summary}</p>
            <div className="prop-foot">
              <time dateTime={p.date}>{niceDate(p.date)}</time>
              <span title={COSTS[p.cost]}>Cost {p.cost}</span>
              {p.by && <span>By {p.by}</span>}
              {p.taken_by && <span>Taken by {p.taken_by}</span>}
              <span className="prop-votes" data-prop={p.id}><VoteTally id={p.id} /></span>
            </div>
          </Link>
        ))}
      </div>

      <section className="prop-how" id="how" aria-labelledby="how-h">
        <h2 id="how-h">How proposals work</h2>
        <article className="md" dangerouslySetInnerHTML={{ __html: renderMd(howItWorks()) }} />
      </section>
    </>
  );
}

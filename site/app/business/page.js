import Link from "next/link";
import { businessDocs } from "../../lib/business.mjs";

export const metadata = { title: "Business docs | Yui" };

// Reading order: the plan, then how Yui finds its first testers (GTM-1), then the detail.
const first = ["plan", "gtm", "beta-list", "biz-1-marketing-positioning"];
const blurb = {
  plan: "Start here. The whole plan on one page.",
  gtm: "How Yui finds its people. The current plan.",
  "beta-list": "The first 20 to 50 outside testers, and where to find them.",
  "biz-1-marketing-positioning": "Who Yui is for and what we say.",
  "biz-1-competitors": "The research behind the positioning.",
  "biz-2-outreach-plan": "Where Hermes users are. Drafts only, nothing sent.",
  "biz-3-revenue-models": "What stays free, and what could pay the bills.",
  "biz-4-content-plan": "What we post and when. Detail behind the plan.",
  "biz-5-social-accounts": "Who each account is, and how it sounds.",
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Business() {
  const rank = (d) => (first.includes(d.slug) ? first.indexOf(d.slug) : first.length);
  const docs = businessDocs().sort((a, b) => rank(a) - rank(b));
  return (
    <>
      <div className="eyebrow">Business | rendered from docs/business</div>
      <h1>Business docs, in the open</h1>
      <p className="lede">
        How Yui plans to find its people, earn its keep and stay honest. Start with the one-page plan. The rest are working drafts, published as they are written.
      </p>
      <div className="grid">
        {docs.map((d) => (
          <Link className="card" key={d.slug} href={`/business/${d.slug}`}>
            <h3>{cap(d.title.replace(/ \([A-Z]+-\d+\)$/, ""))}</h3>
            <p>{blurb[d.slug] ?? "Working draft."}</p>
            {d.card && <p className="biz-key">{d.card}</p>}
          </Link>
        ))}
      </div>
    </>
  );
}

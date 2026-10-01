import Link from "next/link";
import { businessDocs, BLURBS as blurb } from "../../lib/business.mjs";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({ path: "/business", title: "Business docs | Yui", description: "How Yui plans to find its people, earn its keep and stay honest. Start with the one-page plan." });

// Reading order: the plan, then how Yui finds its first testers (GTM-1), then the detail.
const first = ["plan", "gtm", "use-to-earn", "tokenomics", "beta-list", "biz-1-marketing-positioning"];

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
        <Link className="card" href="/developers/where-yui-stands">
          <h3>Where Yui stands</h3>
          <p>The SWOT, with the data behind every point. What is new, what is not, and what is left to prove.</p>
          <p className="biz-key">Sep 26 2026</p>
        </Link>
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

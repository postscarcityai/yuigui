import Link from "next/link";
import { businessDocs } from "../../lib/business.mjs";

export const metadata = { title: "Business docs | Yui" };

export default function Business() {
  const first = ["plan", "gtm"];
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
            <h3>{d.title}</h3>
            <p>{d.card || (d.slug === "gtm" ? "Go-to-market, current" : "Start here")}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

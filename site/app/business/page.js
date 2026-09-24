import Link from "next/link";
import { businessDocs } from "../../lib/business.mjs";

export const metadata = { title: "Business docs | Yui" };

export default function Business() {
  const docs = businessDocs().sort((a, b) => (b.slug === "plan") - (a.slug === "plan"));
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
            <p>{d.card || "Start here"}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

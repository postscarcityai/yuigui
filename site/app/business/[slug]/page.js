import { notFound } from "next/navigation";
import { renderMd } from "../../../lib/md.mjs";
import { businessDocs, BLURBS } from "../../../lib/business.mjs";
import { pageMeta } from "../../../lib/og/meta.mjs";

export const dynamicParams = false;

export function generateStaticParams() {
  return businessDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = businessDocs().find((x) => x.slug === slug);
  return pageMeta({ path: `/business/${slug}`, key: "/business", title: d ? `${d.title} | Yui` : "Business | Yui", description: BLURBS[slug] || "How Yui plans to find its people, earn its keep and stay honest." });
}

export default async function BusinessDoc({ params }) {
  const { slug } = await params;
  const d = businessDocs().find((x) => x.slug === slug);
  if (!d) notFound();
  return (
    <>
      <div className="eyebrow">
        <a href="/business">Business docs</a>{d.card && <> | {d.card}</>}{d.doc && <> | <a href={d.doc}>Google Doc</a></>}
      </div>
      <article className="md" dangerouslySetInnerHTML={{ __html: renderMd(d.md) }} />
    </>
  );
}

import { notFound } from "next/navigation";
import { renderMd } from "../../../lib/md.mjs";
import { businessDocs } from "../../../lib/business.mjs";

export const dynamicParams = false;

export function generateStaticParams() {
  return businessDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = businessDocs().find((x) => x.slug === slug);
  return { title: d ? `${d.title} | Yui` : "Business | Yui" };
}

export default async function BusinessDoc({ params }) {
  const { slug } = await params;
  const d = businessDocs().find((x) => x.slug === slug);
  if (!d) notFound();
  return (
    <>
      <div className="eyebrow">
        <a href="/business">Business docs</a> | {d.card}{d.doc && <> | <a href={d.doc}>Google Doc</a></>}
      </div>
      <article className="md" dangerouslySetInnerHTML={{ __html: renderMd(d.md) }} />
    </>
  );
}

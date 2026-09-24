import { notFound } from "next/navigation";
import { renderMd } from "../../../lib/md.mjs";
import { niceDate, notes } from "../../../lib/notes.mjs";

export const dynamicParams = false;

export function generateStaticParams() {
  return notes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const n = notes().find((x) => x.slug === slug);
  return n ? { title: `${n.title} | Yui`, description: n.dek, openGraph: { title: n.title, description: n.dek, type: "article" } } : { title: "Notes | Yui" };
}

export default async function Note({ params }) {
  const { slug } = await params;
  const n = notes().find((x) => x.slug === slug);
  if (!n) notFound();
  return (
    <>
      <div className="eyebrow">
        <a href="/notes">Notes</a> | <time dateTime={n.date}>{niceDate(n.date)}</time>
      </div>
      <article className="md note" dangerouslySetInnerHTML={{ __html: renderMd(n.md) }} />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import Blocks from "../Blocks";
import { TAGS, niceDate, thoughts } from "../../../lib/thoughts.mjs";

export const dynamicParams = false;

export function generateStaticParams() {
  return thoughts().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = thoughts().find((x) => x.slug === slug);
  if (!t) return { title: "Thoughts | Yui" };
  return {
    title: `${t.title} | Yui`,
    description: t.dek,
    authors: [{ name: "Yui" }],
    openGraph: { title: t.title, description: t.dek, type: "article", publishedTime: t.date, authors: ["Yui"] },
    twitter: { card: "summary_large_image", title: t.title, description: t.dek },
    alternates: { types: { "application/rss+xml": [{ url: "/thoughts/feed.xml", title: "Thoughts from Yui" }] } },
  };
}

export default async function Thought({ params }) {
  const { slug } = await params;
  const all = thoughts();
  const i = all.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const t = all[i];
  const more = all.filter((x) => x.slug !== slug).slice(0, 2);
  return (
    <article className="thought">
      <div className="eyebrow">
        <a href="/thoughts">Thoughts</a> | {TAGS[t.tag]?.label} | <time dateTime={t.date}>{niceDate(t.date)}</time>
      </div>
      <h1>{t.title}</h1>
      <p className="lede">{t.dek}</p>
      <p className="th-by">By Yui, the agent that builds Yui</p>
      <Blocks parts={t.parts} />
      {more.length ? (
        <nav className="th-more" aria-label="More thoughts">
          {more.map((m) => (
            <Link key={m.slug} className="card th-card small" href={`/thoughts/${m.slug}`}>
              {m.lead?.src ? <div className="th-lead"><img src={m.lead.src} alt="" loading="lazy" /></div> : null}
              <div className="th-meta"><span className={`pill th-tag ${m.tag}`}>{TAGS[m.tag]?.label}</span><time dateTime={m.date}>{niceDate(m.date)}</time></div>
              <h3>{m.title}</h3>
            </Link>
          ))}
        </nav>
      ) : null}
    </article>
  );
}

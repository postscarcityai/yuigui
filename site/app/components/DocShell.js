// A spec page (SITE-15): every spec in a left index, this one's h2/h3 outline under its name.
// Under 980px the index folds into one "All specs" box above the text.
import Link from "next/link";
import { specDocs, renderDoc } from "../../lib/spec.mjs";

function Index({ docs, current, toc }) {
  return (
    <ul className="docs-list">
      {docs.map((d) => (
        <li key={d.slug}>
          <Link href={d.href} aria-current={d.slug === current ? "page" : undefined}>{d.label}</Link>
          {d.slug === current && toc.length > 0 && (
            <ul>
              {toc.map((h) => (
                <li key={h.id} className={h.level === 3 ? "docs-h3" : undefined}><a href={`#${h.id}`}>{h.text}</a></li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function DocShell({ slug, eyebrow, after }) {
  const docs = specDocs();
  const d = docs.find((x) => x.slug === slug);
  const { html, toc } = renderDoc(d.md);
  const all = after ? [...toc, ...renderDoc(after).toc] : toc;
  return (
    <div className="docs">
      <aside className="docs-side" aria-label="Specs">
        <div className="docs-head"><Link href="/developers/specs">All specs</Link></div>
        <Index docs={docs} current={slug} toc={all} />
      </aside>
      <div className="docs-main">
        <details className="docs-fold">
          <summary>All specs, and this page's sections</summary>
          <Index docs={docs} current={slug} toc={all.filter((h) => h.level === 2)} />
        </details>
        <div className="eyebrow">{eyebrow}</div>
        <article className="md" dangerouslySetInnerHTML={{ __html: html }} />
        {after && <article className="md" dangerouslySetInnerHTML={{ __html: renderDoc(after).html }} />}
      </div>
    </div>
  );
}

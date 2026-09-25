"use client";
// The Thoughts index (SITE-30): cards that lead with a picture. Tap a tag to see only those.
import Link from "next/link";
import { useState } from "react";

export default function Grid({ items, tags }) {
  const [tag, setTag] = useState("all");
  const shown = items.filter((t) => tag === "all" || t.tag === tag);
  const count = (k) => items.filter((t) => t.tag === k).length;
  return (
    <>
      <div className="th-tags" role="group" aria-label="Show only">
        <button type="button" aria-pressed={tag === "all"} onClick={() => setTag("all")}>All {items.length}</button>
        {Object.entries(tags).map(([k, t]) => (
          <button key={k} type="button" aria-pressed={tag === k} onClick={() => setTag(k)} title={t.hint} disabled={!count(k)}>{t.label} {count(k)}</button>
        ))}
      </div>
      <div className="th-grid">
        {shown.map((t) => (
          <Link className="card th-card" key={t.slug} href={`/thoughts/${t.slug}`}>
            <div className="th-lead">
              {t.lead?.src ? <img src={t.lead.src} alt={t.lead.alt || ""} loading="lazy" /> : <pre><code>{t.lead?.yl}</code></pre>}
              {t.lead?.clip ? <span className="th-play" aria-label="Has a clip">▶</span> : null}
            </div>
            <div className="th-meta"><span className={`pill th-tag ${t.tag}`}>{tags[t.tag]?.label}</span><time dateTime={t.date}>{t.nice}</time></div>
            <h3>{t.title}</h3>
            <p>{t.dek}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

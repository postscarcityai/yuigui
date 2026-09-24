import Link from "next/link";
import { niceDate, notes } from "../../lib/notes.mjs";

export const metadata = { title: "Notes | Yui", description: "Longer pieces on how and why Yui is built, newest first." };

export default function Notes() {
  const all = notes();
  return (
    <>
      <div className="eyebrow">Notes | rendered from docs/notes</div>
      <h1>Notes</h1>
      <p className="lede">Longer pieces on how Yui is built and why. The ship log says what changed. These say why.</p>
      <div className="notes">
        {all.map((n) => (
          <Link className="card note-card" key={n.slug} href={`/notes/${n.slug}`}>
            <time dateTime={n.date}>{niceDate(n.date)}</time>
            <h3>{n.title}</h3>
            <p>{n.dek}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

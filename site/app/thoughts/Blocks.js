// The body of a Thought (SITE-30): short text between visuals, see lib/thoughts.mjs.
import Link from "next/link";
import Shots from "../components/Shots";
import LivePhone from "../mockups/LivePhone";
import { renderMd } from "../../lib/md.mjs";
import Compare from "./Compare";

function Part({ p }) {
  if (p.kind === "md") return <div className="md note" dangerouslySetInnerHTML={{ __html: renderMd(p.md) }} />;
  if (p.kind === "shot") return <figure className="th-shot"><Shots images={p.images} label="Screenshots" />{p.images.length === 1 ? <figcaption>{p.images[0].alt}</figcaption> : null}</figure>;
  if (p.kind === "clip") {
    return (
      <figure className="th-clip">
        <video src={p.src} poster={p.poster} controls muted loop playsInline preload="none" aria-label={p.caption} />
        {p.caption ? <figcaption>{p.caption}</figcaption> : null}
      </figure>
    );
  }
  if (p.kind === "phone") {
    return (
      <figure className="th-phone phonebox">
        <LivePhone yl={p.yl} label={p.caption || "A live Yui screen"} />
        <figcaption className="cap">{p.caption || "Live: tap it."}</figcaption>
        <pre className="th-yl" aria-label="The Yui Lines behind this screen"><code>{p.yl}</code></pre>
      </figure>
    );
  }
  if (p.kind === "compare") return <Compare before={p.before} after={p.after} />;
  return (
    <div className="th-try">
      {p.links.map((l, i) => {
        const out = /^https?:/.test(l.href);
        return out
          ? <a key={l.href} className={i ? "btn soft" : "btn"} href={l.href} target="_blank" rel="noopener">{l.label}</a>
          : <Link key={l.href} className={i ? "btn soft" : "btn"} href={l.href}>{l.label}</Link>;
      })}
    </div>
  );
}

export default function Blocks({ parts }) {
  return <div className="th-body">{parts.map((p, i) => <Part key={i} p={p} />)}</div>;
}

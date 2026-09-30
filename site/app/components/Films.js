// The finished brag films (SITE-62), from public/demo/videos/videos.json, on the pages each one is about.
// Sound on, poster first; nothing downloads until someone presses play. Each film ships a landscape and a
// portrait cut: the page renders both and CSS shows one (landscape on desktop, portrait on a phone). The
// hidden one never nears the screen, so LazyVideo never even loads its poster.
import Link from "next/link";
import videos from "../../public/demo/videos/videos.json";
import LazyVideo from "./LazyVideo";

const label = (v, c) => `${v.title}, a ${Math.round(c.seconds)} second video`;

export function Film({ id, big = false, eager = false }) {
  const v = videos[id];
  if (!v) return null;
  const wide = v["16x9"], tall = v["9x16"];
  const c = wide || tall;
  return (
    <figure className={`film${big ? " big" : ""}${v.concept ? " concept" : ""}`}>
      <div className="film-frame">
        {wide ? <LazyVideo eager={eager} className={`film-cut wide${tall ? " has-tall" : ""}`} src={wide.src} poster={wide.poster} controls playsInline preload="none" aria-label={label(v, wide)} /> : null}
        {tall ? <LazyVideo eager={eager} className={`film-cut tall${wide ? " has-wide" : ""}`} src={tall.src} poster={tall.poster} controls playsInline preload="none" aria-label={label(v, tall)} /> : null}
        {v.concept ? <span className="film-badge">Concept</span> : null}
      </div>
      <figcaption>
        <b>{v.title}</b> <span>{v.what}</span> <Link href={`/s/${id}`}>{Math.round(c.seconds)} s, share it</Link>
      </figcaption>
    </figure>
  );
}

// layout="feature": the first film big, the rest beside it (two up on a wide screen).
export default function Films({ ids, title, lede, layout, eyebrow, id, eager = false }) {
  const feature = layout === "feature" && ids.length > 1;
  return (
    <section className={`films-block${feature ? " feature" : ""}`} aria-label={title || "Videos"} id={id}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      {title ? <h2>{title}</h2> : null}
      {lede ? <p className="films-lede">{lede}</p> : null}
      <div className={`films${ids.length === 1 ? " one" : ""}${feature ? " feature" : ""}`}>
        {ids.map((fid, i) => <Film id={fid} key={fid} big={feature && i === 0} eager={eager && i === 0} />)}
      </div>
    </section>
  );
}

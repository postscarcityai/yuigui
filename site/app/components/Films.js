// The finished brag films (SITE-62), from public/demo/videos/videos.json, on the pages each one is about.
// Landscape cut, sound on, poster first; nothing downloads until someone presses play.
import Link from "next/link";
import videos from "../../public/demo/videos/videos.json";
import LazyVideo from "./LazyVideo";

export function Film({ id }) {
  const v = videos[id];
  if (!v) return null;
  const c = v["16x9"] || v["9x16"];
  return (
    <figure className="film">
      <LazyVideo src={c.src} poster={c.poster} controls playsInline preload="none" aria-label={`${v.title}, a ${Math.round(c.seconds)} second video`} />
      <figcaption>
        <b>{v.title}</b> <span>{v.what}</span> <Link href={`/s/${id}`}>{Math.round(c.seconds)} s, share it</Link>
      </figcaption>
    </figure>
  );
}

export default function Films({ ids, title, lede }) {
  return (
    <section className="films-block" aria-label={title || "Videos"}>
      {title ? <h2>{title}</h2> : null}
      {lede ? <p className="films-lede">{lede}</p> : null}
      <div className={`films${ids.length === 1 ? " one" : ""}`}>
        {ids.map((id) => <Film id={id} key={id} />)}
      </div>
    </section>
  );
}

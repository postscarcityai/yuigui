// A share link (SITE-19): one screen, drawn live, with the lines that draw it and a preview
// image of its own (./opengraph-image.js). Every See it entry, playground sample and clip has one.
import Link from "next/link";
import { notFound } from "next/navigation";
import progress from "../../../content/progress.json";
import LivePhone from "../../mockups/LivePhone";
import Shots from "../../components/Shots";
import AgentBox from "../../components/AgentBox";
import VideoDownloads from "../../components/VideoDownloads";
import { shareItem, shareItems, shareUrl } from "../../../lib/share.mjs";
import { oneLine } from "../../../lib/og/meta.mjs";
import { encodeYL } from "../../../lib/share-code.mjs";

export const dynamicParams = false;
export const generateStaticParams = () => shareItems().map((it) => ({ id: it.id }));

const ALTS = Object.fromEntries(progress.flatMap((e) => (e.images || []).map((im) => [im.src, im.alt])));
const KIND = { entry: "See it", sample: "Playground", clip: "Recorded in the app" };
const describe = (it) => it.what || (it.yl ? `One screen from Yui, drawn from ${it.yl.split("\n").length === 1 ? "one line" : `${it.yl.split("\n").length} lines`} of Yui Lines.` : "A screen from the Yui iPhone app.");

export async function generateMetadata({ params }) {
  const it = shareItem((await params).id);
  if (!it) return {};
  const title = `${it.title} | Yui`;
  const description = oneLine(describe(it));
  return {
    title,
    description,
    alternates: { canonical: shareUrl(it.id) },
    openGraph: {
      title, description, url: shareUrl(it.id), siteName: "Yui", type: it.video ? "video.other" : "website",
      ...(it.video ? { videos: [{ url: new URL(it.video["16x9"].src, "https://www.yuigui.com").href, type: "video/mp4", width: 1920, height: 1080 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Shared({ params }) {
  const it = shareItem((await params).id);
  if (!it) notFound();
  const code = it.yl ? await encodeYL(it.yl) : null;
  const edit = it.sample && it.home?.startsWith("/playground") ? it.home : code ? `/playground?yl=${code}` : null;
  const embed = it.yl ? `/embed?id=${it.id}` : null;
  const shots = it.shots.map((src) => ({ src, alt: ALTS[src] || it.title }));
  const still = !it.yl && !it.video ? (shots[0] ? { src: shots[0].src, alt: shots[0].alt } : it.clip ? { src: it.clip.poster, alt: it.title } : null) : null;

  return (
    <>
      <div className="eyebrow">Shared from Yui | {it.video ? "Video" : it.preset ? <>the <code>{it.preset}</code> screen</> : KIND[it.kind]}</div>
      <h1>{it.title}</h1>
      <p className="lede">{describe(it)}</p>
      <div className="share-hero">
        <div className="share-screen">
          {it.video ? (
            <video className={it.video["9x16"] ? "sc-clip" : "sc-wide"} src={(it.video["9x16"] || it.video["16x9"]).src} poster={(it.video["9x16"] || it.video["16x9"]).poster} controls muted={!it.video.sound} playsInline preload="metadata" aria-label={it.title} />
          ) : it.yl ? <LivePhone yl={it.yl} agent={it.agent} label={`${it.title}, drawn live from Yui Lines`} eager />
            : still ? <div className="phone sc-phone"><div className="screen"><img className="share-still" src={still.src} alt={still.alt} /></div></div>
            : null}
        </div>
        <div className="share-side">
          {it.planned ? <span className="pill sc-planned">Planned, not built</span> : null}
          {it.yl ? (
            <>
              <p className="share-say">{it.yl.split("\n").length === 1 ? "The one line the agent sends:" : "The lines the agent sends:"}</p>
              <pre className="sc-yl"><code>{it.yl}</code></pre>
            </>
          ) : null}
          {it.clip && it.yl ? (
            <video className="sc-clip" src={it.clip.src} poster={it.clip.poster} controls muted loop playsInline preload="none" aria-label={`${it.title}, recorded in the iPhone app`} />
          ) : null}
          {it.video ? <><p className="share-say">Download it{it.video["9x16"] && it.video["16x9"] ? ", both cuts" : ""}, captions burned in{it.video.sound ? ", sound on" : ", sound off"}:</p><VideoDownloads v={it.video} /></> : null}
          <AgentBox path={shareUrl(it.id)} title={it.title} embed={embed} how={it.yl ? "Give this link to your agent. It reads the lines and can send you this screen in Yui." : "Give this link to your agent. It reads the page and can set itself up for Yui."} />
          <ul className="share-links">
            {edit ? <li><Link href={edit}>Edit it in the playground</Link></li> : null}
            {it.home && !it.home.startsWith("/playground") ? <li><Link href={it.home}>See it with the rest</Link></li> : null}
            {it.cards.map((k) => <li key={k}><Link href={`/board#${k}`}>{k} on the board</Link></li>)}
            <li><Link href="/start">Get Yui on your iPhone</Link></li>
          </ul>
          {shots.length > (still ? 1 : 0) ? <Shots images={shots} label={it.title} /> : null}
        </div>
      </div>
    </>
  );
}

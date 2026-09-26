// Embed (SITE-19): one live Yui screen for an iframe on someone else's page. No nav, no footer.
// /embed?id=<share id> | ?demo=<playground sample> | ?yl=<share code>, plus &theme=light.
// Snippet and options: /developers#embed.
import LivePhone from "../mockups/LivePhone";
import { encodeYL, readYL } from "../../lib/share-code.mjs";
import { cleanYL, findSample, sampleSlug, shareItem, shareUrl } from "../../lib/share.mjs";

async function resolve(q) {
  const it = q.id ? shareItem(String(q.id)) : null;
  if (it?.yl) return { yl: it.yl, agent: it.agent, title: it.title, home: shareUrl(it.id), og: `/og?id=${it.id}` };
  const s = q.demo ? findSample(String(q.demo)) : null;
  if (s) return { yl: cleanYL(s.yl), agent: s.agent || "Yui", title: s.name, home: shareUrl(`try-${sampleSlug(s)}`), og: `/og?demo=${encodeURIComponent(sampleSlug(s))}` };
  const yl = cleanYL(await readYL(q.yl));
  const code = yl ? await encodeYL(yl) : null;
  if (yl) return { yl, agent: "Yui", title: "A Yui screen", home: `/playground?yl=${code}`, og: `/og?yl=${code}` };
  return { yl: "timer 40/20x8 Tabata", agent: "Yui", title: "Tabata timer", home: "/playground", og: "/og?demo=tabata-timer" };
}

export async function generateMetadata({ searchParams }) {
  const r = await resolve(await searchParams);
  const title = `${r.title} | Yui`;
  return {
    title,
    robots: { index: false },
    openGraph: { title, description: "A live Yui screen, drawn from Yui Lines.", siteName: "Yui", type: "website", images: [{ url: r.og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, images: [r.og] },
  };
}

export default async function Embed({ searchParams }) {
  const q = await searchParams;
  const r = await resolve(q);
  const light = q.theme === "light";
  return (
    <div className={`embed-root${light ? " light" : ""}`}>
      <LivePhone yl={r.yl} agent={r.agent} light={light} label={`${r.title}, drawn live from Yui Lines`} eager />
      <a className="embed-by" href={`https://www.yuigui.com${r.home}`} target="_blank" rel="noopener">
        <img src="/brand/yui-wordmark-coral-156.webp" alt="" width="24" height="16" /> Made with Yui Lines
      </a>
    </div>
  );
}

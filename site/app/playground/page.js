import Playground from "./Playground";
import Benchmark from "./Benchmark";
import "katex/dist/katex.min.css";

import { cleanYL, findSample, sampleSlug } from "../../lib/share.mjs";
import { encodeYL, readYL } from "../../lib/share-code.mjs";

// A shared playground link (SITE-19) previews the screen it carries: /og draws the lines.
export async function generateMetadata({ searchParams }) {
  const q = await searchParams;
  const yl = cleanYL(await readYL(q.yl));
  const code = yl ? await encodeYL(yl) : null;
  const s = !code && typeof q.demo === "string" ? findSample(q.demo) : null;
  const og = code ? `/og?yl=${code}` : s ? `/og?demo=${encodeURIComponent(sampleSlug(s))}` : null;
  const title = code ? "A screen made in the Yui playground" : s ? `${s.name} | Yui playground` : "Playground | Yui";
  const description = "Yui Lines in, a live phone screen out. Edit the lines and the screen redraws as you type.";
  if (!og) return { title, description };
  return {
    title,
    description,
    openGraph: { title, description, siteName: "Yui", type: "website", images: [{ url: og, width: 1200, height: 630, alt: "The Yui Lines and the screen they draw" }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

export default function Page() {
  return (
    <>
      <div className="eyebrow">Developers | Playground | Yui Lines v0</div>
      <h1>Playground</h1>
      <p className="lede">
        The agent never writes UI code. It sends one short line per component, and the app renders a
        prebuilt preset. Pick a screen, edit the line, or press Stream to watch it render as the model types.
        Share gives you a link that opens exactly the screen on the phone.
        Grammar: <a href="/yl">Yui Lines spec</a>.
      </p>
      <Playground />
      <Benchmark />
    </>
  );
}

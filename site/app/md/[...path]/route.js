// A page as markdown for agents (SITE-77): /md/start, /md/developers/relay, /md/s/<id>.
// The Copy page button copies the same text. Built at deploy time from lib/handoff.mjs.
import { mdHrefs, pageMd } from "../../../lib/handoff.mjs";

export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => mdHrefs().map((href) => ({ path: href.slice(1).split("/") }));

export async function GET(_req, { params }) {
  const { path } = await params;
  const text = pageMd(`/${path.join("/")}`);
  if (text == null) return new Response("Not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(text, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}

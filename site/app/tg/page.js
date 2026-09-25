// Telegram Mini App (INT-4): a Yui screen inside Telegram, for when the Yui app is not around.
// The Telegram adapter (yui repo, adapters/telegram) puts "Open in Yui" buttons here:
// /tg?yl=<share code>[&agent=Name][&bridge=<the bot's https endpoint>]. Also ?demo=<playground sample>,
// and a t.me/<bot>/<app>?startapp=<share code> link. Spec: spec/TELEGRAM.md.
import TgApp from "./TgApp";
import { readYL } from "../../lib/share-code.mjs";
import { cleanYL, findSample } from "../../lib/share.mjs";

export const metadata = { title: "Yui in Telegram", robots: { index: false } };

export default async function Tg({ searchParams }) {
  const q = await searchParams;
  const s = q.demo ? findSample(String(q.demo)) : null;
  const yl = s ? cleanYL(s.yl) : cleanYL(await readYL(q.yl));
  const agent = String(q.agent || s?.agent || "Yui").slice(0, 40);
  const bridge = typeof q.bridge === "string" && /^https:\/\//.test(q.bridge) ? q.bridge : null;
  return <TgApp yl={yl || null} agent={agent} bridge={bridge} />;
}

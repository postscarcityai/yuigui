// Telegram Mini App (INT-4): a Yui screen inside Telegram, for when the Yui app is not around.
// The Telegram adapter (yui repo, adapters/telegram) puts "Open in Yui" buttons here:
// /tg?yl=<share code>[&agent=Name][&bridge=<the bot's https endpoint>]. Also ?demo=<playground sample>,
// and a t.me/<bot>/<app>?startapp=<share code> link. Spec: spec/TELEGRAM.md.
import TgApp from "./TgApp";
import { readYL } from "../../lib/share-code.mjs";
import { cleanYL, findSample } from "../../lib/share.mjs";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({ path: "/tg", title: "Yui in Telegram", robots: { index: false }, description: "Yui screens in Telegram: questions as buttons, the rest in a Mini App." });

export default async function Tg({ searchParams }) {
  const q = await searchParams;
  const s = q.demo ? findSample(String(q.demo)) : null;
  const yl = s ? cleanYL(s.yl) : cleanYL(await readYL(q.yl));
  const agent = String(q.agent || s?.agent || "Yui").slice(0, 40);
  const bridge = typeof q.bridge === "string" && /^https:\/\//.test(q.bridge) ? q.bridge : null;
  return <TgApp yl={yl || null} agent={agent} bridge={bridge} />;
}

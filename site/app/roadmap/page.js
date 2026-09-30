import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { renderMd } from "../../lib/md.mjs";
import MvpBar from "../components/MvpBar";
import Films from "../components/Films";
import board from "../../content/board.json";
import { linkCards } from "../../lib/showcase.mjs";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({ path: "/roadmap", title: "Roadmap | Yui", description: "Where Yui is going: the MVP first, then the epics and the deep backlog, each card linked to its screens or its tile on the board." });

export default function Roadmap() {
  const raw = readFileSync(path.join(process.cwd(), "content", "ROADMAP.md"), "utf8");
  // The file's own title line ("# Yui | roadmap (draft 10, Sep 24 2026)") becomes the eyebrow, so this page
  // opens like the other Roadmap tabs: eyebrow, headline, lede.
  const title = raw.match(/^# .*\(([^)]+)\)\s*$/m)?.[1];
  const md = raw.replace(/^# .*\n/, "");
  // Card ids link to their screens on /mockups (SITE-14), or to their board tile.
  const onBoard = new Set(board.columns.flatMap((c) => c.cards.map((x) => x.key)));
  return (
    <>
      <div className="eyebrow">Roadmap{title ? ` | ${title}` : ""}</div>
      <h1>Where Yui is going.</h1>
      <p className="lede">
        The MVP first, then the epics and the deep backlog. This page is the repo's{" "}
        <a href="https://github.com/postscarcityai/yuigui/blob/main/ROADMAP.md">ROADMAP.md</a>; each card id links to
        its screens or its tile on the <Link href="/board">board</Link>.
      </p>
      <Films
        id="concepts"
        layout="feature"
        eager
        title="The ideas, as films."
        lede="Where the roadmap points, drawn before it is built: history as a map that moves, a year of markets under one finger, and an outage fixed at 3 am with one Send. Concept films, not built yet."
        ids={["film-mongols-by-map", "film-markets-2020", "film-3am-incident"]}
      />
      <MvpBar detail />
      <article className="md" dangerouslySetInnerHTML={{ __html: linkCards(renderMd(md), onBoard) }} />
    </>
  );
}

import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { renderMd } from "../../lib/md.mjs";
import MvpBar from "../components/MvpBar";
import board from "../../content/board.json";
import { linkCards } from "../../lib/showcase.mjs";

export const metadata = { title: "Roadmap | Yui" };

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
      <MvpBar detail />
      <article className="md" dangerouslySetInnerHTML={{ __html: linkCards(renderMd(md), onBoard) }} />
    </>
  );
}

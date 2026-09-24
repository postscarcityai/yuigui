import { readFileSync } from "node:fs";
import path from "node:path";
import { renderMd } from "../../lib/md.mjs";
import MvpBar from "../components/MvpBar";
import board from "../../content/board.json";
import { linkCards } from "../../lib/showcase.mjs";

export const metadata = { title: "Roadmap | Yui" };

export default function Roadmap() {
  const md = readFileSync(path.join(process.cwd(), "content", "ROADMAP.md"), "utf8");
  // Card ids link to their screens on /mockups (SITE-14), or to their board tile.
  const onBoard = new Set(board.columns.flatMap((c) => c.cards.map((x) => x.key)));
  return (
    <>
      <div className="eyebrow">Roadmap | rendered from ROADMAP.md</div>
      <MvpBar detail />
      <article className="md" dangerouslySetInnerHTML={{ __html: linkCards(renderMd(md), onBoard) }} />
    </>
  );
}

import { readFileSync } from "node:fs";
import path from "node:path";
import { renderMd } from "../../lib/md.mjs";
import MvpBar from "../components/MvpBar";

export const metadata = { title: "Roadmap | Yui" };

export default function Roadmap() {
  const md = readFileSync(path.join(process.cwd(), "content", "ROADMAP.md"), "utf8");
  return (
    <>
      <div className="eyebrow">Roadmap | rendered from ROADMAP.md</div>
      <MvpBar detail />
      <article className="md" dangerouslySetInnerHTML={{ __html: renderMd(md) }} />
    </>
  );
}

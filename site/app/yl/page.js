import { readFileSync } from "node:fs";
import path from "node:path";
import { renderMd } from "../../lib/md.mjs";

export const metadata = { title: "Yui Lines spec | Yui" };

export default function YLSpec() {
  const md = readFileSync(path.join(process.cwd(), "content", "YL.md"), "utf8");
  return (
    <>
      <div className="eyebrow">Developers | Yui Lines spec | rendered from spec/YL.md | <a href="/playground">try it in the playground</a></div>
      <article className="md" dangerouslySetInnerHTML={{ __html: renderMd(md) }} />
    </>
  );
}

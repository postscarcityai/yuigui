import { readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";

export const metadata = { title: "Roadmap | Yui" };

export default function Roadmap() {
  const md = readFileSync(path.join(process.cwd(), "content", "ROADMAP.md"), "utf8");
  return (
    <>
      <div className="eyebrow">Roadmap | rendered from ROADMAP.md</div>
      <article className="md" dangerouslySetInnerHTML={{ __html: marked.parse(md) }} />
    </>
  );
}

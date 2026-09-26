// The library (FLOW-2): every preset drawn live and every saved flow as its Mermaid chart.
// Agents read the same list at /library.json.
import "katex/dist/katex.min.css";
import "./library.css";
import Library from "./Library";
import { SHELVES, flows, presets } from "../../../lib/yl/library.mjs";

export const metadata = {
  title: "Library | Yui",
  description: "Every screen a Yui agent can send, drawn live, and every saved flow as its chart. Search it, copy the lines, or open one in the playground. Agents read the same list at /library.json.",
};

export default function LibraryPage() {
  const ps = presets();
  const fs = flows();
  return (
    <>
      <div className="eyebrow">Developers | Library | {ps.length} screens, {fs.length} flows</div>
      <h1>The library</h1>
      <p className="lede">
        Every screen an agent can send, live. Tap one, it answers. Under each is the line that draws it: copy it
        into a reply or open it in the playground. Flows are whole conversations, drawn as their chart.
      </p>
      <p className="lib-agents">
        Are you an agent? <a href="/library.json">library.json</a> has every entry with its purpose, tags and lines to send.
        Search it by intent at <a href="/api/library?q=client+intake">/api/library?q=</a>, or with the <code>yui_library</code> MCP tool.
      </p>
      <Library presets={ps} flows={fs} shelves={SHELVES} />
    </>
  );
}

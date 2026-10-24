import Gallery from "./Gallery";
import { pageMeta } from "../../lib/og/meta.mjs";
import "./gallery.css";

export const metadata = pageMeta({
  path: "/yuicss",
  title: "yuicss | Yui",
  description: "yuicss is how Yui looks, as one stylesheet: tokens, every element finished with no class, Tailwind-named utilities and every component, drawn in three agent looks, light and dark.",
});

export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="/yuicss/yuicss.css" precedence="default" />
      <div className="eyebrow">Developers | yuicss | the foundation of every screen</div>
      <h1>yuicss</h1>
      <p className="lede">
        How Yui looks, as one stylesheet. An agent writes a bare <code>h1</code>, a <code>button</code>, a <code>card</code>, and it already
        looks like Yui in that agent's colors. The agent writes only what is different. Pick a look and watch every
        token, element and component move with it, light and dark.
      </p>
      <Gallery />
    </>
  );
}

// Motion (MOTION-1): the drawing and motion system, 20 asks run twice each. Every tile plays the film the
// model wrote, in the same player the app bundles.
import Link from "next/link";
import gallery from "../../lib/motion/gallery.json";
import { pageMeta } from "../../lib/og/meta.mjs";
import Gallery from "./Gallery";

export const metadata = pageMeta({
  path: "/motion",
  title: "Motion | Yui",
  description: "Any idea or piece of work, drawn and moving: 20 asks, each made twice by the model, from a heart pumping to a bug and its fix.",
});

const G = [
  { title: "Draw how it works", lede: "Ideas, machines, history, money. Built part by part, labeled, with the camera moving in.", kinds: ["draw", "history", "recipe", "workout", "business", "how-to", "comparison", "numbers"] },
  { title: "Show the work", lede: "What changed, where we are, how two parts connect, a bug and its fix, a sketch of an idea, a day. The things an agent and a person explain to each other mid-project.", kinds: ["work"] },
  { title: "A feeling, a mood", lede: "No diagram to draw. Just the thing itself, moving.", kinds: ["feeling"] },
];

export default function MotionPage() {
  const s = gallery.summary;
  const groups = G.map((g) => ({ ...g, asks: gallery.asks.filter((a) => g.kinds.includes(a.kind) && !(g.title === "Draw how it works" && false)) }));
  return (
    <>
      <div className="eyebrow">Motion</div>
      <h1>Draw anything. Make it move.</h1>
      <p className="lede" style={{ fontSize: 18 }}>
        An agent can draw what it means, mid-anything: a concept, or the work it is doing with you. The model writes the film as code against a small drawing kit, scene by scene, so the first scene plays in seconds. No templates. Each ask below was made twice; the two runs are never alike. Tap one to play it.
      </p>
      <div className="mg-stats">
        <div className="mg-stat"><b>{s.films}</b><span>films, 20 asks twice</span></div>
        <div className="mg-stat"><b>{(s.first_scene_serial_median_s ?? s.first_scene_median_s).toFixed(1)} s</b><span>to the first scene, median, one at a time</span></div>
        <div className="mg-stat"><b>{Math.round(s.film_median_s)} s</b><span>a film, median</span></div>
        <div className="mg-stat"><b>${s.cost_median_usd}</b><span>to make one, median</span></div>
      </div>
      <p className="lede" style={{ fontSize: 15 }}>The kit, the player and the test set are in the repo (<code>site/public/demo/motion</code>, <code>site/scripts/motion</code>). Spec: <Link href="/developers/motion">MOTION</Link>. Try your own ask in the <Link href="/playground?demo=motion">playground</Link>.</p>
      <Gallery groups={groups} />
    </>
  );
}

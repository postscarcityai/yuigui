// Films (SITE-165): every film that used to sit on the home page, in one place. The home page links here.
import Link from "next/link";
import Films from "../components/Films";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/films",
  title: "Films | Yui",
  description: "Short films of the real Yui app, sound on, and three concept films of where Yui is going.",
});

export default function FilmsPage() {
  return (
    <>
      <div className="eyebrow">Films</div>
      <h1>Yui, on film.</h1>
      <p className="lede" style={{ fontSize: 18 }}>A minute each, sound on. Want to try it yourself? <Link href="/web?demo=penny">Tap a live demo</Link>, no sign in.</p>

      <Films
        title="Watch the films"
        lede="One idea per film, all of it the real app on the demo account."
        ids={["film-meet-yui", "film-plan-to-launch", "film-agents", "film-tune-up"]}
      />

      <Films
        title="Dinner, a car, homework"
        lede="Three everyday moments, half a minute each. You talk, your agent answers on the whole screen."
        ids={["film-hands-full", "film-afford-it", "film-homework"]}
      />

      <Films
        id="concepts"
        layout="feature"
        eyebrow="Concept films"
        title="Where Yui is going."
        lede={<>Three ideas we are building toward: history as a map that moves, a year of markets under one finger, and an outage fixed at 3 am with one Send. Not built yet. <Link href="/roadmap">See the roadmap</Link>.</>}
        ids={["film-mongols-by-map", "film-markets-2020", "film-3am-incident"]}
      />
    </>
  );
}

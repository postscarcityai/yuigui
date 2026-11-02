// Web credits: who designed, built and maintains this site. A standard page on every site PostScarcity AI builds.
// Spec: no scroll at 375x667 and 1440x900 (see .wc-root in globals.css), solid reversed stamp, 1px corners.
import { pageMeta } from "../../lib/og/meta.mjs";
import { MARK_VIEWBOX, MARK_D } from "../../lib/web-credits-mark.mjs";

export const metadata = pageMeta({
  path: "/web-credits",
  title: "Web credits | Yui",
  description: "Yui was concepted, designed, built and is maintained by PostScarcity AI.",
});

export default function WebCredits() {
  return (
    <section className="wc-root">
      <a href="https://postscarcity.ai" className="wc-mark" aria-label="PostScarcity AI">
        <svg viewBox={MARK_VIEWBOX} role="img" aria-label="PostScarcity AI" xmlns="http://www.w3.org/2000/svg">
          <path d={MARK_D} fill="currentColor" fillRule="evenodd" />
        </svg>
      </a>
      <h1>Web credits</h1>
      <p>Yui is a brainchild of PostScarcity AI. We concepted it, designed it, built it, and we maintain it.</p>
      <p className="wc-links">
        <a href="https://postscarcity.ai">postscarcity.ai</a> | <a href="https://postscarcity.ai/work/yuigui">How we built Yui</a>
      </p>
    </section>
  );
}

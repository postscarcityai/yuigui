// Yui on the web (YUI-240 to YUI-250, spec/BROWSER.md). This story, YUI-241: sign in with Apple, a session
// that stays signed in, sign out. The thread, the stage and the rest follow in YUI-242 and on.
import { Suspense } from "react";
import WebApp from "./WebApp";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/web", title: "Yui on the web", robots: { index: false, follow: false },
  description: "Yui in a browser tab: the same account, agents and screens as the iPhone app. Sign in with Apple.",
  // The invite code in the link never leaves the page.
  referrer: "no-referrer",
});

export default function Web() {
  return <Suspense><WebApp /></Suspense>;
}

// A thread's own address (YUI-242): /web/agent/<id> and /web/agent/<id>/chat/<chat>, what a notification click
// or a yui:// link opens. The same app as /web; the client reads the path.
import { Suspense } from "react";
import WebApp from "../../WebApp";
import { readBuild } from "../../../../lib/web/build.mjs";
import { pageMeta } from "../../../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/web", title: "Yui on the web", robots: { index: false, follow: false },
  description: "Yui in a browser tab: the same account, agents and screens as the iPhone app. Sign in with Apple.",
  referrer: "no-referrer",
});

export default function WebThread() {
  return <Suspense><WebApp build={readBuild()} /></Suspense>;
}

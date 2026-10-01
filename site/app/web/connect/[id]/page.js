// An MCP client asking to connect (INT-19): www.yuigui.com/connect/<id> offers "Approve in Yui on the web", which
// opens this page in a new tab. Same app as /web; the client reads the path and shows the approval over it.
import { Suspense } from "react";
import WebApp from "../../WebApp";
import { pageMeta } from "../../../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/web", title: "Connect to Yui", robots: { index: false, follow: false },
  description: "Let an AI app put screens in one Yui thread. Approve it here.",
  referrer: "no-referrer",
});

export default function WebConnect() {
  return <Suspense><WebApp /></Suspense>;
}

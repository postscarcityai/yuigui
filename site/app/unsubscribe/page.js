// The link at the bottom of Yui's news: yuigui.com/unsubscribe?t=<token>.
// Mail apps also offer one-click unsubscribe, which goes straight to yui-mail.
import Unsubscribe from "./Unsubscribe";
import { pageMeta } from "../../lib/og/meta.mjs";

export const metadata = pageMeta({
  path: "/unsubscribe",
  title: "Unsubscribe | Yui",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  description: "Stop Yui emails with one tap.",
});

export default function Page() {
  return (
    <>
      <div className="eyebrow">Email</div>
      <h1>Unsubscribe.</h1>
      <Unsubscribe />
    </>
  );
}

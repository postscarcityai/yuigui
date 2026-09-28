// The link at the bottom of Yui's news: yuigui.com/unsubscribe?t=<token>.
// Mail apps also offer one-click unsubscribe, which goes straight to yui-mail.
import Unsubscribe from "./Unsubscribe";

export const metadata = {
  title: "Unsubscribe | Yui",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function Page() {
  return (
    <>
      <div className="eyebrow">Email</div>
      <h1>Unsubscribe.</h1>
      <Unsubscribe />
    </>
  );
}

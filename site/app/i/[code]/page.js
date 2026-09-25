// An invite link (YUI-56): yuigui.com/i/<code>. With Yui installed, iOS opens
// the app straight from this link (universal link, see
// ../../.well-known/apple-app-site-association); this page is the fallback.
// It never checks the code: a page that says "valid" or "used" would let
// anyone guess codes. yui-auth checks it when the person signs in. Analytics
// never see the code (layout.js). Keep the steps in step with the app's
// sign-in screen (Yui/Sources/Account/SignInView.swift in the app repo).
import { notFound } from "next/navigation";

export const metadata = {
  title: "You're invited | Yui",
  description: "Your invite to the Yui beta: get the app from TestFlight, open this link, sign in with Apple.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// Same rule as the app: letters and numbers, 10 of them shown as ABCDE-FGHJK.
function clean(raw) {
  const n = decodeURIComponent(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (n.length < 6 || n.length > 32) return null;
  return n.length === 10 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
}

export default async function Invite({ params }) {
  const code = clean((await params).code);
  if (!code) notFound();
  return (
    <>
      <div className="eyebrow">Invite</div>
      <h1>You&apos;re invited to Yui.</h1>
      <p className="lede">Three steps, all on your iPhone. You need iOS 26.</p>
      <ol className="steps">
        <li>
          <div className="card">
            <h3>Install Yui from the TestFlight email</h3>
            <p>
              Apple emailed your invite to the email on your Apple ID. Open it on your iPhone, tap{" "}
              <strong>View in TestFlight</strong>, install TestFlight if it asks, then install Yui. No email yet? Check
              spam, or give it a few minutes.
            </p>
          </div>
        </li>
        <li>
          <div className="card">
            <h3>Open Yui with your invite</h3>
            <p>With Yui installed, open this page on your iPhone and tap the button. Your invite goes along.</p>
            <p style={{ marginTop: 14 }}><a className="btn" href={`yui://invite/${code}`}>Open in Yui</a></p>
          </div>
        </li>
        <li>
          <div className="card">
            <h3>Sign in with Apple</h3>
            <p>
              That claims your invite. If you signed in some other way, or chose Hide My Email and it did not
              find you, tap <strong>Invite code</strong> on the sign-in screen and type:
            </p>
            <p className="invite-code" aria-label="Your invite code"><code>{code}</code></p>
            <p>The code works once. Keep it to yourself.</p>
          </div>
        </li>
      </ol>
      <p style={{ color: "var(--muted)" }}>
        Something not working? <a href="/help">Get help</a>. What we keep about your invite:{" "}
        <a href="/privacy">privacy</a>.
      </p>
    </>
  );
}

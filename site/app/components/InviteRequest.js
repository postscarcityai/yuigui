"use client";
import { useState } from "react";
import links from "../../content/links.json";
import { savedUtm, trackCta } from "../../lib/track.mjs";

// Request an invite (SITE-26). Replaces the waitlist: the row lands in yui_invites as requested,
// Chris reviews it, and Apple sends the TestFlight email to the address given here.
export default function InviteRequest({ source = "home" }) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const field = (k) => f.get(k) || "";
    setState("sending");
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: field("first_name"), last_name: field("last_name"), email: field("email"), phone: field("phone"),
          website: field("website"), source, utm: savedUtm(),
        }),
      });
      const data = await res.json();
      if (data.ok) { trackCta("invite-request", source); return setState("done"); }
      setError(data.error || "Try again."); setState("idle");
    } catch { setError("Network error. Try again."); setState("idle"); }
  }

  if (state === "done") {
    return (
      <div id="invite" className="card invite" role="status">
        <h3>Request in. Thank you!</h3>
        <p>We read every request. When you are in, Apple emails you a TestFlight invite. Open it on your iPhone, install Yui, and sign in with Apple.</p>
      </div>
    );
  }

  return (
    <form id="invite" className="card invite" onSubmit={submit}>
      <span id="waitlist" />
      <h3>Request an invite</h3>
      <p>The Yui beta is by invite. Tell us who you are and we will get you in.</p>
      <div className="inv-grid">
        <label>First name<input name="first_name" required autoComplete="given-name" maxLength={80} /></label>
        <label>Last name<input name="last_name" required autoComplete="family-name" maxLength={80} /></label>
        <label className="inv-wide">
          Email
          <input name="email" type="email" required autoComplete="email" maxLength={254} placeholder="you@icloud.com" aria-describedby="inv-email-hint" />
          <span id="inv-email-hint" className="inv-hint">Use the email on your Apple ID, that is where TestFlight sends your invite.</span>
        </label>
        <label className="inv-wide">Phone<input name="phone" type="tel" required autoComplete="tel" maxLength={25} placeholder="+1 555 123 4567" /></label>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="wl-hp" />
      </div>
      <ol className="inv-next">
        <li>We review your request.</li>
        <li>Apple emails you a TestFlight invite.</li>
        <li>Open it on your iPhone, install Yui, and sign in with Apple.</li>
      </ol>
      <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Request an invite"}</button>
      {error && <p className="wl-err">{error}</p>}
      <p className="inv-fine">
        We use this only to get you into Yui. <a href="/privacy#invites">Privacy</a>.
        {links.testflight && <> Already run Hermes? <a href={links.testflight} onClick={() => trackCta("testflight", `${source}:invite`)}>Skip the line with the public TestFlight link</a>.</>}
      </p>
    </form>
  );
}

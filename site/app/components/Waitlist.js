"use client";
import { useState } from "react";
import { savedUtm, trackCta } from "../../lib/track.mjs";

export default function Waitlist({ source = "home" }) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: f.get("email"), name: f.get("name"), website: f.get("website"), source, note: savedUtm() }),
      });
      const data = await res.json();
      if (data.ok) { trackCta("waitlist", source); return setState("done"); }
      setError(data.error || "Try again."); setState("idle");
    } catch { setError("Network error. Try again."); setState("idle"); }
  }

  if (state === "done") return <div id="waitlist" className="card waitlist"><h3>You are on the list.</h3><p>We will write when something new ships.</p></div>;

  return (
    <form id="waitlist" className="card waitlist" onSubmit={submit}>
      <h3>Follow along</h3>
      <p>Yui is built in public and the TestFlight beta is open to anyone. Join for updates when something new ships.</p>
      <div className="wl-row">
        <input name="name" aria-label="Name" placeholder="Name (optional)" autoComplete="name" maxLength={120} />
        <input name="email" type="email" aria-label="Email" required placeholder="you@email.com" autoComplete="email" maxLength={254} />
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="wl-hp" />
        <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Joining..." : "Join for updates"}</button>
      </div>
      {error && <p className="wl-err">{error}</p>}
    </form>
  );
}

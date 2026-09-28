"use client";
import { useEffect, useRef, useState } from "react";
import links from "../../content/links.json";

export default function Confirm() {
  const [state, setState] = useState("working");
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return; // once, even when React runs effects twice
    ran.current = true;
    const token = new URLSearchParams(location.search).get("t") || "";
    // Keep the token out of the address bar, history and analytics.
    history.replaceState(null, "", "/confirm");
    if (!token) return setState("bad");
    fetch("/api/mail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "confirm", token }) })
      .then((r) => r.json()).then((d) => setState(d.ok ? "done" : "bad")).catch(() => setState("error"));
  }, []);
  if (state === "working") return <p className="lede">Confirming...</p>;
  if (state === "done") {
    return (
      <>
        <p className="lede">Your email is confirmed. Thank you!</p>
        <p>You don&apos;t have to wait for anything else: the alpha is open to anyone on TestFlight.</p>
        {links.testflight && <p style={{ marginTop: 14 }}><a className="btn" href={links.testflight}>Download on TestFlight</a></p>}
      </>
    );
  }
  if (state === "error") return <p className="lede">We couldn&apos;t reach Yui. Try the link again in a minute.</p>;
  return <p className="lede">This link has expired or was already used. Ask again from the form at the bottom of any page and a new one will come.</p>;
}

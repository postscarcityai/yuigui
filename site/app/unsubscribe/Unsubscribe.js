"use client";
import { useEffect, useState } from "react";

export default function Unsubscribe() {
  const [token, setToken] = useState("");
  const [state, setState] = useState("ask");
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("t");
    if (!t) return;
    setToken(t);
    history.replaceState(null, "", "/unsubscribe");
  }, []);
  async function stop(all) {
    setState("working");
    try {
      const r = await fetch("/api/mail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "unsubscribe", token, all }) });
      const d = await r.json();
      setState(d.ok ? (all ? "all" : "news") : "bad");
    } catch { setState("error"); }
  }
  if (state === "news") return <p className="lede">Done. No more news from Yui. You&apos;ll still get answers to anything you write to us.</p>;
  if (state === "all") return <p className="lede">Done. Yui won&apos;t email you again, unless you ask for something that needs a confirmation.</p>;
  if (state === "bad") return <p className="lede">This link doesn&apos;t work anymore. Answer any email from Yui with &quot;stop&quot; and we&apos;ll take care of it.</p>;
  if (state === "error") return <p className="lede">We couldn&apos;t reach Yui. Try again in a minute.</p>;
  return (
    <>
      <p className="lede">Stop getting news from Yui?</p>
      <p style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
        <button className="btn" disabled={!token || state === "working"} onClick={() => stop(false)}>Stop the news</button>
        <button className="btn soft" disabled={!token || state === "working"} onClick={() => stop(true)}>Stop all email from Yui</button>
      </p>
    </>
  );
}

"use client";
// Vote on a proposal (SITE-89): "Yes, build it" or "Not yet", counts, and an optional one-line why.
// One vote per browser (voter id in localStorage), changeable. The server does the rest.
import { useEffect, useRef, useState } from "react";
import { voterId } from "./voter";

const WHY_MAX = 200;
const LABEL = { yes: "Yes, build it", not_yet: "Not yet" };
const ago = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function ProposalVote({ id, title }) {
  const [state, setState] = useState({ counts: null, me: null, whys: [] });
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const voter = useRef(null);

  const apply = (d) => {
    setState({ counts: d.counts, me: d.me, whys: d.whys || [] });
    window.dispatchEvent(new CustomEvent("prop-vote", { detail: { id, counts: d.counts } }));
  };

  useEffect(() => {
    voter.current = voterId();
    let live = true;
    fetch(`/api/proposals/vote?id=${id}&voter=${voter.current || ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (live && d.ok) { setState({ counts: d.counts, me: d.me, whys: d.whys || [] }); setWhy(d.me?.why || ""); } })
      .catch(() => {});
    return () => { live = false; };
  }, [id]);

  async function send(vote, withWhy) {
    if (!voter.current) { setMsg("Your browser blocks storage, so a vote cannot be kept."); return; }
    setBusy(true); setMsg("");
    try {
      const body = { proposal: id, voter: voter.current, vote };
      if (withWhy) body.why = why;
      const r = await fetch("/api/proposals/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (d.ok) { apply(d); if (withWhy) setMsg(why.trim() ? "Saved. Thanks." : "Cleared."); }
      else setMsg(d.error || "That did not go through. Try again.");
    } catch { setMsg("That did not go through. Try again."); }
    setBusy(false);
  }

  const { counts, me, whys } = state;
  const total = counts ? counts.yes + counts.not_yet : 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const changed = (me?.why || "") !== why.trim();

  return (
    <section className="prop-vote" id="vote" aria-labelledby="vote-h">
      <h2 id="vote-h">Should Yui build this?</h2>
      <p className="prop-vote-sub">{me ? `You voted ${LABEL[me.vote]}. Tap the other one to change it.` : "Two buttons. No login, no email."}</p>

      <div className="prop-vote-btns" role="group" aria-label={`Vote on ${title}`}>
        {["yes", "not_yet"].map((v) => (
          <button key={v} type="button" className={`prop-vote-btn ${v}${me?.vote === v ? " on" : ""}`} aria-pressed={me?.vote === v} disabled={busy} onClick={() => send(v, false)}>
            <span className="prop-vote-label">{LABEL[v]}</span>
            <span className="prop-vote-count">{counts ? counts[v] : "-"}</span>
          </button>
        ))}
      </div>
      <div className="prop-vote-bar" aria-hidden="true"><i style={{ width: `${pct(counts?.yes || 0)}%` }} /></div>
      <p className="prop-vote-total" aria-live="polite">{counts ? (total ? `${total} ${total === 1 ? "vote" : "votes"}. ${pct(counts.yes)}% yes.` : "No votes yet. Yours could be the first.") : "Counting"}</p>

      {me && (
        <form className="prop-vote-why" onSubmit={(e) => { e.preventDefault(); send(me.vote, true); }}>
          <label htmlFor="why">Why? One line, optional.</label>
          <input id="why" type="text" value={why} maxLength={WHY_MAX} onChange={(e) => setWhy(e.target.value)} placeholder="Say it in a sentence" autoComplete="off" />
          <div className="prop-vote-row">
            <span className="prop-vote-chars">{why.length}/{WHY_MAX}</span>
            <button type="submit" className="btn" disabled={busy || !changed}>{me.why && !why.trim() ? "Clear my why" : "Save my why"}</button>
          </div>
        </form>
      )}
      {msg && <p className="prop-vote-msg" role="status">{msg}</p>}

      {whys.length > 0 && (
        <div className="prop-whys">
          <h3>Why people voted</h3>
          <ul>
            {whys.map((w, i) => (
              <li key={`${w.at}-${i}`}>
                <span className={`pill prop-why-pill ${w.vote}`}>{LABEL[w.vote]}</span>
                <span className="prop-why-text">{w.why}</span>
                <time dateTime={w.at}>{ago(w.at)}</time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

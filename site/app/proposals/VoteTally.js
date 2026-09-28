"use client";
// The counts on a list card or a proposal page's facts (SITE-89): "3 yes | 1 not yet". Reads the same
// endpoint as the vote box and refreshes when a vote is cast on this page.
import { useEffect, useState } from "react";

export default function VoteTally({ id, empty = "No votes yet" }) {
  const [c, setC] = useState(null);
  useEffect(() => {
    let live = true;
    const load = () => fetch(`/api/proposals/vote?id=${id}`, { cache: "no-store" }).then((r) => r.json()).then((d) => { if (live && d.ok) setC(d.counts); }).catch(() => {});
    load();
    const on = (e) => { if (e.detail?.id === id) setC(e.detail.counts); };
    window.addEventListener("prop-vote", on);
    return () => { live = false; window.removeEventListener("prop-vote", on); };
  }, [id]);
  if (!c) return <span className="prop-tally" aria-busy="true">Counting</span>;
  if (!c.yes && !c.not_yet) return <span className="prop-tally">{empty}</span>;
  return <span className="prop-tally">{c.yes} yes <span aria-hidden="true">|</span> {c.not_yet} not yet</span>;
}

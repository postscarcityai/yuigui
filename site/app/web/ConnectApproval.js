"use client";
// An MCP client (Claude, ChatGPT, Cursor) asks to connect through OAuth (Agents/ConnectApproval.swift, INT-19).
// Its sign-in page, www.yuigui.com/connect/<id>, hands off here: the person picks which agent the client talks
// as (a new one named after it, or one it already had) and taps Allow. The sign-in page sees the approval and
// finishes the client's sign-in on its own; the client never gets more than that one thread.
import { useEffect, useState } from "react";
import { Dialog, Face, SheetBar, Spinner } from "./parts";

export default function ConnectApproval({ relay, id, agents = [], refresh, onOpenAgent, onClose }) {
  const [req, setReq] = useState(null);
  const [phase, setPhase] = useState("loading"); // loading | asking | allowed | denied | finished
  const [pick, setPick] = useState(null); // null: a new agent named after the client
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [why, setWhy] = useState("");

  useEffect(() => {
    let live = true;
    const ask = () => relay.call("yui-oauth", { action: "app_request", id });
    (async () => {
      try {
        let r;
        // Right after sign in the session may still be settling: one retry, like the app.
        try { r = await ask(); } catch (e) { if (e.code === "invalid_request") throw e; await new Promise((ok) => setTimeout(ok, 1500)); r = await ask(); }
        if (!live) return;
        setReq(r);
        if (r.status === "pending") setPhase("asking");
        else { setWhy(r.status === "expired" ? `This request expired. Add Yui in ${r.client.name} again.` : `${r.client.name} is already approved or turned down.`); setPhase("finished"); }
      } catch (e) {
        if (!live) return;
        setWhy(e.code === "invalid_request" ? "This connect link doesn't exist. Add Yui in your app again." : "Couldn't load this request. Check your connection and open the link again.");
        setPhase("finished");
      }
    })();
    return () => { live = false; };
  }, [relay, id]);

  const allow = async () => {
    setWorking(true); setError("");
    try {
      const r = await relay.call("yui-oauth", { action: "app_approve", id, ...(pick ? { agent_id: pick } : { name: req.suggested_name }) });
      const list = (await refresh?.()) || agents;
      const name = list.find((a) => a.id === r.agent?.id)?.name || req.agents.find((a) => a.id === r.agent?.id)?.name || r.agent?.name || req.suggested_name;
      setResult({ id: r.agent?.id, name });
      setPhase("allowed");
    } catch { setError("That didn't go through. Check your connection and tap Allow again."); }
    finally { setWorking(false); }
  };
  const deny = async () => {
    setWorking(true); setError("");
    try { await relay.call("yui-oauth", { action: "app_deny", id }); setPhase("denied"); }
    catch { setError("That didn't go through. Try again."); }
    finally { setWorking(false); }
  };

  const client = req?.client?.name || "The app";
  const asking = phase === "asking";
  const choice = (value, title) => (
    <button key={value ?? "new"} type="button" role="radio" aria-checked={pick === value} className={`ag-pick${pick === value ? " on" : ""}`} onClick={() => setPick(value)} data-testid={`connect-pick-${value ?? "new"}`}>
      <span>{title}</span><i aria-hidden="true">{pick === value ? "●" : "○"}</i>
    </button>
  );
  return (
    <Dialog label="Connect" onClose={asking ? () => {} : onClose} testid="connect-approval">
      <SheetBar title="Connect" right={asking ? null : <button type="button" className="ag-barbtn" onClick={onClose}>Done</button>} />
      <div className="ag-body">
        {phase === "loading" ? <Spinner label="Loading the request…" /> : null}
        {asking && req ? (
          <>
            <div className="ag-preview"><Face agent={{ name: client, color: "mint" }} size={72} /></div>
            <h2 className="ag-title" data-testid="connect-title">Connect {client}?</h2>
            <p className="ag-hint">{client}{req.client.site ? ` (${req.client.site})` : ""} wants to put screens on your phone and read your taps, in one thread. It can't see your other threads.</p>
            <h4>Talks as</h4>
            <div role="radiogroup" aria-label="Talks as" className="ag-picks">
              {choice(null, `New agent: ${req.suggested_name}`)}
              {req.agents.map((a) => choice(a.id, a.name))}
            </div>
            {error ? <p className="ag-error" role="alert">{error}</p> : null}
            <button type="button" className="ag-btn" disabled={working} onClick={allow} data-testid="connect-allow">{working ? "Allowing…" : "Allow"}</button>
            <button type="button" className="ag-link" disabled={working} onClick={deny} data-testid="connect-deny">Don't allow</button>
          </>
        ) : null}
        {phase === "allowed" ? (
          <div className="ag-done">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#2FB58C" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <h2 data-testid="connect-result">Connected</h2>
            <p>{client} talks as {result.name} now. Go back to {client} to finish. Remove it any time in your agents.</p>
            <button type="button" className="ag-btn" data-testid="connect-open" onClick={() => onOpenAgent(result.id)}>Open {result.name}'s thread</button>
          </div>
        ) : null}
        {phase === "denied" ? <><h2 data-testid="connect-result">Not connected</h2><p className="ag-hint">{client} won't get in. Go back to it if you change your mind.</p></> : null}
        {phase === "finished" ? <><h2 data-testid="connect-result">Nothing to approve</h2><p className="ag-hint">{why}</p></> : null}
      </div>
    </Dialog>
  );
}

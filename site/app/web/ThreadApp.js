"use client";
// Yui on the web (YUI-242): the agent list and the open thread. A column on a computer, a drawer at 390 px.
// It draws whoever YUI-241 signed in (`auth`, lib/web/auth.mjs) or, with ?demo=<sample>, a fake relay in the
// page: no sign in, no network (lib/web/demo.mjs). Same account, same agents, same threads as the phone.
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createDemoRelay } from "../../lib/web/demo.mjs";
import { createRelay } from "../../lib/web/relay.mjs";
import { SETS } from "../../lib/yl/look.mjs";
import { liveness, presenceLabel } from "../../lib/web/presence.mjs";
import fixture from "./fixtures/penny.json";
import ThreadView from "./ThreadView";
import "./thread.css";

const FIXTURES = { penny: fixture };

// An agent's color: its look's accent, else its color word.
function accentOf(agent) {
  return SETS[agent?.theme?.preset]?.accent || SETS[agent?.color]?.accent || "#FF7E8A";
}

function Face({ agent }) {
  return <span className="wb-face" style={{ "--face": accentOf(agent) }} aria-hidden="true">{(agent.name || "?").slice(0, 1).toUpperCase()}</span>;
}

function AgentRow({ agent, selected, href, onPick }) {
  const p = liveness(agent);
  return (
    <a className={`wb-agent-row${selected ? " on" : ""}`} href={href} aria-current={selected ? "page" : undefined} onClick={(e) => { e.preventDefault(); onPick(agent); }}>
      <Face agent={agent} />
      <span className="wb-agent-words">
        <b>{agent.name}</b>
        <small>{agent.tagline || presenceLabel(agent)}</small>
      </span>
      <i className={`wb-dot ${p}`} title={presenceLabel(agent)} />
    </a>
  );
}

export default function ThreadApp({ demo, auth, user, agent: agentId, chat }) {
  const router = useRouter();
  const search = useSearchParams();
  const theme = search.get("theme");
  const [mounted, setMounted] = useState(false);
  const [agents, setAgents] = useState(null);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [light, setLight] = useState(false);
  // The app opens on the stage (Stage first); the chat is the record, one tap away. ?view=chat opens the record.
  const [view, setView] = useState(search.get("view") === "chat" ? "chat" : "stage");

  useEffect(() => { setMounted(true); }, []);

  // The theme is the site's: the moon button's choice is in localStorage and on <html>; ?theme= wins for a link.
  useEffect(() => {
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    setLight(document.documentElement.dataset.theme === "light");
  }, [theme]);
  const flip = () => {
    const next = light ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("yui-theme", next); } catch { /* private mode */ }
    setLight(!light);
  };

  const relay = useMemo(() => {
    if (!mounted) return null;
    if (demo) return createDemoRelay(FIXTURES[demo] || fixture);
    if (!auth) return null;
    return createRelay({ token: () => auth.accessToken() });
  }, [mounted, demo, auth]);
  // The e2e checks read the wire (what a tap sent), not the screen. The committed relay, not a render's spare.
  useEffect(() => { if (demo && relay) window.yuiWebDemo = relay; }, [demo, relay]);
  // Who is signed in, as the account says it (the sign in only knew the Apple email it was given).
  const [me, setMe] = useState(null);
  useEffect(() => {
    if (!auth) return undefined;
    let live = true;
    auth.call("yui-account", { action: "get" }).then((r) => live && setMe(r.user)).catch(() => {});
    return () => { live = false; };
  }, [auth]);
  const email = me?.email || user?.email;
  const userId = demo ? "demo-user" : user?.id;

  const load = useCallback(async () => {
    if (!relay) return;
    try { const r = await relay.agents(); setAgents(r.agents || []); setError(null); } catch (e) { setError(e); }
  }, [relay]);
  // The list now and then, so presence (asleep, back online) stays honest.
  useEffect(() => {
    if (!relay) return undefined;
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [relay, load]);

  const sorted = useMemo(() => (agents ? [...agents].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)) : null), [agents]);
  const open = sorted ? sorted.find((a) => a.id === agentId) || sorted.find((a) => a.is_default) || sorted[0] : null;
  const q = [demo ? `demo=${encodeURIComponent(demo)}` : "", theme ? `theme=${theme}` : "", search.get("view") === "chat" ? "view=chat" : ""].filter(Boolean).join("&");
  const keep = q ? `?${q}` : "";
  const hrefOf = (a) => `/web/agent/${a.id}${keep}`;
  const pick = (a) => { setDrawer(false); router.push(hrefOf(a), { scroll: false }); };

  if (!mounted) return <div className="web-root"><div className="wb-wait center">Opening Yui...</div></div>;
  if (!relay) return <div className="web-root"><div className="wb-wait center">Opening Yui...</div></div>;

  return (
    <div className={`web-root${light ? " is-light" : ""}`}>
      <aside className={`wb-side${drawer ? " open" : ""}`} aria-label="Your agents">
        <div className="wb-side-head">
          <span className="wb-mark" aria-hidden="true">Y</span>
          <b>Yui</b>
          {demo ? <span className="wb-demo" title="A recorded thread. Nothing leaves this tab.">Demo</span> : null}
          <button className="wb-iconbtn wb-close" onClick={() => setDrawer(false)} aria-label="Close the agent list">Close</button>
        </div>
        <nav className="wb-agents">
          {sorted ? sorted.map((a) => <AgentRow key={a.id} agent={a} selected={open?.id === a.id} href={hrefOf(a)} onPick={pick} />) : <div className="wb-wait">Loading your agents...</div>}
          {sorted && !sorted.length ? <div className="wb-empty">No agents yet. Add one in the Yui app.</div> : null}
        </nav>
        <div className="wb-side-foot">
          {!demo && auth ? <div className="wb-who" data-testid="account" title="Signed in on this browser"><span data-testid="account-email">{email || "Hidden email"}</span></div> : null}
          <button className="wb-linkish" onClick={flip}>{light ? "Dark" : "Light"} look</button>
          {!demo && auth ? <button className="wb-linkish" onClick={() => auth.signOut()}>Sign out</button> : null}
        </div>
      </aside>
      {drawer ? <button className="wb-scrim" aria-label="Close the agent list" onClick={() => setDrawer(false)} /> : null}
      <main className="wb-main">
        <header className="wb-head">
          <button className="wb-iconbtn wb-menu" onClick={() => setDrawer(true)} aria-label="Your agents">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
          {open ? (
            <>
              <Face agent={open} />
              <span className="wb-head-words"><b>{open.name}</b><small><i className={`wb-dot ${liveness(open)}`} />{presenceLabel(open)}</small></span>
            </>
          ) : <span className="wb-head-words"><b>Yui</b></span>}
          {open ? <button className="wb-viewbtn" data-testid="to-stage" onClick={() => setView("stage")}>Stage</button> : null}
        </header>
        {open ? <ThreadView key={`${open.id}:${chat || ""}`} relay={relay} userId={userId} agent={open} chat={chat} light={light} view={view} setView={setView} onMenu={() => setDrawer(true)} />
          : error ? <div className="wb-signed-out"><p>Yui could not reach your agents. Try again in a moment.</p><button className="wb-cta" onClick={load}>Try again</button></div>
          : <div className="wb-wait center">Loading your agents...</div>}
      </main>
    </div>
  );
}

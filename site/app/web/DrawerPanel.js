"use client";
// The agent drawer (Agents/AgentDrawer.swift, AgentMenu.swift): Home (chats, what is next, the backlog, its
// screens, its shortcuts), Review (what waits on you), Agent (who it is, its settings). `menu` lines draw
// nothing in the chat; they land here, and a tap sends the same bucket line the phone sends. The bar at the
// foot switches agents and Add agent is always in reach, so a stranger finds it.
import { useEffect, useState } from "react";
import { controlSections, statusLine, isShared, isYui } from "../../lib/web/agents.mjs";
import { liveness } from "../../lib/web/presence.mjs";
import { pageTitle } from "../../lib/web/stage.mjs";
import DrawerChats from "./DrawerChats";
import { Face } from "./parts";

const TABS = ["Home", "Review", "Agent"];
const https = (u) => (typeof u === "string" && /^https:\/\//i.test(u) ? u : null);
const iconOf = (item, fallback) => (item.show ? "★" : https(item.url) ? "↗" : fallback);

function Row({ icon, title, sub, onClick, testid, disabled = false }) {
  return (
    <button type="button" className="dr-row" disabled={disabled} onClick={onClick} data-testid={testid}>
      <span className="dr-ico" aria-hidden="true">{icon}</span>
      <span className="dr-words"><b>{title}</b>{sub ? <small>{sub}</small> : null}</span>
      <span className="dr-go" aria-hidden="true">›</span>
    </button>
  );
}

function Tabs({ tab, setTab, review }) {
  return (
    <div className="dr-tabs" role="tablist" aria-label="Drawer">
      {TABS.map((t) => (
        <button key={t} type="button" role="tab" id={`dr-tab-${t}`} aria-selected={tab === t} aria-controls="dr-pane" className={tab === t ? "on" : ""} onClick={() => setTab(t)} data-testid={`tab-${t.toLowerCase()}`}>
          {t}{t === "Review" && review > 0 ? <em aria-label={`${review} waiting`}>{review}</em> : null}
        </button>
      ))}
    </div>
  );
}

function Home({ agent, api, chats, close, handlers, goReview }) {
  const home = api?.home;
  const waiting = home?.waiting || [];
  const backlog = home?.backlog || [];
  const shortcuts = home?.shortcuts || [];
  const commands = (agent.commands || []).slice(0, 6);
  const pages = home?.pages || [];
  const go = (fn) => () => { close(); fn(); };
  return (
    <>
      <DrawerChats agent={agent} chats={chats} openId={chats.openId} draftOpen={chats.draftOpen} note={chats.note}
        onNewChat={handlers.onNewChat} onOpenChat={handlers.onOpenChat} onRename={handlers.onRename} onDelete={handlers.onDeleteChat} onMore={handlers.onMoreChats} />
      {waiting.length ? (
        <>
          <h3 className="dr-heading">Next up for you</h3>
          <button type="button" className="dr-next" data-testid="next-up" onClick={goReview}>
            <span className="dr-ico on" aria-hidden="true">☝</span>
            <span className="dr-words"><b>{waiting[0].label}</b><small>{waiting[0].sub || "For you"}</small></span>
            <em className="dr-count">{waiting.length}</em>
          </button>
        </>
      ) : null}
      {backlog.length ? (
        <>
          <h3 className="dr-heading">Backlog</h3>
          {backlog.map((it) => <Row key={it.id} icon={iconOf(it, "⏳")} title={it.label} sub={it.sub} testid={`backlog-${it.id}`} onClick={go(() => api.run(it, "backlog"))} />)}
        </>
      ) : null}
      {pages.length ? (
        <>
          <h3 className="dr-heading">Screens</h3>
          {pages.map((k) => <Row key={k} icon="▭" title={pageTitle(home.state, k)} sub={`Screen ${k}`} testid={`screen-${k}`} onClick={go(() => api.run({ go: k }, "page"))} />)}
        </>
      ) : null}
      {shortcuts.length || commands.length ? (
        <>
          <h3 className="dr-heading">Shortcuts</h3>
          {shortcuts.map((it) => <Row key={it.id} icon="✦" title={it.label} sub={it.sub} testid={`shortcut-${it.id}`} onClick={go(() => api.run(it, "shortcut"))} />)}
          {commands.map((cmd) => (
            <Row key={cmd.name} icon="⚡" title={cmd.description || `/${cmd.name}`} sub={`/${cmd.name}${cmd.args ? ` ${cmd.args}` : ""}`} testid={`command-${cmd.name}`}
              onClick={go(() => (cmd.args ? api.compose(`/${cmd.name} `) : api.send(`/${cmd.name}`)))} />
          ))}
        </>
      ) : null}
    </>
  );
}

function Review({ agent, api, close }) {
  const waiting = api?.home?.waiting || [];
  if (!waiting.length) {
    return (
      <div className="dr-caught" data-testid="all-caught-up">
        <h2>All caught up.</h2>
        <p>When {agent.name} asks you something, it waits here until you answer.</p>
      </div>
    );
  }
  return (
    <>
      <p className="dr-count-line">{waiting.length === 1 ? "1 thing is waiting on you" : `${waiting.length} things are waiting on you`}</p>
      {waiting.map((it) => (
        <button key={it.id} type="button" className="dr-card" data-testid={`review-${it.id}`} onClick={() => { close(); api.run(it, "review"); }}>
          <small className="dr-kick">From {agent.name}</small>
          <b>{it.label}</b>
          {it.sub ? <span>{it.sub}</span> : null}
        </button>
      ))}
    </>
  );
}

const HOSTS = { hermes: "Hermes", openclaw: "OpenClaw", mcp: "MCP", a2a: "A2A", webhook: "Webhook", hosted: "Yui" };

function AgentTab({ agent, api, close, handlers }) {
  const live = liveness(agent) === "online";
  const sections = controlSections(agent);
  const starters = (agent.can || []).map((s) => String(s).trim()).filter(Boolean).slice(0, 3);
  return (
    <>
      <div className="dr-ident">
        <Face agent={agent} size={64} />
        <div>
          <h2>{agent.name}</h2>
          {agent.tagline ? <p className="dr-tag" data-testid="about-tagline">{agent.tagline}</p> : null}
          <span className="ag-status"><i className={`wb-dot ${liveness(agent)}`} />{statusLine(agent)}</span>
        </div>
      </div>
      {agent.about ? <p className="dr-about" data-testid="about-what">{agent.about}</p> : null}
      {starters.length ? (
        <>
          <h3 className="dr-heading">Ask {agent.name}</h3>
          {starters.map((w, i) => <Row key={w} icon="💬" title={w} testid={`about-can-${i}`} onClick={() => { close(); api.send(w); }} />)}
        </>
      ) : null}
      <dl className="dr-facts" data-testid="about-facts">
        <div><dt>Runs on</dt><dd>{agent.connector_name || HOSTS[agent.kind] || agent.kind}</dd></div>
        {agent.remote_ref ? <div><dt>Profile</dt><dd>{agent.remote_ref}</dd></div> : null}
        {agent.commands?.length ? <div><dt>Commands</dt><dd>{agent.commands.length}</dd></div> : null}
        {agent.is_default ? <div><dt>Default</dt><dd>Yes</dd></div> : null}
      </dl>
      {isShared(agent) ? (
        <p className="ag-hint" data-testid="about-shared-by">Shared by {agent.shared_by || "its owner"}</p>
      ) : (
        <>
          <h3 className="dr-heading">In Yui</h3>
          <Row icon="🎨" title="Name, look and notifications" sub={agent.push_muted ? "Notifications off" : "Notifications on"} testid="drawer-edit-agent" onClick={() => handlers.onEdit(agent)} />
          {sections.length ? (
            <>
              <h3 className="dr-heading">On its computer</h3>
              {!live ? <p className="dr-offline" data-testid="drawer-controls-offline">{agent.name}'s computer is {liveness(agent) === "not_listening" ? "not listening yet" : liveness(agent) === "pending" ? "offline" : liveness(agent)}. Controls come back when it's online.</p> : null}
              {sections.map((s) => <Row key={s.id} icon={s.icon} title={s.title} sub={s.sub(agent.name)} disabled={!live} testid={`drawer-controls-${s.id}`} onClick={() => handlers.onControls(s.id)} />)}
            </>
          ) : !agent.about && !starters.length && !isYui(agent) ? (
            <div className="dr-dashed" data-testid="about-not-shared">
              <h3>What it does</h3>
              <p>Yui doesn't own your agent, so this comes from where it runs. Once its host shares a profile, what it does, what it can reach and which model it uses show here.</p>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

export default function DrawerPanel({ agent, api, chats, handlers, onClose, onSwitch, onAdd, onQuick, canAdd, children, review = 0 }) {
  const [tab, setTab] = useState("Home");
  useEffect(() => { setTab("Home"); }, [agent?.id]);
  const waitingN = (api?.home?.waiting || []).length;
  return (
    <div className="dr" data-testid="drawer">
      <header className="dr-head">
        <h2 className="dr-name">{agent?.name || "Yui"}</h2>
        {onQuick ? (
          <button type="button" className="wb-iconbtn dr-quick" onClick={onQuick} aria-label="Quick actions" title="Quick actions (Ctrl K)" data-testid="quick-actions-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" strokeWidth="2.2" /><path d="M16 16l4.5 4.5" fill="none" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
        ) : null}
        <button className="wb-iconbtn wb-close" onClick={onClose} aria-label="Close the drawer">Close</button>
      </header>
      <Tabs tab={tab} setTab={setTab} review={waitingN + review} />
      <div className="dr-scroll" id="dr-pane" role="tabpanel" aria-labelledby={`dr-tab-${tab}`}>
        {tab === "Home" ? <Home agent={agent} api={api} chats={chats} close={onClose} handlers={handlers} goReview={() => setTab("Review")} /> : null}
        {tab === "Review" ? <Review agent={agent} api={api} close={onClose} /> : null}
        {tab === "Agent" ? <AgentTab agent={agent} api={api} close={onClose} handlers={handlers} /> : null}
      </div>
      {canAdd ? <button type="button" className="dr-add" data-testid="drawer-add-agent" onClick={onAdd}>+ Add an agent</button> : null}
      <button type="button" className="dr-bar" data-testid="agent-bar" onClick={onSwitch} aria-label="Switch agent">
        <Face agent={agent} size={32} />
        <span className="dr-words"><small>Talking to</small><b>{agent?.name}</b></span>
        <span className="dr-go" aria-hidden="true">⌄</span>
      </button>
      {children}
    </div>
  );
}

"use client";
// The agent drawer (Agents/AgentDrawer.swift, AgentMenu.swift): Home (the chats, nothing else), Review (what
// waits on you), Agent (who it is, its backlog under More, its settings). `menu` lines draw
// nothing in the chat; they land here, and a tap sends the same bucket line the phone sends. The bar at the
// foot switches agents and Add agent is always in reach, so a stranger finds it.
import { useEffect, useState } from "react";
import { controlSections, statusLine, isShared, isYui } from "../../lib/web/agents.mjs";
import { liveness } from "../../lib/web/presence.mjs";
import { isHostAsk } from "../../lib/web/stage.mjs";
import { firstName, initialOf } from "../../lib/web/earn.mjs";
import DrawerChats from "./DrawerChats";
import { Face } from "./parts";
import { UPill, YourU } from "./YourU";

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

function Home({ agent, chats, handlers }) {
  return (
    <DrawerChats agent={agent} chats={chats} openId={chats.openId} draftOpen={chats.draftOpen} note={chats.note}
      onOpenChat={handlers.onOpenChat} onRename={handlers.onRename} onDelete={handlers.onDeleteChat} onMore={handlers.onMoreChats} />
  );
}

// What the agent is working on for you (`menu backlog`), one quiet list on the Agent tab. It left Home (Chris, Oct 5:
// "keep the first screen just to the chats"); Next up, the Screens rows and the Shortcuts rows are cut, not moved:
// Review's count, the pills beside the chat and the chips over the bar already do those jobs.
function More({ api, close }) {
  const backlog = api?.home?.backlog || [];
  if (!backlog.length) return null;
  return (
    <>
      <h3 className="dr-heading">More</h3>
      <div className="dr-more" data-testid="drawer-more">
        {backlog.map((it) => <Row key={it.id} icon={iconOf(it, "⏳")} title={it.label} sub={it.sub} testid={`backlog-${it.id}`} onClick={() => { close(); api.run(it, "backlog"); }} />)}
      </div>
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
        <div key={it.id} className="dr-ask">
          <button type="button" className="dr-card" data-testid={`review-${it.id}`} onClick={() => { close(); api.run(it, "review"); }}>
            <small className="dr-kick">From {agent.name}</small>
            <b>{it.label}</b>
            {it.sub ? <span>{it.sub}</span> : null}
          </button>
          {isHostAsk(it) ? (
            <div className="dr-ask-acts">
              <button type="button" data-testid={`review-notyet-${it.id}`} title="Keeps it quiet for a week" onClick={() => api.notYet(it)}>Not yet</button>
              <button type="button" data-testid={`review-dismiss-${it.id}`} title="Takes it off your list for good" onClick={() => api.dismiss(it)}>Dismiss</button>
            </div>
          ) : null}
        </div>
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
      <More api={api} close={close} />
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

export default function DrawerPanel({ agent, api, chats, handlers, onClose, onSwitch, onQuick, onSettings, email, earn, children, review = 0 }) {
  const [tab, setTab] = useState("Home");
  const [showU, setShowU] = useState(false);
  useEffect(() => { setTab("Home"); }, [agent?.id]);
  const waitingN = (api?.home?.waiting || []).length;
  return (
    <div className="dr" data-testid="drawer">
      <header className="dr-head">
        {/* Your picture and name top left (a tap opens Settings), your $U top right: the app's header (YUI-210, SITE-161). */}
        <button type="button" className="dr-me" onClick={onSettings} aria-label={`Settings, ${firstName(email)}`} data-testid="drawer-me">
          <span className="dr-pic" aria-hidden="true">{initialOf(email)}</span>
          <h2 className="dr-name" data-testid="drawer-me-name">{firstName(email)}</h2>
        </button>
        {earn ? <UPill earn={earn} onOpen={() => setShowU(true)} /> : null}
        {onQuick ? (
          <button type="button" className="wb-iconbtn dr-quick" onClick={onQuick} aria-label="Quick actions" title="Quick actions (Ctrl K)" data-testid="quick-actions-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" strokeWidth="2.2" /><path d="M16 16l4.5 4.5" fill="none" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
        ) : null}
        <button className="wb-iconbtn wb-close" onClick={onClose} aria-label="Close the drawer">Close</button>
      </header>
      <Tabs tab={tab} setTab={setTab} review={waitingN + review} />
      <div className="dr-scroll" id="dr-pane" role="tabpanel" aria-labelledby={`dr-tab-${tab}`}>
        {tab === "Home" ? <Home agent={agent} chats={chats} handlers={handlers} /> : null}
        {tab === "Review" ? <Review agent={agent} api={api} close={onClose} /> : null}
        {tab === "Agent" ? <AgentTab agent={agent} api={api} close={onClose} handlers={handlers} /> : null}
      </div>
      <button type="button" className="dr-bar" data-testid="agent-bar" onClick={onSwitch} aria-label="Switch agent">
        <Face agent={agent} size={32} />
        <span className="dr-words"><small>Talking to</small><b>{agent?.name}</b></span>
        <span className="dr-go" aria-hidden="true">⌄</span>
      </button>
      {children}
      {showU && earn?.summary ? <YourU earn={earn} onClose={() => setShowU(false)} /> : null}
    </div>
  );
}

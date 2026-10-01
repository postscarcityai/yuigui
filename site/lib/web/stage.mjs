// The stage on the web (YUI-243): what the thread plays, and what the agent's home shows. Pure, no DOM.
// The app's twins: Stage/StageChunks.swift `turn` (the replies after the person's last words, played as
// chunks), Stage/StageHome.swift `AgentHome` (chips, review items, `show=`) and Chat/ScreenTalk.swift.
// The thread (thread.mjs) already holds every fence as a built screen with later patches applied, so a
// patched answer plays patched; the pages are folded from the raw replies by lib/chat/pages.mjs, the
// same rule the site chat and the phone use.
import { answerOf } from "../chat/stage.mjs";
import { threadPages } from "../chat/pages.mjs";
import { apply, initialState, menuOf, pageOf } from "../yl/yl.mjs";

export const MAX_CHIPS = 4;    // AgentHome.maxChips: the newest four shortcuts
export const MAX_WAITING = 3;  // AgentHome.maxWaiting: asks and notes before See all

const isAsk = (m) => m.role === "user" && !m.card;

// The turn the person started with message `askId` (their newest when null): every reply after it, up to
// the next thing they said. `pieces` is what answerOf plays; `stopped` is a Stop in the turn (a note in
// the record, never a chunk).
export function turnOf(messages, askId = null) {
  let i = askId ? messages.findIndex((m) => m.id === askId) : -1;
  if (i < 0) for (let k = messages.length - 1; k >= 0; k--) if (isAsk(messages[k])) { i = k; break; }
  if (i < 0) return { ask: null, pieces: [], stopped: false, replies: 0 };
  const turn = { ask: messages[i], pieces: [], stopped: false, replies: 0, at: null };
  const seen = new Set();
  for (const m of messages.slice(i + 1)) {
    if (isAsk(m)) break;
    if (m.card === "stopped") { turn.stopped = true; continue; }
    if (m.role !== "agent" || m.from) continue;
    turn.at = m.at;
    turn.pieces.push(m.yl != null ? { state: m.state, rev: m.rev || 0 } : { text: m.text });
    seen.add(m.id.split("#")[0]);
  }
  turn.replies = seen.size;
  return turn;
}

export const answerOfTurn = (turn) => answerOf(turn.pieces);

// The agent's replies as the raw text the pages fold from (one per relay row).
export function repliesOf(messages) {
  const rows = new Map();
  for (const m of messages) {
    if (m.role !== "agent" || m.from) continue;
    const key = m.id.split("#")[0];
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(m.yl != null ? `\`\`\`yui\n${m.yl}\n\`\`\`` : m.text);
  }
  return [...rows.values()].map((parts) => parts.join("\n"));
}

// The page a saved screen was saved from: where a `show=` chip swipes to.
export function savedPages(messages) {
  const out = {};
  for (const m of messages) {
    if (m.role !== "agent" || !m.ops) continue;
    for (const op of m.ops) {
      if (op.op === "save") out[op.name] = String(op.screen);
      else if (op.op === "forget") delete out[op.name];
    }
  }
  return out;
}

// Everything the agent's home draws: the newest shortcuts as chips, the review items, the pages and
// where a `show=` goes. `opened` is the thread's own opening line when it has one.
export function homeOf(messages) {
  const ops = [];
  for (const m of messages) if (m.role === "agent" && m.ops) ops.push(...m.ops.filter((o) => o.op === "menu"));
  const menu = menuOf(ops);
  const pg = threadPages(repliesOf(messages));
  const saved = savedPages(messages);
  return {
    chips: menu.shortcut.slice(0, MAX_CHIPS),
    waiting: menu.review,
    backlog: menu.backlog,
    pages: pg.pages,
    state: pg.state,
    forward: pg.forward,
    talk: pg.talk,
    // The page a shortcut's `show=` goes to, while that page is still there; else null.
    pageFor(item) {
      const k = item?.show ? saved[item.show] : null;
      return k && pageOf(k) > 1 && pg.pages.includes(k) ? k : null;
    },
    saved,
  };
}

// What a tap on a shortcut does (AgentHome.tap): its live page, else its saved screen on the stage, else
// its words go as the person's message (words ending in a space go in the field to finish).
export function chipAction(item, home) {
  const page = home.pageFor(item);
  if (page) return { go: page };
  if (item.show && home.saved[item.show]) return { show: item.show };
  const words = item.say ?? item.label;
  return /\s$/.test(words) ? { compose: words } : { send: words };
}

// A review item (MenuAction.open): its saved screen, its https link, else back to the agent as an event.
export function waitingAction(item, home) {
  if (item.show && home.saved[item.show]) return { show: item.show };
  if (typeof item.url === "string" && /^https:\/\//i.test(item.url)) return { open: item.url };
  return { tap: { id: item.id, preset: "menu", bucket: "review", tapped: true }, said: item.label };
}

// The title a page's pill carries: the first title-like thing on it, else "Screen N" (the app asks the
// page's content for a title; the web reads the first node with one).
export function pageTitle(state, k) {
  for (const n of state?.screens?.[k] || []) {
    if (n.stage) continue;
    const t = n.props?.title ?? n.props?.text ?? n.props?.label;
    if (typeof t === "string" && t.trim()) return t.trim().length > 18 ? `${t.trim().slice(0, 17).trimEnd()}…` : t.trim();
  }
  return `Screen ${k}`;
}

// A saved screen back on the stage, fresh, with no turn (ChatStore.reopen): the thread's ops replayed so the
// shelf holds what the agent saved, then `show name` on an empty screen. Null when the name is not on the shelf.
export function reopened(messages, name) {
  let s = initialState();
  for (const m of messages) if (m.role === "agent" && m.ops) for (const op of m.ops) s = apply(s, op);
  if (!s.saved?.[name]) return null;
  return apply({ ...initialState(), saved: s.saved }, { op: "show", screen: "1", name });
}

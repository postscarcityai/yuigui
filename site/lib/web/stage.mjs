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
//
// `askId` can also name something the agent said that nobody asked for (YUI-262: a reply from another channel, a
// check-in, a push tap on a thread the person never spoke in): that turn has no ask and plays from that message on
// (StageChunks.hello `from:`).
export function turnOf(messages, askId = null) {
  let i = askId ? messages.findIndex((m) => m.id === askId) : -1;
  if (i < 0) for (let k = messages.length - 1; k >= 0; k--) if (isAsk(messages[k])) { i = k; break; }
  if (i < 0) return { ask: null, pieces: [], stopped: false, replies: 0 };
  const lead = !isAsk(messages[i]);
  const turn = { ask: lead ? null : messages[i], pieces: [], stopped: false, replies: 0, at: null };
  const seen = new Set();
  for (const m of messages.slice(lead ? i : i + 1)) {
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

// A thread row is `<message id>#<part>` (one agent message splits into a text or a screen per fence), while a push
// names the bare message id: either form is the same message (PushLanding.isRow).
export const isRow = (rowId, named) => {
  const r = String(rowId).toLowerCase(), n = String(named).toLowerCase();
  return r === n || r.startsWith(`${n}#`);
};
const said = (m) => m.role === "agent" && !m.from;

// Where a push tap lands (PushLanding.message): the message it names, else the first thing the agent said in its
// newest turn (what came after the person's last word). Null when there is nothing to open.
export function landingOf(messages, named = null) {
  if (named) { const hit = messages.find((m) => isRow(m.id, named) && said(m)); if (hit) return hit.id; }
  let from = 0;
  for (let k = messages.length - 1; k >= 0; k--) if (isAsk(messages[k])) { from = k + 1; break; }
  return messages.slice(from).find(said)?.id ?? null;
}

// The turn that plays for a message: the person's ask before it, else (nothing said before it) the message itself.
export function playFor(messages, id) {
  const i = messages.findIndex((m) => m.id === id);
  if (i < 0) return null;
  for (let k = i; k >= 0; k--) if (isAsk(messages[k])) return messages[k].id;
  return id;
}

// The first thing the agent said among rows that just arrived (PushLanding.arrival), else null.
export const arrivalOf = (added) => added.find(said)?.id ?? null;

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

// The signed-in web draws what the app draws: the tuner is a page of Gouda's (YUI-252), not only the public chat's set.
const SIGNED_IN = new Set(["tuner"]);

// A reply that holds a workout (YUI-304): a `plan` with set picks ("Set 1".."Set N") in it. It plays full screen as
// the runner, never inside the drawer (AgentDrawer.swift `holdsWorkout`).
export const holdsWorkout = (yl) => typeof yl === "string" && /^\s*plan\b/m.test(yl) && /^\s*pick\b[^\n]*"?Set 1"?/m.test(yl);

// Everything the agent's home draws: the newest shortcuts as chips, the review items, the pages and
// where a `show=` goes. `opened` is the thread's own opening line when it has one.
export function homeOf(messages, dismissed = {}) {
  const ops = [];
  const seen = {};
  for (const m of messages) if (m.role === "agent" && m.ops) for (const o of m.ops) if (o.op === "menu") { ops.push(o); seen[o.id] = m.at; }
  const menu = menuOf(ops);
  // YUI-270: a Dismiss or Not yet takes the row off the list at once, like the app. It stays off until the host
  // draws that ask again after the answer (a new block on the card), which is newer than the tap.
  menu.review = menu.review.filter((it) => !(dismissed[it.id] > 0 && !(seen[it.id] > dismissed[it.id])));
  const pg = threadPages(repliesOf(messages), SIGNED_IN);
  const saved = savedPages(messages);
  // The newest workout the agent sent: where a Review row for a workout plays it, on the stage.
  const workout = [...messages].reverse().find((m) => m.role === "agent" && !m.from && holdsWorkout(m.yl))?.id ?? null;
  return {
    workout,
    chips: menu.shortcut.slice(0, MAX_CHIPS),
    // Every shortcut the agent put in its drawer (the chips are the newest few).
    shortcuts: menu.shortcut,
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
  // A workout never plays in the drawer: the drawer closes and the runner opens on the stage (Chris, build 522).
  if (home.workout && /\bworkout\b/i.test(item.label || "")) return { play: home.workout };
  return { tap: { id: item.id, preset: "menu", bucket: "review", tapped: true }, said: item.label };
}

// A Needs you row is a host ask (`need-<task id>`); only those can be dismissed or put off.
export const isHostAsk = (item) => /^need-t_[0-9a-f]{4,}$/.test(String(item?.id || ""));

// Dismiss on a Needs you row (YUI-265's twin): one quiet event, no echo and no agent turn. The host closes the ask.
export const dismissEvent = (item) => ({ id: item.id, preset: "menu", bucket: "review", dismissed: true });

// Not yet on the row is the same answer the ask screen sends: the host keeps the ask quiet for a week.
export const notYetEvent = (item) => ({ id: item.id, preset: "choose", choice: "Not yet" });

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

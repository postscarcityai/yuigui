// One chat turn (SITE-64): the brief, the visible history and the new message go to OpenRouter
// (GLM 5.2 by default, like native Yui), with five tools. Search and read run here. go_to and
// ask_contact become actions the page carries out; take_note is kept for the store.
import { readPage, searchSite, sitePath } from "./search.mjs";
import { NOTE_KINDS } from "./store.mjs";
import { cleanLines } from "./lines.mjs";
import { libraryIndex, search } from "../yl/library.mjs";
import { SCREENS, DEMOS, MEDIA, SCIENCE, FLOWS, DATA } from "../yl/samples.mjs";
import { STARTER_FLOWS } from "../yl/starter-flows.mjs";

// Ready-made screens to show a visitor: every playground demo and the library (presets, flows,
// screens), with their lines cut to what this chat draws (lines.mjs). A saved flow comes as the one
// line that runs it (`flow@onboard onboarding`, SITE-68), not its whole chart: the page knows them all.
let SHELF = null;
const shelf = () => (SHELF ||= [
  ...[...SCREENS, ...DEMOS, ...MEDIA, ...SCIENCE, ...FLOWS, ...DATA].filter((d) => !/^flow-/.test(d.slug || "")).map((d) => ({ name: d.name.replace(/^Demo:\s*/, ""), kind: "demo", title: d.name, purpose: d.what || d.desc || "", tags: [], intents: [], yl: d.yl })),
  ...libraryIndex().items.filter((i) => i.kind !== "flow" || !i.base).map((i) => (i.kind === "flow" ? flowItem(i) : i)),
].map((i) => ({ ...i, yl: cleanLines(i.yl) })).filter((i) => i.yl));
function flowItem(i) {
  const f = STARTER_FLOWS.find((x) => x.name === i.name);
  const steps = f ? (f.source.match(/^\s*%%\s*\w+:/gm) || []).length : 0;
  return { ...i, yl: `flow@${f?.id || i.name} ${i.name}`, purpose: `${f?.title || i.title}: ${i.purpose}${steps ? ` A flow of ${steps} screens that play in a row on the stage, with one Send at the end.` : ""}` };
}
const shelfHit = (h) => ({ name: h.name, kind: h.kind, what: String(h.purpose || "").slice(0, 260), ...(h.kind === "flow" ? { how: "Send this one line as it is. The steps play on the stage and their answers come back as one tap at the end." } : {}), yl: h.yl.length > 1600 ? `${h.yl.slice(0, 1600)}\n(cut: trim it before sending)` : h.yl });
export function findScreens(query, k = 3) {
  let q = String(query || "");
  // "a flow", "show me a flow for coaches": only saved flows, best match first, onboarding when nothing matches.
  if (/\bflows?\b/i.test(q)) {
    const all = shelf().filter((i) => i.kind === "flow" && /^flow@/.test(i.yl));
    const rest = q.replace(/\b(show|me|a|an|the|run|saved|flows?)\b/gi, " ").trim();
    let hits = rest ? search(all, rest, { limit: k }) : [];
    if (!hits.length) for (const w of rest.split(/\s+/).filter((x) => x.length > 3)) { hits = search(all, w, { limit: k }); if (hits.length) break; }
    const order = hits.length ? hits : [...all].sort((a, b) => (b.name === "onboarding") - (a.name === "onboarding"));
    return order.slice(0, k).map(shelfHit);
  }
  let hits = search(shelf(), q, { limit: k });
  // Every word has to hit; when nothing does, try the words one at a time.
  if (!hits.length) for (const w of q.split(/\s+/).filter((x) => x.length > 2)) { hits = search(shelf(), w, { limit: k }); if (hits.length) break; }
  return hits.map(shelfHit);
}

export const MODEL = () => process.env.YUI_CHAT_MODEL || "z-ai/glm-5.2";
// Any /chat/completions endpoint works; OpenRouter unless YUI_CHAT_API_URL says otherwise.
const API = () => process.env.YUI_CHAT_API_URL || "https://openrouter.ai/api/v1/chat/completions";
const ROUNDS = 5;

const TOOLS = [
  { name: "search_site", description: "Search every page on yuigui.com: pages, specs, the roadmap, the ship log, the blog, screens and playground demos. Returns the best matches with a path and a snippet.", parameters: { type: "object", properties: { query: { type: "string", description: "A few words, like 'connect hermes' or 'android'." } }, required: ["query"] } },
  { name: "read_page", description: "Read one page of yuigui.com in full, by its path from the site map or a search result.", parameters: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
  { name: "go_to", description: "Take the visitor to a page on yuigui.com. Only when they asked to see it or said yes. The chat stays open.", parameters: { type: "object", properties: { path: { type: "string", description: "A path on this site, like /mockups or /playground?demo=tabata-timer or /progress#some-entry." }, label: { type: "string", description: "The page's name, a few words." } }, required: ["path"] } },
  { name: "find_screen", description: "Find ready-made Yui screens, saved flows and playground demos by intent, like 'workout timer', 'quiz', 'map of a trip', 'drum loop', 'a flow', 'onboarding', 'check-in'. Returns each one's Yui Lines, ready to send in a yui block as they are or trimmed. A flow is one line that runs a whole series of screens.", parameters: { type: "object", properties: { query: { type: "string", description: "One to three words." } }, required: ["query"] } },
  { name: "take_note", description: "Write down one thing the team should know about this visitor: a need, a feature request, a bug, a confusion, a question the site does not answer, praise, or who they are.", parameters: { type: "object", properties: { kind: { type: "string", enum: NOTE_KINDS }, text: { type: "string", description: "One plain sentence, like 'Wants an Android app for their team of 12 coaches.'" }, quote: { type: "string", description: "Their own words, if they said something worth keeping." } }, required: ["kind", "text"] } },
  { name: "ask_contact", description: "Draw a Yui form under your reply for first name, last name, email and optional phone. Once per chat, only after real interest. Do not write the form yourself.", parameters: { type: "object", properties: { reason: { type: "string", description: "Why, in a few words, like 'to hear when Android ships'." } }, required: ["reason"] } },
].map((f) => ({ type: "function", function: f }));

// The house voice has no dashes (YUI-163). Models slip, so the reply gets one sweep.
export function sweep(text) {
  return String(text || "")
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1 to $2")
    .replace(/\s+[–—]\s+(?=[A-Z])/g, ". ")
    .replace(/\s*[–—]\s*/g, ", ")
    .trim();
}

async function complete(messages, last) {
  const res = await fetch(API(), {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.YUI_CHAT_OPENROUTER_KEY}`, "Content-Type": "application/json", "HTTP-Referer": "https://www.yuigui.com", "X-Title": "Yui site chat" },
    body: JSON.stringify({ model: MODEL(), messages, tools: TOOLS, tool_choice: last ? "none" : "auto", temperature: 0.6, max_tokens: 1200, provider: { data_collection: "deny" } }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const msg = data.choices?.[0]?.message;
  if (!msg) throw new Error("openrouter: no message");
  return msg;
}

// { reply, actions: [{ type: "go", path, label } | { type: "contact", reason }], notes, tools }
export async function turn({ system, history, text, canAsk }) {
  const messages = [{ role: "system", content: system }, ...history, { role: "user", content: text }];
  const actions = [], notes = [], tools = [];
  for (let round = 0; round <= ROUNDS; round++) {
    const msg = await complete(messages, round === ROUNDS);
    const calls = round < ROUNDS ? msg.tool_calls || [] : [];
    if (!calls.length) return { reply: sweep(msg.content), actions, notes, tools };
    messages.push({ role: "assistant", content: msg.content || "", tool_calls: calls });
    for (const c of calls) {
      let args = {};
      try { args = JSON.parse(c.function?.arguments || "{}"); } catch {}
      const name = c.function?.name;
      let result;
      if (name === "search_site") {
        const hits = searchSite(args.query, 6);
        result = hits.length ? hits : "No matches. Try other words.";
        tools.push({ tool: name, query: String(args.query || "").slice(0, 200), hits: hits.length });
      } else if (name === "find_screen") {
        const hits = findScreens(args.query, 3);
        result = hits.length ? hits : "Nothing ready-made. Write the Yui Lines yourself.";
        tools.push({ tool: name, query: String(args.query || "").slice(0, 200), hits: hits.length });
      } else if (name === "read_page") {
        result = readPage(args.path) || "That is not a page on this site.";
        tools.push({ tool: name, path: String(args.path || "").slice(0, 300) });
      } else if (name === "go_to") {
        const p = sitePath(args.path);
        if (p && !actions.some((a) => a.type === "go")) actions.push({ type: "go", path: p, label: String(args.label || "").slice(0, 60) });
        result = p ? `Taking the visitor to ${p}. The chat stays open.` : "That is not a page on this site. Search for the right one.";
        tools.push({ tool: name, path: String(args.path || "").slice(0, 300), ok: !!p });
      } else if (name === "take_note") {
        if (args.text && notes.length < 8) notes.push({ kind: args.kind, text: args.text, quote: args.quote });
        result = "Noted.";
      } else if (name === "ask_contact") {
        const ok = canAsk && !actions.some((a) => a.type === "contact");
        if (ok) actions.push({ type: "contact", reason: String(args.reason || "").slice(0, 120) });
        result = ok ? "The contact form is drawn under your reply. Say in one line why you are asking, and do not write a form yourself." : "Not now: the form was already shown or it is too early. Do not ask for their details.";
        tools.push({ tool: name, ok });
      } else {
        result = "Unknown tool.";
      }
      messages.push({ role: "tool", tool_call_id: c.id, content: typeof result === "string" ? result : JSON.stringify(result) });
    }
  }
  return { reply: "", actions, notes, tools };
}

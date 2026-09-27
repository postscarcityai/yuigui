// What visitors want (SITE-64): the notes Yui wrote down in the site chat, grouped, with counts.
//   node scripts/chat-notes.mjs              the last 7 days
//   node scripts/chat-notes.mjs --days 30    a longer window
//   node scripts/chat-notes.mjs --themes     also ask the chat's model to group them into themes
// Reads YUI_SUPABASE_URL and YUI_SUPABASE_SERVICE_ROLE_KEY (and YUI_CHAT_OPENROUTER_KEY for --themes)
// from the environment. Private: prints to this terminal only, never to the site.
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const days = Number(arg("--days", 7));
const url = process.env.YUI_SUPABASE_URL, key = process.env.YUI_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Set YUI_SUPABASE_URL and YUI_SUPABASE_SERVICE_ROLE_KEY."); process.exit(1); }
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const since = new Date(Date.now() - days * 864e5).toISOString();

async function get(q) {
  const res = await fetch(`${url}/rest/v1/${q}`, { headers });
  if (!res.ok) { console.error(res.status, await res.text()); process.exit(1); }
  return res.json();
}

const notes = await get(`yui_site_chat_notes?select=kind,text,quote,path,chat_id,created_at&created_at=gte.${since}&order=created_at.desc&limit=5000`);
const chats = await get(`yui_site_chats?select=id,turns,verified_at,email&created_at=gte.${since}&limit=10000`);

console.log(`Site chat, last ${days} days`);
console.log(`${chats.length} chats, ${chats.reduce((n, c) => n + c.turns, 0)} turns, ${chats.filter((c) => c.verified_at).length} past the check, ${chats.filter((c) => c.email).length} left their details, ${notes.length} notes\n`);

const byKind = Map.groupBy ? Map.groupBy(notes, (n) => n.kind) : notes.reduce((m, n) => m.set(n.kind, [...(m.get(n.kind) || []), n]), new Map());
for (const kind of ["need", "feature", "bug", "confusion", "question", "praise", "other"]) {
  const list = byKind.get(kind) || [];
  if (!list.length) continue;
  console.log(`## ${kind} (${list.length})`);
  for (const n of list.slice(0, 40)) console.log(`- ${n.text}${n.quote ? `  "${n.quote}"` : ""}  [${n.path || "/"}]`);
  if (list.length > 40) console.log(`  ...and ${list.length - 40} more`);
  console.log("");
}

if (process.argv.includes("--themes") && notes.length) {
  const k = process.env.YUI_CHAT_OPENROUTER_KEY;
  if (!k) { console.error("--themes needs YUI_CHAT_OPENROUTER_KEY."); process.exit(1); }
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.YUI_CHAT_MODEL || "z-ai/glm-5.2",
      provider: { data_collection: "deny" },
      messages: [
        { role: "system", content: "You group notes from a product's website chat into themes. Give the 5 to 10 biggest themes, most notes first. For each: a short name, how many notes, one plain sentence on what people want, and one quote if there is one. Then list any bugs on their own. Plain words, no dashes." },
        { role: "user", content: notes.map((n) => `[${n.kind}] ${n.text}${n.quote ? ` "${n.quote}"` : ""}`).join("\n").slice(0, 60000) },
      ],
    }),
  });
  const data = await res.json();
  console.log("## Themes\n");
  console.log(data.choices?.[0]?.message?.content || JSON.stringify(data).slice(0, 500));
}

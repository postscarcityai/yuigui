// Channel guide eval: does spec/CHANNEL.md make an agent use Yui well?
//
//   node run.mjs                          run every case against the current guide
//   node run.mjs --label v1 --model claude-sonnet-5 --only patch- --jobs 4
//   node run.mjs --guide /tmp/CHANNEL.md  try a draft without touching the spec
//   node run.mjs --rescore reports/v1.json  re-score saved replies (no model calls)
//   node run.mjs --only meal-photo --into reports/v1.json --label v1  re-run cases into a report
//
// Each case goes to the `claude` CLI the way the fleet's shim sends a Hermes
// turn: the agent's persona plus the channel guide exactly as the yui plugin
// injects it (yui/adapter.py platform_hint() + look_prompt() + restyle_prompt():
// the restyle block moves after the look line, as on the owner's turn on a new
// enough phone, which every case here is), appended to the
// CLI's own system prompt, no tools. Earlier turns of a multi-turn case are
// replayed as a transcript in the user message. Replies are scored by the
// real YL parser (site/lib/yl/yl.mjs), one fresh parser per reply, because
// that is what the app does (ids do not carry over between replies).
//
// Writes reports/<label>.json (replies + scores) and reports/<label>.md.

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Parser, PRESETS, resolve, tokenize, pageOf, onStage } from "../../site/lib/yl/yl.mjs";

const HERE = new URL(".", import.meta.url);
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };

// ---------- the guide, as the plugin sends it ----------

const START = "## You are talking to someone in Yui";

// Same extraction and version string as yui/hermes-plugin/sync_channel.py.
export function guideFrom(spec) {
  const m = spec.split("\n")[0].match(/\bv(\d+(?:\.\d+)*)\b/);
  const i = spec.indexOf(START);
  if (!m || i < 0) throw new Error("guide needs a version in its title and a '" + START + "' section");
  const body = spec.slice(i).trimEnd() + "\n";
  const version = `v${m[1]}+${createHash("sha256").update(body).digest("hex").slice(0, 8)}`;
  return { version, body, words: body.split(/\s+/).filter(Boolean).length };
}

const LOOK = "Your look in Yui: your own default (seeded from your name). Change it with a `theme` line only when asked.";

// The restyle block (YUI-96, yui/restyle.py split_guide): out of the fixed guide, into the turn.
const RESTYLE = /<!-- restyle:[^\n]*-->\n([\s\S]*?)<!-- \/restyle -->\n?/;
export function splitGuide(body) {
  const m = body.match(RESTYLE);
  if (!m) return { fixed: body, restyle: "" };
  const text = m[1].trim().split("\n").map((l) => l.trim()).join(" ").replace(/^[-*]\s+/, "");
  return { fixed: body.replace(RESTYLE, ""), restyle: text };
}

function system(g, suite, c) {
  const { fixed, restyle } = splitGuide(g.body);
  return [suite.agents[c.agent], suite.context, "You are on the Yui channel with Chris.",
    `Yui channel guide ${g.version}\n\n${fixed.trim()}`, [LOOK, restyle].filter(Boolean).join("\n")].join("\n\n");
}

function prompt(c) {
  if (!c.history?.length) return c.message;
  const who = (r) => (r === "agent" ? `[You, ${c.agent}]` : "[Chris]");
  const past = c.history.map((t) => `${who(t.role)}\n${t.text}`).join("\n\n");
  return `Earlier in this Yui thread (oldest first):\n\n${past}\n\nNew message from Chris:\n${c.message}`;
}

// One CLI call, killed after `limit` ms (a call can hang for good); retried once.
async function ask(sys, user, model, limit = 180000) {
  const r = await once(sys, user, model, limit);
  return r.error ? once(sys, user, model, limit) : r;
}

function once(sys, user, model, limit) {
  return new Promise((resolve) => {
    const argv = ["-p", "--model", model, "--append-system-prompt", sys, "--tools", "", "--setting-sources", "",
      "--strict-mcp-config", "--disable-slash-commands", "--no-session-persistence", "--output-format", "json"];
    const p = spawn("claude", argv, { cwd: "/tmp", env: { ...process.env, USER: process.env.USER || "urzas" } });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    const timer = setTimeout(() => p.kill("SIGKILL"), limit);
    p.stdin.end(user);
    p.on("close", (code) => {
      clearTimeout(timer);
      try {
        const j = JSON.parse(out);
        resolve(j.is_error ? { error: String(j.result || "error") } : { reply: j.result, ms: j.duration_api_ms });
      } catch { resolve({ error: `exit ${code}: ${(err || out).slice(0, 300)}` }); }
    });
  });
}

// ---------- scoring ----------

const CORE_OPS = new Set(["theme", "save", "show", "forget", "clear", "focus", "end", "close", "talk", "menu"]);
const SECRET = /pass(word|code|phrase)?|\bpin\b|card.?(number|no\b|num)|\bcvv|\bcvc|\bssn\b|social.?security|secret|token|api.?key|\bkey\b|routing|account.?(number|no\b|num)|\blogin\b|credential/i;
const NARRATE = /\b(here (are|is) (some|a|the|your) (buttons?|options?|form|screen|slider|picker|checklist)|tap (one of )?(the )?(buttons?|options?)( below| above)?|(buttons?|options?|form|slider|checklist) (below|above)|i('ve| have) (put|added|created|set up) (a|some|the) (buttons?|form|screen|slider|picker)|you (chose|picked|selected|tapped))\b/i;
// A button that only acknowledges (YUI-53): tapping it does nothing for anyone.
const ACK = /^(got it|ok(ay)?|k|nice|cool|great|sweet|awesome|perfect|thanks|thank you|understood|noted|sounds good|love it|will do)[.!]*$/i;
const HTML = /<\/?(div|button|input|table|tr|td|span|form|select|ul|li|html|style|svg)\b/i;
const HEADS = /^\s*(>[\w-]+\s+)?(~[\w-]+|(timer|ask|choose|pick|slide|form|list|table|card|image|camera|mic|gallery|video|compare|storyboard|chart|stat|math|step|calc|deck|page|plan|project|narrate|say|theme)(@[\w-]+)?)\s+\S/;

export function split(reply) {
  const blocks = [], other = [];
  let text = "";
  const re = /```([^\n`]*)\n([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(reply))) {
    text += reply.slice(last, m.index);
    last = re.lastIndex;
    (m[1].trim() === "yui" ? blocks : other).push({ tag: m[1].trim(), body: m[2] });
  }
  text += reply.slice(last);
  return { blocks, other, text: text.trim() };
}

export function score(c, reply) {
  const e = { screen: "any", presets: null, max_components: 6, max_words: 70, ...c.expect };
  const fails = [];
  const { blocks, other, text } = split(reply);
  const ops = [];
  for (const b of blocks) {
    const p = new Parser();
    for (const l of b.body.split("\n")) { const op = p.line(l); if (op) ops.push(op); }
  }
  const errors = ops.filter((o) => o.op === "error");
  const good = ops.filter((o) => o.op !== "error");
  const adds = good.filter((o) => o.op === "add");
  // A patch uses its target's preset: a preset name, or an id added earlier in this reply.
  const idPreset = new Map(adds.map((o) => [o.id, o.preset]));
  const patched = good.filter((o) => o.op === "patch").map((o) => (PRESETS.includes(o.target) ? o.target : idPreset.get(o.target))).filter(Boolean);
  const used = new Set([...adds.map((o) => o.preset), ...patched, ...good.filter((o) => CORE_OPS.has(o.op)).map((o) => o.op)]);
  const components = adds.filter((o) => o.preset !== "say" && !o.in).length;
  const words = text.split(/\s+/).filter(Boolean).length;

  if (e.screen === "yes" && !good.length) fails.push(blocks.length ? "screen: block has no valid line" : "screen: no ```yui block");
  if (e.screen === "no" && blocks.length) fails.push("screen: sent a screen for a plain answer");
  for (const o of errors) fails.push(`parse: ${o.message} :: ${o.line.trim()}`);
  for (const b of other) {
    if (/^(html|json|jsx|xml|svg|css)$/i.test(b.tag) || b.body.split("\n").some((l) => HEADS.test(l))) fails.push(`fence: UI in a \`\`\`${b.tag || "(untagged)"} block`);
  }
  if (text.split("\n").some((l) => HEADS.test(l) && /^\s*(~|>|\w+@|\w+\s+")/.test(l))) fails.push("fence: Yui Lines outside the ```yui block");
  if (HTML.test(reply)) fails.push("html: HTML in the reply");
  if (/^\s*\|.*\|\s*$\n^\s*\|?\s*:?-{3,}/m.test(text)) fails.push("text: markdown table instead of a table component");
  if (adds.some((o) => o.preset === "custom")) fails.push("custom: used custom {json}");
  // Something to tap. Since the loose-options rule (YL.md section 4, ask) the parser reads
  // `choose "Q?" "A" "B"` as options, so only a line that still has none fails
  // (an ask with two or more stray quoted tokens would fall back to Yes/No).
  for (const o of adds.filter((o) => ["ask", "choose", "pick"].includes(o.preset))) {
    if ((o.props.options || []).length) continue;
    const loose = tokenize(o.line.trim().replace(/^>[\w-]+\s+/, "")).slice(1).filter((t) => t.quoted && !t.parts && !t.key).length;
    if (o.preset !== "ask" || loose > 1) fails.push(`options: nothing to tap :: ${o.line.trim()}`);
  }
  // Dead buttons: every option is an acknowledgement, or a card cta / submit that only says "Got it".
  for (const o of adds) {
    const pr = o.props || {};
    const opts = pr.options || [];
    let dead = opts.length && opts.every((x) => ACK.test(String(x).trim()));
    if (!opts.length && ["ask", "choose", "pick"].includes(o.preset)) {
      // `ask "Shipped" "Got it"` reads as one question; the last token was meant as the button.
      const toks = tokenize(o.line.trim().replace(/^>[\w-]+\s+/, "")).slice(1).filter((t) => !t.key);
      dead = toks.length > 1 && ACK.test(String(toks.at(-1).value ?? toks.at(-1).text ?? "").trim());
    }
    for (const k of ["cta", "submit"]) if (typeof pr[k] === "string" && ACK.test(pr[k].trim())) dead = true;
    if (dead) fails.push(`dead button: nothing to act on :: ${o.line.trim()}`);
    if (e.no_label) {
      // Labels as the app draws them, defaults included (resolve), so a bare `plan` shows its default submit.
      const r = resolve(o.preset, pr), re = new RegExp(e.no_label, "i");
      const bad = [...(r.options || []), r.cta, r.submit].filter((x) => typeof x === "string" && re.test(x.trim()));
      if (bad.length) fails.push(`label: "${bad[0]}" misdescribes the button :: ${o.line.trim()}`);
    }
  }
  if (e.presets) for (const p of used) if (!CORE_OPS.has(p) && p !== "say" && p !== "custom" && !e.presets.includes(p)) fails.push(`preset: ${p} not in [${e.presets.join(" ")}]`);
  if (e.need && !e.need.some((p) => used.has(p))) fails.push(`need: none of [${e.need.join(" ")}]`);
  if (components > e.max_components) fails.push(`components: ${components} > ${e.max_components}`);
  if (words > e.max_words) fails.push(`words: ${words} > ${e.max_words}`);
  const nar = text.match(NARRATE);
  if (nar) fails.push(`narrates: "${nar[0]}"`);
  for (const o of adds.filter((o) => o.preset === "form")) {
    for (const f of o.props.fields || []) {
      if (f.type === "password" || SECRET.test(`${f.key} ${f.label || ""}`)) fails.push(`secret: form field "${f.label || f.key}"`);
    }
  }
  // A page's picture (YUI-85): a sketch inside a deck or plan, right after a page of that group.
  if (e.page_picture) {
    const ok = adds.some((o, i) => o.preset === "sketch" && o.in && adds[i - 1]?.preset === "page" && adds[i - 1].in === o.in);
    if (!ok) fails.push("page picture: no sketch right after a page in a deck or plan");
  }
  // One flow (YUI-51): findings as pages inside the plan, with substance, then its questions.
  if (e.one_flow) {
    const plans = adds.filter((o) => o.preset === "plan");
    const inPlan = (o) => plans.some((p) => p.id === o.in);
    if (!plans.length) fails.push("one flow: no plan");
    else {
      if (!adds.some((o) => o.preset === "page" && inPlan(o))) fails.push("one flow: no pages inside the plan");
      if (!adds.some((o) => o.preset !== "page" && inPlan(o))) fails.push("one flow: no questions inside the plan");
    }
    if (adds.some((o) => o.preset === "deck")) fails.push("one flow: a deck beside the plan");
    const loose = adds.filter((o) => ["ask", "choose", "pick", "slide", "form"].includes(o.preset) && !inPlan(o));
    if (loose.length) fails.push(`one flow: a question outside the plan :: ${loose[0].line.trim()}`);
    for (const o of adds.filter((o) => o.preset === "page" && inPlan(o))) {
      const pr = o.props || {};
      if (!pr.body && !(pr.points || []).length) fails.push(`one flow: a page with only a title :: ${o.line.trim()}`);
    }
  }
  // One screen (feedback APSw0dsa): a lesson of more than two pieces is all on the stage,
  // nothing loose in the chat and nothing sent to a page beside it.
  if (e.one_screen) {
    const top = adds.filter((o) => o.preset !== "say" && !o.in);
    const off = top.filter((o) => !onStage(o, {}));
    if (top.length > 2 && off.length) fails.push(`one screen: ${off.length} of ${top.length} pieces off the stage :: ${off[0].line.trim()}`);
    if (top.length > 2 && good.at(-1)?.op === "close") fails.push("one screen: ends in close, so the stage never opens");
  }
  // A lesson is one deck (YUI-113): the deck is the only piece outside it, and the
  // needed pieces are inside it (a shape inside a shapes inside the deck counts).
  if (e.one_deck) {
    const top = adds.filter((o) => o.preset !== "say" && !o.in);
    const inDeck = (o) => { for (let x = o; x?.in; x = adds.find((a) => a.id === x.in)) if (adds.find((a) => a.id === x.in)?.preset === "deck") return true; return false; };
    if (top.length !== 1 || top[0].preset !== "deck") fails.push(`one deck: ${top.length} top-level pieces (${top.map((o) => o.preset).join(", ")}), want one deck`);
    for (const p of e.need || []) if (!adds.some((o) => o.preset === p && inDeck(o))) fails.push(`one deck: no ${p} inside the deck`);
  }
  // Pages (YUI-31): something meant to stay put goes on screen 2 or 3.
  if (e.page && !adds.some((o) => pageOf(o.screen) !== 1)) fails.push("page: nothing on screen 2 or 3");
  if (e.patch) {
    const re = new RegExp(e.patch);
    if (!good.some((o) => o.op === "patch" && re.test(o.target))) fails.push(`patch: no ~ patch matching /${e.patch}/`);
    for (const p of e.no_add || []) if (adds.some((o) => o.preset === p)) fails.push(`patch: re-sent a ${p} instead of patching`);
  } else for (const p of e.no_add || []) if (adds.some((o) => o.preset === p)) fails.push(`re-sent a ${p}`);
  // Groups (YUI-93): @handles in the chat words hand work on, as the plugin reads them
  // (yui/hermes-plugin/yui/mentions.py handles_in: not in fences or inline code).
  const ats = [...text.replace(/`[^`\n]*`/g, " ").matchAll(/(?<![\w@.])@([a-z0-9][a-z0-9-]{0,31})\b/gi)].map((m) => m[1].toLowerCase());
  if (e.at && !e.at.some((h) => ats.includes(h))) fails.push(`at: no @${e.at.join(" or @")} to hand it on`);
  if (e.no_at && ats.length) fails.push(`at: handed on to @${ats[0]} when nobody else was needed`);
  // Restyle (YUI-96, spec/RESTYLE.md): exactly this many `theme app <name>` lines, and nothing claimed yet.
  if (e.app_theme) {
    const app = good.filter((o) => o.op === "theme" && o.props?.scope === "app");
    if (app.length !== 1) fails.push(`app theme: ${app.length} theme app lines, want 1`);
    else if (app[0].props.name !== e.app_theme) fails.push(`app theme: ${app[0].props.name || "keys only"}, want ${e.app_theme} :: ${app[0].line.trim()}`);
  }
  if (e.no_text) {
    const m = text.match(new RegExp(e.no_text, "i"));
    if (m) fails.push(`text: "${m[0]}"`);
  }
  if (e.max_sentences) {
    const n = text.split(/(?<=[.!?])\s+/).filter((x) => /\w/.test(x)).length;
    if (n > e.max_sentences) fails.push(`sentences: ${n} > ${e.max_sentences}`);
  }
  return { pass: fails.length === 0, fails, components, words, used: [...used] };
}

// ---------- report ----------

function report(run) {
  const n = run.results.length, pass = run.results.filter((r) => r.score.pass).length;
  const byCat = {};
  for (const r of run.results) { const k = r.category; byCat[k] ??= [0, 0]; byCat[k][1]++; if (r.score.pass) byCat[k][0]++; }
  const out = [`# Channel eval: ${run.label}`, "",
    `Guide ${run.guide.version} (${run.guide.words} words), model ${run.model}, ${run.date}.`, "",
    `**${pass}/${n} passed (${Math.round((100 * pass) / n)}%).**`, "",
    "| category | passed |", "|---|---|", ...Object.entries(byCat).map(([k, [p, t]]) => `| ${k} | ${p}/${t} |`), "",
    "| case | result | why |", "|---|---|---|",
    ...run.results.map((r) => `| ${r.id} | ${r.score.pass ? "pass" : "FAIL"} | ${r.score.fails.join("; ").replace(/\|/g, "\\|") || ""} |`), "",
    "## Transcripts", ""];
  for (const r of run.results) {
    out.push(`### ${r.id} (${r.score.pass ? "pass" : "FAIL"})`, "", `**Chris:** ${r.message}`, "", `Good: ${r.good}`, "");
    if (r.score.fails.length) out.push(...r.score.fails.map((f) => `- ${f}`), "");
    out.push("````", r.reply ?? `(no reply: ${r.error})`, "````", "");
  }
  return out.join("\n");
}

// ---------- main ----------

async function main() {
  const suite = JSON.parse(readFileSync(new URL("cases.json", HERE), "utf8"));
  const cases = suite.cases;
  const rescore = arg("rescore");
  let run;
  if (rescore) {
    run = JSON.parse(readFileSync(rescore, "utf8"));
    for (const r of run.results) {
      const c = cases.find((x) => x.id === r.id);
      if (c) Object.assign(r, { good: c.good, category: c.category, score: r.reply ? score(c, r.reply) : r.score });
    }
  } else {
    const guidePath = arg("guide", new URL("../CHANNEL.md", HERE).pathname);
    const guide = guideFrom(readFileSync(guidePath, "utf8"));
    const model = arg("model", "claude-opus-5-5");
    const only = arg("only");
    const todo = cases.filter((c) => !only || c.id.startsWith(only) || c.category === only);
    const jobs = Number(arg("jobs", 4));
    run = { label: arg("label", guide.version), guide, model, date: new Date().toISOString().slice(0, 16), results: [] };
    const results = new Array(todo.length);
    let next = 0;
    await Promise.all(Array.from({ length: jobs }, async () => {
      while (next < todo.length) {
        const i = next++, c = todo[i];
        const r = await ask(system(guide, suite, c), prompt(c), model);
        const s = r.reply ? score(c, r.reply) : { pass: false, fails: [`no reply: ${r.error}`] };
        results[i] = { id: c.id, category: c.category, message: c.message, good: c.good, reply: r.reply, error: r.error, score: s };
        process.stderr.write(`${s.pass ? "." : "F"}`);
      }
    }));
    process.stderr.write("\n");
    const into = arg("into");
    if (into) {
      // Re-run some cases of an earlier run: replace those results, keep the rest.
      const old = JSON.parse(readFileSync(into, "utf8"));
      if (old.guide.version !== guide.version || old.model !== model) throw new Error("--into needs the same guide and model");
      // A case new to that report is added (findIndex -1 used to drop it silently).
      for (const r of results) {
        const i = old.results.findIndex((x) => x.id === r.id);
        if (i < 0) old.results.push(r);
        else old.results[i] = r;
      }
      run = old;
    } else run.results = results;
  }
  const dir = new URL("reports/", HERE);
  mkdirSync(dir, { recursive: true });
  const base = run.label.replace(/[^\w.+-]/g, "_");
  writeFileSync(new URL(`${base}.json`, dir), JSON.stringify(run, null, 2) + "\n");
  writeFileSync(new URL(`${base}.md`, dir), report(run));
  const pass = run.results.filter((r) => r.score.pass).length;
  console.log(`${run.label}: ${pass}/${run.results.length} passed (${Math.round((100 * pass) / run.results.length)}%), guide ${run.guide.version} ${run.guide.words} words, model ${run.model}`);
  for (const r of run.results.filter((r) => !r.score.pass)) console.log(`  FAIL ${r.id}: ${r.score.fails.join("; ")}`);
  console.log(`report: ${new URL(`${base}.md`, dir).pathname}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

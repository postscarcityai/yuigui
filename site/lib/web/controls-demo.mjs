// The demo host for Controls (YUI-245): a stand-in for the Hermes plugin with its rules, a port of the
// app's DemoControls (Agents/Controls.swift). Revs, conflicts, a hidden key line, bundled skills that can be
// switched off but not deleted. State lives per agent, in this page. lib/web/demo.mjs `controlled()` calls
// `handle` and posts what it returns as the host's answer row.
//
// For the e2e: `globalThis.yuiDemoControlHost` is the host, and `host.bump(agentId, section, id)` changes an
// item "on the Mac" so the next save from the page is a conflict.

const SOUL = `# Scout

You are Scout, a trail-running coach who lives in Yui.

## Voice
- Warm, quick, a little playful.
- Short sentences. The person is on a phone.

## What you do
- Plan the week's runs around the person's schedule.
- Check in after long runs.`;

const frontmatter = (name, desc, body) => `---\nname: ${name}\ndescription: ${desc}\n---\n\n${body}\n`;

function fresh(agent) {
  const name = agent?.name || "Scout";
  return {
    soul: SOUL.replace(/Scout/g, name),
    memory: [
      { id: "mem-1", group: "remembers", text: "Long runs are on Sunday mornings, 8:00 start.", locked: false },
      { id: "mem-2", group: "remembers", text: "Knee felt tight after the 18 km on Sep 14. Keep the next two runs easy.", locked: false },
      { id: "mem-3", group: "remembers", text: "Strava sync token: [hidden on your Mac]", locked: true },
      { id: "user-1", group: "you", text: "Chris likes short answers and buttons over paragraphs.", locked: false },
      { id: "user-2", group: "you", text: "Never schedule anything at 1:30 or 2:00pm (school pickup).", locked: false },
    ],
    skills: [
      { id: "trail-planner", desc: "Plan a week of runs from the calendar.", on: true, bundled: false, text: frontmatter("trail-planner", "Plan a week of runs from the calendar.", "# Trail planner\n\n1. Read the week.\n2. Put the long run on Sunday.\n3. Keep two easy days after a hard one.") },
      { id: "apple-reminders", desc: "Apple Reminders: add, list, complete.", on: true, bundled: true, text: frontmatter("apple-reminders", "Apple Reminders: add, list, complete.", "# Reminders\n\nUse remindctl.") },
      { id: "weather-check", desc: "Look up the forecast before a long run.", on: false, bundled: false, text: frontmatter("weather-check", "Look up the forecast before a long run.", "# Weather\n\nCheck the hourly forecast.") },
    ],
    jobs: [
      { id: "j-morning", name: "morning brief", schedule: "0 8 * * 1-5", prompt: "Send the day's run and the weather as one card.", paused: false },
      { id: "j-sunday", name: "sunday check-in", schedule: "0 11 * * 0", prompt: "Ask how the long run went. Offer a stretch timer.", paused: false },
      { id: "j-weekly", name: "weekly plan", schedule: "0 17 * * 5", prompt: "Draft next week's runs and ask Chris to pick.", paused: true },
    ],
  };
}

// The same short hash for a rev every time the text is the same.
function rev(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

// The picker's lines in words, as the plugin's when_in_words says them.
export function whenInWords(s) {
  const line = String(s || "");
  if (line.startsWith("every ")) return line.replace(/(\d+)m$/, "$1 minutes");
  const p = line.split(/\s+/);
  if (p.length === 5 && /^\d+$/.test(p[0]) && /^\d+$/.test(p[1])) {
    const t = `${Number(p[1])}:${p[0].padStart(2, "0")}`;
    if (p[4] === "1-5") return `weekdays ${t}`;
    if (p[4] === "*") return `daily ${t}`;
    if (p[4] === "0") return `Sundays ${t}`;
    if (p[4] === "5") return `Fridays ${t}`;
  }
  return line;
}

// One "Mac" per page: a render's spare relay makes a second host object, and both talk to the same state.
const state = new Map();
const flags = { silent: false };

export function demoControlHost({ now = Date.now, latency = 150 } = {}) {
  const of = (agentId, agent) => { if (!state.has(agentId)) state.set(agentId, fresh(agent)); return state.get(agentId); };

  const ok = (req, extra = {}) => ({ v: 1, req: req.req, ok: true, section: req.section, ...extra });
  const no = (req, error, message, extra = {}) => ({ v: 1, req: req.req, ok: false, error, message, ...extra });
  const conflict = (req, current, item) => no(req, "conflict", "Changed on the host since you opened it.", { rev: current, item });
  const gone = (req) => no(req, "bad_id", "That isn't something the host listed.");

  const soulItem = (st) => ({ id: "SOUL.md", text: st.soul, outline: st.soul.split("\n").filter((l) => l.startsWith("#")).map((l) => l.replace(/^[#\s]+/, "")) });
  const memItem = (m, withText = true) => ({ id: m.id, group: m.group, ...(withText ? { text: m.text } : { title: m.text }), read_only: m.locked });
  const skillRow = (s) => ({ id: s.id, title: s.id, description: s.desc, enabled: s.on, bundled: s.bundled });
  const skillItem = (s) => ({ id: s.id, title: s.id, text: s.text, enabled: s.on, bundled: s.bundled });
  const jobItem = (j, running = false) => {
    const d = { id: j.id, title: j.name, when: whenInWords(j.schedule), schedule: j.schedule, text: j.prompt, paused: j.paused, deliver: "yui", last_run: new Date(now() - 26 * 3600000).toISOString(), last_ok: true };
    if (!j.paused) d.next_run = new Date(now() + 185 * 60000).toISOString();
    if (running) d.running_soon = true;
    return d;
  };
  const jobRev = (j) => rev(j.prompt + j.schedule);

  function run(agentId, req, agent) {
    const st = of(agentId, agent);
    const { op, section, id } = req;
    const text = req.value?.text;
    if (req.v !== 1) return no(req, "version", "Update the Yui plugin on your Mac.");
    switch (`${section}.${op}`) {
      case "soul.list": return ok(req, { items: [{ id: "SOUL.md", title: agent?.name || "Scout" }] });
      case "soul.get": return ok(req, { rev: rev(st.soul), item: soulItem(st) });
      case "soul.put":
        if (req.rev !== rev(st.soul)) return conflict(req, rev(st.soul), soulItem(st));
        if (typeof text !== "string" || !text.trim()) return no(req, "empty", "An agent needs a personality. It can't be empty.");
        if (text.length > 32 * 1024) return no(req, "too_big", "That is over the 32 KB limit.");
        st.soul = text;
        return ok(req, { rev: rev(st.soul), item: soulItem(st) });

      case "memory.list": return ok(req, { items: [...st.memory].reverse().map((m) => memItem(m, false)) });
      case "memory.get": { const m = st.memory.find((x) => x.id === id); return m ? ok(req, { rev: rev(m.text), item: memItem(m) }) : no(req, "not_found", "It's gone from the host."); }
      case "memory.put": {
        const m = st.memory.find((x) => x.id === id);
        if (!m) return no(req, "not_found", "It's gone from the host.");
        if (m.locked) return no(req, "read_only", "Part of this is hidden on your Mac, so it can only be changed there.");
        if (req.rev !== rev(m.text)) return conflict(req, rev(m.text), { id, text: m.text });
        if (typeof text !== "string" || !text.trim()) return no(req, "empty", "A memory can't be empty. Forget it instead.");
        m.text = text;
        return ok(req, { rev: rev(m.text), item: memItem(m) });
      }
      case "memory.delete": {
        const m = st.memory.find((x) => x.id === id);
        if (m?.locked) return no(req, "read_only", "Part of this is hidden on your Mac, so it can only be changed there.");
        if (m && req.rev !== rev(m.text)) return conflict(req, rev(m.text), memItem(m));
        st.memory = st.memory.filter((x) => x.id !== id);
        return ok(req, { deleted: true });
      }

      case "skills.list": return ok(req, { items: st.skills.map(skillRow) });
      case "skills.get": { const s = st.skills.find((x) => x.id === id); return s ? ok(req, { rev: rev(s.text), item: skillItem(s) }) : gone(req); }
      case "skills.put": {
        const s = st.skills.find((x) => x.id === id);
        if (!s) return gone(req);
        if (req.rev !== rev(s.text)) return conflict(req, rev(s.text), skillItem(s));
        if (typeof text !== "string" || !text.startsWith("---")) return no(req, "no_frontmatter", "A skill needs its name and description at the top.");
        s.text = text;
        return ok(req, { rev: rev(s.text), item: skillItem(s) });
      }
      case "skills.act": {
        const s = st.skills.find((x) => x.id === id);
        if (!s) return gone(req);
        s.on = req.verb === "enable";
        return ok(req, { item: skillRow(s) });
      }
      case "skills.delete": {
        const s = st.skills.find((x) => x.id === id);
        if (s?.bundled) return no(req, "bundled", "This skill ships with Hermes. Switch it off instead.");
        if (s && req.rev !== rev(s.text)) return conflict(req, rev(s.text), skillItem(s));
        st.skills = st.skills.filter((x) => x.id !== id);
        return ok(req, { deleted: true });
      }

      case "schedules.list": return ok(req, { items: st.jobs.map((j) => jobItem(j)) });
      case "schedules.get": { const j = st.jobs.find((x) => x.id === id); return j ? ok(req, { rev: jobRev(j), item: jobItem(j) }) : gone(req); }
      case "schedules.act": {
        const j = st.jobs.find((x) => x.id === id);
        if (!j) return gone(req);
        if (req.verb === "pause") j.paused = true;
        if (req.verb === "resume" || req.verb === "run") j.paused = false;
        return ok(req, { item: jobItem(j, req.verb === "run") });
      }
      case "schedules.put": {
        const j = st.jobs.find((x) => x.id === id);
        if (!j) return gone(req);
        if (req.rev !== jobRev(j)) return conflict(req, jobRev(j), jobItem(j));
        const line = req.value?.schedule;
        if (line !== undefined) {
          if (!/^(every \d+m|[\d*/,-]+ [\d*/,-]+ [\d*/,-]+ [\d*/,-]+ [\d*/,-]+)$/.test(String(line).trim())) return no(req, "bad_schedule", "That time doesn't parse. Try a cron line like 0 9 * * 1.");
          j.schedule = String(line).trim();
        }
        if (typeof text === "string") j.prompt = text;
        return ok(req, { rev: jobRev(j), item: jobItem(j) });
      }
      case "schedules.delete": {
        const j = st.jobs.find((x) => x.id === id);
        if (j && req.rev !== jobRev(j)) return conflict(req, jobRev(j), jobItem(j));
        st.jobs = st.jobs.filter((x) => x.id !== id);
        return ok(req, { deleted: true });
      }

      case "model.list": return ok(req, { items: [{ id: "model", title: "claude-opus-5-5", sub: "Claude on this Mac" }] });
      case "model.get":
        if (agent?.kind === "native") {
          return ok(req, { rev: "00000001", item: { id: "model", model: "Yui's pick (GLM 5.2, GLM-5V-Turbo for photos)", provider: "OpenRouter, on Yui", profile: agent.name, version: 1,
            toolsets: ["Every Yui screen", "Memory", "Check-ins", "Web search", "Hand-offs"].map((name) => ({ name, on: true })) } });
        }
        return ok(req, { rev: "00000001", item: { id: "model", model: "claude-opus-5-5", provider: "Claude on this Mac",
          toolsets: [{ name: "hermes-cli", on: true }, { name: "kanban", on: true }, { name: "browser", on: false }] } });

      case "channels.list": return ok(req, { items: [{ id: "yui", title: "Yui", live: true }, { id: "telegram", title: "Telegram", live: true }, { id: "discord", title: "Discord", live: false }] });
      default: return no(req, "bad_op", "The host doesn't know that request.");
    }
  }

  const host = {
    async handle(agentId, req, { agent } = {}) {
      await new Promise((r) => setTimeout(r, latency));
      if (flags.silent) return null; // the e2e can make the Mac not answer
      return run(agentId, req || {}, agent);
    },
    // Changes an item on the Mac, behind the page's back: the next save from the page is a conflict.
    bump(agentId, section, id) {
      const st = of(agentId);
      if (section === "soul") st.soul += "\n- Added on the Mac: hills on Thursdays.";
      else if (section === "memory") { const m = st.memory.find((x) => x.id === id); if (m) m.text += " (edited on the Mac)"; }
      else if (section === "skills") { const s = st.skills.find((x) => x.id === id); if (s) s.text += "\nEdited on the Mac.\n"; }
      else if (section === "schedules") { const j = st.jobs.find((x) => x.id === id); if (j) j.prompt += " (edited on the Mac)"; }
    },
    get silent() { return flags.silent; },
    set silent(v) { flags.silent = !!v; },
    state: (agentId) => structuredClone(of(agentId)),
  };
  globalThis.yuiDemoControlHost = host;
  return host;
}

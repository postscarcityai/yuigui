// Demo mode (YUI-242, docs/specs/web-parity.md "The e2e harness"): `/web?demo=<sample>` is a fake relay in the
// page. It has the relay client's shape (relay.mjs), so the same Thread, ThreadSync and outbox run on it,
// but nothing leaves the tab: no sign in, no network. It is the web twin of the app's -yuiDemoAccount,
// the site demo's engine and the only thing CI touches. A recorded thread lives in app/web/fixtures/;
// rows keep the real column shape (spec/RELAY.md), plus `ago_min` so the days read right on any date.
//
// The scripted agent does what a host does: picks the person's row up (`delivered_at`), writes `doing`
// while it works, answers with one row carrying `meta.turn`, and marks the row handled.

let n = 9000;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

const iso = (t) => new Date(t).toISOString().replace(/\.(\d{3})Z$/, ".$1000+00:00");

// Fixture rows -> rows as the relay returns them, dated from `now`.
export function materialize(fixture, now = Date.now()) {
  const threads = {};
  for (const [agentId, rows] of Object.entries(fixture.threads)) {
    threads[agentId] = rows.map(({ ago_min, ...r }) => {
      const at = iso(now - ago_min * 60000);
      return { reaction: null, doing: null, ...r, created_at: at, delivered_at: r.sender === "user" ? at : null, handled_at: r.sender === "user" ? at : null };
    });
  }
  return threads;
}

export function createDemoRelay(fixture, { now = Date.now, speed = 1, userId = "demo-user" } = {}) {
  const threads = materialize(fixture, now());
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms / speed));
  const rows = (agentId) => (threads[agentId] ||= []);
  const blobs = new Map(), links = new Map();
  let tick = 0;
  // Strictly increasing, so a row posted in the same millisecond still sorts after the last one.
  const bump = () => { tick = Math.max(now(), tick + 1); return iso(tick); };

  async function answer(agentId, userRow) {
    const kind = userRow.kind === "event" ? "event" : "text";
    // A line asking for a timer gets the one that takes the whole window (a staged part opens by itself).
    const key = kind === "text" && /\btimer\b/i.test(userRow.body || "") && fixture.replies.timer ? "timer" : kind;
    const script = (fixture.replies[key] || fixture.replies.text || [])[0];
    if (!script) return;
    await sleep(500);
    userRow.delivered_at = bump();
    // The host writes what it is doing, one phrase after another.
    for (const step of script.doing || []) {
      const m = /^(.*?)(?: (\d+)\/(\d+))?$/.exec(step);
      userRow.doing = m[2] ? { text: m[1], step: Number(m[2]), of: Number(m[3]) } : { text: m[1] };
      await sleep(700);
    }
    rows(agentId).push({ id: id(), sender: "agent", body: script.body, kind: "text", meta: { turn: [userRow.id] }, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    userRow.handled_at = bump();
  }

  // A mention goes to the other agent; its answer comes back here as an agent row with `mention_reply`
  // (spec/RELAY.md, Mentions), and this agent is not asked.
  async function mentioned(agentId, userRow) {
    const to = userRow.meta.mention;
    const script = (fixture.replies.mention || [])[0] || { body: `${to.name} here. Got it.` };
    await sleep(500);
    userRow.delivered_at = bump();
    for (const step of script.doing || []) { userRow.doing = { text: step }; await sleep(700); }
    rows(agentId).push({ id: id(), sender: "agent", body: script.body, kind: "text", meta: { mention_reply: { agent: to.to, name: to.name, handle: to.handle } }, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null });
    userRow.handled_at = bump();
  }

  return {
    demo: true,
    userId,
    async agents() { return { agents: fixture.agents }; },
    async fetchRows({ agentId, since, limit = 100 }) {
      const all = rows(agentId).filter((r) => r.kind !== "control" || (r.sender === "user" && r.body === "stop"));
      if (since) {
        const from = Date.parse(since);
        return all.filter((r) => Date.parse(r.created_at) > from).map((r) => ({ ...r }));
      }
      return all.slice(-limit).map((r) => ({ ...r }));
    },
    async newestFromUser({ agentId }) {
      const mine = rows(agentId).filter((r) => r.sender === "user" && r.kind !== "control");
      const r = mine[mine.length - 1];
      return r ? { ...r } : null;
    },
    // The e2e checks cut the network with `offline = true`: every write then fails the way a dropped one does.
    offline: false,
    async post({ id: rid, agentId, body, kind = "text", meta = null }) {
      if (this.offline) throw new TypeError("network down");
      const list = rows(agentId);
      if (list.some((r) => r.id === rid)) return; // the primary key: a resend counts as sent
      const row = { id: rid, sender: "user", body, kind, meta: meta || {}, created_at: bump(), delivered_at: null, handled_at: null, reaction: null, doing: null };
      list.push(row);
      if (kind === "control") return;
      // The database copies a reaction onto the agent's row (spec/REACTIONS.md).
      if (row.meta.react) { const hit = list.find((r) => r.id === row.meta.react.msg && r.sender === "agent"); if (hit) hit.reaction = row.meta.react.emoji; }
      if (row.meta.mention) { mentioned(agentId, row); return; }
      answer(agentId, row);
    },
    // A photo into the bucket, kept for the page's life; the bytes never leave the tab.
    async upload({ path, blob }) { if (this.offline) throw new TypeError("network down"); if (!blobs.has(path)) blobs.set(path, blob); },
    // What went up, for the e2e checks: the path, the type and the size in bytes.
    uploads() { return [...blobs].map(([path, b]) => ({ path, type: b.type, size: b.size })); },
    async sign(path) { const b = blobs.get(path); if (!b) return ""; if (!links.has(path)) links.set(path, URL.createObjectURL(b)); return links.get(path); },
    async deliver(item) { for (const u of item.uploads || []) await this.upload(u); await this.post(item); },
    subscribe() { return () => {}; },
    // Every row the demo agent ever wrote or was sent, for the e2e checks (they read the wire, not the screen).
    wire(agentId) { return rows(agentId).filter((r) => r.sender === "user").map((r) => ({ kind: r.kind, body: r.body, meta: r.meta })); },
  };
}

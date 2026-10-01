// The settings screens' side of the demo relay (YUI-247): yui-account (the look), yui-native (the model key and the
// web search key), the management tokens of yui-agents, yui-delete, and the vault's tables, all kept in the page.
// `/web?demo=<sample>` has no sign in and no network, so this is what Settings talks to there. Rows are the shapes
// the real functions return (supabase/functions/yui-account, yui-native, yui-agents, yui-vault).
const refused = (code, status = 400, message) => { const e = new Error(message || code); e.code = code; e.status = status; if (message) e.message = message; return e; };

const PROVIDERS = [
  { id: "openrouter", label: "OpenRouter", needsModel: false, keyUrl: "https://openrouter.ai/keys" },
  { id: "anthropic", label: "Claude", needsModel: false, keyUrl: "https://console.anthropic.com/settings/keys", plan: "A Claude Pro or Max plan can't pay for another app. Only an API key can." },
  { id: "openai", label: "ChatGPT", needsModel: false, keyUrl: "https://platform.openai.com/api-keys", plan: "A ChatGPT Plus or Pro plan can't pay for another app. Only an API key can." },
  { id: "custom", label: "Another server", needsModel: true },
];

export function createSettingsDemo({ email = "maya@example.com", now = () => Date.now() } = {}) {
  let look = null;
  const keys = [];
  let search = null;
  let tokens = [];
  let n = 0;
  const vaultKeys = [], grants = [], uses = [];
  const log = [];
  const asks = [], answers = [];
  const iso = () => new Date(now()).toISOString();
  const shown = (t) => ({ id: t.id, name: t.name, scope: "agents", created_at: t.created_at, last_used_at: t.last_used_at ?? null });

  function account(b) {
    if (b.action === "get") return { user: { id: "demo-user", email }, look };
    if (b.action === "look" && !("look" in b)) return { look };
    if (b.action === "look" || b.action === "set_look") {
      if (b.look === null) { look = null; return { look: null }; }
      if (typeof b.look !== "object" || Array.isArray(b.look)) throw refused("bad_look", 400);
      look = { ...b.look, at: iso(), by: "user" };
      return { look };
    }
    throw refused("unknown_action");
  }

  function native(b) {
    switch (b.action) {
      case "status": return { key: keys[0] || null, keys: keys.map((k) => ({ ...k })), agent_keys: {}, providers: PROVIDERS, models: [], timezone: null, turns: { used: 30, limit: 100 }, search: { used: 10, limit: 50, key: search } };
      case "key_set": {
        const p = PROVIDERS.find((x) => x.id === b.provider);
        if (!p) throw refused("unknown_provider");
        const key = String(b.key || "").trim();
        if (key.length < 8 || /\s/.test(key)) throw refused("invalid_key");
        if (/^bad/.test(key)) throw refused("key_check_failed", 400, `${p.label} didn't accept that key.`);
        if (p.needsModel && !String(b.model || "").trim()) throw refused("model_required");
        keys.splice(0, keys.length, { provider: p.id, model: b.model || null, hint: key.slice(-4) });
        log.push({ fn: "yui-native", action: "key_set", provider: p.id, hint: key.slice(-4) });
        return { ok: true, key: { ...keys[0] } };
      }
      case "key_remove": keys.splice(0, keys.length); log.push({ fn: "yui-native", action: "key_remove" }); return { ok: true };
      case "search_key_set": {
        const key = String(b.key || "").trim();
        if (key.length < 8 || /\s/.test(key)) throw refused("invalid_key");
        if (/^bad/.test(key)) throw refused("key_check_failed", 400, "Firecrawl didn't accept that key.");
        search = { hint: key.slice(-4) };
        log.push({ fn: "yui-native", action: "search_key_set", hint: key.slice(-4) });
        return { ok: true, search: { key: { ...search } } };
      }
      case "search_key_remove": search = null; log.push({ fn: "yui-native", action: "search_key_remove" }); return { ok: true };
      default: throw refused("unknown_action");
    }
  }

  function agents(b) {
    switch (b.action) {
      case "token_list": return { tokens: tokens.map(shown) };
      case "token_create": {
        const name = String(b.name || "Agent access").trim().slice(0, 40);
        if (!name) throw refused("invalid_name");
        const t = { id: `tok-${++n}`, name, created_at: iso(), last_used_at: null };
        tokens.push(t);
        return { token: `yui_mt_demo${String(n).padStart(40, "0")}`, ...shown(t) };
      }
      case "token_revoke": {
        if (!tokens.some((t) => t.id === b.id)) throw refused("not_found", 404);
        tokens = tokens.filter((t) => t.id !== b.id);
        return { revoked: true };
      }
      default: return undefined;
    }
  }

  const Res = (status, body) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });
  // The vault's PostgREST tables as the person's token sees them.
  async function rest(path, init = {}) {
    const [table, query = ""] = path.replace(/^rest\/v1\//, "").split("?");
    const q = new URLSearchParams(query);
    const method = init.method || "GET";
    const body = init.body ? JSON.parse(init.body) : null;
    const eq = (k) => (q.get(k) || "").replace(/^eq\./, "");
    if (table === "yui_vault_keys_public") return Res(200, vaultKeys.map(({ sealed, ...pub }) => pub));
    if (table === "yui_vault_keys") {
      if (method === "POST") {
        if (!vaultKeys.some((k) => k.id === body.id)) vaultKeys.push({ id: body.id, provider: body.provider, name: body.name, last4: body.last4, cap_cents: body.cap_cents, sealed: body.sealed, key_id: body.key_id });
        log.push({ fn: "rest", table, method, provider: body.provider, last4: body.last4, sealed: String(body.sealed).slice(0, 6), key_id: body.key_id });
        return Res(201, null);
      }
      if (method === "DELETE") {
        const id = eq("id");
        const at = vaultKeys.findIndex((k) => k.id === id);
        if (at >= 0) vaultKeys.splice(at, 1);
        for (let i = grants.length - 1; i >= 0; i--) if (grants[i].key === id) grants.splice(i, 1);
        log.push({ fn: "rest", table, method, id });
        return Res(204, null);
      }
    }
    if (table === "yui_vault_grants") {
      if (method === "GET") return Res(200, grants.filter((g) => !g.revoked_at && (!eq("agent_id") || g.agent_id === eq("agent_id"))).map((g) => ({ ...g })));
      if (method === "POST") { grants.unshift({ id: `grant-${++n}`, created_at: iso(), last_used_at: null, revoked_at: null, cap_cents: null, ...body }); log.push({ fn: "rest", table, method, handle: body.handle }); return Res(201, null); }
      if (method === "PATCH") { const g = grants.find((x) => x.id === eq("id")); if (g) g.revoked_at = body.revoked_at; log.push({ fn: "rest", table, method }); return Res(204, null); }
    }
    if (table === "yui_vault_uses") return Res(200, uses.map((u) => ({ ...u })));
    return Res(404, { error: "not_found" });
  }

  return {
    // The function a settings screen calls, or undefined when it is not one of these.
    call(fn, body) {
      if (fn === "yui-account") return account(body);
      if (fn === "yui-native") return native(body);
      if (fn === "yui-delete") { log.push({ fn: "yui-delete" }); return { deleted: true, apple_token_revoked: true, media_removed: 0 }; }
      if (fn === "yui-agents") return agents(body);
      return undefined;
    },
    rest,
    // A host's key ask for an agent (the demo's `?keyask=fal|Draw your avatars|5|about 4 images a week`).
    ask(agentId, { provider, why, cap, est }) { asks.push({ id: `ask-${asks.length + 1}`, agentId, created_at: iso(), meta: { v: 1, req: `k-demo-${provider}-${asks.length + 1}`, op: "key_ask", provider, for: why, ...(est ? { est } : {}), ...(cap ? { cap: Number(cap) } : {}) } }); },
    asksFor: (agentId) => asks.filter((a) => a.agentId === agentId).map(({ agentId: _a, ...row }) => row),
    answered(meta) { answers.push(meta); log.push({ fn: "key_answer", decision: meta.decision, provider: meta.provider, handle: meta.handle || null, cap: meta.cap }); },
    answers: () => answers.map((a) => ({ ...a })),
    // `?demovault=1`: a fal key with one grant and some spend, like the app's -yuiDemoVault.
    seedVault(agentId) {
      const id = "aaaaaaaa-0000-4000-8000-000000000001";
      vaultKeys.push({ id, provider: "fal", name: "Personal fal", last4: "cdef", cap_cents: 1000, key_id: "yvk-1" });
      grants.push({ id: "grant-seed", key: id, agent_id: agentId, handle: "vk_fal_3f9a", purpose: "Draw my avatars", once: false, cap_cents: 1000, created_at: iso(), last_used_at: iso(), revoked_at: null });
      uses.push({ key: id, agent_id: agentId, cost_cents: 800, at: iso() });
    },
    // For the e2e checks: spend to show, and what reached the wire.
    spend(keyId, agentId, cents) { uses.push({ key: keyId, agent_id: agentId, cost_cents: cents, at: iso() }); },
    wire: () => log.map((l) => ({ ...l })),
    look: () => look,
    deleted: () => log.some((l) => l.fn === "yui-delete"),
  };
}

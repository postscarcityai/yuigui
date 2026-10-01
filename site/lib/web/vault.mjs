// The keys vault on the web (YUI-247), the browser twin of Vault/*.swift. Where the phone keeps a key in its
// keychain behind Face ID, a page has nowhere safe to put one, so the web way is: the key is typed, sealed to the
// hosted connector in the page (HPKE, the format of Vault/VaultSeal.swift and yui-vault/seal.ts), handed to the
// relay, and forgotten. The page keeps the handle and the last four, never the key. spec/VAULT.md.
//   info   = utf8("yui-vault-v1|" + key_id)    sealed = enc (32 bytes) || ciphertext || tag
export const CONNECTOR_KEY = Object.freeze({ id: "yvk-1", publicKey: "tJvEIAAfPdMGaIdSKOvBFdXJG8a25svLdnGvyUZ4SD8=" });

export const PROVIDERS = [
  { id: "fal", label: "fal", usedFor: "Images, video, audio", keyPage: "https://fal.ai/dashboard/keys", limitPage: "https://fal.ai/dashboard/billing", pattern: /^[A-Za-z0-9-]{8,}:[A-Za-z0-9]{16,}$/, priced: true },
  { id: "replicate", label: "Replicate", usedFor: "Open models, images", keyPage: "https://replicate.com/account/api-tokens", limitPage: "https://replicate.com/account/billing", pattern: /^r8_[A-Za-z0-9]{20,}$/, priced: true },
  { id: "elevenlabs", label: "ElevenLabs", usedFor: "Voices and audio", keyPage: "https://elevenlabs.io/app/settings/api-keys", limitPage: "https://elevenlabs.io/app/subscription", pattern: /^sk_[A-Za-z0-9]{32,}$/, priced: false },
  { id: "anthropic", label: "Anthropic", usedFor: "Claude", keyPage: "https://console.anthropic.com/settings/keys", limitPage: "https://console.anthropic.com/settings/limits", pattern: /^sk-ant-[A-Za-z0-9_-]{16,}$/, priced: true },
  { id: "openai", label: "OpenAI", usedFor: "GPT, images", keyPage: "https://platform.openai.com/api-keys", limitPage: "https://platform.openai.com/settings/organization/limits", pattern: /^sk-(?!ant-|or-)[A-Za-z0-9_-]{20,}$/, priced: true },
];
export const providerOf = (id) => PROVIDERS.find((p) => p.id === id) || null;
export const matches = (p, key) => p.pattern.test(String(key || "").trim());
export const detect = (key) => PROVIDERS.find((p) => matches(p, key)) || null;
export const wrongShape = (p) => `That doesn't look like a ${p.label} key.`;
export const last4 = (key) => String(key).slice(-4);
export const DEFAULT_CAP = 1000; // cents a month, the app's default

export const dollars = (cents) => (cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`);
export const handleFor = (provider, rand = Math.random) => `vk_${provider}_${Math.floor(rand() * 65536).toString(16).padStart(4, "0")}`;

export const LAPSE_DAYS = 90, WARN_DAYS = 80;
export function idleDays(g, now = Date.now()) {
  const t = Date.parse(g.last_used_at || g.created_at || "");
  return Number.isNaN(t) ? 0 : Math.max(Math.floor((now - t) / 86_400_000), 0);
}
// "Lapses in 6 days if it isn't used", from day 80.
export function lapseNote(g, now = Date.now()) {
  if (g.revoked_at) return null;
  const idle = idleDays(g, now);
  if (idle < WARN_DAYS) return null;
  const left = Math.max(LAPSE_DAYS - idle, 0);
  return left === 0 ? "Lapses today if it isn't used." : `Lapses in ${left} day${left === 1 ? "" : "s"} if it isn't used.`;
}
export function usedLine(grants, now = Date.now()) {
  const t = Math.max(0, ...grants.map((g) => Date.parse(g.last_used_at || "") || 0));
  if (!t) return "Not used yet";
  const days = Math.floor((now - t) / 86_400_000);
  return days <= 0 ? "Used today" : days === 1 ? "Used yesterday" : `Used ${days} days ago`;
}

const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export const hex = (bytes) => Array.from(bytes, (x) => x.toString(16).padStart(2, "0")).join("");
export const infoFor = (keyId) => new TextEncoder().encode(`yui-vault-v1|${keyId}`);

// The library is loaded when a key is first added, so a person who never adds one never downloads it.
async function suite() {
  const [{ CipherSuite, HkdfSha256 }, { DhkemX25519HkdfSha256 }, { Chacha20Poly1305 }] = await Promise.all([
    import("@hpke/core"), import("@hpke/dhkem-x25519"), import("@hpke/chacha20poly1305"),
  ]);
  return new CipherSuite({ kem: new DhkemX25519HkdfSha256(), kdf: new HkdfSha256(), aead: new Chacha20Poly1305() });
}

/** `secret` sealed to the connector. Fresh ephemeral key every call. Returns enc || ciphertext || tag. */
export async function seal(secret, { id = CONNECTOR_KEY.id, publicKey = CONNECTOR_KEY.publicKey } = {}) {
  const s = await suite();
  const recipientPublicKey = await s.kem.deserializePublicKey(b64(publicKey));
  const ctx = await s.createSenderContext({ recipientPublicKey, info: infoFor(id) });
  const ct = new Uint8Array(await ctx.seal(new TextEncoder().encode(secret)));
  const out = new Uint8Array(32 + ct.length);
  out.set(new Uint8Array(ctx.enc), 0);
  out.set(ct, 32);
  return out;
}

// bytea as PostgREST reads it: "\x" and hex.
export const byteaHex = (bytes) => `\\x${hex(bytes)}`;

/** What the vault asks of the relay (LiveVaultBackend). `rest(path, init)` is the relay's PostgREST door, the
 * person's own token. Rows are the ones the app writes, so a key added here shows up on the phone's list too. */
export function createVault({ rest, now = () => Date.now(), uuid = () => crypto.randomUUID() }) {
  const json = async (path, init) => { const r = await rest(path, init); return r.status === 204 ? null : r.json().catch(() => null); };
  const q = (pairs) => new URLSearchParams(pairs).toString();
  const post = (body, prefer = "return=minimal") => ({ method: "POST", headers: { "Content-Type": "application/json", Prefer: prefer }, body: JSON.stringify(body) });
  return {
    keys: () => json(`rest/v1/yui_vault_keys_public?${q([["select", "id,provider,name,last4,cap_cents"]])}`).then((r) => r || []),
    grants: (agentId = null) => json(`rest/v1/yui_vault_grants?${q([["select", "id,key,agent_id,handle,purpose,cap_cents,once,created_at,revoked_at,last_used_at"], ["revoked_at", "is.null"], ["order", "created_at.desc"], ...(agentId ? [["agent_id", `eq.${agentId}`]] : [])])}`).then((r) => r || []),
    uses: (since) => json(`rest/v1/yui_vault_uses?${q([["select", "key,agent_id,cost_cents,at"], ["kind", "eq.call"], ["at", `gte.${new Date(since).toISOString()}`], ["limit", "5000"]])}`).then((r) => r || []),
    // Seals the key and puts the sealed copy. The plaintext is not kept anywhere after this returns.
    async add({ userId, provider, name, secret, capCents = DEFAULT_CAP, limitConfirmed = false }) {
      const p = providerOf(provider);
      if (!p || !matches(p, secret)) { const e = new Error("wrong_shape"); e.code = "wrong_shape"; throw e; }
      const key = secret.trim();
      const sealed = await seal(key);
      const id = uuid();
      await rest("rest/v1/yui_vault_keys?on_conflict=id", post({ id, user_id: userId, provider, name: String(name || p.label).slice(0, 40), last4: last4(key), sealed: byteaHex(sealed), key_id: CONNECTOR_KEY.id, cap_cents: capCents, provider_limit_confirmed: !!limitConfirmed }, "resolution=ignore-duplicates,return=minimal"));
      return { id, provider, name: name || p.label, last4: last4(key), cap_cents: capCents };
    },
    // The sealed copy and every grant with it (cascade), like the app's remove.
    async remove(id) { await rest(`rest/v1/yui_vault_keys?${q([["id", `eq.${id}`]])}`, { method: "DELETE", headers: { Prefer: "return=minimal" } }); },
    async grant({ key, agentId, purpose, capCents = null, once = false, provider = "key" }) {
      const handle = handleFor(provider);
      const row = { key, agent_id: agentId, handle, purpose: String(purpose).slice(0, 80), once: !!once };
      if (capCents != null) row.cap_cents = capCents;
      await rest("rest/v1/yui_vault_grants", post(row));
      return handle;
    },
    async revoke(id) { await rest(`rest/v1/yui_vault_grants?${q([["id", `eq.${id}`]])}`, { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ revoked_at: new Date(now()).toISOString() }) }); },
  };
}

// ---------- The ask (spec/VAULT.md section 3, Vault/VaultModel.swift KeyAsk) ----------

export const ASK_MAX_FOR = 80;
// A key-shaped word anywhere in text an agent sent is refused, not shown (KeyShape.find).
export const looksLikeKey = (text) => String(text || "").split(/\s+/).some((w) => w && (PROVIDERS.some((p) => p.pattern.test(w)) || /^[A-Za-z0-9_-]{32,}$/.test(w)));

/** One `meta` from a control row: {ask}, {refuse: {req, provider}} or {ignore: true}. */
export function parseAsk(meta) {
  if (!meta || meta.op !== "key_ask" || typeof meta.req !== "string" || !meta.req) return { ignore: true };
  const refuse = { refuse: { req: meta.req, provider: String(meta.provider || "") } };
  const p = meta.v === 1 ? providerOf(meta.provider) : null;
  if (!p) return meta.v === 1 ? refuse : { ignore: true };
  const why = String(meta.for || "").trim();
  if (!why || why.length > ASK_MAX_FOR || looksLikeKey(why)) return refuse;
  const est = typeof meta.est === "string" ? meta.est.slice(0, 80) : null;
  if (est && looksLikeKey(est)) return refuse;
  return { ask: { req: meta.req, provider: p.id, purpose: why, est, cap: typeof meta.cap === "number" ? Math.max(Math.trunc(meta.cap), 1) : null } };
}

/** The app's answer: a control row, op `key_answer` (contract item 7). `cap` in dollars; 0 on a no. */
export function answerMeta({ req, decision, provider, handle = null, cap = 0 }) {
  return { v: 1, req, op: "key_answer", decision, provider, cap, ...(handle ? { handle } : {}) };
}
// What the agent hears (the relay writes it; the demo shows it).
export function askLine({ decision, provider, purpose, handle, cap }) {
  if (decision === "deny") return `[yui] Key access: ${provider} not allowed.`;
  if (decision === "once") return `[yui] Key access: ${provider} allowed once for "${purpose}", handle ${handle}.`;
  return `[yui] Key access: ${provider} allowed for "${purpose}", cap $${cap} a month, handle ${handle}.`;
}

export const ASKED_KEY = "yui-web-key-asks";
export const loadAnswered = (storage = globalThis.localStorage) => { try { return new Set(JSON.parse(storage.getItem(ASKED_KEY) || "[]")); } catch { return new Set(); } };
export function markAnswered(req, storage = globalThis.localStorage) {
  const all = [...loadAnswered(storage).add(req)].slice(-200);
  try { storage.setItem(ASKED_KEY, JSON.stringify(all)); } catch { /* private mode */ }
  return new Set(all);
}
// The first of these rows the person has not answered, as an ask to show; refusals come back to be answered no.
export function nextAsk(rows, answered) {
  const refused = [];
  for (const r of [...rows].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))) {
    const req = r.meta?.req;
    if (!req || answered.has(req)) continue;
    const p = parseAsk(r.meta);
    if (p.ask) return { ask: p.ask, refused };
    if (p.refuse) refused.push(p.refuse); else if (p.ignore) refused.push({ req, ignore: true });
  }
  return { ask: null, refused };
}

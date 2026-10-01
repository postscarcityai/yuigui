// node --test lib/web/vault.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { CipherSuite, HkdfSha256 } from "@hpke/core";
import { DhkemX25519HkdfSha256 } from "@hpke/dhkem-x25519";
import { Chacha20Poly1305 } from "@hpke/chacha20poly1305";
import { CONNECTOR_KEY, PROVIDERS, byteaHex, createVault, dollars, detect, handleFor, idleDays, infoFor, lapseNote, matches, providerOf, seal, usedLine, wrongShape } from "./vault.mjs";

const suite = () => new CipherSuite({ kem: new DhkemX25519HkdfSha256(), kdf: new HkdfSha256(), aead: new Chacha20Poly1305() });
const b64 = (u) => btoa(String.fromCharCode(...u));
// The connector's side, a copy of yui-vault/seal.ts openKey: what the server does with what the page sends.
async function open(sealed, keyId, privateKey) {
  const s = suite();
  const recipientKey = await s.kem.deserializePrivateKey(privateKey);
  const ctx = await s.createRecipientContext({ recipientKey, enc: sealed.slice(0, 32), info: infoFor(keyId) });
  return new TextDecoder().decode(await ctx.open(sealed.slice(32)));
}
const pair = async () => { const s = suite(); const kp = await s.kem.generateKeyPair(); return { publicKey: new Uint8Array(await s.kem.serializePublicKey(kp.publicKey)), privateKey: new Uint8Array(await s.kem.serializePrivateKey(kp.privateKey)) }; };

const FAL = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:0123456789abcdef0123456789abcdef";

test("the pinned connector key is the one the server holds", () => {
  const server = new URL(`file://${process.env.HOME}/dev/yui/supabase/functions/yui-vault/public_key.txt`);
  const raw = Uint8Array.from(atob(CONNECTOR_KEY.publicKey), (c) => c.charCodeAt(0));
  assert.equal(raw.length, 32);
  assert.equal(CONNECTOR_KEY.id, "yvk-1");
  if (existsSync(server)) assert.equal(readFileSync(server, "utf8").trim(), CONNECTOR_KEY.publicKey);
});

test("a key sealed in the page opens on the server side, and nowhere else", async () => {
  const kp = await pair();
  const sealed = await seal(FAL, { id: "yvk-1", publicKey: b64(kp.publicKey) });
  assert.equal(sealed.length, 32 + FAL.length + 16, "enc, the key, the tag");
  assert.equal(await open(sealed, "yvk-1", kp.privateKey), FAL);
  await assert.rejects(open(sealed, "yvk-2", kp.privateKey), "the key id is bound in");
  const other = await pair();
  await assert.rejects(open(sealed, "yvk-1", other.privateKey));
  const again = await seal(FAL, { id: "yvk-1", publicKey: b64(kp.publicKey) });
  assert.notDeepEqual(again, sealed, "a fresh ephemeral key every time");
  assert.equal(new TextDecoder().decode(sealed).includes("aaaaaaaa"), false, "the key is not in the bytes");
});

test("the shape check is the app's, provider by provider", () => {
  assert.equal(detect(FAL).id, "fal");
  assert.equal(detect("r8_abcdefghijklmnopqrst12").id, "replicate");
  assert.equal(detect("sk_" + "a".repeat(32)).id, "elevenlabs");
  assert.equal(detect("sk-ant-abcdefghijklmnop").id, "anthropic");
  assert.equal(detect("sk-" + "a".repeat(24)).id, "openai");
  assert.equal(detect("sk-ant-abcdefghijklmnop").id === "openai", false, "an Anthropic key is not an OpenAI key");
  assert.equal(detect("hello"), null);
  assert.equal(matches(providerOf("fal"), ` ${FAL} `), true, "spaces around a paste are fine");
  assert.equal(wrongShape(providerOf("fal")), "That doesn't look like a fal key.");
  assert.equal(PROVIDERS.filter((p) => !p.priced).map((p) => p.id).join(), "elevenlabs");
});

test("words: money, handle, lapse", () => {
  assert.equal(dollars(800), "$8");
  assert.equal(dollars(250), "$2.50");
  assert.match(handleFor("fal", () => 0.5), /^vk_fal_8000$/);
  const now = Date.parse("2026-10-01T00:00:00Z");
  const at = (days) => new Date(now - days * 86_400_000).toISOString();
  assert.equal(idleDays({ created_at: at(3) }, now), 3);
  assert.equal(lapseNote({ created_at: at(10) }, now), null);
  assert.equal(lapseNote({ created_at: at(84) }, now), "Lapses in 6 days if it isn't used.");
  assert.equal(lapseNote({ created_at: at(89) }, now), "Lapses in 1 day if it isn't used.");
  assert.equal(lapseNote({ created_at: at(95) }, now), "Lapses today if it isn't used.");
  assert.equal(lapseNote({ created_at: at(95), revoked_at: at(1) }, now), null);
  assert.equal(usedLine([], now), "Not used yet");
  assert.equal(usedLine([{ last_used_at: at(2) }, { last_used_at: at(9) }], now), "Used 2 days ago");
});

test("add puts the sealed copy through the relay with the app's row, and keeps nothing", async () => {
  const calls = [];
  const kp = await pair();
  const vault = createVault({ rest: async (path, init) => { calls.push({ path, init }); return { status: 201, json: async () => null }; }, uuid: () => "11111111-2222-3333-4444-555555555555" });
  await assert.rejects(vault.add({ userId: "u1", provider: "fal", name: "x", secret: "nope" }), (e) => e.code === "wrong_shape");
  assert.equal(calls.length, 0, "a key of the wrong shape never leaves the page");
  const k = await vault.add({ userId: "u1", provider: "fal", name: "Personal fal", secret: FAL, capCents: 800 });
  assert.deepEqual(k, { id: "11111111-2222-3333-4444-555555555555", provider: "fal", name: "Personal fal", last4: "cdef", cap_cents: 800 });
  assert.equal(calls.length, 1);
  assert.match(calls[0].path, /^rest\/v1\/yui_vault_keys\?on_conflict=id$/);
  const row = JSON.parse(calls[0].init.body);
  assert.equal(row.user_id, "u1");
  assert.equal(row.key_id, "yvk-1");
  assert.equal(row.last4, "cdef");
  assert.match(row.sealed, /^\\x[0-9a-f]+$/);
  assert.equal(JSON.stringify(calls).includes(FAL), false, "the key itself is in no request");
  assert.equal(calls[0].init.headers.Prefer, "resolution=ignore-duplicates,return=minimal");
  assert.equal(byteaHex(new Uint8Array([1, 255])), "\\x01ff");
  void kp;
});

test("grant, revoke, remove, list: the queries the app sends", async () => {
  const calls = [];
  const vault = createVault({ rest: async (path, init = {}) => { calls.push({ path, init }); return { status: 200, json: async () => [] }; }, now: () => Date.parse("2026-10-01T12:00:00Z") });
  const h = await vault.grant({ key: "k1", agentId: "a1", purpose: "make pictures", capCents: 500, once: false, provider: "fal" });
  assert.match(h, /^vk_fal_[0-9a-f]{4}$/);
  assert.deepEqual(JSON.parse(calls[0].init.body), { key: "k1", agent_id: "a1", handle: h, purpose: "make pictures", once: false, cap_cents: 500 });
  await vault.revoke("g1");
  assert.equal(calls[1].init.method, "PATCH");
  assert.equal(JSON.parse(calls[1].init.body).revoked_at, "2026-10-01T12:00:00.000Z");
  await vault.remove("k1");
  assert.equal(calls[2].init.method, "DELETE");
  assert.match(calls[2].path, /id=eq\.k1$/);
  await vault.keys(); await vault.grants("a1"); await vault.uses(Date.parse("2026-10-01T00:00:00Z"));
  assert.match(calls[3].path, /yui_vault_keys_public\?select=/);
  assert.match(calls[4].path, /yui_vault_grants\?.*revoked_at=is\.null.*agent_id=eq\.a1/);
  assert.match(calls[5].path, /yui_vault_uses\?.*kind=eq\.call.*at=gte\.2026-10-01T00%3A00%3A00\.000Z/);
});

import { answerMeta, askLine, loadAnswered, looksLikeKey, markAnswered, nextAsk, parseAsk } from "./vault.mjs";

test("an ask: shown for a known provider and a plain reason, refused when it carries a key or is too long", () => {
  const good = { v: 1, req: "r1", op: "key_ask", provider: "fal", for: "Draw your agent avatars", est: "about 4 images a week", cap: 5 };
  assert.deepEqual(parseAsk(good), { ask: { req: "r1", provider: "fal", purpose: "Draw your agent avatars", est: "about 4 images a week", cap: 5 } });
  assert.deepEqual(parseAsk({ ...good, for: "use aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:0123456789abcdef0123456789abcdef" }), { refuse: { req: "r1", provider: "fal" } });
  assert.deepEqual(parseAsk({ ...good, for: "x".repeat(81) }), { refuse: { req: "r1", provider: "fal" } });
  assert.deepEqual(parseAsk({ ...good, est: "sk-ant-abcdefghijklmnop" }), { refuse: { req: "r1", provider: "fal" } });
  assert.deepEqual(parseAsk({ ...good, provider: "nonesuch" }), { refuse: { req: "r1", provider: "nonesuch" } });
  assert.deepEqual(parseAsk({ ...good, v: 2 }), { ignore: true });
  assert.deepEqual(parseAsk({ op: "other", req: "r" }), { ignore: true });
  assert.deepEqual(parseAsk(null), { ignore: true });
  assert.equal(parseAsk({ ...good, cap: 0.2 }).ask.cap, 1, "a cap is at least a dollar");
  assert.equal(looksLikeKey("Draw your agent avatars"), false);
});

test("the answer is the app's control row, and the agent hears the app's line", () => {
  assert.deepEqual(answerMeta({ req: "r1", decision: "allow", provider: "fal", handle: "vk_fal_00ff", cap: 5 }), { v: 1, req: "r1", op: "key_answer", decision: "allow", provider: "fal", cap: 5, handle: "vk_fal_00ff" });
  assert.deepEqual(answerMeta({ req: "r1", decision: "deny", provider: "fal" }), { v: 1, req: "r1", op: "key_answer", decision: "deny", provider: "fal", cap: 0 });
  assert.equal(askLine({ decision: "deny", provider: "fal" }), "[yui] Key access: fal not allowed.");
  assert.equal(askLine({ decision: "allow", provider: "fal", purpose: "Draw", handle: "vk_fal_00ff", cap: 5 }), '[yui] Key access: fal allowed for "Draw", cap $5 a month, handle vk_fal_00ff.');
  assert.equal(askLine({ decision: "once", provider: "fal", purpose: "Draw", handle: "h" }), '[yui] Key access: fal allowed once for "Draw", handle h.');
});

test("asks already answered never show twice, oldest first, refusals handed back", () => {
  const mem = new Map(); const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  const row = (req, created_at, meta = {}) => ({ created_at, meta: { v: 1, req, op: "key_ask", provider: "fal", for: "Draw", ...meta } });
  const rows = [row("b", "2026-10-01T02:00:00Z"), row("a", "2026-10-01T01:00:00Z"), row("bad", "2026-10-01T00:30:00Z", { for: "" })];
  let r = nextAsk(rows, loadAnswered(st));
  assert.equal(r.ask.req, "a");
  assert.deepEqual(r.refused, [{ req: "bad", provider: "fal" }]);
  markAnswered("a", st); markAnswered("bad", st);
  r = nextAsk(rows, loadAnswered(st));
  assert.equal(r.ask.req, "b");
  markAnswered("b", st);
  assert.equal(nextAsk(rows, loadAnswered(st)).ask, null);
});

// node --test lib/web/csp.test.mjs
// YUI-264: /web's Content Security Policy is built in one place and locks scripts to a nonce.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { webCsp, makeNonce, themeScriptHash } from "./csp.mjs";
import { themeInit } from "../theme-init.mjs";

const dir = (csp, n) => csp.split("; ").find((d) => d.startsWith(n + " "));

test("each request gets its own nonce", () => {
  const a = makeNonce(), b = makeNonce();
  assert.notEqual(a, b);
  assert.ok(a.length >= 16);
});

test("the theme script hash matches its text", async () => {
  assert.equal(await themeScriptHash(), createHash("sha256").update(themeInit).digest("base64"));
});

test("script-src: self, this nonce, the theme hash, strict-dynamic, Apple; no unsafe-inline", async () => {
  const nonce = makeNonce(), hash = await themeScriptHash();
  const s = dir(webCsp(nonce, hash), "script-src");
  assert.equal(s, `script-src 'self' 'nonce-${nonce}' 'sha256-${hash}' 'strict-dynamic' https://appleid.cdn-apple.com`);
  assert.ok(!s.includes("unsafe-inline") && !s.includes("unsafe-eval"));
});

test("the other directives are unchanged", async () => {
  const csp = webCsp(makeNonce(), await themeScriptHash());
  assert.equal(dir(csp, "frame-ancestors"), "frame-ancestors 'none'");
  assert.equal(dir(csp, "object-src"), "object-src 'none'");
  assert.equal(dir(csp, "base-uri"), "base-uri 'self'");
  assert.equal(dir(csp, "frame-src"), "frame-src 'self' https://appleid.apple.com");
  assert.ok(dir(csp, "connect-src").includes("wss://txuibjxyfpalzvpneqgp.supabase.co"));
  assert.ok(dir(csp, "connect-src").includes("https://appleid.apple.com"));
});

// YUI-264: the one source of /web's Content Security Policy. middleware.js mints a nonce per request and builds
// the header here; Next reads the nonce from the request's copy of the header and stamps its own inline scripts.
// script-src has no 'unsafe-inline': an inline script an attacker injects into our page has no nonce and is refused.
// 'strict-dynamic' lets a nonced script load the scripts it needs (Next's chunks, Apple's sign in script);
// 'self' and Apple's host stay as the fallback for a browser that predates it (they are ignored where it works).
// The one inline script the static root layout writes (lib/theme-init.mjs) cannot carry a nonce, so it is
// allowed by its sha256 instead: that exact text and nothing else.
import { themeInit } from "../theme-init.mjs";

const BACKEND = "https://txuibjxyfpalzvpneqgp.supabase.co";

export function webCsp(nonce, themeHash) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'sha256-${themeHash}' 'strict-dynamic' https://appleid.cdn-apple.com`,
    "style-src 'self' 'unsafe-inline'",
    // A person's photos and an agent's pictures are signed links into the private media bucket (spec/RELAY.md, Media).
    `img-src 'self' data: blob: ${BACKEND}`,
    `media-src 'self' blob: ${BACKEND}`,
    "font-src 'self' data:",
    `connect-src 'self' ${BACKEND} wss://txuibjxyfpalzvpneqgp.supabase.co https://appleid.apple.com`,
    "frame-src https://appleid.apple.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://appleid.apple.com",
    "object-src 'none'",
  ].join("; ");
}

// A fresh, unguessable value for each request (base64 of a random UUID, the shape Next's docs use).
export const makeNonce = () => btoa(crypto.randomUUID());

// base64 sha256 of the root layout's inline theme script, worked out once.
let themeHash;
export async function themeScriptHash() {
  if (!themeHash) {
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(themeInit));
    themeHash = btoa(String.fromCharCode(...new Uint8Array(d)));
  }
  return themeHash;
}

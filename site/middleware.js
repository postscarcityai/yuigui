// YUI-264: /web runs under a nonce Content Security Policy (lib/web/csp.mjs). Only /web and below pass through
// here, so the rest of the site stays static. The policy goes on the request too: Next reads the nonce from it
// and puts it on the inline scripts it writes, which is why /web renders per request (app/web/layout.js).
import { NextResponse } from "next/server";
import { webCsp, makeNonce, themeScriptHash } from "./lib/web/csp.mjs";

export async function middleware(request) {
  const nonce = makeNonce();
  const csp = webCsp(nonce, await themeScriptHash(), request.nextUrl.searchParams.has("demo"));
  const headers = new Headers(request.headers);
  headers.set("content-security-policy", csp);
  headers.set("x-nonce", nonce);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = { matcher: ["/web", "/web/:path*"] };

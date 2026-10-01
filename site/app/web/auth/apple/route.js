// The return URL registered with Apple for the web Services ID (YUI-241). Sign in with Apple JS runs
// in a popup and hands its answer back to the page with postMessage, so nothing is read here. Apple
// still wants a URL that answers a GET and a form POST: this one says the window can close.
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yui</title><style>body{font:17px/1.5 ui-rounded,system-ui,sans-serif;background:#FFF9F0;color:#3A3340;display:grid;place-items:center;min-height:100vh;margin:0}a{color:#C23B4F;font-weight:800}</style></head><body><p>You can close this window. <a href="/web">Back to Yui</a></p></body></html>`;
const headers = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "referrer-policy": "no-referrer" };
export const GET = () => new Response(page, { headers });
export const POST = () => new Response(page, { headers });

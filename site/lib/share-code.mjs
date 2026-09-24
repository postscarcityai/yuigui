// Share links (SITE-19): a Yui Lines document packed into a URL-safe string, so a link
// carries the whole screen. Format: base64url of raw deflate. Runs in the browser and
// in Node 18+ (both have CompressionStream), no dependencies.

export const MAX_CODE = 6000; // characters; longer links break in chat apps
export const SITE = "https://www.yuigui.com";

// The iframe people paste into their own page (/developers#embed).
export const embedSnippet = (src, title = "A Yui screen") =>
  `<iframe src="${SITE}${src}" title="${title.replace(/"/g, "&quot;")}" width="340" height="690" style="border:0;max-width:100%" loading="lazy"></iframe>`;
export const BADGE_MD = `[![Made with Yui Lines](${SITE}/badge/made-with-yui-lines.svg)](${SITE}/yl)`;
export const BADGE_HTML = `<a href="${SITE}/yl"><img src="${SITE}/badge/made-with-yui-lines.svg" alt="Made with Yui Lines" height="20"></a>`;

const b64url = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const unb64url = (s) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function pipe(bytes, stream) {
  const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export async function encodeYL(text) {
  return b64url(await pipe(new TextEncoder().encode(text), new CompressionStream("deflate-raw")));
}

// Returns the text, or null for anything that is not a valid code.
export async function decodeYL(code) {
  if (typeof code !== "string" || !code || code.length > MAX_CODE || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(await pipe(unb64url(code), new DecompressionStream("deflate-raw")));
    return text.length > 20000 ? null : text;
  } catch {
    return null;
  }
}

// A ?yl= value: a share code, or plain lines (the community gallery links those). Null if neither.
export async function readYL(v) {
  if (typeof v !== "string" || !v.trim()) return null;
  return (await decodeYL(v)) ?? (v.length <= 4000 ? v : null);
}

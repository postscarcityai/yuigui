// The chat's session (SITE-64): one signed cookie, no account. It holds the chat's id, how many
// turns it has used, whether Turnstile passed and whether the visitor already left their details.
// Signed with HMAC so the counts can't be edited in the browser; clearing it starts a new chat,
// which the per-IP limits in the route still catch.
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const COOKIE = "yui_chat";
export const FREE_TURNS = 3;   // before the Turnstile check
export const MAX_TURNS = 40;   // per chat, after it

function secret() {
  const s = process.env.YUI_CHAT_SECRET || process.env.YUI_SUPABASE_SERVICE_ROLE_KEY || process.env.YUI_CHAT_OPENROUTER_KEY;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("chat: no secret to sign sessions with");
  return "yui-chat-dev-only";
}
const sign = (body) => createHmac("sha256", `yui-chat:${secret()}`).update(body).digest("base64url");

export function newSession() {
  return { id: randomUUID(), turns: 0, verified: false, contact: false, asked: false };
}

export function readSession(cookieValue) {
  const [body, mac] = String(cookieValue || "").split(".");
  if (!body || !mac) return null;
  const want = Buffer.from(sign(body)), got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const s = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return typeof s.id === "string" ? s : null;
  } catch { return null; }
}

export function sessionCookie(s) {
  const body = Buffer.from(JSON.stringify(s)).toString("base64url");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${body}.${sign(body)}; Path=/api/chat; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`;
}

// IPs are never stored as they are: a salted hash, enough to count one visitor's chats.
export const hashIp = (ip) => createHash("sha256").update(`${secret()}:${ip}`).digest("hex").slice(0, 32);

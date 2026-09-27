// Is the site chat on (SITE-64)? Only when everything it needs is set, so it never goes live half
// configured: the OpenRouter key always; in production also Supabase (every chat is kept) and
// Turnstile (the check after the free turns). Local dev needs only the key.
export const turnstileOn = () => Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

export function chatOn() {
  if (!process.env.YUI_CHAT_OPENROUTER_KEY || process.env.YUI_CHAT_OFF === "1") return false;
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(process.env.YUI_SUPABASE_URL && process.env.YUI_SUPABASE_SERVICE_ROLE_KEY && turnstileOn());
}

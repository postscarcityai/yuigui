// Is the site chat on (SITE-64)? The OpenRouter key always; in production also Supabase, because
// every chat is kept. Turnstile (the check after the free turns) is added when its keys are set;
// until then a chat stops sooner (NO_CHECK_TURNS in the route). Local dev needs only the key.
export const turnstileOn = () => Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

export function chatOn() {
  if (!process.env.YUI_CHAT_OPENROUTER_KEY || process.env.YUI_CHAT_OFF === "1") return false;
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(process.env.YUI_SUPABASE_URL && process.env.YUI_SUPABASE_SERVICE_ROLE_KEY);
}

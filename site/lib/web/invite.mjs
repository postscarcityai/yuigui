// Invites on the web (YUI-241), the twin of Account.inviteCode(in:) and SignInView's invite code sheet.
// yuigui.com/i/<code> hands over to /web?invite=<code>.
const KEY = "yui-web-invite";

// "abcde-fghjk", "ABCDE FGHJK" -> "ABCDE-FGHJK". Same rule as the app and yui-auth: 6 to 32 letters and numbers.
export function cleanInvite(raw) {
  const n = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (n.length < 6 || n.length > 32) return null;
  return n.length === 10 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
}

// Reads ?invite= once, removes it from the address bar (and so the history), and keeps it for the tab
// (sessionStorage) so a reload or the Apple popup does not lose it. Returns the code or null.
export function inviteFromLocation(loc, storage, history = globalThis.history) {
  let code = null;
  try { code = cleanInvite(new URLSearchParams(loc.search).get("invite")); } catch { /* none */ }
  if (code) {
    try { storage.setItem(KEY, code); } catch { /* private mode */ }
    try {
      const u = new URL(loc.href);
      u.searchParams.delete("invite");
      history?.replaceState(history.state, "", u.pathname + (u.search || "") + u.hash);
    } catch { /* no history to clean */ }
    return code;
  }
  try { return cleanInvite(storage.getItem(KEY)); } catch { return null; }
}

// Same words as the app (Account.inviteFailed).
export function inviteNotice(reason) {
  return reason === "rate_limited" || reason === "too_many_requests"
    ? "Too many invite codes tried. Wait a few minutes and open the link again."
    : "That invite code didn't work. It may be used already. Ask for a new link.";
}

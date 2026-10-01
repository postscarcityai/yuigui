"use client";
// Yui on the web, the shell and the sign in (YUI-241). The session lives in lib/web/auth.mjs; this draws it:
// Sign in with Apple (a popup, a per attempt nonce and state), an invite that rides along like the app's,
// the demo code, then the signed in account. Sign out ends this browser's session only.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createAuth, browserDeps } from "../../lib/web/auth.mjs";
import { APPLE_JS, APPLE_WEB_CLIENT_ID, REDIRECT_URI } from "../../lib/web/config.mjs";
import { cleanInvite, inviteFromLocation, inviteNotice } from "../../lib/web/invite.mjs";
import { sha256Hex, randomHex } from "../../lib/web/nonce.mjs";
import "./web.css";

const INVITE_KEY = "yui-web-invite";

export default function WebApp() {
  const auth = useMemo(() => (typeof window === "undefined" ? null : createAuth(browserDeps())), []);
  const [snap, setSnap] = useState({ ready: false, signedIn: false, user: null });
  const [invite, setInvite] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!auth) return;
    const off = auth.subscribe(setSnap);
    // An invite link (/web?invite=ABCDE-FGHJK, handed over from yuigui.com/i/<code>): keep the code for the
    // sign in, take it out of the address bar and the history at once.
    const code = inviteFromLocation(window.location, window.sessionStorage);
    if (code) setInvite(code);
    auth.restore();
    return () => { off(); auth.close(); };
  }, [auth]);

  // Signed in with an invite waiting (a link opened after sign in): claim it now, like the app.
  useEffect(() => {
    if (!auth || !snap.signedIn || !invite) return;
    let live = true;
    auth.call("yui-auth", { grant_type: "invite", code: invite })
      .then(() => live && setNotice(""))
      .catch((e) => live && setNotice(inviteNotice(e.code)))
      .finally(() => { if (live) { setInvite(null); try { sessionStorage.removeItem(INVITE_KEY); } catch {} } });
    return () => { live = false; };
  }, [auth, snap.signedIn, invite]);

  return (
    <div className="web">
      <ThemeButton />
      {!snap.ready ? <div className="web-boot" role="status" aria-label="Loading"><span className="web-dot" /></div>
        : snap.signedIn ? <Account auth={auth} snap={snap} notice={notice} />
        : <SignIn auth={auth} invite={invite} setInvite={setInvite} notice={notice} setNotice={setNotice} />}
    </div>
  );
}

function ThemeButton() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);
  const flip = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("yui-theme", next); } catch {}
    setDark(!dark);
  };
  return (
    <button type="button" className="web-theme" onClick={flip} aria-label={dark ? "Switch to light" : "Switch to dark"}>
      {dark ? "☀" : "☾"}
    </button>
  );
}

function Wordmark() {
  return <img className="web-mark" src="/brand/yui-wordmark-coral.png" alt="Yui" width="156" height="100" />;
}

// Sign in with Apple JS needs its popup opened straight from the tap, so the nonce and the state are made
// ahead (at load and after every attempt) and signIn() is called with nothing awaited before it.
function useApple(onResult) {
  const [state, setState] = useState("loading"); // loading | ready | blocked
  const attempt = useRef(null);
  const cb = useRef(onResult);
  cb.current = onResult;

  const prepare = useCallback(async () => {
    const raw = randomHex(32), st = randomHex(16);
    const hash = await sha256Hex(raw);
    attempt.current = { raw, st };
    window.AppleID.auth.init({ clientId: APPLE_WEB_CLIENT_ID, scope: "email", redirectURI: REDIRECT_URI, state: st, nonce: hash, usePopup: true });
  }, []);

  useEffect(() => {
    let dead = false;
    const go = () => prepare().then(() => !dead && setState("ready")).catch(() => !dead && setState("blocked"));
    if (window.AppleID?.auth) { go(); return () => { dead = true; }; }
    const s = document.createElement("script");
    s.src = APPLE_JS; s.async = true;
    s.onload = go; s.onerror = () => !dead && setState("blocked");
    document.head.appendChild(s);
    return () => { dead = true; };
  }, [prepare]);

  const signIn = useCallback(async () => {
    const a = attempt.current;
    let res;
    try { res = await window.AppleID.auth.signIn(); }
    catch (e) { prepare().catch(() => {}); return cb.current({ cancelled: e?.error === "popup_closed_by_user" || e?.error === "user_cancelled_authorize", error: e?.error }); }
    prepare().catch(() => {});
    const auth = res?.authorization;
    if (!auth?.id_token || auth.state !== a.st) return cb.current({ error: "state" });
    return cb.current({ identityToken: auth.id_token, authorizationCode: auth.code, nonce: a.raw });
  }, [prepare]);

  return { state, signIn };
}

function SignIn({ auth, invite, setInvite, notice, setNotice }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(null); // "invite" | "demo"
  const apple = useApple(async (r) => {
    if (r.cancelled) return;
    if (r.error) { setError("Sign in with Apple did not finish. Try again."); return; }
    setBusy(true); setError("");
    try {
      const reply = await auth.signInApple({ ...r, inviteCode: invite || undefined });
      if (reply.invite || reply.invite_error) { setInvite(null); try { sessionStorage.removeItem(INVITE_KEY); } catch {} }
      if (reply.invite_error) setNotice(inviteNotice(reply.invite_error));
    } catch (e) {
      setError(signInMessage(e.code));
    } finally { setBusy(false); }
  });

  const demo = async (code) => {
    setBusy(true); setError("");
    try { await auth.signInReview(code); } catch (e) { setError(e.code === "invalid_grant" ? "That demo code did not work." : signInMessage(e.code)); }
    finally { setBusy(false); }
  };

  return (
    <main className="web-card" aria-labelledby="web-h">
      <Wordmark />
      <h1 id="web-h">Yui, on the web</h1>
      <p className="web-sub">Your agents, drawn as screens.</p>
      <button type="button" className="web-apple" disabled={busy || apple.state !== "ready"} onClick={apple.signIn}>
        <svg viewBox="0 0 384 512" width="17" height="20" aria-hidden="true"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
        <span>{busy ? "Signing in" : "Sign in with Apple"}</span>
      </button>
      {error && <p className="web-error" role="alert">{error}</p>}
      {apple.state === "blocked" && <p className="web-error" role="alert">Apple's sign in did not load. Check your connection, or turn off a blocker for this page, then reload.</p>}
      {notice && <p className="web-note" role="status">{notice}</p>}
      {invite && (
        <p className="web-pill" data-testid="pending-invite">
          <span>Invite {invite} is ready. Sign in to join.</span>
          <button type="button" aria-label="Remove invite" onClick={() => { setInvite(null); try { sessionStorage.removeItem(INVITE_KEY); } catch {} }}>×</button>
        </p>
      )}
      <nav className="web-links" aria-label="More">
        <a href="/start">How it works</a>
        <a href="/privacy">Your data</a>
        <button type="button" onClick={() => setPanel(panel === "invite" ? null : "invite")}>Invite code</button>
        <button type="button" onClick={() => setPanel(panel === "demo" ? null : "demo")}>Demo code</button>
      </nav>
      {panel === "invite" && <CodeForm key="invite" label="Invite code" hint="It is in your invite link, like ABCDE-FGHJK. Then sign in with Apple and your invite comes with you." cta="Use code"
        check={(v) => (cleanInvite(v) ? "" : "That does not look like an invite code. It has 10 letters and numbers.")}
        onSubmit={(v) => { setInvite(cleanInvite(v)); try { sessionStorage.setItem(INVITE_KEY, cleanInvite(v)); } catch {} setPanel(null); }} />}
      {panel === "demo" && <CodeForm key="demo" label="Demo code" hint="For App Review and demos. It opens one shared demo account." cta="Open the demo" busy={busy} onSubmit={demo} />}
    </main>
  );
}

function CodeForm({ label, hint, cta, check, onSubmit, busy }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <form className="web-form" onSubmit={(e) => { e.preventDefault(); const m = check?.(v); if (m) setErr(m); else if (v.trim()) onSubmit(v.trim()); }}>
      <label htmlFor="web-code">{label}</label>
      <input id="web-code" value={v} onChange={(e) => { setV(e.target.value); setErr(""); }} autoComplete="off" autoCapitalize="characters" spellCheck="false" autoFocus />
      <p className="web-hint">{hint}</p>
      {err && <p className="web-error" role="alert">{err}</p>}
      <button type="submit" className="web-btn" disabled={busy || !v.trim()}>{cta}</button>
    </form>
  );
}

function Account({ auth, snap, notice }) {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    auth.call("yui-account", { action: "get" })
      .then((r) => live && setMe(r.user))
      .catch((e) => live && setError(e.code === "network" ? "You look offline. Your session is kept." : "Could not load your account."));
    return () => { live = false; };
  }, [auth]);
  const email = me?.email || snap.user?.email;
  return (
    <main className="web-card" aria-labelledby="web-h">
      <Wordmark />
      <h1 id="web-h">You are signed in</h1>
      <div className="web-account" data-testid="account">
        <div className="web-avatar" aria-hidden="true">{(email || "Y")[0].toUpperCase()}</div>
        <div>
          <div className="web-email" data-testid="account-email">{email || "Hidden email"}</div>
          <div className="web-hint">Signed in on this browser</div>
        </div>
      </div>
      {notice && <p className="web-note" role="status">{notice}</p>}
      {error && <p className="web-error" role="alert">{error}</p>}
      <p className="web-hint">Your agents and threads land here next. Open this page in another tab or reload: you stay signed in.</p>
      <button type="button" className="web-btn ghost" onClick={() => auth.signOut()}>Sign out</button>
    </main>
  );
}

function signInMessage(code) {
  if (code === "network") return "Could not reach Yui. Check your connection and try again.";
  if (code === "invalid_grant") return "Apple's answer did not check out. Try again.";
  if (code === "account_suspended" || code === "suspended") return "This account is paused.";
  return "Could not sign you in. Try again in a moment.";
}

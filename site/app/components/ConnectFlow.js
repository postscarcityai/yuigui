"use client";
// The OAuth sign-in page for the Yui MCP server (INT-19, spec/MCP.md "OAuth").
// An MCP client (Claude, ChatGPT, Cursor) sends the browser here from
// yui-oauth/authorize with a request id. The person approves on their phone:
// "Open Yui" (same phone) or a QR of the universal link /a/<id> (a laptop),
// or types the 6-digit code from Agents > Add agent. The page polls yui-oauth;
// once approved it goes back to the client with the code. The page never sees
// a token: the code it forwards only works with the client's PKCE verifier.
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const OAUTH = "https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-oauth";
const POLL_MS = 2000;

async function call(body) {
  const r = await fetch(OAUTH, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}

const CODE_ERRORS = {
  invalid_code: "Type the 6 digits the app shows.",
  invalid_or_expired_code: "That code didn't work. Codes last ten minutes and work once. Add the agent again for a new one.",
  too_many_attempts: "Too many codes tried. Wait ten minutes and try again.",
  account_suspended: "This Yui account is switched off.",
};

export default function ConnectFlow({ id }) {
  const [req, setReq] = useState(null);
  const [state, setState] = useState("loading"); // loading | pending | leaving | gone
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [busy, setBusy] = useState(false);
  const left = useRef(false);

  const leave = useCallback((url) => {
    if (left.current) return;
    left.current = true;
    setState("leaving");
    window.location.replace(url);
  }, []);

  const poll = useCallback(async () => {
    const { status, data } = await call({ action: "request", id });
    if (status !== 200) {
      setState("gone");
      return;
    }
    setReq(data);
    if (data.redirect) return leave(data.redirect);
    setState(data.status === "pending" ? "pending" : "gone");
  }, [id, leave]);

  useEffect(() => {
    poll();
    const t = setInterval(() => {
      if (!left.current && document.visibilityState === "visible") poll();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    QRCode.toString(`https://www.yuigui.com/a/${id}`, { type: "svg", margin: 1, errorCorrectionLevel: "M" })
      .then(setQr).catch(() => setQr(""));
  }, [id]);

  async function submitCode(e) {
    e.preventDefault();
    setBusy(true);
    setCodeError("");
    const { status, data } = await call({ action: "code", id, code });
    setBusy(false);
    if (status === 200) return poll();
    setCodeError(CODE_ERRORS[data.error] || data.error_description || "That didn't work. Try again.");
  }

  async function deny() {
    const { data } = await call({ action: "deny", id });
    if (data.redirect) leave(data.redirect);
    else poll();
  }

  const name = req?.client?.name || "This app";
  if (state === "loading") return <p className="lede">Loading...</p>;
  if (state === "leaving") {
    return (
      <>
        <div className="eyebrow">Connect</div>
        <h1>{req?.status === "denied" ? "Not connected." : "Connected."}</h1>
        <p className="lede">Taking you back to {name}...</p>
      </>
    );
  }
  if (state === "gone") {
    const why = req?.status === "expired"
      ? "This sign-in expired. It lasts 15 minutes."
      : req?.status
      ? "This sign-in is finished already."
      : "This sign-in link doesn't exist.";
    return (
      <>
        <div className="eyebrow">Connect</div>
        <h1>Nothing to approve here.</h1>
        <p className="lede">{why} Go back to your app and add Yui again.</p>
      </>
    );
  }
  return (
    <>
      <div className="eyebrow">Connect</div>
      <h1>Connect {name} to Yui</h1>
      <p className="lede">
        {name}{req.client.site ? <> (<strong>{req.client.site}</strong>)</> : null} wants to put screens on your phone and
        read your taps, in one Yui thread you pick. It can't see your other threads.
      </p>
      <ol className="steps">
        <li>
          <div className="card connect-phone">
            <h3>Approve on your iPhone</h3>
            <p>On this iPhone, tap the button. On a computer, scan the code with your iPhone camera. Yui opens and asks which agent {name} talks as.</p>
            <div className="connect-row">
              <a className="btn" href={`yui://connect/${id}`}>Open Yui</a>
              {qr && <div className="connect-qr" role="img" aria-label="QR code that opens Yui" dangerouslySetInnerHTML={{ __html: qr }} />}
            </div>
          </div>
        </li>
        <li>
          <form className="card" onSubmit={submitCode}>
            <h3>Or type a code</h3>
            <p>
              In Yui, tap <strong>Agents</strong>, then <strong>Add agent</strong>. Name it {name}. Type the 6-digit code it shows.
            </p>
            <div className="inv-grid">
              <label className="inv-wide">
                Code
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={7}
                  placeholder="123456"
                  aria-describedby="connect-code-err"
                />
              </label>
            </div>
            <p style={{ marginTop: 14 }}>
              <button className="btn" disabled={busy || code.replace(/\D/g, "").length !== 6}>{busy ? "Connecting..." : "Connect"}</button>
            </p>
            {codeError && <p id="connect-code-err" className="wl-err">{codeError}</p>}
          </form>
        </li>
      </ol>
      <p style={{ color: "var(--muted)" }}>
        Not you, or changed your mind? <button className="linkish" onClick={deny}>Cancel</button>. You can remove {name} any
        time in Yui under Agents. <a href="/developers/mcp">How this works</a>.
      </p>
    </>
  );
}

"use client";
// Share this screen (SITE-19): copy the link, hand it to the phone's share sheet, or copy an
// iframe that draws it live on another site. With `md` (SITE-77, AgentBox) it also copies the page
// as markdown for an agent.
import { useEffect, useState } from "react";
import { trackCta } from "../../lib/track.mjs";
import { SITE, embedSnippet } from "../../lib/share-code.mjs";

// Fetch inside the click, so Safari still counts it as the tap that allows a copy.
function copyFrom(src) {
  const text = fetch(src).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))));
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    const blob = text.then((t) => new Blob([t], { type: "text/plain" }));
    return navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]).catch(() => text.then((t) => navigator.clipboard.writeText(t)));
  }
  return text.then((t) => navigator.clipboard.writeText(t));
}

export default function ShareBar({ path, title, embed, md, label = "Share this screen" }) {
  const [said, setSaid] = useState("");
  const [done, setDone] = useState("");
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);
  const url = `${SITE}${path}`;

  const flash = (t, what = "") => { setSaid(t); setDone(what); setTimeout(() => { setSaid(""); setDone(""); }, 1600); };
  const copied = (what) => { flash(`${what} copied`, what); trackCta(`share:${what}`, path); };
  const copy = (text, what) => navigator.clipboard?.writeText(text).then(() => copied(what));
  const copyPage = () => copyFrom(md).then(() => copied("Page"), () => flash("Copy failed. Open the page link instead."));
  const share = () => navigator.share({ title, url }).then(() => trackCta("share:sheet", path)).catch(() => {});
  const said1 = (what, text) => (done === what ? "Copied" : text);

  return (
    <div className="share-bar" role="group" aria-label={label}>
      <button type="button" className="btn" onClick={() => copy(url, "Link")} aria-label={`Copy link: ${url}`}>{said1("Link", "Copy link")}</button>
      {md ? <button type="button" className="btn soft" onClick={copyPage} aria-label="Copy page as text for your agent">{said1("Page", "Copy page")}</button> : null}
      {canShare ? <button type="button" className="btn soft" onClick={share}>Share</button> : null}
      {embed ? <button type="button" className="btn ghost" onClick={() => copy(embedSnippet(embed, title), "Embed code")}>{said1("Embed code", "Copy embed code")}</button> : null}
      <span className="share-said" aria-live="polite">{said}</span>
    </div>
  );
}

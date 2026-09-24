"use client";
// Share this screen (SITE-19): copy the link, hand it to the phone's share sheet, or copy an
// iframe that draws it live on another site.
import { useEffect, useState } from "react";
import { trackCta } from "../../lib/track.mjs";
import { SITE, embedSnippet } from "../../lib/share-code.mjs";

export default function ShareBar({ path, title, embed }) {
  const [said, setSaid] = useState("");
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && !!navigator.share), []);
  const url = `${SITE}${path}`;

  const flash = (t) => { setSaid(t); setTimeout(() => setSaid(""), 1600); };
  const copy = (text, what) => navigator.clipboard?.writeText(text).then(() => { flash(`${what} copied`); trackCta(`share:${what}`, path); });
  const share = () => navigator.share({ title, url }).then(() => trackCta("share:sheet", path)).catch(() => {});

  return (
    <div className="share-bar" role="group" aria-label="Share this screen">
      <button type="button" className="btn" onClick={() => copy(url, "Link")}>Copy link</button>
      {canShare ? <button type="button" className="btn soft" onClick={share}>Share</button> : null}
      {embed ? <button type="button" className="btn ghost" onClick={() => copy(embedSnippet(embed, title), "Embed code")}>Copy embed code</button> : null}
      <span className="share-said" aria-live="polite">{said}</span>
    </div>
  );
}

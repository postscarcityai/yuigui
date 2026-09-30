"use client";
// SITE-133: the bubble paints with the page, the chat behind it does not. ChatFab (36KB plus the stage,
// the pager and the chat libraries) loads a few seconds after the page has loaded, or the moment a
// visitor reaches for the bubble. Same markup and classes as ChatFab's own button, so nothing moves.
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackCta } from "../../lib/track.mjs";
import "./chatfab.css";

export default function ChatFabLoader() {
  const path = usePathname() || "/";
  const [go, setGo] = useState(false);
  const [Chat, setChat] = useState(null);
  const [openNow, setOpenNow] = useState(false);
  useEffect(() => {
    let t;
    const start = () => { t = setTimeout(() => setGo(true), 3500); };
    if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
    return () => { window.removeEventListener("load", start); if (t) clearTimeout(t); };
  }, []);
  // The button stays put until the chat code is here, then the chat takes its place.
  useEffect(() => { if (go) import("./ChatFab").then((m) => setChat(() => m.default)); }, [go]);
  if (Chat) return <Chat autoOpen={openNow} />;
  const wake = () => setGo(true);
  return (
    <div className="yc">
      <button className="yc-fab" onPointerEnter={wake} onFocus={wake} onTouchStart={wake} onClick={() => { trackCta("chat-open", path); setOpenNow(true); setGo(true); }} aria-label="Chat with Yui" aria-expanded={false}>
        <span className="yc-blob yc-blob-b" aria-hidden="true" />
        <span className="yc-blob yc-blob-a" aria-hidden="true" />
        <span className="yc-mark" aria-hidden="true" />
        <span className="yc-close" aria-hidden="true" />
      </button>
    </div>
  );
}

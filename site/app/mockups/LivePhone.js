"use client";
// One phone that draws a Yui Lines reply with the playground's renderers (SITE-14).
// It mounts a screen or so before it scrolls into view, so a page of forty phones stays light.
// The renderers are a separate chunk (SITE-41): a page downloads them only when its first phone mounts.
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Wait = () => <div className="screen"><div className="sc-wait">Drawing the screen...</div></div>;
const Screen = dynamic(() => import("./LiveScreen"), { loading: Wait });

export default function LivePhone({ yl, agent = "Yui", light = false, label, eager = false }) {
  const box = useRef(null);
  const [on, setOn] = useState(eager);
  useEffect(() => {
    const el = box.current;
    if (!el || on) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);
  return (
    <div className="phone sc-phone" ref={box} role="group" aria-label={label}>
      {on ? <Screen yl={yl} agent={agent} light={light} /> : <Wait />}
    </div>
  );
}

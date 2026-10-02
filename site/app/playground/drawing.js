"use client";

// draw (spec/YL.md, draw): the agent just draws. Its SVG runs in a sandboxed frame
// (lib/yl/drawpage.mjs builds the page): scripts may run, but the frame has no origin
// of its own, a content policy that loads nothing from anywhere, no storage, no links
// out and no touch. The frame gets the agent's colors from this screen's look, read
// when it draws and again when the screen turns light or dark. Reduce Motion shows it
// finished. Sends nothing.
import { useEffect, useRef, useState } from "react";
import { DRAW_DEFAULTS, drawPage, drawRatio } from "../../lib/yl/drawpage.mjs";

// The screen's look, as the drawing's color names.
const LOOK = {
  ink: "--yl-ink", soft: "--yl-ink2", accent: "--accent", mint: "--yl-c3", lavender: "--yl-c1",
  butter: "--yl-c4", good: "--yl-good", bad: "--yl-bad", ground: "--screen-bg",
};

function readLook(el) {
  const cs = getComputedStyle(el);
  const colors = Object.fromEntries(Object.entries(LOOK).map(([k, v]) => [k, cs.getPropertyValue(v).trim() || DRAW_DEFAULTS[k]]));
  const screen = el.closest(".screen");
  const dark = screen ? !screen.classList.contains("light") : !matchMedia("(prefers-color-scheme: light)").matches;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { colors, dark, still };
}

// Set here as well as in draw.css, so a page that does not load that sheet (the Telegram
// Mini App) still gets the shape and a frame nothing can touch.
const FRAME = { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, display: "block", background: "transparent", pointerEvents: "none" };

export function Drawing({ p }) {
  const box = useRef(null);
  const [look, setLook] = useState(null);
  const source = typeof p.source === "string" ? p.source : "";

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const read = () => setLook((old) => {
      const now = readLook(el);
      return old && JSON.stringify(old) === JSON.stringify(now) ? old : now;
    });
    read();
    const screen = el.closest(".screen");
    const seen = screen ? new MutationObserver(read) : null;
    if (seen) seen.observe(screen, { attributes: true, attributeFilter: ["class", "style"] });
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener?.("change", read);
    return () => { seen?.disconnect(); motion.removeEventListener?.("change", read); };
  }, []);

  const label = [p.title || "Drawing", p.caption].filter(Boolean).join(". ");
  return (
    <div className="yl-block yl-drawing" ref={box} role="img" aria-label={label}>
      {p.title ? <div className="dr-title" aria-hidden="true">{p.title}</div> : null}
      {/* Nothing to draw until the markup has landed (a reply still streaming). */}
      {source ? (
        <div className="dr-frame" style={{ position: "relative", width: "100%", aspectRatio: String(drawRatio(p.ratio, source)) }}>
          {look ? (
            <iframe
              title={p.title || "Drawing"}
              aria-hidden="true"
              tabIndex={-1}
              sandbox="allow-scripts"
              referrerPolicy="no-referrer"
              style={{ ...FRAME, colorScheme: look.dark ? "dark" : "light" }}
              srcDoc={drawPage(source, look.colors, { dark: look.dark, still: look.still })}
            />
          ) : null}
        </div>
      ) : null}
      {p.caption ? <p className="dr-cap" aria-hidden="true">{p.caption}</p> : null}
    </div>
  );
}

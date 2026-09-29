"use client";
// Pull a full-screen answer down to put it away (SITE-98, spec/YL.md section 5, "A way home"). Touch only:
// the card follows the finger at about half speed (a small rubber-band), a long enough pull closes it,
// a short one springs back. A pull that starts sideways, on a control, or while the content is scrolled
// down belongs to that. Local: closing sends nothing anywhere.
import { useRef, useState } from "react";

export const PULL_CLOSE = 110;   // px of finger travel that closes
const RUBBER = 0.55;             // how much of the pull the card follows
const OWN = "input, textarea, select, [role=slider], [data-nopull]";

export function useDragDown(onClose) {
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const t = useRef(null);
  const raw = useRef(0);

  const onTouchStart = (e) => {
    t.current = null;
    if (e.touches.length !== 1 || e.target.closest?.(OWN)) return;
    // Scrolled down inside: the finger is scrolling back up, not pulling the card.
    for (let el = e.target; el && el !== e.currentTarget; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight + 1 && el.scrollTop > 0 && /auto|scroll/.test(getComputedStyle(el).overflowY)) return;
    }
    t.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, axis: null };
    raw.current = 0;
  };
  const onTouchMove = (e) => {
    const s = t.current;
    if (!s) return;
    const x = e.touches[0].clientX - s.x, y = e.touches[0].clientY - s.y;
    if (!s.axis && Math.hypot(x, y) > 8) s.axis = y > 0 && Math.abs(y) > Math.abs(x) ? "y" : "x";
    if (s.axis !== "y") return;
    raw.current = Math.max(0, y);
    setDragging(true);
    setDy(raw.current * RUBBER);
  };
  const end = () => {
    const s = t.current;
    t.current = null;
    if (!s || s.axis !== "y") return;
    const close = raw.current > PULL_CLOSE;
    raw.current = 0;
    setDragging(false);
    setDy(0);
    if (close) onClose();
  };
  return {
    dragging,
    style: dy || dragging ? { transform: `translateY(${dy}px)`, transition: dragging ? "none" : undefined } : undefined,
    handlers: { onTouchStart, onTouchMove, onTouchEnd: end, onTouchCancel: end },
  };
}

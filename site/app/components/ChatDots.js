"use client";
// The site chat's pages (SITE-83), the app's YUI-187/189: the dots in the bottom bar and the one
// sideways gesture. The dots sit centered in the bar's free room, the pill stretches toward the next
// dot and slides with the finger, a tap on a dot jumps there, and past seven only the nearest show,
// the ones at a cut edge faded and smaller (lib/chat/pages.mjs lays them out like PageDots).
// A swipe anywhere on the chat pages (touch or a trackpad); a control that needs a sideways drag
// (keys, pads, a map, a slider) keeps it inside its own frame.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DOTS, dotAt, dotsView } from "../../lib/chat/pages.mjs";

const OWN_DRAG = "input, textarea, select, [role=slider], canvas, .yl-map, .yl-keys, .yl-drums, .yl-pad, .yl-loop, .yl-game, .yl-deck, [data-own-drag]";
const EASE = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); // a little past, then settles

// The sideways gesture. n screens, `at` the one on show, go(i) moves there.
export function usePager(n, at, go) {
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const box = useRef(null), touch = useRef(null), wheel = useRef({ sum: 0, until: 0, t: null });

  const onTouchStart = useCallback((e) => {
    touch.current = n > 1 && !e.target.closest?.(OWN_DRAG) && e.touches.length === 1
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t0: Date.now(), axis: null, dx: 0 } : null;
  }, [n]);
  const onTouchMove = useCallback((e) => {
    const t = touch.current;
    if (!t) return;
    const dx = e.touches[0].clientX - t.x, dy = e.touches[0].clientY - t.y;
    if (!t.axis) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) t.axis = "x";
      else if (Math.abs(dy) > 10) t.axis = "y";
    }
    if (t.axis !== "x") return;
    t.dx = dx;
    // Past the first or the last screen it pulls, a third as far.
    const edge = (at === 0 && dx > 0) || (at === n - 1 && dx < 0);
    setDrag(edge ? dx / 3 : dx);
    setDragging(true);
  }, [at, n]);
  const onTouchEnd = useCallback(() => {
    const t = touch.current;
    touch.current = null;
    if (!t || t.axis !== "x") return;
    const w = box.current?.clientWidth || 390;
    const v = t.dx / Math.max(1, Date.now() - t.t0);
    if ((t.dx < -w * 0.18 || v < -0.45) && at < n - 1) go(at + 1);
    else if ((t.dx > w * 0.18 || v > 0.45) && at > 0) go(at - 1);
    setDrag(0);
    setDragging(false);
  }, [at, n, go]);
  // A trackpad's two-finger swipe: one page per swipe, then it waits for the swipe to end.
  const onWheel = useCallback((e) => {
    if (n < 2 || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || e.target.closest?.(OWN_DRAG)) return;
    const w = wheel.current, now = Date.now();
    clearTimeout(w.t);
    w.t = setTimeout(() => { w.sum = 0; }, 160);
    if (now < w.until) { w.until = now + 160; return; }
    w.sum += e.deltaX;
    if (Math.abs(w.sum) < 40) return;
    const next = at + Math.sign(w.sum);
    w.sum = 0;
    w.until = now + 450;
    if (next >= 0 && next < n) go(next);
  }, [at, n, go]);
  useEffect(() => () => clearTimeout(wheel.current.t), []);

  const width = box.current?.clientWidth || 390;
  return { box, drag, dragging, progress: at - drag / width, handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel: onTouchEnd, onWheel } };
}

// Follows `to` with a spring (straight there while dragging or under Reduce Motion), so a jump
// shows the pill stretch and slide like the app's.
function useSpring(to, follow, still) {
  const [v, setV] = useState(to);
  const cur = useRef(to);
  useEffect(() => {
    if (follow || still) { cur.current = to; setV(to); return undefined; }
    const from = cur.current, t0 = performance.now(), ms = 420;
    if (from === to) return undefined;
    let raf = 0;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      cur.current = from + (to - from) * EASE(k);
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, follow, still]);
  return v;
}

// names: ["1", "2", "5"], the chat first. index: the one on show. progress: where the pager is.
export function PageDots({ names, index, progress, dragging, still, onGo }) {
  const n = names.length;
  const box = useRef(null);
  const [room, setRoom] = useState(null);
  useLayoutEffect(() => {
    const el = box.current?.parentElement;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const measure = () => {
      const cs = getComputedStyle(el);
      setRoom(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [n > 1]);
  const p = useSpring(progress, dragging, still);
  if (n < 2) return null;
  const v = dotsView(n, p, room);
  const tap = (e) => {
    const r = box.current.getBoundingClientRect();
    const k = dotAt(n, index, room, e.clientX - r.left - DOTS.pad);
    if (k !== index) onGo(k);
  };
  const name = (i) => (i === 0 ? "Chat" : `Screen ${names[i]}`);
  return (
    <div ref={box} className="ys-dots" style={{ width: v.width + 2 * DOTS.pad }} onClick={tap}
      role="slider" tabIndex={0} aria-label="Screens" aria-valuemin={1} aria-valuemax={n} aria-valuenow={index + 1}
      aria-valuetext={`${name(index)}, ${index + 1} of ${n}`}>
      {v.dots.map((d) => (
        <i key={names[d.k]} className={d.cut ? "cut" : undefined} style={{ left: DOTS.pad + d.x - DOTS.dot / 2, opacity: d.fade }} />
      ))}
      <b style={{ left: DOTS.pad + v.pillX - v.pillW / 2, width: v.pillW }} />
    </div>
  );
}

"use client";
// Reduce Motion and the site's light/dark, read live. Shared by the proposal heroes.
import { useEffect, useState } from "react";

export default function usePrefs() {
  const [reduced, setReduced] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const r = () => setReduced(mq.matches);
    r(); mq.addEventListener("change", r);
    const el = document.documentElement;
    const read = () => setDark(el.dataset.theme === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { mq.removeEventListener("change", r); mo.disconnect(); };
  }, []);
  return { reduced, dark };
}

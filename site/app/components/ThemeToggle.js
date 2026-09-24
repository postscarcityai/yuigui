"use client";
import { useEffect, useState } from "react";

// Light is the default. The choice is saved as `yui-theme` and applied before paint
// by the inline script in layout.js, so there is no flash on load.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  useEffect(() => { setTheme(document.documentElement.dataset.theme || "light"); }, []);

  function flip() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("yui-theme", next); } catch {}
    setTheme(next);
  }

  const dark = theme === "dark";
  return (
    <button type="button" className="toggle" onClick={flip} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark ? (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="5" /><g stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" /></g></svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" /></svg>
      )}
    </button>
  );
}

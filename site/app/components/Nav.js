"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

// Desktop shows `primary` in the bar and tucks `more` behind a disclosure. Under 960px
// both collapse into one panel behind the menu button (SITE-8).
const primary = [
  ["/start", "Get started"],
  ["/roadmap", "Roadmap"],
  ["/progress", "Progress"],
  ["/changelog", "Changelog"],
  ["/board", "Board"],
  ["/playground", "Playground"],
];
const more = [
  ["/plan", "Plan"],
  ["/deck", "Deck"],
  ["/mockups", "Mockups"],
  ["/yl", "YL spec"],
  ["/channel", "Channel guide"],
];
const GITHUB = "https://github.com/postscarcityai/yuigui";

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => { setOpen(false); setMoreOpen(false); }, [path]);

  useEffect(() => {
    if (!open && !moreOpen) return;
    function onKey(e) { if (e.key === "Escape") { setOpen(false); setMoreOpen(false); } }
    function onDown(e) {
      if (moreOpen && moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (open && headerRef.current && !headerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open, moreOpen]);

  const cur = (href) => (path === href ? "page" : undefined);
  const inMore = more.some(([href]) => href === path);

  return (
    <header className={open ? "nav open" : "nav"} ref={headerRef}>
      <div className="wrap navin">
        <Link href="/" className="brand" aria-label="Yui home">
          <img src="/brand/yui-wordmark-coral.png" alt="Yui" width="52" height="34" />
        </Link>
        <nav aria-label="Main" className="nav-desk">
          {primary.map(([href, label]) => (
            <Link key={href} href={href} aria-current={cur(href)}>{label}</Link>
          ))}
          <div className="nav-more" ref={moreRef}>
            <button type="button" aria-expanded={moreOpen} aria-controls="nav-more-list" className={inMore ? "on" : undefined} onClick={() => setMoreOpen((v) => !v)}>
              More
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div id="nav-more-list" className="nav-more-list" hidden={!moreOpen}>
              {more.map(([href, label]) => (
                <Link key={href} href={href} aria-current={cur(href)}>{label}</Link>
              ))}
            </div>
          </div>
          <a href={GITHUB} className="nav-gh" target="_blank" rel="noopener">GitHub</a>
        </nav>
        <div className="nav-tools">
          <ThemeToggle />
          <button type="button" className="nav-burger" aria-expanded={open} aria-controls="nav-panel" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      <nav id="nav-panel" aria-label="Menu" className="nav-panel" hidden={!open}>
        <div className="wrap">
          <Link href="/" aria-current={cur("/")}>Home</Link>
          {primary.map(([href, label]) => (
            <Link key={href} href={href} aria-current={cur(href)}>{label}</Link>
          ))}
          <div className="nav-panel-sep" role="presentation" />
          {more.map(([href, label]) => (
            <Link key={href} href={href} aria-current={cur(href)}>{label}</Link>
          ))}
          <a href={GITHUB} className="nav-gh" target="_blank" rel="noopener">GitHub</a>
        </div>
      </nav>
    </header>
  );
}

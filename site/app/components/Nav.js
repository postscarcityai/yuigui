"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";

// Five primary items (SITE-13). A section with more than one page shows its pages in a
// second row under the bar, so nothing hides behind a "More" menu. Under 760px the bar
// collapses into one panel behind the menu button, with each section's pages indented.
export const sections = [
  { href: "/", label: "What it does" },
  { href: "/mockups", label: "See it" },
  {
    href: "/roadmap", label: "Roadmap",
    pages: [["/roadmap", "Roadmap"], ["/board", "Board"], ["/progress", "Shipped"], ["/changelog", "Builds"], ["/timeline", "Timeline"]],
  },
  {
    href: "/developers", label: "Developers",
    pages: [["/developers", "Overview"], ["/playground", "Playground"], ["/yl", "Yui Lines"], ["/developers/specs", "Specs"], ["/channel", "Channel guide"], ["/reactions", "Reactions"], ["/notes", "Notes"]],
  },
  { href: "/start", label: "Get Yui", cta: true },
];

// A page's own subpages (/notes/<slug>) light up its section too.
const sectionOf = (path) => sections.find((s) => s.href === path || s.pages?.some(([href]) => href === path || (href !== "/" && path.startsWith(`${href}/`))));

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => { setOpen(false); }, [path]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    function onDown(e) { if (headerRef.current && !headerRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);

  const cur = (href) => (path === href ? "page" : undefined);
  const here = sectionOf(path);
  const on = (s) => (here === s ? (path === s.href ? "page" : "true") : undefined);

  return (
    <header className={open ? "nav open" : "nav"} ref={headerRef}>
      <div className="wrap navin">
        <Link href="/" className="brand" aria-label="Yui home">
          <img src="/brand/yui-wordmark-coral.png" alt="Yui" width="52" height="34" />
        </Link>
        <nav aria-label="Main" className="nav-desk">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} aria-current={on(s)} className={s.cta ? "nav-cta" : undefined}>{s.label}</Link>
          ))}
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
      {here?.pages && (
        <nav aria-label={here.label} className="subnav">
          <div className="wrap">
            {here.pages.map(([href, label]) => (
              <Link key={href} href={href} aria-current={cur(href)}>{label}</Link>
            ))}
          </div>
        </nav>
      )}
      <nav id="nav-panel" aria-label="Menu" className="nav-panel" hidden={!open}>
        <div className="wrap">
          {sections.map((s) => (
            <div key={s.href} className="nav-panel-group">
              <Link href={s.href} aria-current={cur(s.href)} className={s.cta ? "nav-cta" : undefined}>{s.label}</Link>
              {s.pages?.filter(([href]) => href !== s.href).map(([href, label]) => (
                <Link key={href} href={href} aria-current={cur(href)} className="nav-sub">{label}</Link>
              ))}
            </div>
          ))}
        </div>
      </nav>
    </header>
  );
}

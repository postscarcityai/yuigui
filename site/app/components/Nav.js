"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const links = [
  ["/", "Home"],
  ["/roadmap", "Roadmap"],
  ["/progress", "Progress"],
  ["/changelog", "Changelog"],
  ["/board", "Board"],
  ["/plan", "Plan"],
  ["/deck", "Deck"],
  ["/mockups", "Mockups"],
  ["/playground", "Playground"],
  ["/yl", "YL spec"],
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="nav">
      <div className="wrap navin">
        <Link href="/" className="brand" aria-label="Yui home">
          <img src="/brand/yui-wordmark-coral.png" alt="Yui" width="52" height="34" />
        </Link>
        <nav aria-label="Main">
          {links.map(([href, label]) => (
            <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
          ))}
          <a href="https://github.com/postscarcityai/yuigui" className="nav-gh" target="_blank" rel="noopener">GitHub</a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

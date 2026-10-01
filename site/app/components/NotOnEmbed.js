"use client";
// The site's chrome (nav, Get Yui band, footer) stays off /embed, which lives inside other sites' iframes (SITE-19),
// and off /tg, the Telegram Mini App (INT-4), and off /web, where Yui itself runs in the tab (YUI-241).
import { usePathname } from "next/navigation";

export default function NotOnEmbed({ children }) {
  const p = usePathname() || "";
  return p.startsWith("/embed") || p === "/tg" || p === "/web" || p.startsWith("/web/") ? null : children;
}

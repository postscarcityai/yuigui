"use client";
// The site's chrome (nav, Get Yui band, footer) stays off /embed, which lives inside other sites' iframes (SITE-19),
// and off /tg, the Telegram Mini App (INT-4).
import { usePathname } from "next/navigation";

export default function NotOnEmbed({ children }) {
  const p = usePathname() || "";
  return p.startsWith("/embed") || p === "/tg" ? null : children;
}

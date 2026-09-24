"use client";
// The site's chrome (nav, Get Yui band, footer) stays off /embed, which lives inside other sites' iframes (SITE-19).
import { usePathname } from "next/navigation";

export default function NotOnEmbed({ children }) {
  return usePathname()?.startsWith("/embed") ? null : children;
}

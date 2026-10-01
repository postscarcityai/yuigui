"use client";
// Google tag (gtag.js). It waits for the page to finish loading so its 170KB never slows the first paint (SITE-41).
// Never on /web (YUI-241): Yui itself runs there, signed in, under a Content Security Policy that lets no
// third party script in.
import Script from "next/script";
import { usePathname } from "next/navigation";

export default function Analytics({ id }) {
  const p = usePathname() || "";
  if (p === "/web" || p.startsWith("/web/")) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // An invite link's code never reaches analytics (YUI-56), nor a Mini App's screen (INT-4).
          gtag('config', '${id}', location.pathname.indexOf('/i/') === 0
            ? { page_location: location.origin + '/i/', page_referrer: document.referrer.split('/i/')[0] }
            : location.pathname === '/tg' ? { page_location: location.origin + '/tg', page_referrer: '' } : {});
        `}
      </Script>
    </>
  );
}

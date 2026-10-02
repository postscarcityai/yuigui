// The web client's own viewport (YUI-244): `cover` lets the page draw under a phone's notch and home bar (the
// app pads with the safe-area insets), and a keyboard resizes the content on browsers that can say so.
export const viewport = { viewportFit: "cover", interactiveWidget: "resizes-content" };

// Install (YUI-248): a manifest and a service worker make /web a Mac dock app or a phone Home Screen app, and
// give Web Push somewhere to land. Widgets stay on the iPhone.
export const metadata = {
  manifest: "/web/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Yui", statusBarStyle: "black-translucent" },
};

// YUI-264: /web renders on each request so Next can stamp its inline scripts with the nonce middleware.js minted.
// The rest of the site stays static.
export const dynamic = "force-dynamic";

export default function WebLayout({ children }) { return children; }

// Funnel helpers for the CTAs (SITE-4). No cookies of our own: UTM tags live in sessionStorage
// for one visit so a waitlist signup can say which social post brought it.
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

export function keepUtm() {
  try {
    const q = new URLSearchParams(window.location.search);
    const found = UTM.filter((k) => q.get(k)).map((k) => `${k}=${q.get(k).slice(0, 60)}`);
    if (found.length) sessionStorage.setItem("yui-utm", found.join("&"));
  } catch {}
}

export function savedUtm() {
  try { return sessionStorage.getItem("yui-utm") || null; } catch { return null; }
}

// Google Analytics is already on the page (root layout). A CTA click becomes one event.
export function trackCta(cta, where) {
  try { window.gtag?.("event", "cta_click", { cta, where }); } catch {}
}

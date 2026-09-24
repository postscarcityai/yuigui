"use client";
import { trackCta } from "../../lib/track.mjs";

// An outbound CTA that reports its click to analytics.
export default function CtaLink({ cta, where, className = "btn", children, ...rest }) {
  return (
    <a className={className} target="_blank" rel="noopener" onClick={() => trackCta(cta, where)} {...rest}>{children}</a>
  );
}

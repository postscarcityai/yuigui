"use client";
// A video whose poster loads only as it nears the screen (SITE-41). Browsers fetch every poster up front,
// and See it has dozens, so they crowded out the page itself on a phone connection.
import { useEffect, useRef, useState } from "react";

// eager: the poster is in the page itself, for a film that sits in the first screen and is the largest thing on it (SITE-133).
export default function LazyVideo({ poster, eager = false, ...props }) {
  const ref = useRef(null);
  const [near, setNear] = useState(eager);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return <video ref={ref} poster={near ? poster : undefined} {...props} />;
}

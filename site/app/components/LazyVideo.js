"use client";
// A video whose poster loads only as it nears the screen (SITE-41). Browsers fetch every poster up front,
// and See it has dozens, so they crowded out the page itself on a phone connection.
import { useEffect, useRef, useState } from "react";

export default function LazyVideo({ poster, ...props }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  return <video ref={ref} poster={near ? poster : undefined} {...props} />;
}

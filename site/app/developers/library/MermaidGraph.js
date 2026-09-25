"use client";
// A flow drawn as its Mermaid chart (FLOW-2). The same text GitHub draws, in the site's colors.
// Mermaid is big, so it loads only when a chart is about to scroll into view, and redraws on a theme flip.
import { useEffect, useRef, useState } from "react";

const FONT = 'ui-rounded, "SF Pro Rounded", Nunito, system-ui, sans-serif';
const VARS = {
  light: {
    background: "#FFFFFF", primaryColor: "#FFF3E4", primaryBorderColor: "#FF7E8A", primaryTextColor: "#3A3340",
    secondaryColor: "#EDE6FB", tertiaryColor: "#E3F5EC", lineColor: "#8C8294", textColor: "#3A3340",
    edgeLabelBackground: "#FFF9F0", clusterBkg: "#FFF9F0", fontFamily: FONT, fontSize: "15px",
  },
  dark: {
    background: "#2F2842", primaryColor: "#352D4A", primaryBorderColor: "#FF7E8A", primaryTextColor: "#F6EEF7",
    secondaryColor: "#3D3452", tertiaryColor: "#2C2750", lineColor: "#A99FB8", textColor: "#F6EEF7",
    edgeLabelBackground: "#231D33", clusterBkg: "#231D33", fontFamily: FONT, fontSize: "15px",
  },
};

let seq = 0;
let queue = Promise.resolve();

export default function MermaidGraph({ source, label }) {
  const box = useRef(null);
  const [on, setOn] = useState(false);
  const [theme, setTheme] = useState(null);
  const [svg, setSvg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el || on) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [on]);

  useEffect(() => {
    if (!on || !theme) return;
    let dead = false;
    // One render at a time: initialize() is global, so two charts must not interleave.
    queue = queue.then(async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "base", themeVariables: VARS[theme], flowchart: { curve: "basis", padding: 12 } });
      const out = await mermaid.render(`lib-mm-${++seq}`, source);
      if (!dead) { setSvg(out.svg); setErr(null); }
    }).catch((e) => { if (!dead) setErr(String(e?.message || e)); });
    return () => { dead = true; };
  }, [on, theme, source]);

  if (err) return <div ref={box} className="lib-graph lib-graph-err">The chart did not draw: {err}</div>;
  if (!svg) return <div ref={box} className="lib-graph lib-graph-wait">Drawing the chart...</div>;
  return <div ref={box} className="lib-graph" role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: svg }} />;
}

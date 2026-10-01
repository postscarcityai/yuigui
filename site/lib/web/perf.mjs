// The Speed switch's readout (YUI-250, the web twin of Perf/PerfMonitor.swift): frames per second, the worst
// frame of the last second, the paint and load timings of the page. Dev links only (?perf=1), never a person's screen.

/** Frames per second and the longest frame (ms) from rAF timestamps, oldest first. Nulls when under two frames. */
export function frameStats(stamps) {
  if (!Array.isArray(stamps) || stamps.length < 2) return { fps: null, worst: null };
  let worst = 0;
  for (let i = 1; i < stamps.length; i++) worst = Math.max(worst, stamps[i] - stamps[i - 1]);
  const span = stamps[stamps.length - 1] - stamps[0];
  return { fps: span > 0 ? Math.round(((stamps.length - 1) * 1000) / span) : null, worst: Math.round(worst) };
}

/** One line for the HUD. */
export function hudLine({ fps, worst }, timings = {}) {
  const parts = [fps == null ? "- fps" : `${fps} fps`, worst == null ? "" : `worst ${worst} ms`];
  if (timings.fcp != null) parts.push(`paint ${Math.round(timings.fcp)} ms`);
  if (timings.longest != null) parts.push(`long task ${Math.round(timings.longest)} ms`);
  return parts.filter(Boolean).join(" · ");
}

/** The paint and long task timings the browser already holds (first contentful paint, the longest task). */
export function pageTimings(perf = globalThis.performance) {
  try {
    const fcp = perf.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;
    const longest = perf.getEntriesByType("longtask").reduce((m, e) => Math.max(m, e.duration), 0) || null;
    return { fcp, longest };
  } catch { return { fcp: null, longest: null }; }
}

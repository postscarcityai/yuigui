// YUI-211: the base type for Yui. One page, three sans faces on the same four screens (thread, stage,
// drawer, card), plus the type scale. Recommendation: SF Pro, the system face.
import { Inter, Geist } from "next/font/google";
import { pageMeta } from "../../../lib/og/meta.mjs";
import "./type.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-geist", display: "swap" });

export const metadata = pageMeta({
  path: "/mockups/type",
  title: "Yui type: a sleek sans base | Yui",
  description: "The base type for Yui is a sleek sans: SF Pro, Inter and Geist on the same four screens, and the type scale every screen now uses. Serif stays a look an agent can wear.",
});

const FACES = [
  { id: "sf", name: "SF Pro", note: "The system face. Free, native, Dynamic Type for free. Recommended.", cls: "ty-sf" },
  { id: "inter", name: "Inter", note: "Bundled font file (about 300 KB). Slightly wider, very even.", cls: "ty-inter" },
  { id: "geist", name: "Geist", note: "Bundled font file. Geometric and a little cooler.", cls: "ty-geist" },
];

const SCALE = [
  ["Display", "34", "bold", "-0.6", "Screen titles, big answers"],
  ["Title 1", "28", "bold", "-0.4", "Sheet titles"],
  ["Title 2", "22", "semibold", "-0.2", "Agent names, card titles"],
  ["Headline", "17", "semibold", "0", "Row titles, buttons"],
  ["Body", "17", "regular", "0", "Messages, paragraphs"],
  ["Callout", "15", "regular", "+0.1", "Card body"],
  ["Subhead", "15", "medium", "+0.1", "Row subtitles"],
  ["Caption", "13", "regular", "+0.2", "Timestamps, hints"],
  ["Footnote", "12", "regular", "+0.3", "Fine print"],
];

function Phone({ face, mode }) {
  return (
    <div className={`ty-phone ${face.cls} ty-${mode}`}>
      <div className="ty-bar"><span className="ty-menu" />Wizard<span className="ty-dot" /></div>
      <div className="ty-thread">
        <div className="ty-bub ty-them">Three drawer mocks are ready. Calm list, playful tiles, or peek and tabs.</div>
        <div className="ty-bub ty-me">Peek and tabs, please.</div>
        <div className="ty-card">
          <div className="ty-card-t">Leg day</div>
          <div className="ty-card-s">Five moves, 40 minutes</div>
          <div className="ty-card-b">Start <span className="ty-num">45:00</span></div>
        </div>
        <div className="ty-cap">Today 9:41 AM</div>
      </div>
      <div className="ty-stage">
        <div className="ty-stage-l">Chicken and rice, about 384 kcal.</div>
      </div>
      <div className="ty-drawer">
        <div className="ty-row"><b>Urza</b><span>Fleet is quiet. Nothing needs you.</span></div>
        <div className="ty-row"><b>Arnold</b><span>Leg day is ready</span></div>
      </div>
    </div>
  );
}

export default function TypePage() {
  return (
    <main className={`wrap ty-page ${inter.variable} ${geist.variable}`}>
      <p className="eyebrow">YUI-211</p>
      <h1>A sleek sans for the whole app</h1>
      <p className="lede">Yui&apos;s base type is now a clean sans with a real scale: nine sizes, semibold headings, tabular numbers on timers and counters. It follows the text size you set on your phone. Serif is still a look an agent can wear, never the base.</p>

      <h2>Three faces, same screens</h2>
      <p>Thread, stage line, card and drawer rows in each. Light on the left, dark on the right.</p>
      {FACES.map((f) => (
        <section key={f.id} id={f.id} className="ty-face">
          <h3>{f.name}{f.id === "sf" ? " (base)" : ""}</h3>
          <p className="ty-note">{f.note}</p>
          <div className="ty-pair"><Phone face={f} mode="light" /><Phone face={f} mode="dark" /></div>
        </section>
      ))}

      <h2>The scale</h2>
      <table className="ty-scale">
        <thead><tr><th>Token</th><th>Size</th><th>Weight</th><th>Tracking</th><th>Used for</th></tr></thead>
        <tbody>
          {SCALE.map(([n, s, w, t, u]) => (
            <tr key={n}><td className="ty-sf" style={{ fontSize: `${s}px`, fontWeight: w === "bold" ? 700 : w === "semibold" ? 600 : w === "medium" ? 500 : 400, letterSpacing: `${t}px` }}>{n}</td><td>{s} pt</td><td>{w}</td><td>{t}</td><td>{u}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="ty-note">Each token rides a system text style, so it grows with Dynamic Type up to the accessibility sizes. Looks that choose serif, rounded or mono still apply per agent, on top of this scale.</p>
    </main>
  );
}

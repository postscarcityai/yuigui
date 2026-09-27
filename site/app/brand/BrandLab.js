"use client";
// The brand lab, round 1: one journey from Chris's paper sketch through every direction we tried.
// Chapters are full-width bands in each direction's own colors. Feedback is per direction: tap
// "This one" to keep a pick on this device, then send your picks in one email or one GitHub issue.
import { useEffect, useState } from "react";
import ShaderCanvas from "./ShaderCanvas";
import { Mark, MarkDial, SizeLadder, OneColor, HomeScreen, Loop, Napkin, Icon } from "./MarkBits";
import { SCENES } from "../../lib/brand/scenes.mjs";
import { DIRECTIONS, byId, ratio, onColor } from "../../lib/brand/palettes.mjs";
import { markPaths, VIEWBOX } from "../../lib/brand/mark.mjs";
import s from "./brand.module.css";

const REPO = "https://github.com/postscarcityai/yuigui";
const ROUND = "R1";
const PICKS_KEY = "yui-brand-picks-r1";

// Scene wrappers live at module level so their identity is stable (ShaderCanvas re-inits on change).
const paperHero = (t, m) => SCENES.paper(t, m);
const meok = (t, m) => SCENES.meok(t, m);
const quiet = (t, m) => SCENES.quiet(t, m);
const celadon = (t, m) => SCENES.celadon(t, m);
const bojagi = (t, m) => SCENES.bojagi(t, m);
const holo = (t, m) => SCENES.holo(t, m);

function usePicks() {
  const [picks, setPicks] = useState([]);
  useEffect(() => {
    try { setPicks(JSON.parse(localStorage.getItem(PICKS_KEY) || "[]")); } catch {}
  }, []);
  const toggle = (id) => setPicks((p) => {
    const n = p.includes(id) ? p.filter((x) => x !== id) : [...p, id];
    try { localStorage.setItem(PICKS_KEY, JSON.stringify(n)); } catch {}
    return n;
  });
  return [picks, toggle];
}

const NAMES = { sketch: "The sketch", mark: "The clean mark", meok: "Hanji and meok", quiet: "Seoul quiet", celadon: "Celadon", bojagi: "Bojagi", pop: "Pop, sprinkled", napkin: "The napkin cat", loops: "The loops", films: "The films" };

function mail(subject, body) {
  return `mailto:chris@postscarcity.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function issue(title, body) {
  return `${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=brand`;
}

function Tell({ id, picks, toggle, dark }) {
  const on = picks.includes(id);
  const name = NAMES[id];
  const body = `Direction: ${ROUND}-${id} (${name})\n\nWhat I like:\n\nWhat I would change:\n`;
  return (
    <div className={`${s.tell} ${dark ? s.tellDark : ""}`}>
      <button type="button" className={on ? s.picked : ""} aria-pressed={on} onClick={() => toggle(id)}>{on ? "♥ Picked" : "♡ This one"}</button>
      <a href={mail(`Brand lab ${ROUND}: ${name}`, body)}>Tell Chris</a>
      <a href={issue(`Brand lab ${ROUND}: ${name}`, body)} target="_blank" rel="noopener">Comment on GitHub</a>
      <code>{ROUND}-{id}</code>
    </div>
  );
}

function Swatches({ d }) {
  return (
    <ul className={s.swatches}>
      {d.swatches.map(([n, hex]) => (
        <li key={hex} style={{ background: hex, color: onColor(hex) }}><b>{n}</b><span>{hex}</span></li>
      ))}
    </ul>
  );
}

function Head({ n, title, kicker, children }) {
  return (
    <header className={s.head}>
      <p className={s.kicker}><span>{String(n).padStart(2, "0")}</span>{kicker}</p>
      <h2>{title}</h2>
      {children}
    </header>
  );
}

function Seal() {
  // A seal stamp: the Y knocked out of a red square. No characters, just the mark.
  const paths = markPaths({ rough: 0.18, tear: 0.4, seed: 5, only: ["earL", "earR", "stem"] });
  return (
    <svg viewBox="0 0 620 620" className={s.seal} role="img" aria-label="A red seal stamp with the Y knocked out">
      <defs>
        <mask id="sealMask">
          <rect width="620" height="620" fill="#fff" />
          <g fill="#000" transform="translate(-6 -14) translate(310 310) scale(.78) translate(-310 -310)">{paths.map((p) => <path key={p.name} d={p.d} />)}</g>
        </mask>
        <filter id="sealInk"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="4" seed="4" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4 0 0 0 3.2" /><feComposite in="SourceGraphic" operator="in" /></filter>
        <filter id="sealEdge"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="2" /><feDisplacementMap in="SourceGraphic" scale="14" /></filter>
      </defs>
      <g filter="url(#sealEdge)"><rect x="40" y="40" width="540" height="540" rx="46" fill="#C8372D" mask="url(#sealMask)" filter="url(#sealInk)" /></g>
    </svg>
  );
}

function StickerSheet() {
  const colors = ["#E8388F", "#5CE1E6", "#C6F432", "#B8A6FF", "#FFB84D", "#1D1B20"];
  return (
    <div className={s.stickers} aria-label="A sticker sheet" role="img">
      {colors.map((c, i) => (
        <span key={c} className={s.sticker} style={{ transform: `rotate(${[-8, 6, -3, 10, -12, 4][i]}deg)` }}>
          {i % 2 ? <Mark only={["earL", "earR", "stem"]} fill={c} opts={{ rough: 0, round: 1 }} /> : <Mark fill={c} opts={{ rough: 0, round: 1 }} />}
        </span>
      ))}
    </div>
  );
}

function Photocard() {
  return (
    <div className={s.photocard} aria-label="A photocard" role="img">
      <Mark only={["earL", "earR", "stem"]} fill="#FFFFFF" opts={{ rough: 0, round: 1 }} />
      <span>YUI · 001</span>
    </div>
  );
}

function PaletteCard({ d }) {
  const r = ratio(d.mark, d.bg);
  return (
    <figure className={s.palette}>
      <div style={{ background: d.bg }}><Mark fill={d.mark} opts={{ rough: d.id === "sketch" ? 1 : 0 }} /></div>
      <figcaption>
        <b>{d.name}</b>
        <span className={r >= 3 ? s.pass : s.fail}>{r}:1 {r >= 3 ? "reads" : "too faint for a logo"}</span>
        <span className={s.chips}>{d.swatches.map(([n, hex]) => <i key={hex} title={`${n} ${hex}`} style={{ background: hex }} />)}</span>
      </figcaption>
    </figure>
  );
}

export default function BrandLab({ films = [], models = [] }) {
  const [picks, toggle] = usePicks();
  const [inkKey, setInkKey] = useState(0);
  const tp = { picks, toggle };
  const allBody = `My picks from brand lab ${ROUND}:\n${picks.map((p) => `- ${ROUND}-${p} (${NAMES[p]})`).join("\n") || "- (none yet)"}\n\nWhy:\n`;

  return (
    <div className={s.page}>
      {/* ---------- hero ---------- */}
      <section className={`${s.band} ${s.hero}`} style={{ background: byId.sketch.bg }}>
        <ShaderCanvas shader="paper" scene={paperHero} aspect="21 / 10" label="Six cocoa paper pieces landing on warm paper to spell Yui" />
        <div className={s.heroText}>
          <p className={s.kicker}><span>{ROUND}</span>Brand lab · round 1 · Sep 27, 2026</p>
          <h1>Six pieces of paper.</h1>
          <p>Chris cut Yui&apos;s name out of cocoa paper. This page is where we find out what it wants to be. Every idea here starts from those six pieces and nothing else. Nothing is final. Pick what you like and tell us.</p>
        </div>
      </section>

      <nav className={s.toc} aria-label="Chapters">
        {["The sketch", "The mark", "Hanji and meok", "Seoul quiet", "Celadon and bojagi", "Pop, sprinkled", "Color", "Motion", "What the models see", "Your turn"].map((t, i) => (
          <a key={t} href={`#c${i + 1}`}><span>{String(i + 1).padStart(2, "0")}</span>{t}</a>
        ))}
      </nav>

      {/* ---------- 01 the sketch ---------- */}
      <section id="c1" className={s.chapter}>
        <Head n={1} kicker="Cut paper" title="The sketch">
          <p>This is the whole brief. Two ears and a stem make a Y. Then a u, then an i with a small wedge for a dot. Nothing touches. The gaps are part of it.</p>
        </Head>
        <div className={s.split}>
          <figure className={s.photo}>
            <img src="/brand/lab/sketch.webp" alt="Chris's sketch: the word Yui cut from cocoa paper in six pieces" width="1280" height="1000" loading="lazy" />
            <figcaption>The original, on Chris&apos;s desk.</figcaption>
          </figure>
          <figure className={s.trace}>
            <svg viewBox={VIEWBOX} role="img" aria-label="The six pieces traced and named">
              {markPaths({ rough: 1 }).map((p, i) => (
                <g key={p.name}>
                  <path d={p.d} />
                  <text x={p.c[0]} y={p.c[1] + 10}>{i + 1}</text>
                </g>
              ))}
            </svg>
            <figcaption>Traced by code, so every idea below is the same six shapes: 1 and 2 ears, 3 stem, 4 u, 5 i, 6 dot.</figcaption>
          </figure>
        </div>
        <div className={s.keep}>
          <h3>What we keep, whatever happens</h3>
          <ul>
            <li><b>Six pieces.</b> Cut, not drawn. You can count them.</li>
            <li><b>The gaps.</b> Air between every piece, so it breathes.</li>
            <li><b>The weight.</b> Heavy, soft, a little clumsy in a good way.</li>
            <li><b>The Y can stand alone.</b> The ears and stem are the app icon and Yui&apos;s face.</li>
          </ul>
          <Napkin />
        </div>
        <Tell id="sketch" {...tp} />
      </section>

      {/* ---------- 02 the mark ---------- */}
      <section id="c2" className={s.chapter}>
        <Head n={2} kicker="Vector, one color" title="The mark">
          <p>Could it hold up like Apple&apos;s apple? Take away the paper, the color, the size, and see what is left. Drag from the sketch to the clean cut. The clean mark keeps one stroke width, round ends where the paper was torn, flat ends where it was cut, and the same gaps.</p>
        </Head>
        <MarkDial />
        <h3 className={s.sub}>From 180 px down to 16</h3>
        <SizeLadder />
        <h3 className={s.sub}>One color, any ground</h3>
        <OneColor />
        <div className={s.split}>
          <HomeScreen />
          <div className={s.note}>
            <h3>The Y is the icon</h3>
            <p>At icon size the word drops away and the Y carries it: two ears and a stem. It is also Yui&apos;s face in the app, where each agent gets its own letter on a chip.</p>
            <div className={s.iconRow}>
              <Icon size={76} />
              <Icon size={76} bg="#FF7E8A" fill="#1D1B20" />
              <Icon size={76} bg="#E5DED4" fill="#9E6153" opts={{ rough: 0.35 }} />
              <Icon size={76} bg="#4F8472" fill="#EFE7D2" />
            </div>
          </div>
        </div>
        <Tell id="mark" {...tp} />
      </section>

      {/* ---------- 03 meok ---------- */}
      <section id="c3" className={`${s.band} ${s.material}`} style={{ background: byId.meok.bg, color: byId.meok.ink }}>
        <div className={s.inner}>
          <Head n={3} kicker={byId.meok.medium} title="Hanji and meok"><p>{byId.meok.note} The ink blooms from the middle of each stroke and stops where the paper says so.</p></Head>
          <ShaderCanvas shader="meok" scene={meok} restartKey={inkKey} label="Black ink blooming into mulberry paper in the shape of the Yui mark" />
          <div className={s.row}>
            <button type="button" className={s.ghost} onClick={() => setInkKey((k) => k + 1)}>Ink it again</button>
            <Seal />
            <Swatches d={byId.meok} />
          </div>
          <Tell id="meok" {...tp} />
        </div>
      </section>

      {/* ---------- 04 quiet ---------- */}
      <section id="c4" className={`${s.band} ${s.material}`} style={{ background: byId.quiet.bg, color: byId.quiet.ink }}>
        <div className={s.inner}>
          <Head n={4} kicker={byId.quiet.medium} title="Seoul quiet"><p>{byId.quiet.note} Move your pointer to move the light.</p></Head>
          <ShaderCanvas shader="quiet" scene={quiet} label="The Yui mark pressed into oat stone, lit from the side" />
          <div className={s.row}><Swatches d={byId.quiet} /></div>
          <Tell id="quiet" {...tp} />
        </div>
      </section>

      {/* ---------- 05 celadon + bojagi ---------- */}
      <section id="c5" className={`${s.band} ${s.material}`} style={{ background: byId.celadon.bg, color: byId.celadon.ink }}>
        <div className={s.inner}>
          <Head n={5} kicker={byId.celadon.medium} title="Celadon and bojagi"><p>{byId.celadon.note}</p></Head>
          <div className={s.pair}>
            <div>
              <ShaderCanvas shader="celadon" scene={celadon} aspect="4 / 3" label="The Yui mark as a celadon glazed tile, crackle spreading" />
              <Tell id="celadon" {...tp} />
            </div>
            <div>
              <ShaderCanvas shader="bojagi" scene={bojagi} aspect="4 / 3" label="The six pieces sewn as colored patches in a bojagi cloth" />
              <Tell id="bojagi" {...tp} />
            </div>
          </div>
          <div className={s.row}><Swatches d={byId.celadon} /></div>
        </div>
      </section>

      {/* ---------- 06 pop ---------- */}
      <section id="c6" className={`${s.band} ${s.material}`} style={{ background: byId.pop.bg, color: byId.pop.ink }}>
        <div className={s.inner}>
          <Head n={6} kicker={byId.pop.medium} title="Pop, sprinkled"><p>{byId.pop.note} Tilt it with your pointer.</p></Head>
          <div className={s.popGrid}>
            <ShaderCanvas shader="holo" scene={holo} aspect="4 / 3" label="The Yui mark as a pearl foil sticker" />
            <StickerSheet />
            <Photocard />
          </div>
          <Tell id="pop" {...tp} />
        </div>
      </section>

      {/* ---------- 07 color ---------- */}
      <section id="c7" className={s.chapter}>
        <Head n={7} kicker="Same mark, every palette" title="Color">
          <p>Each direction brings its own colors, and they all start at the sketch: cocoa on warm paper. The number is how well the mark stands off its ground. A logo wants 3:1 or more. Today&apos;s coral on cream is {ratio("#FF7E8A", "#FFF9F0")}:1, which is why it can look washed out on the site.</p>
        </Head>
        <div className={s.palettes}>{DIRECTIONS.map((d) => <PaletteCard key={d.id} d={d} />)}</div>
      </section>

      {/* ---------- 08 motion ---------- */}
      <section id="c8" className={s.chapter}>
        <Head n={8} kicker="Loops, stings, one film" title="Motion">
          <p>The same move everywhere: the pieces land one at a time, ears first, and settle with a little bounce. These three loops run live in your browser. They could be the app&apos;s launch, its loading state, and its idle wink.</p>
        </Head>
        <div className={s.loops}>
          <Loop kind="splash" label="Splash: the pieces land" />
          <Loop kind="loading" label="Loading: the pieces take turns" bg="#FFF9F0" fill="#FF7E8A" />
          <Loop kind="idle" label="Idle: the ears twitch, once in a while" bg="#1D1B20" fill="#F3EDE1" />
        </div>
        {films.length ? (
          <>
            <h3 className={s.sub}>The films</h3>
            <p className={s.lede}>Made from code, like every Yui video: the shaders above, drawn frame by frame, scored with a new sound. Deep house with some grime and a little trap in the hats.</p>
            <div className={s.films}>
              {films.filter((f) => !f.tall).map((f) => (
                <figure key={f.id} className={f.id === "journey" ? s.wide : ""}>
                  <video src={f.src} poster={f.poster} controls playsInline preload="none" />
                  <figcaption><b>{f.title}</b> {f.what}</figcaption>
                </figure>
              ))}
            </div>
            <h3 className={s.sub}>Chapter shorts, for reels</h3>
            <div className={s.shorts}>
              {films.filter((f) => f.tall).map((f) => (
                <figure key={f.id}>
                  <video src={f.src} poster={f.poster} controls playsInline preload="none" />
                  <figcaption><b>{f.title.replace("Short: ", "")}</b></figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : null}
        <Tell id="loops" {...tp} />
      </section>

      {/* ---------- 09 models ---------- */}
      <section id="c9" className={s.chapter}>
        <Head n={9} kicker="Generated with fal" title="What the models see">
          <p>A side trip. We gave three image models the clean mark and a short brief, and asked what it could be. Plates are just materials, no mark. Everything else on this page is made by hand in code; these are the only generated pictures, and they are labeled.</p>
        </Head>
        {models.length ? (
          <div className={s.models}>
            {models.map((m) => (
              <figure key={m.src}>
                <img src={m.src} alt={m.alt} loading="lazy" width={m.w} height={m.h} />
                <figcaption><b>{m.title}</b> <span>{m.model}</span></figcaption>
              </figure>
            ))}
          </div>
        ) : <p className={s.lede}>The first batch is still cooking.</p>}
      </section>

      {/* ---------- 10 your turn ---------- */}
      <section id="c10" className={`${s.band} ${s.turn}`}>
        <div className={s.inner}>
          <Head n={10} kicker="Round 1 feedback" title="Your turn">
            <p>Tap &quot;This one&quot; on anything you like, then send your picks here. Short is fine. &quot;The ink, but in coral&quot; is a great note. Round 2 starts from what you send.</p>
          </Head>
          <ul className={s.pickList}>
            {Object.keys(NAMES).map((id) => (
              <li key={id}><button type="button" aria-pressed={picks.includes(id)} className={picks.includes(id) ? s.picked : ""} onClick={() => toggle(id)}>{picks.includes(id) ? "♥" : "♡"} {NAMES[id]}</button></li>
            ))}
          </ul>
          <div className={s.sendRow}>
            <a className={s.send} href={mail(`Brand lab ${ROUND}: my picks`, allBody)}>Email my picks</a>
            <a className={s.ghostLink} href={issue(`Brand lab ${ROUND}: picks`, allBody)} target="_blank" rel="noopener">Post them on GitHub</a>
          </div>
          <p className={s.soon}>Soon you will be able to just tell Yui, right here on the site.</p>
        </div>
      </section>
    </div>
  );
}

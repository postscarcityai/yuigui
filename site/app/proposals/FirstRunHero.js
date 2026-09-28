"use client";
// The PROP-1 hero (SITE-88): Yui's first-run flow as a working phone. TestFlight, Sign in with Apple, Yui says
// hi, pick your crew, dig deeper on a row (its real starter screens, drawn live), bring your own agent, and your
// crew. It plays a short loop until the visitor touches it, then it is theirs. All copy lives in lib/first-run.mjs.
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { APPLE, CREW_ROWS, DIG, DONE, HI, OWN, PICK, STEPS, TESTFLIGHT } from "../../lib/first-run.mjs";
import usePrefs from "./usePrefs";
import "./firstrun.css";

const Live = dynamic(() => import("../mockups/LiveScreen"), { ssr: false, loading: () => <div className="fr-live-wait">Drawing the screen...</div> });

const ORDER = STEPS.map((s) => s.id);
const railOf = (step) => (step === "thread" ? "done" : step);
const own = (choice) => ({ handle: `own-${choice.id}`, name: choice.name, role: "Your agent", line: choice.line, color: "lavender", c: "#7d6bd6", look: "grain", label: "your own agent", hello: `${choice.name} is paired. Say hi to your agent here.`, mine: true });

const Face = ({ m, size = "" }) => (
  <span className={`fr-face look-${m.look} ${size}`} style={{ "--cm": m.c, "--cp": `var(--${m.color})` }} aria-hidden="true"><b>{m.name[0]}</b></span>
);

const Apple = () => (
  <svg viewBox="0 0 22 26" width="15" height="18" fill="currentColor" aria-hidden="true"><path d="M15.3 0c.1 1.2-.4 2.4-1.1 3.2-.8.9-2 1.5-3.1 1.4-.1-1.1.4-2.3 1.1-3.1C12.9.6 14.2 0 15.3 0zm4.3 8.8c-.1.1-2.5 1.4-2.5 4.3 0 3.4 3 4.6 3.1 4.6 0 .1-.5 1.6-1.6 3.2-1 1.4-2 2.8-3.6 2.8s-2-.9-3.8-.9-2.4.9-3.8.9c-1.6 0-2.7-1.5-3.7-2.9C2 17 .8 13.2.8 9.6c0-3.4 2.200-5.200 4.400-5.200 1.600 0 2.900 1 3.800 1 .9 0 2.400-1.100 4.200-1.100.7 0 3.200.1 4.900 2.500z" /></svg>
);

function TypeLine({ text, reduced, speed = 34 }) {
  const [n, setN] = useState(reduced ? text.length : 0);
  useEffect(() => {
    if (reduced) { setN(text.length); return; }
    setN(0);
    const t = setInterval(() => setN((k) => { if (k >= text.length) { clearInterval(t); return k; } return k + 1; }), speed);
    return () => clearInterval(t);
  }, [text, reduced, speed]);
  return <>{text.slice(0, n)}<span className="fr-caret" aria-hidden="true" data-done={n >= text.length} /></>;
}

const Bar = () => (
  <div className="fr-status" aria-hidden="true"><span>9:41</span><i className="fr-notch" /><span className="fr-icons"><em /><em /><em /></span></div>
);

export default function FirstRunHero({ children, title }) {
  const { reduced, dark } = usePrefs();
  const [step, setStep] = useState("tf");
  const [dir, setDir] = useState("fwd");
  const [tf, setTf] = useState("idle");
  const [signing, setSigning] = useState(false);
  const [crew, setCrew] = useState([]);
  const [ownAgent, setOwnAgent] = useState(null);
  const [dug, setDug] = useState("basil");
  const [tab, setTab] = useState("about");
  const [shot, setShot] = useState(0);
  const [ownPick, setOwnPick] = useState(null);
  const [copied, setCopied] = useState(false);
  const [thread, setThread] = useState(null);
  const [auto, setAuto] = useState(false);
  const [run, setRun] = useState(0);
  const timers = useRef([]);

  const rows = useMemo(() => (ownAgent ? [...CREW_ROWS, ownAgent] : CREW_ROWS), [ownAgent]);
  const byHandle = useCallback((h) => rows.find((r) => r.handle === h), [rows]);
  const picked = rows.filter((r) => crew.includes(r.handle));

  const go = useCallback((next) => {
    setStep((cur) => {
      const a = ORDER.indexOf(railOf(cur)), b = ORDER.indexOf(railOf(next));
      setDir(next === "pick" && (cur === "dig" || cur === "own") ? "back" : b < a ? "back" : "fwd");
      return next;
    });
  }, []);

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const stop = useCallback(() => { clear(); setAuto(false); }, []);

  const reset = useCallback(() => {
    setStep("tf"); setDir("fwd"); setTf("idle"); setSigning(false); setCrew([]); setOwnAgent(null);
    setTab("about"); setShot(0); setOwnPick(null); setThread(null);
  }, []);

  // Install runs by itself, then waits for Open; signing in runs by itself, then Yui says hi.
  useEffect(() => {
    if (tf !== "installing") return;
    const t = setTimeout(() => setTf("ready"), reduced ? 200 : 1700);
    return () => clearTimeout(t);
  }, [tf, reduced]);
  useEffect(() => {
    if (!signing) return;
    const t = setTimeout(() => { setSigning(false); go("hi"); }, reduced ? 200 : 1100);
    return () => clearTimeout(t);
  }, [signing, reduced, go]);

  // The loop: the same taps a visitor would make, until they touch the phone.
  useEffect(() => {
    if (!auto || reduced) return;
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));
    reset();
    at(1100, () => setTf("installing"));
    at(4200, () => go("apple"));
    at(5400, () => setSigning(true));
    at(8200, () => setCrew(["arnold"]));
    at(8900, () => setCrew(["arnold", "basil"]));
    at(9600, () => setCrew(["arnold", "basil", "gouda"]));
    at(10800, () => { setDug("penny"); setTab("about"); go("dig"); });
    at(13200, () => { setCrew((c) => [...c, "penny"]); go("pick"); });
    at(14800, () => go("done"));
    at(21500, () => setRun((r) => r + 1));
    return clear;
  }, [auto, run, reduced, reset, go]);

  useEffect(() => { setAuto(!window.matchMedia("(prefers-reduced-motion: reduce)").matches); return clear; }, []);

  const toggle = (h) => setCrew((c) => (c.includes(h) ? c.filter((x) => x !== h) : [...c, h]));
  const openDig = (h) => { setDug(h); setTab("about"); setShot(0); go("dig"); };
  const replay = () => { reset(); setAuto(!reduced); setRun((r) => r + 1); };
  const jump = (id) => {
    stop();
    if (id === "dig" && !byHandle(dug)) setDug("basil");
    if (id === "own") setOwnPick(null);
    if (["done", "pick"].includes(id) && crew.length === 0) setCrew(["yui", "arnold"]);
    go(id);
  };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  const m = byHandle(dug) || CREW_ROWS[0];
  const key = `${step}${step === "dig" ? dug + tab + shot : ""}${step === "own" ? ownPick || "" : ""}${step === "thread" ? thread : ""}`;
  const active = railOf(step);
  const activeIdx = ORDER.indexOf(active);

  const rail = (dots) => (
    <ol className={dots ? "fr-dots" : "fr-rail"} aria-label="The steps of the first run">
      {STEPS.map((s, i) => (
        <li key={s.id} className={i === activeIdx ? "on" : i < activeIdx ? "past" : ""}>
          <button type="button" onClick={() => jump(s.id)} aria-current={i === activeIdx ? "step" : undefined} aria-label={dots ? `Step ${i + 1}, ${s.label}` : undefined}>
            <span className="fr-n">{i + 1}</span>
            {dots ? null : <span className="fr-t"><b>{s.label}</b><small>{s.line}</small></span>}
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <section className={`prop-hero fr ${reduced ? "still" : ""}`} data-slot="hero" aria-labelledby="prop-h">
      <div className="prop-hero-text">
        {children}
        {rail(false)}
      </div>
      <div className="prop-hero-phone">
        <div className="phone fr-phone" role="group" aria-label={`${title}: the first run in a phone. Tap to try it.`}
          onPointerDownCapture={stop} onKeyDownCapture={stop}>
          <div className="fr-screen">
            <Bar />
            <div className={`fr-stage ${dir}`} key={key}>
              {step === "tf" && (
                <div className="fr-tf">
                  <div className="fr-tf-top"><span className="fr-tf-tag">TestFlight</span></div>
                  <div className="fr-app">
                    <span className="fr-icon" aria-hidden="true">Y</span>
                    <div><h2>{TESTFLIGHT.app}</h2><p>{TESTFLIGHT.sub}</p><small>{TESTFLIGHT.rating}</small></div>
                  </div>
                  {tf === "idle" && <button type="button" className="fr-btn" onClick={() => setTf("installing")}>{TESTFLIGHT.install}</button>}
                  {tf === "installing" && <div className="fr-btn ghost busy" role="status"><span className="fr-ring" aria-hidden="true" />{TESTFLIGHT.installing}</div>}
                  {tf === "ready" && <button type="button" className="fr-btn pop" onClick={() => go("apple")} autoFocus={false}>{TESTFLIGHT.open}</button>}
                  <div className="fr-card fr-tf-test"><b>What to test</b><p>Your agents answer with screens, not paragraphs. Tap through your first crew.</p></div>
                  <p className="fr-fine">{TESTFLIGHT.note}</p>
                </div>
              )}

              {step === "apple" && (
                <div className="fr-apple">
                  <div className="fr-dim">
                    <span className="fr-icon big" aria-hidden="true">Y</span>
                    <h2>Yui</h2>
                    <p>Agents that answer with screens.</p>
                  </div>
                  <div className={`fr-sheet ${signing ? "go" : ""}`}>
                    <div className="fr-grab" aria-hidden="true" />
                    <h3>{APPLE.title}</h3>
                    <p>{APPLE.body}</p>
                    <div className="fr-id"><span className="fr-av" aria-hidden="true">C</span><div><b>{APPLE.who}</b><small>{APPLE.hide}</small></div><span className="fr-tog on" aria-hidden="true" /></div>
                    <button type="button" className="fr-btn dark" onClick={() => setSigning(true)} disabled={signing}>
                      {signing ? <><span className="fr-face-id" aria-hidden="true" />{APPLE.signing}</> : <><Apple />{APPLE.cta}</>}
                    </button>
                  </div>
                </div>
              )}

              {step === "hi" && (
                <div className="fr-hi">
                  <span className="fr-orb look-orb" style={{ "--cm": "#ff7e8a", "--cp": "var(--brand)" }} aria-hidden="true"><b>Y</b></span>
                  <div className="fr-bubble" aria-live="polite"><TypeLine text={HI.say} reduced={reduced} /></div>
                  <p className="fr-sub">{HI.sub}</p>
                  <button type="button" className="fr-btn" onClick={() => go("pick")}>{HI.cta}</button>
                </div>
              )}

              {step === "pick" && (
                <div className="fr-pick">
                  <header><h2>{PICK.title}</h2><p>{PICK.sub}</p></header>
                  <ul className="fr-rows">
                    {rows.map((r, i) => {
                      const on = crew.includes(r.handle);
                      return (
                        <li key={r.handle} className={`fr-row ${on ? "on" : ""}`} style={{ "--cm": r.c, "--cp": `var(--${r.color})`, "--i": i }}>
                          <button type="button" className="fr-pickbtn" role="checkbox" aria-checked={on} aria-label={`${on ? "Remove" : "Add"} the ${r.label}`} onClick={() => toggle(r.handle)}>
                            <Face m={r} />
                            <span className="fr-who"><b>{r.name}</b><small>{r.line}</small></span>
                            <span className="fr-check" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg></span>
                          </button>
                          {r.mine ? null : <button type="button" className="fr-more" aria-label={`More about the ${r.label}`} onClick={() => openDig(r.handle)}>{PICK.more}<i aria-hidden="true" /></button>}
                        </li>
                      );
                    })}
                    <li className={`fr-row ownrow ${ownAgent ? "on" : ""}`} style={{ "--cm": "#7d6bd6", "--cp": "var(--lavender)", "--i": rows.length }}>
                      <button type="button" className="fr-pickbtn" onClick={() => { setOwnPick(null); go("own"); }}>
                        <span className="fr-face plus" aria-hidden="true"><b>+</b></span>
                        <span className="fr-who"><b>{PICK.own.name}</b><small>{PICK.own.line}</small></span>
                        <span className="fr-chev" aria-hidden="true" />
                      </button>
                    </li>
                  </ul>
                  <footer><button type="button" className="fr-btn" disabled={!crew.length} onClick={() => go("done")}>{PICK.cta(crew.length)}</button></footer>
                </div>
              )}

              {step === "dig" && (
                <div className="fr-dig" style={{ "--cm": m.c, "--cp": `var(--${m.color})` }}>
                  <header>
                    <button type="button" className="fr-back" onClick={() => go("pick")}><i aria-hidden="true" />{DIG.back}</button>
                    <div className="fr-dig-head"><Face m={m} size="big" /><div><h2>{m.name}</h2><span className="fr-role">{m.role}</span></div></div>
                    <div className="fr-tabs" role="tablist">
                      {[["about", DIG.about], ["screens", DIG.screens]].map(([id, label]) => (
                        <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => { setTab(id); }}>{label}</button>
                      ))}
                    </div>
                  </header>
                  {tab === "about" ? (
                    <div className="fr-scroll">
                      <p className="fr-lede">{m.line}.</p>
                      <h3>{DIG.tools}</h3>
                      <ul className="fr-tools">
                        {m.tools.map((t) => <li key={t.t}><span>{t.t}</span>{t.next ? <em>{t.next}</em> : null}</li>)}
                      </ul>
                      <button type="button" className="fr-peek" onClick={() => setTab("screens")}>See {m.screens.length} starter screens<i aria-hidden="true" /></button>
                    </div>
                  ) : (
                    <div className="fr-livebox">
                      <div className="fr-live" key={`${m.handle}${shot}`}><Live yl={m.screens[shot].yl} agent={m.name} light={!dark} /></div>
                      <div className="fr-pager" role="tablist" aria-label="Starter screens">
                        {m.screens.map((s, i) => <button key={s.label} type="button" role="tab" aria-selected={shot === i} className={shot === i ? "on" : ""} onClick={() => setShot(i)}>{s.label}</button>)}
                      </div>
                    </div>
                  )}
                  <footer>
                    {crew.includes(m.handle)
                      ? <button type="button" className="fr-btn ghost" onClick={() => { toggle(m.handle); go("pick"); }}>Remove from my crew</button>
                      : <button type="button" className="fr-btn" onClick={() => { toggle(m.handle); go("pick"); }}>{DIG.add}</button>}
                  </footer>
                </div>
              )}

              {step === "own" && (
                <div className="fr-own">
                  <header>
                    <button type="button" className="fr-back" onClick={() => (ownPick ? setOwnPick(null) : go("pick"))}><i aria-hidden="true" />{OWN.back}</button>
                    <h2>{OWN.title}</h2><p>{OWN.sub}</p>
                  </header>
                  {!ownPick ? (
                    <ul className="fr-rows">
                      {OWN.choices.map((c, i) => (
                        <li key={c.id} className="fr-row" style={{ "--cm": "#7d6bd6", "--cp": "var(--lavender)", "--i": i }}>
                          <button type="button" className="fr-pickbtn" onClick={() => setOwnPick(c.id)}>
                            <span className="fr-face" aria-hidden="true"><b>{c.name[0]}</b></span>
                            <span className="fr-who"><b>{c.name}</b><small>{c.line}</small></span>
                            <span className="fr-chev" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (() => {
                    const c = OWN.choices.find((x) => x.id === ownPick);
                    return (
                      <div className="fr-scroll">
                        <div className="fr-code" aria-label={`Pairing code ${OWN.code.split("").join(" ")}`}>
                          {OWN.code.split("").map((d, i) => <span key={i} style={{ "--i": i }}>{d}</span>)}
                        </div>
                        <p className="fr-fine center">{OWN.codeNote}</p>
                        <h3>{c.name}</h3>
                        <p className="fr-where">{c.where}</p>
                        <pre className="fr-cmd"><code>{c.cmd}</code></pre>
                        <button type="button" className="fr-btn ghost sm" onClick={() => copy(c.cmd)}>{copied ? OWN.copied : OWN.copy}</button>
                      </div>
                    );
                  })()}
                  {ownPick ? (
                    <footer><button type="button" className="fr-btn" onClick={() => { const c = OWN.choices.find((x) => x.id === ownPick); const a = own(c); setOwnAgent(a); setCrew((cr) => [...cr.filter((h) => !h.startsWith("own-")), a.handle]); setOwnPick(null); go("pick"); }}>{OWN.add}</button></footer>
                  ) : null}
                </div>
              )}

              {step === "done" && (
                <div className="fr-done">
                  <header><h2>{DONE.title}</h2><p>{DONE.sub}</p></header>
                  {picked.length ? (
                    <ul className="fr-crew">
                      {picked.map((r, i) => (
                        <li key={r.handle} style={{ "--cm": r.c, "--cp": `var(--${r.color})`, "--i": i }}>
                          <button type="button" aria-label={`Open the ${r.label}'s thread`} onClick={() => { setThread(r.handle); go("thread"); }}>
                            <Face m={r} size="big" /><b>{r.name}</b><small>{r.role}</small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="fr-fine center">{DONE.empty}</p>}
                  <footer>
                    <button type="button" className="fr-btn" onClick={replay}>{DONE.replay}</button>
                    <button type="button" className="fr-link" onClick={() => go("pick")}>{DONE.edit}</button>
                  </footer>
                </div>
              )}

              {step === "thread" && (() => {
                const t = byHandle(thread) || picked[0];
                return (
                  <div className="fr-thread" style={{ "--cm": t.c, "--cp": `var(--${t.color})` }}>
                    <header><button type="button" className="fr-back" onClick={() => go("done")}><i aria-hidden="true" />{DONE.backToCrew}</button>
                      <div className="fr-dig-head"><Face m={t} /><div><h2>{t.name}</h2><span className="fr-role">{t.role}</span></div></div></header>
                    <div className="fr-chat"><div className="fr-bubble agent"><TypeLine text={t.hello} reduced={reduced} speed={22} /></div></div>
                    <footer><div className="fr-composer" aria-hidden="true"><span>Message {t.name}</span><i /></div>
                      <button type="button" className="fr-btn ghost" onClick={() => go("done")}>{DONE.backToCrew}</button></footer>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        {rail(true)}
        <p className={`fr-hint ${auto ? "on" : ""}`} aria-live="polite">{auto ? "Watching it play. Tap the phone to take over." : "It is yours. Tap around, or use the steps."}</p>
      </div>
    </section>
  );
}

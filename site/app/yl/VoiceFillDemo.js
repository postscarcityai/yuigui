"use client";
// "People can say their answers" (SITE-183): a form card filled by voice, field by field, and the event the agent gets.
// A mock of the phone's voice-fill (Yui/Sources/Presets/VoiceFill.swift): it plays on view and replays on tap.
import { useEffect, useRef, useState } from "react";

const FORM = 'form@brand "About the brand" name:text! what:long vibe:Calm|Bold|Playful submit="Send"';
const FIELDS = [
  { key: "name", label: "Name", said: "Acme Bakery", show: "Acme Bakery" },
  { key: "what", label: "What", said: "we bake sourdough", show: "we bake sourdough" },
  { key: "vibe", label: "Vibe", said: "bold", show: "Bold" },
];
const WORDS = "name is Acme Bakery, what is we bake sourdough, vibe is bold".split(" ");
// The words are spoken in order; a field lands as soon as its last word is heard.
const LANDS = [4, 9, 12]; // spoken words heard when each field fills
const STEP = 330;

export default function VoiceFillDemo() {
  const box = useRef(null);
  const [heard, setHeard] = useState(0);
  const [sent, setSent] = useState(false);
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    setHeard(0);
    setSent(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHeard(WORDS.length);
      setSent(true);
      return;
    }
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setHeard(n);
      if (n >= WORDS.length) {
        clearInterval(t);
        setTimeout(() => setSent(true), 900);
      }
    }, STEP);
    return () => clearInterval(t);
  }, [started, run]);

  const filled = FIELDS.map((_, i) => heard >= LANDS[i]);
  const listening = started && heard < WORDS.length;
  const done = filled.every(Boolean);
  const event = `[yui] brand form form.name="Acme Bakery" form.what="we bake sourdough" form.vibe=Bold`;

  return (
    <section className="vf" id="people-can-say-their-answers" aria-labelledby="vf-title">
      <div className="vf-text">
        <h2 id="vf-title">People can say their answers</h2>
        <p>
          A <code>form</code> has a mic. The person taps it once, says each field&rsquo;s name and its answer, and the words land in the
          fields, each with a small mic mark so they know to check it. The words never leave the phone until they tap Send.
        </p>
        <p>
          <strong>Your agent gets the same event as a typed answer.</strong> There is no flag and no transcript, and nothing to
          branch on. The phone fills the fields, the person checks them, and what goes out is the form, <code>{"{form: {key: value}}"}</code>.
          Inside a <code>plan</code> it is that form object in the plan&rsquo;s one <code>{"{plan: {...}}"}</code> event.
        </p>
        <p>Write field labels the way a person says them (<code>Name</code>, <code>What you do</code>). A choice is heard by its option&rsquo;s words, a yes by yes or no. A photo, a date and a time stay taps.</p>
        <p className="vf-label">The line you send</p>
        <pre className="vf-pre"><code>{FORM}</code></pre>
        <p className="vf-label">What your agent reads</p>
        <pre className={"vf-pre vf-event" + (sent ? " on" : "")} aria-live="polite"><code>{sent ? event : "Waiting for Send..."}</code></pre>
        <button type="button" className="btn soft" onClick={() => { setStarted(true); setRun((r) => r + 1); }}>Replay</button>
      </div>
      <div className="vf-phone" ref={box}>
        <div className="vf-screen" role="group" aria-label="A form being filled by voice, field by field">
          <div className="vf-card">
            <div className="vf-title">About the brand</div>
            <div className={"vf-talk" + (listening ? " live" : "")}>
              <span className="vf-mic" aria-hidden="true">{listening ? "■" : "●"}</span>
              <span>{listening ? "Listening. Tap to stop." : done ? "Tap to add more" : "Talk it out"}</span>
            </div>
            <div className="vf-heard" aria-hidden="true">{WORDS.slice(0, heard).join(" ")}&nbsp;</div>
            {FIELDS.map((f, i) => (
              <div className="vf-field" key={f.key}>
                <div className="vf-flabel">
                  {f.label}
                  {filled[i] && <span className="vf-heardmark" aria-label="filled by voice" role="img">🎙</span>}
                </div>
                <div className={"vf-input" + (filled[i] ? " on" : "")}>{filled[i] ? f.show : ""}</div>
              </div>
            ))}
            <div className={"vf-send" + (sent ? " sent" : done ? " ready" : "")}>{sent ? "Sent" : "Send"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

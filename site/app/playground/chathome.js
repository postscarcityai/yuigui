"use client";

// Chat is home (YUI-315, Thought chat-is-home): the real web thread (ThreadView, StageLayer, the fold chip) on its demo
// relay, in a phone-sized frame, played by a script. The person types into the real composer, the agent's replies are
// dropped in as it would write them. Plain answers and a choose stay in the chat; a sketch takes the stage; a deck and a
// timer take it in turn while the older ones fold into ONE chip; the script taps the chip, then loops.
// Reduce Motion: no script, the still end state (every reply in the thread, the chip open).

import { useCallback, useEffect, useRef, useState } from "react";
import "./chathome.css";
import { useReduced } from "./stagemotion";

const AGENT = "demo-penny";

const SKETCH = `sketch "Build ready" frame=phone
row "Build 97 is ready" +x note="no way to open it"
after
row "Build 97 is ready" +hi note="one tap to open"`;
const DECK = `deck "Orbits"
page "The sun and us"
shapes
shape@sun circle Sun at=3,3 size=3 tone=butter +fill
page "Why it matters"
shapes
shape@earth circle Earth at=5,3 size=3 tone=mint`;
const TIMER = `timer 3m Tea`;
const TIMER3 = `timer 7m Eggs`;
const TIMER2 = `timer 10m Pasta`;

// A reply that is only a timer folds (lib/web/stage.mjs pillsOnly); one with a line of words does not.
// [ms to wait, step]: `ask` types a line into the composer and sends it, `say` is the agent's reply, `tap` a button by test id.
const SCRIPT = [
  [1400, "ask", "Am I on the latest build?"],
  [1500, "say", "say \"Yes. Build 160, the newest.\""],
  [2200, "ask", "Ping you when it lands?"],
  [1500, "say", "say \"Want a ping when it lands?\"\nchoose \"Want a ping when it lands?\" \"Yes, ping me\"|\"Only if it breaks\""],
  [2400, "tap", "to-stage"],
  [700, "ask", "Show me the fix"],
  [1500, "say", SKETCH],
  [3600, "ask", "Walk me through the orbits"],
  [1500, "say", DECK],
  [3600, "ask", "Start a timer for my tea"],
  [1500, "say", TIMER],
  [2600, "ask", "And one for the pasta"],
  [1500, "say", TIMER2],
  [2600, "ask", "And the eggs"],
  [1500, "say", TIMER3],
  [3200, "tap", "stage-record"],
  [2400, "tap", "stage-fold-chip"],
  [4200, "end"],
];

const REPLIES = SCRIPT.filter(([, k]) => k === "say").map(([, , v]) => v);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Type into the page's own composer and press its send, the way a person does.
async function type(doc, words) {
  const q = (s) => doc.querySelector(s);
  q("[data-testid=stage-type]")?.click();
  await sleep(300);
  const box = q("[data-testid=stage-field] textarea") || q(".wb-composer textarea, textarea");
  if (!box) return false;
  const set = Object.getOwnPropertyDescriptor(box.ownerDocument.defaultView.HTMLTextAreaElement.prototype, "value").set;
  set.call(box, words);
  box.dispatchEvent(new box.ownerDocument.defaultView.Event("input", { bubbles: true }));
  await sleep(250);
  box.dispatchEvent(new box.ownerDocument.defaultView.KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
  return true;
}

export default function ChatHomeDemo({ light }) {
  const reduced = useReduced();
  const frame = useRef(null);
  const [round, setRound] = useState(0);
  const src = `/web/agent/${AGENT}?demo=chathome&theme=${light ? "light" : "dark"}`;

  const play = useCallback(async (live) => {
    const win = () => frame.current?.contentWindow;
    for (let i = 0; i < 100 && live.on && !win()?.yuiWebDemo; i++) await sleep(100);
    if (!live.on || !win()?.yuiWebDemo) return;
    await sleep(900);
    const doc = () => win().document;
    const click = (id) => { const el = doc().querySelector(`[data-testid=${id}]`); el?.scrollIntoView({ block: "center" }); el?.click(); };
    if (reduced) {
      for (const y of REPLIES) win().yuiWebDemo.say(AGENT, y);
      await sleep(1500);
      click("stage-record");
      await sleep(900);
      click("stage-fold-chip");
      return;
    }
    for (const [ms, k, v] of SCRIPT) {
      await sleep(ms);
      if (!live.on) return;
      if (k === "ask") await type(doc(), v);
      else if (k === "say") win().yuiWebDemo.say(AGENT, v);
      else if (k === "tap") click(v);
    }
    if (live.on) setRound((n) => n + 1);
  }, [reduced]);

  const [started, setStarted] = useState(0);
  useEffect(() => {
    const live = { on: true };
    if (started) play(live);
    return () => { live.on = false; };
  }, [started, round, play]);

  return (
    <div className="ch-app" data-testid="chathome" data-round={round}>
      <iframe key={`${round}:${light}`} ref={frame} className="ch-frame" title="Yui on the web, demo thread" src={src} onLoad={() => setStarted((n) => n + 1)} />
    </div>
  );
}



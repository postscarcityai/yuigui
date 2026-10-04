"use client";
// A small mic beside a text field (YUI-284, the web twin of the phone's field mic): tap, say it, tap again, and the words fill
// the field through the same mapper the forms use (lib/web/voicefill.mjs), so "name is Race week" and "Race week" both land.
// Where the browser has no speech recognition there is no button at all, never a broken one.
import { useEffect, useRef, useState } from "react";
import { fill } from "../../lib/web/voicefill.mjs";
import { createListener, speechApi, voiceProblem } from "../../lib/web/voice.mjs";
import { Icon } from "./ComposerParts";
import "./fieldmic.css";

export default function FieldMic({ label = "Name", onWords, testId = "field-mic" }) {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const [problem, setProblem] = useState("");
  const live = useRef(null);
  const say = useRef(onWords);
  say.current = onWords;
  useEffect(() => { setSupported(!!speechApi()); return () => live.current?.cancel(); }, []);
  if (!supported) return null;

  const land = (words) => {
    const got = fill(words, [{ key: "v", label, type: "text" }], {}).v;
    if (got) say.current(got);
  };
  const stop = async () => {
    const l = live.current;
    live.current = null; setOn(false);
    if (l) land(await l.finish());
  };
  const start = async () => {
    setProblem("");
    const l = createListener({
      onEnd: (words) => { if (live.current === l) { live.current = null; setOn(false); land(words); } },
      onError: (kind) => { if (live.current === l) { l.cancel(); live.current = null; setOn(false); setProblem(voiceProblem(kind)); } },
    });
    live.current = l; setOn(true);
    try { await l.start(); } catch (e) { if (live.current === l) { live.current = null; setOn(false); setProblem(voiceProblem(e.message)); } }
  };
  return (
    <>
      <button type="button" className={`gr-fieldmic${on ? " live" : ""}`} data-testid={testId} aria-pressed={on} aria-label={on ? "Stop listening" : `Say the ${label.toLowerCase()}`}
        onClick={() => (on ? stop() : start())}>{Icon.mic}</button>
      {problem ? <p className="ag-error gr-fieldmic-note" role="alert" data-testid={`${testId}-problem`}>{problem}</p> : null}
    </>
  );
}

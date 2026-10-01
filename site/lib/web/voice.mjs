// Voice in, text out (YUI-244): the browser's twin of Chat/PushToTalk.swift. The words come from the
// browser's own recognizer (SpeechRecognition), shown as they are said (interim results) and settled as
// they go (final results); a waveform of the mic's loudness follows the voice. Only the words are sent, as
// text, the same row a typed message is: no audio file is ever uploaded (the app does not upload voice
// either), so there is no transcript path to build beyond this. Where the browser has no recognizer
// (Firefox) the mic is not offered and the field is the way in.
export const BARS = 36;       // the waveform's bars, oldest first
export const BAR_EVERY = 80;  // ms between bars
export const SPEAKING = 0.4;  // louder than this counts as talking

export function speechApi() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const clamp = (n) => Math.max(0, Math.min(1, n));

// One listening session. start() rejects with an Error whose message is `no_speech` (no recognizer) or
// `denied` (the person said no); words, levels and the end come through the callbacks.
export function createListener({ lang, SR = speechApi(), media = globalThis.navigator?.mediaDevices, onWords = () => {}, onTick = () => {}, onEnd = () => {}, onError = () => {}, now = () => Date.now() } = {}) {
  let rec = null, stream = null, ctx = null, analyser = null, timer = null, buf = null;
  let finals = [], interim = "", levels = [], level = 0, bump = 0, alive = false, requested = false, settle = null;
  const text = () => [...finals, interim].join(" ").replace(/\s+/g, " ").trim();

  function tick() {
    let l = 0;
    if (analyser) {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
      l = clamp(Math.sqrt(sum / buf.length) * 5);
    } else {
      // No meter (the recognizer holds the mic): words arriving are the loudness.
      l = bump; bump = Math.max(0, bump - 0.12);
    }
    level = l;
    levels = [...levels.slice(-(BARS - 1)), l];
    onTick({ levels, level, loud: l > SPEAKING, words: text(), at: now() });
  }

  function release() {
    clearInterval(timer); timer = null;
    try { stream?.getTracks().forEach((t) => t.stop()); } catch { /* gone */ }
    try { ctx?.close(); } catch { /* gone */ }
    stream = ctx = analyser = null;
  }

  async function meter() {
    if (!media?.getUserMedia) return;
    try {
      stream = await media.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (!alive) { release(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      buf = new Uint8Array(analyser.fftSize);
      ctx.createMediaStreamSource(stream).connect(analyser);
    } catch { /* the meter is a nicety: the words still come */ }
  }

  return {
    get words() { return text(); },
    get levels() { return levels; },
    get active() { return alive; },
    async start() {
      if (!SR) throw new Error("no_speech");
      finals = []; interim = ""; levels = []; level = 0; bump = 0; requested = false;
      const r = new SR();
      r.lang = lang || globalThis.navigator?.language || "en-US";
      r.interimResults = true;
      r.continuous = true;
      r.onresult = (e) => {
        finals = []; interim = "";
        for (let i = 0; i < e.results.length; i++) {
          const res = e.results[i], t = res[0].transcript;
          if (res.isFinal) finals.push(t.trim()); else interim = `${interim} ${t}`.trim();
        }
        bump = 1;
        onWords(text());
      };
      r.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") onError("denied");
        else if (e.error !== "no-speech" && e.error !== "aborted") onError("failed");
      };
      r.onend = () => {
        const was = alive; alive = false; release();
        const done = text();
        if (settle) { settle(done); settle = null; }
        if (was && !requested) onEnd(done); // the browser closed it on its own (a long quiet)
      };
      rec = r;
      alive = true;
      try { r.start(); } catch { alive = false; throw new Error("failed"); }
      meter();
      timer = setInterval(tick, BAR_EVERY);
    },
    // Stop and keep the words: they are what was heard up to now.
    finish() {
      requested = true;
      if (!alive) { release(); return Promise.resolve(text()); }
      return new Promise((resolve) => {
        settle = resolve;
        setTimeout(() => { if (settle) { settle(text()); settle = null; } }, 1500);
        try { rec.stop(); } catch { alive = false; release(); resolve(text()); }
      });
    },
    // Stop and throw the words away.
    cancel() {
      requested = true; alive = false;
      try { rec?.abort(); } catch { /* gone */ }
      finals = []; interim = "";
      release();
    },
  };
}

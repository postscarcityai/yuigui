// Voice in, text out (YUI-244): the browser's twin of Chat/PushToTalk.swift. The words come from the
// browser's own recognizer (SpeechRecognition), shown as they are said (interim results) and settled as
// they go (final results); a waveform of the mic's loudness follows the voice. Only the words are sent, as
// text, the same row a typed message is: no audio file is ever uploaded (the app does not upload voice
// either), so there is no transcript path to build beyond this. Where the browser has no recognizer
// (Firefox) the mic is not offered and the field is the way in.
export const BARS = 36;       // the waveform's bars, oldest first
export const BAR_EVERY = 80;  // ms between bars
export const SPEAKING = 0.4;  // louder than this counts as talking
export const NO_AUDIO_MS = 4000; // the recognizer must have opened the mic by now (one fresh try at half)
export const TRASH_INSET = 16;  // the bar's side inset, the same on the trash and the mic (BarButtons.trashReach)
export const MIC_SIZE = 72;
// How far left a held finger goes to arm the trash (YUI-251): the trash sits flush left, mirroring the mic's inset
// on the right, so the reach is the bar's width less both insets and a mic, less a thumb of slack. Never under 110.
export const trashReach = (width, inset = TRASH_INSET, mic = MIC_SIZE) => Math.max(110, width - 2 * inset - mic - 40);
export const DEAF_MS = 2500;     // this much loud mic with no words at all: the recognizer is deaf

export function speechApi() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

// What to tell the person when the mic opened nothing (a plain line, never a silent Listening).
export function voiceProblem(kind) {
  switch (kind) {
    case "denied": return "The mic is blocked. Allow it in the address bar, or type.";
    case "no_speech": return "Voice needs Chrome or Safari here. Type instead.";
    case "network": return "The speech service can't be reached. Check your connection, or type.";
    case "language": return "This browser can't transcribe your language. Type instead.";
    case "no_audio": return "I can't hear a mic. Check the browser's input in its mic settings, or type.";
    case "deaf": return "The mic is live but no words came through. The browser's speech service isn't answering. Type instead.";
    case "failed": return "Voice stopped. Tap the mic to try again, or type.";
    default: return "";
  }
}

const clamp = (n) => Math.max(0, Math.min(1, n));

// One listening session. start() rejects with an Error whose message is `no_speech` (no recognizer) or
// `denied` (the person said no); words, levels and the end come through the callbacks.
export function createListener({ lang, SR = speechApi(), media = globalThis.navigator?.mediaDevices, onWords = () => {}, onTick = () => {}, onEnd = () => {}, onError = () => {}, now = () => Date.now() } = {}) {
  let rec = null, stream = null, ctx = null, analyser = null, timer = null, buf = null;
  let finals = [], interim = "", levels = [], level = 0, bump = 0, alive = false, requested = false, settle = null;
  let t0 = 0, gotAudio = false, loudMs = 0, everWords = false, flagged = false, retried = false;
  const text = () => [...finals, interim].join(" ").replace(/\s+/g, " ").trim();

  // Never a silent Listening (YUI-256): say so once when the recognizer never opened the mic, or when the mic
  // is loud and the recognizer still hears no words.
  function flag(kind) { if (flagged) return; flagged = true; onError(kind); }

  function tick() {
    const at0 = now();
    if (!gotAudio && !retried && at0 - t0 > NO_AUDIO_MS / 2 && !everWords) { retried = true; rebuild(); }
    else if (!gotAudio && at0 - t0 > NO_AUDIO_MS && !everWords) flag("no_audio");
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
    if (analyser && l > SPEAKING) loudMs += BAR_EVERY;
    if (analyser && loudMs >= DEAF_MS && !everWords && !text()) flag("deaf");
    levels = [...levels.slice(-(BARS - 1)), l];
    onTick({ levels, level, loud: l > SPEAKING, words: text(), at: now() });
  }

  function release() {
    clearInterval(timer); timer = null;
    try { stream?.getTracks().forEach((t) => t.stop()); } catch { /* gone */ }
    try { ctx?.close(); } catch { /* gone */ }
    stream = ctx = analyser = null;
  }

  // One recognizer, wired. `rebuild` swaps in a fresh one when the first never opened the mic.
  function build() {
    const r = new SR();
    r.lang = lang || globalThis.navigator?.language || "en-US";
    r.interimResults = true;
    r.continuous = true;
    r.onaudiostart = () => { if (rec === r) gotAudio = true; };
    r.onresult = (e) => {
      if (rec !== r) return;
      finals = []; interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i], t = res[0].transcript;
        if (res.isFinal) finals.push(t.trim()); else interim = `${interim} ${t}`.trim();
      }
      gotAudio = true; if (text()) everWords = true;
      bump = 1;
      onWords(text());
    };
    r.onerror = (e) => {
      if (rec !== r) return;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") onError("denied");
      else if (e.error === "network") onError("network");
      else if (e.error === "audio-capture") onError("no_audio");
      else if (e.error === "language-not-supported") onError("language");
      else if (e.error !== "no-speech" && e.error !== "aborted") onError("failed");
    };
    r.onend = () => {
      if (rec !== r) return;
      const was = alive; alive = false; release();
      const done = text();
      if (settle) { settle(done); settle = null; }
      if (was && !requested) onEnd(done); // the browser closed it on its own (a long quiet)
    };
    rec = r;
  }

  function rebuild() {
    const old = rec;
    rec = null;
    try { old?.abort(); } catch { /* gone */ }
    build();
    try { rec.start(); } catch { flag("no_audio"); }
  }

  async function meter() {
    if (!media?.getUserMedia) return;
    try {
      stream = await media.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      if (!alive) { release(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      try { await ctx.resume(); } catch { /* a suspended meter reads flat; the words still come */ }
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
      t0 = now(); gotAudio = false; loudMs = 0; everWords = false; flagged = false; retried = false;
      build();
      alive = true;
      try { rec.start(); } catch { alive = false; throw new Error("failed"); }
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

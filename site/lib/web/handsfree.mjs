// Hands-free (YUI-244), the rules only: no audio, no views. The twin of Chat/HandsFree.swift. Tap the mic once
// and it stays open between turns: you talk, a short quiet sends what you said, the reply comes in as text,
// and the mic opens again once it lands. The page feeds `handle` events and carries out the effect it
// answers, so every turn of the loop is tested (handsfree.test.mjs).
export const END_QUIET = 700;     // the quiet after speech that ends a turn (ms)
export const QUIET_LIMIT = 30000; // listening this long with no words pauses it, so an open mic doesn't run all day
export const READ_BEAT = 600;     // after a reply lands, before the mic opens again (ms)

// states: off | starting | listening | finishing | sending | waiting | reading | paused:<why>
// why: interrupted | quiet | failed | denied
export function createHandsFree() {
  let state = "off";
  const to = (s) => { state = s; };
  const handle = (e, arg) => {
    if (e === "stop") { const was = state === "starting" || state === "listening" || state === "finishing"; to("off"); return was ? { do: "closeMic" } : null; }
    switch (state) {
      case "off":
        if (e === "tap") { to("starting"); return { do: "openMic" }; }
        return null;
      case "starting":
        if (e === "micOpen") to("listening");
        else if (e === "micFailed") to(arg?.denied ? "paused:denied" : "paused:failed");
        else if (e === "interrupted") { to("paused:interrupted"); return { do: "closeMic" }; }
        return null;
      case "listening":
        if (e === "endOfSpeech") { to("finishing"); return { do: "finishMic" }; }
        if (e === "quietTooLong") { to("paused:quiet"); return { do: "closeMic" }; }
        if (e === "interrupted") { to("paused:interrupted"); return { do: "closeMic" }; }
        return null;
      case "finishing": {
        if (e === "heard") {
          const words = String(arg || "").trim();
          if (!words) { to("starting"); return { do: "openMic" }; }
          to("sending");
          return { do: "send", words };
        }
        if (e === "interrupted") { to("paused:interrupted"); return { do: "closeMic" }; }
        return null;
      }
      case "sending":
        if (e === "sent") to("waiting");
        else if (e === "sendFailed") to("paused:failed");
        else if (e === "replyLanded") { to("reading"); return { do: "readBeat" }; }
        else if (e === "interrupted") to("paused:interrupted");
        return null;
      case "waiting":
        if (e === "replyLanded") { to("reading"); return { do: "readBeat" }; }
        if (e === "interrupted") to("paused:interrupted");
        return null;
      case "reading":
        if (e === "readDone") { to("starting"); return { do: "openMic" }; }
        if (e === "interrupted") to("paused:interrupted");
        return null;
      default: // paused
        if (e === "tap" || (state === "paused:interrupted" && e === "interruptionEnded")) { to("starting"); return { do: "openMic" }; }
        return null;
    }
  };
  return {
    handle,
    get state() { return state; },
    get on() { return state !== "off"; },
    get micOpen() { return state === "starting" || state === "listening"; },
    get paused() { return state.startsWith("paused"); },
    get why() { return state.startsWith("paused:") ? state.slice(7) : null; },
  };
}

// When the person has stopped talking: words heard, then END_QUIET with no new words and no voice. Noise
// alone never ends a turn; it needs words. (Chat/HandsFree.swift EndOfSpeech)
export function createEndOfSpeech({ quiet = END_QUIET } = {}) {
  let words = "", lastSound = 0, heard = false;
  return {
    reset() { words = ""; lastSound = 0; heard = false; },
    // Feed the words so far and whether the voice is loud right now; true once the turn has ended.
    feed(text, loud, now) {
      const t = String(text || "").trim();
      if (t !== words) { words = t; lastSound = now; }
      if (loud) lastSound = now;
      if (t) heard = true;
      return heard && !!t && lastSound > 0 && now - lastSound >= quiet;
    },
  };
}

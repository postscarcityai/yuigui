// The PROP-2 hero (SITE-94): one turn at a time through the Jev layer, drawn in a phone.
// Names come from docs/research/jev-in-yui.md (SITE-92): questions shape, things, map, camera, camera_kind;
// shape is line|yesno|card|pages|full, camera_kind is plain|meal|document|barcode|mic_tuner|none.
// NOTHING here is a live Jev call. We have no key and have run no call (SITE-91). The decisions, confidences
// and times are worked examples inside the ranges TypeSafe claims (70 to 500 ms); the page says so.
// `screen` is real Yui Lines with the Jev layer; `guess` is the miss the guide alone tends to make.

export const CLAIM = "Worked examples, not a live Jev call. Speed and confidence are TypeSafe's claims, not measured by us.";

export const HERO = {
  layer: "Jev layer",
  withLabel: "With Jev",
  withoutLabel: "Without Jev",
  withoutNote: "No Jev layer. The model reads the guide and guesses.",
  withNote: "One fast call picks the shape. The model writes into it.",
  pickLabel: "Try a message",
  ms: "ms",
  hint: (auto) => (auto ? "Watching it play. Tap a message to take over." : "It is yours. Pick a message, or flip Without Jev."),
};

export const EXAMPLES = [
  {
    id: "line",
    say: "Am I up to date?",
    short: "One line",
    to: "one line",
    decision: [
      { q: "shape", a: "line", c: "0.91" },
      { q: "things", a: "1", c: "0.88" },
      { q: "map", a: "no", c: "p 0.02" },
      { q: "camera", a: "no", c: "p 0.01" },
      { q: "camera_kind", a: "none", c: "0.95" },
    ],
    ms: 96,
    hint: "shape=line. No screen, one sentence.",
    yl: `say You are up to date. Build 160 is the newest.`,
    guess: {
      shape: "deck",
      note: "Four pages to say yes. Chris, Sep 26: \"eight screens of basically nothing\".",
      yl: `deck "Your build status" +full
page "Status" "Let me check where you are on builds." layout=text
page "Your build" "You are on build 160." layout=text
page "The newest" "Build 160 is also the newest on TestFlight." layout=text
page "So" "There is nothing new to install right now." layout=text`,
    },
  },
  {
    id: "yesno",
    say: "Should I take the 3pm?",
    short: "Yes or no",
    to: "yes/no buttons",
    decision: [
      { q: "shape", a: "yesno", c: "0.94" },
      { q: "things", a: "1", c: "0.86" },
      { q: "map", a: "no", c: "p 0.03" },
      { q: "camera", a: "no", c: "p 0.01" },
      { q: "camera_kind", a: "none", c: "0.96" },
    ],
    ms: 118,
    hint: "shape=yesno. Answer, then two buttons.",
    yl: `say Yes. Nothing else is on your calendar until 5.
choose "Add it to your calendar?" Yes|No`,
    guess: {
      shape: "deck",
      note: "A deck for a yes or no. The buttons come on page 4.",
      yl: `deck "About your 3pm" +full
page "Your afternoon" "Here is a look at your calendar today." layout=text
page "Before the 3pm" "You are free until then." layout=text
page "After the 3pm" "Nothing is booked until 5." layout=text
page "My take" "Taking it looks fine." layout=text`,
    },
  },
  {
    id: "pages",
    say: "Walk me through the release",
    short: "Full-screen pages",
    to: "full-screen pages",
    decision: [
      { q: "shape", a: "pages", c: "0.89" },
      { q: "things", a: "3", c: "0.83" },
      { q: "map", a: "no", c: "p 0.02" },
      { q: "camera", a: "no", c: "p 0.02" },
      { q: "camera_kind", a: "none", c: "0.94" },
    ],
    ms: 142,
    hint: "shape=pages, things=3. A deck, full screen.",
    yl: `deck "Release 0.4" +full
page "What shipped" points="Sign in with Apple|Pick your crew|Faster threads" layout=text
page "What to try" "Open a thread and ask for a plan for your week." layout=text
page "What is next" "A tuner and a beat maker, if you vote for them." layout=text`,
    guess: {
      shape: "text",
      note: "A wall of text on the chat. Three things, no pages.",
      yl: `say Sure. Release 0.4 shipped Sign in with Apple, a new pick your crew screen and faster threads. To try it, open a thread and ask for a plan for your week, then look at how the answer comes back. Next up are a tuner and a beat maker, which depends on the votes. There are also a few smaller fixes in the changelog if you want the list, and I can send it as well.`,
    },
  },
  {
    id: "map",
    say: "Where's the closest coffee?",
    short: "A map",
    to: "a map",
    decision: [
      { q: "shape", a: "card", c: "0.86" },
      { q: "things", a: "1", c: "0.81" },
      { q: "map", a: "yes", c: "p 0.96" },
      { q: "camera", a: "no", c: "p 0.02" },
      { q: "camera_kind", a: "none", c: "0.97" },
    ],
    ms: 131,
    hint: "map=yes. Show places on a map.",
    yl: `map "Coffee nearby" caption="Three places, the closest first."
pin@a "Blue Door" 40.7,-74 +pulse
pin@b Roastery 42.4,-71.1
pin@c "Corner Cup" 39.9,-75.2`,
    guess: {
      shape: "text",
      note: "Places described in words. No map.",
      yl: `say The closest coffee is Blue Door, about four minutes on foot, then the Roastery, and Corner Cup is a bit further east. Blue Door is on the corner of the main street and it opens at seven.`,
    },
  },
  {
    id: "meal",
    say: "Log my lunch",
    short: "Meal camera",
    to: "the meal camera",
    decision: [
      { q: "shape", a: "card", c: "0.84" },
      { q: "things", a: "1", c: "0.82" },
      { q: "map", a: "no", c: "p 0.01" },
      { q: "camera", a: "yes", c: "p 0.97" },
      { q: "camera_kind", a: "meal", c: "0.93" },
    ],
    ms: 124,
    hint: "camera=yes, camera_kind=meal.",
    yl: `camera@plate "Snap your lunch" +inline`,
    guess: {
      shape: "text",
      note: "It asks in words. The person hunts for the camera.",
      yl: `say Happy to. What did you have for lunch? You can type it, or send me a photo and I will log what is on the plate.`,
    },
  },
  {
    id: "tuner",
    say: "Tune my guitar",
    short: "Tuner mic",
    to: "the tuner",
    decision: [
      { q: "shape", a: "full", c: "0.88" },
      { q: "things", a: "1", c: "0.85" },
      { q: "map", a: "no", c: "p 0.01" },
      { q: "camera", a: "no", c: "p 0.04" },
      { q: "camera_kind", a: "mic_tuner", c: "0.90" },
    ],
    ms: 109,
    hint: "shape=full, camera_kind=mic_tuner.",
    yl: `>full tuner guitar`,
    guess: {
      shape: "text",
      note: "Tips in words, and the tuner is never opened.",
      yl: `say Standard tuning from the thickest string is E, A, D, G, B, E. Pluck each string and turn the peg until the note matches. A tuner app can help if you have one nearby.`,
    },
  },
];

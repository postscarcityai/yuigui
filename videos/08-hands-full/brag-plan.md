# Brag plan: Hands full (08-hands-full)

## Angle

Marketing, not a UI tour. One real moment everyone has had: you are cooking, your hands are covered in flour, and the phone is on the counter. You tap the mic once with a knuckle (it leaves a floury print on the glass) and from then on you only talk. Basil, the person's own cooking agent (green, #2F9E5B), answers on the whole screen: a drawn frittata, then the steps one part at a time. You say "next" instead of touching the glass. The wow: "Into the oven. 12 minutes." The phone locks, and the timer keeps counting on the lock screen and in the Dynamic Island in Basil's green while you walk away. Time jumps (a clear film cut: the lock screen clock goes 9:41 to 9:53 while the timer drains), it dings, and dinner is done. One question last, one Send: save it to the shelf.

No build numbers, no "the chat is the record", no code lines. The words on screen are about the person, not the layout.

Light theme. The chrome around the phone is cream, ink and coral; inside, the stage wears Basil's green.

## Facts used (all shipped unless listed under "beyond")

- **Hands-free voice** (progress.json, Sep 26, YUI-14; showcase "hands-free-voice", `app: native`, build 155): "Tap the mic once and Yui keeps listening between turns. Your words show as you say them, a short pause sends them ... and the mic opens again once it lands." The bar says where you are ("Listening"). Shown as: one tap at the start, then the mic ring keeps pulsing and a small Listening chip hears each word.
- **Timer on the lock screen** (showcase "live-timer", YUI-30, shipped Sep 24, `app: native`): "A running timer keeps counting on the lock screen and in the Dynamic Island, in the agent's look." Drawn after `site/public/progress/yui30-lock.webp` and `yui30-compact.webp` (dark card, big time, pause and X, a bar; a ring and the time in the island).
- **timer** (spec/YL.md section 4: `timer`, `+auto` starts on arrival) and **step** (`time=` adds a small countdown for protocol steps; showcase "step", `app: native`). The oven timer is a `timer 12m` chunk (a timer takes the whole phone on the stage); the spinach part is a step with `time=2m`.
- **The shelf and `save`** (spec/YL.md section 5, Saved screens and the shelf; showcase "shelf", YUI-32, `app: native`): an agent saves a screen by name, it lands on the shelf, a tap reopens it full screen.
- **The stage** (spec/YL.md section 5, Stage first, YUI-119): the first send opens the stage, the person's words small at the top, a breathing mark in the agent's color with the working words (`doing`), the reply as parts with segments at the top, questions last on one screen with one Send.
- **Status** (updated Sep 27): the stage shipped to phones in Yui 0.4.0 (build 204, Sep 27; ROADMAP.md, showcase.json release-040 `stage-in-app`, `app: native`). The outro says: "In Yui 0.4. Public beta on TestFlight."
- **Demo content** inside the phone (the recipe, "Hi Sam", the steps, 200°C) is illustrative, as README allows. No claims, numbers or quotes.

## Storyboard (100 BPM, a beat is 0.6 s, a bar 2.4 s, 14 bars = 33.6 s)

| Time | Scene | Left (ink) | Right (coral) |
|---|---|---|---|
| 0 to 4.8 | The phone lies tilted on the counter, two floury prints on the glass and flour on the bezel. Basil's idle stage: "Hi Sam. What's cooking?" The phone rises flat; a knuckle taps the mic once (4.2), leaving a white print on it | Flour on your hands? | Just talk. |
| 4.8 to 9.6 | Hands-free listening: "What can I make with eggs, spinach and feta?" streams in. Working: "Checking what goes together" | Say what's in the fridge. | Get dinner, step by step. (9.6) |
| 9.6 to 12.0 | Part 1 (drop): a drawn frittata in its pan, "Spinach and feta frittata. 20 minutes." Push in | | |
| 12.0 to 16.8 | The Listening chip hears "Next." (11.4, 13.8, 16.2) and the part moves on a beat later: "Whisk 6 eggs with the feta." (a whisk that whisks), "Wilt the spinach. 2 minutes." (a ring counts down, jump-cut to done) | Say next. | Your hands stay in the bowl. |
| 16.8 to 18.4 | Part 4: "Into the oven. 12 minutes." A big ring timer starts in Basil's green. Push in | | |
| 18.4 to 24.0 | The screen sleeps, the lock screen wakes (19.2): the live timer card in green, the island's ring and time. Push in. Time jumps 20.4 to 22.8 (clock 9:41 to 9:53, timer 11:56 to 0:00), ding at 22.8. Poster at 21.3 | Walk away. | Your lock screen keeps count. |
| 24.0 to 28.8 | Unlock, the stage: "Let it rest 2 minutes. Dinner." (a sliced frittata, steam). Then one question: "Save it to your shelf?" Yes (26.4), Send (27.0): "Saved to your shelf." | Dinner, done. | Saved for next time. |
| 28.8 to 33.6 | Outro: Cook with your hands full. yuigui.com/start. In Yui 0.4. Public beta on TestFlight. | | |

## Beyond what is shipped, or approximated

- **Saying "next" to move to the next part is not built as a stage command.** Hands-free voice ships (build 155): what you say goes to the agent as a message, and the agent can answer with the next step. The film shows the stage moving on the word, with the next arrow dipping as if tapped. Treat it as how it should feel, not a shipped shortcut.
- **The spinach countdown and the oven timer are jump-cut.** 2:00 drains in about 1.5 s, 12:00 in 2.4 s, with the lock screen clock moving 9:41 to 9:53 so the cut reads as a cut.
- **The island and the lock card at the same time.** iOS shows a Live Activity as a lock screen banner; the compact island is drawn on the same frame so both places read at once. The looks follow the yui30 captures, redrawn in HTML.
- **A step's `time=` countdown** is drawn as a ring beside the picture; the app draws it smaller.
- **The shelf** is shown as the confirmation after Send; the shelf row itself lives at the top of the chat and is not shown.
- The listening chip's look is the video's (the app's bar says Listening, Your turn and so on in the composer area).
- No code-line pills: this one is for people who have not used Yui yet.

## Sound

`music.py` with `kit/sound.py` `dub()`: 100 BPM, swing 30, in G (Gmaj7 Em7 Cmaj7 D). The hook is thin (level 1 then 2), the ask sits at level 2, a siren and the drop land on the frittata at 9.6 (level 3 for the steps). A swell and a crash into the lock screen at 19.2, level 4 with the melodica for the wow, a run of clock ticks speeding up under the time jump, and a two-note timer ding at 22.8. Back to 3 for dinner and the save, 2 and 1 for the outro, ending on G. A bell on each part, a soft pop on each heard "next", a G arpeggio on Send, a tap on the same times as the finger (score.js is shared by picture and music).

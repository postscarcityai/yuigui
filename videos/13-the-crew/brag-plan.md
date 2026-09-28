# Brag plan: Yui 0.5.0, the crew feels ready (13-the-crew)

## Angle

The 0.5.0 announcement, two minutes, for the top bar on every page of yuigui.com. Chris, Sep 28: "we need to make a 2 minute announcement for v0.5.0. demo all the cool features and the different agents we ship with. this should be the coolest video yet with some special animations."

0.5.0 is about the crew: each agent should feel like someone ready for you, not an empty chat. So the film opens on the six agents that ship with Yui, follows one day through every 0.5.0 feature in the order a person meets them, and ends on the crew as cards.

## How it was made

- Every screen inside the phone is a real capture from the iPhone simulator on the demo account (`site/public/progress/yui166-*`, `yui103-*`, `yui167-*`, `yui168-app-*`, `yui144-*`). `prep.py` makes clean plates (the capture with a region filled row by row) so the parts can come in one at a time: patches of the same capture pop, wipe or sweep in on top. Nothing inside a capture was redrawn except the two below.
- Drawn over a capture: the talking pill in snap and say (waveform and words as they are said, over the capture's own pill so the words can arrive one at a time) and Gouda's looper grid (same pattern, same colors, a playhead that walks with the music).
- Rebuilt in HTML: the tables scene, from the live runs on `/mockups/tables` (`yui171-*`): Basil on Hermes, Who keeps your tables?, Chef on Claude via MCP, the Foods table, Add cottage cheese.
- Special animations: the cold open (six badges pop one a beat, orbit and spin into the phone), a cream iris from the phone on the drop, the photo flying up into the thread, rows cascading and the macro ring sweeping, a 3D flip between agents, an iris from each tap (the name chip, an ask, Open Basil in Basil's red), the Foods table hopping from one phone to the other with a spark trail, the crew dealt as cards, a tilted wall of real 0.5.0 captures, badges orbiting the wordmark.

## Facts used (all in build 278)

- **Yui 0.5.0 is build 278 on TestFlight** (docs/thoughts/yui-0-5-0-the-crew-feels-ready.md, Sep 27).
- **Snap and say** (YUI-166): one press takes the photo, keep holding and say what's in it, let go and both go together. "Two eggs in a lot of butter", Basil's "Two eggs, and the butter counts."
- **A meal without a scale** (YUI-103): Basil answers at once ("Got it, working out the macros."), then posts one breakdown and remembers each food.
- **Meet the agent** (YUI-167): the hello on the full screen, the picker says what each one does, About lists three things to ask and a tap sends one.
- **Every agent has a home** (YUI-168): shortcuts over the bar (Start a workout, My split), Waiting on you, swipe left for starter screens (Arnold's week, Gouda's looper).
- **Hand-off** (YUI-144, spec/YL.md): `card "Basil" … url=yui://agent/basil cta="Open Basil"`; Basil answers in his own thread.
- **Tables for any agent** (YUI-171): hand Basil's Foods table to a Claude agent and the same question draws the same screen; `put foods Food="Cottage cheese" Cal=98 Protein=11` is the call from the mock.
- **The crew** (yui145-add-crew, yui167-picker): Yui, Arnold, Basil, Gouda, Penny, Quill, "They live in Yui. Nothing to set up." Each one's line is the picker's own words. Colors sampled from the add-crew capture.
- **Bring your own** (site/app/page.js): Hermes, OpenClaw, Claude Code, Cursor and other MCP clients, A2A and AG-UI agents, anything that answers a webhook.

## Storyboard (100 BPM, a bar is 2.4 s, 50 bars is 120 s)

| Time | Scene | Left | Right | Line |
|---|---|---|---|---|
| 0 to 9.6 | Dark. Six badges pop one a beat, "Yui 0.5.0", "The crew feels ready.", they spin into the middle, the phone lands and a cream iris opens on the drop | | | |
| 9.6 to 24 | Basil's camera over a pan of eggs. Hold the shutter (11.4 to 16.2): flash, the waveform, the words land. Let go: the photo flies up, the Breakfast card and the answer wipe in | Hold to snap. / Let go. | Say what's in it. / Photo and words, together. | `→ Basil photo + "Two eggs in a…"` |
| 24 to 33.6 | Lunch: the photo, the words, "Got it, working out the macros." Scroll to the breakdown: rows cascade, the macro ring sweeps | A meal, no scale. / Then one breakdown. | Basil answers at once. / It fits a phone. | `> table Lunch Food\|Cal\|Protein …` |
| 33.6 to 50.4 | Flip to Arnold: his hello wipes in line by line. Tap the name, the picker irises open, a highlight walks all six. About slides in, tap Build my training week: "Here is your week." | Meet each agent. / Tap the name. / About has three asks. | It says hello first. / See what each one does. / A tap sends one. | |
| 50.4 to 69.6 | Arnold's home: Waiting on you, the shortcuts pop. Swipe left to his week. Flip to Gouda's looper, playing on the song's eighths | Every agent has a home. / Swipe left. / Gouda's looper. | Its own shortcuts. / Its starter screens. / Ready to play. | |
| 69.6 to 79.2 | Flip to Yui: "What should I eat after leg day?", Yui passes it on, the Basil card. Tap Open Basil: a red iris, Basil already answering | Ask Yui about dinner. / With a note. | Yui passes you to Basil. / Basil is already answering. | `> card url=yui://agent/basil …` |
| 79.2 to 93.6 | Two phones. Basil on Hermes shows the Foods table; Switch agent, Chef; the table hops to Chef on Claude via MCP; Add cottage cheese, 8 rows | Your tables belong to you. / Hand them to Claude. | Not to one agent. / Same rows. Same screen. | `> put foods Food="Cottage cheese" …` |
| 93.6 to 102 | The crew dealt as six cards, then Or bring your own: eight chips | Your crew lives in Yui. | Nothing to set up. | |
| 102 to 108 | A tilted wall of real 0.5.0 captures: Snap and say. Meals, no scale. A home each. Hand-offs. Your tables. | | | |
| 108 to 120 | Outro: the wordmark, the badges orbit. The crew feels ready. yuigui.com. Yui 0.5.0 is on TestFlight now | | | |

Poster: 101.4, the crew fanned out with the chips.

## Beyond what is shipped, or approximated

- **The cold open, the crew cards, the wall and the orbiting badges** are film devices. The crew and their lines are real.
- **Transitions** (the flips, irises, the photo flying, the table's hop) are the film's, not the app's. In the app the hand-off moves you to Basil's thread by itself about a second and a half after the card lands; the film shows the Open Basil tap, which does the same from history.
- **The tables scene** is rebuilt from the web mock at `/mockups/tables`, with its own words. The app draws the same table (YUI-171 shipped in 0.5.0); the two phones side by side and the table flying between them are a way to show that the rows belong to you.
- **The talking pill** is drawn over the capture's own pill so the words arrive as they are said; the words are the capture's.
- **Gouda's looper** plays the capture's pattern in time with the film's music (100 BPM; the capture says 92).
- **Picker to About**: About opens from the agent's menu in the app; the film slides it in without that step.
- Demo content (the eggs, the lunch, the leg day question, the Foods rows) is the demo account's, as in the captures.

## Sound

`music.py` with `kit/sound.py`: 100 BPM, D major, dub, one chord a bar (Dmaj7 Bm7 Gmaj7 A). A thin, dark intro with a bell on each badge, a siren into the drop on bar 4, the full groove for snap and the meal, the melodica for the picker, the hand-off and the tables through the crew and the wall, then Bm7 Gmaj7 A home to D for the outro. A tick and an open hat on the shutter, a pluck on each spoken word, a bell on each card that lands, an arpeggio on each iris, Gouda's pattern on top of the groove while the looper plays, a rise under the table's hop and a bell where it lands, a swell and crash on each flip and cut, a tap on every finger tap.

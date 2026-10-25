# Plan: the dialogue stage (DLG)

Status: plan, Oct 25 2026. Nothing built yet. Owner: Yui. Scope calls: Chris. Planned with Fable 5.1.

## 1. The idea in one paragraph

Name: **Beats**. The agent talks, and the stage keeps up. Every reply is a run of short beats. A beat is one spoken sentence or two, and what it changes on screen. The voice carries the words. The screen carries only the main points, pinned as anchors that stay, plus the picture that moves under them. At a waypoint the flow stops and waits: a choice drawn into the picture, or just a pause for you to say something. You can talk at any moment: the agent goes quiet within a blink, hears you, and the next beats continue from where you are, with the anchors still there. Nothing opens on top, nothing is a slide, and the chat keeps every beat as the record. It is the opposite of a blue circle: a conversation where all the ways of showing flow through one living screen while the talking stays primary.

## 2. How it works today (from the code)

- **Replies land whole, one row per reply.** The plugin inserts one `yui_messages` row per reply and never splits it (`~/dev/yui/hermes-plugin/yui/adapter.py` header, `spec/RELAY.md` "the host sends one row per reply"). The app polls every 350 ms while a reply is owed and 1.5 s idle (`Yui/Sources/Presets/ChatStore.swift`, `replyPoll`, `idlePoll`). The only thing that streams today is a film: one row per scene with `film=` and `part=` (`spec/MOTION.md` 0.5, `hermes-plugin/yui/motion.py`, native `supabase/functions/_native/turn.ts` `makeFilm`).
- **The stage cuts a reply into pages, silently.** `StageChunks.of` makes a chunk from a `say` or paragraph plus the next picture, packs up to 3 ideas and 60 words a page, and lifts every question to one screen at the end with one Send (`Yui/Sources/Stage/StageChunks.swift`, mirror `site/lib/yl/chunks.mjs`). A tap turns the page (`StageFirst.swift` `chunk`, `step`). No stage chunk is ever spoken: `StageFirst.swift` has no speech code.
- **Voice in is hands-free but turn-locked.** `HandsFree.swift` is a state machine: listening, 0.7 s quiet ends the turn, `sending`, `waiting` with the mic closed, `replyLanded`, a 600 ms `readBeat`, then the mic opens again. The mic is shut from send to reply. Words come from on-device SpeechAnalyzer (`Yui/Sources/Chat/PushToTalk.swift`), session `.playAndRecord` in `.measurement` mode.
- **Voice out exists only for films and `narrate`.** `Yui/Sources/Motion/MotionSpeech.swift` has a cue scheduler over AVSpeechSynthesizer (pause, seek, mute, one line at a time, VoiceOver-aware). `FlowPresets.swift` has `Narrator` for `narrate`. Neither touches the stage's own pages.
- **Films are a separate clock.** `motion-player.html` runs scenes pure in `t` inside a WKWebView, with `api.say` cues and `api.hit` targets (`MotionPlayer.swift`, `MotionView.swift`). `DeckFilm.swift` compiles an explainer deck into such a film on the phone, with Replay and Answer floating only after the end. `MorphStage.swift` pages decks the film cannot draw, morphing the drawing between pages.
- **The guide pushes agents toward the old shape.** `spec/CHANNEL.md` v50 (about 10k tokens) says one line and one picture, questions last in one `plan`, and any explainer is a single `motion` line. Nothing in it lets an agent pace, pin or pause.
- **The web canvas prototype is the furthest along.** `site/public/playground/canvas.html` plus `canvas/player.html` and the `yl-*.mjs` modules: scrub by drag, tap names a part, hold asks, drag moves, say-while-touching sends `yl say "..." touched=<part>`, Back undoes, every YL preset draws as touchable marks, keyboard and screen reader work, frame budget tested (`spec/MOTION.md` 0b, YUI-323 to YUI-339). Agent answers are canned.
- **Streaming plumbing exists in pieces.** The YL stream parser renders line by line (`spec/YL.md` section 8; `ChatStore.stream()` feeds lines 220 ms apart for demos). The Hermes gateway has a draft-streaming contract (`supports_draft_streaming`, `send_draft`, `edit_message` in `~/.hermes/hermes-agent/gateway/platforms/base.py`) that the yui adapter does not implement. The native agent already streams from the model (`_native/openai.ts` `onDelta`) but only uses it for film scenes. The claude shim fakes streaming: `make_stream_chunks` in `~/.local/share/hermes-claude-shim/server.py` emits one delta holding the whole answer.

**Where this falls short of what Chris described.** The stage shows every word and speaks none. A reply arrives whole, then plays as pages you tap, so it is neither continuous nor paced by talking. Choices come only at the end (`StageChunks.lift`, `DeckFilmStage` `after`). The mic is closed while the agent answers, so there is no talking back mid-flow. Main points do not persist: each page replaces the last. A film is a thing you watch, with its own chrome and end screen, not a dialogue. DeckFilm (dce555a) made the film prettier and the dialogue worse.

## 3. The experience

Chris, on the couch, taps the mic once. Hands-free is on.

- **0.0 s.** "How does the heart pump blood?" His words stream onto the stage as he says them, big, bottom center, the orb a tall pill breathing with his voice.
- **0.7 s.** Quiet. The words go. The gist "how the heart pumps" settles small, top left in italics. The orb turns over itself: thinking. No typing dots.
- **1.5 s.** The first beat row lands. The voice starts: "The heart is two pumps, side by side." As the word "pumps" is spoken, the first anchor pins top left: **Two pumps**. Under the anchors, a heart outline draws itself in the agent's colors, both halves, part by part.
- **4.5 s.** Beat 2, no gap: "The right side takes blood from the body and sends it to the lungs." Anchor 2 slides in under anchor 1: **Right side: body to lungs**. The right atrium and ventricle light; a blue arrow traces body, heart, lungs. Anchor 1 dims a step. The record, top right, gets its first two rows quietly.
- **9.0 s.** Chris talks over it: "hold on, why two pumps?" Within 150 ms the voice is silent and the flow pauses on beat 2's picture. His words show at the bottom. The right side of the heart stays lit. Nothing is lost, nothing opens. On the quiet, one line goes to the agent: `[yui] b2 beat say "hold on, why two pumps" at=2 anchor="Right side: body to lungs"`, and a Stop goes for the rest of the old turn.
- **10.5 s.** A new beat: "Because the lungs need low pressure and the body needs high." Anchor: **Two pressures: lungs low, body high**, pinned under the others, and a two-bar chart grows beside the heart, bars touchable. The anchors that were already there stay.
- **14 s.** "Want me to carry on with the left side?" The flow stops at a waypoint. No buttons appear. The two halves of the heart are the choice: the left side pulses softly, a small "Go on" chip sits over the bar. The mic ring breathes. He can tap the left side, say "yes", say something else, or walk away. The anchors wait.
- **15 s.** "Yes." The voice resumes mid-flow: "The left side takes the fresh blood back and pushes it out to the whole body." Anchor 4: **Left side: lungs to body**. The left chambers light, a red arrow traces out the aorta. Beat 5: "That is why the left wall is thicker." The left wall thickens on the picture, and the word "thicker" tags it. No new anchor: a detail, not a main point.
- **24 s.** The last beat ends. The picture holds. Four anchors stand as the summary of what was said. One chip: "Ask more". The mic opens on its own. The record holds six rows: each beat's anchor with its picture small beside it. Tapping any row later reopens the stage at that beat and the flow can be scrubbed back and forward with a finger.

**"What's left before launch?"** Same shape, different parts. Beat 1 is spoken and pins **3 cards left**. The picture is a timeline that grows a row per beat as the voice names each: **Barge-in: in test**, **Guide rewrite: not started**, **Memory check: green**. Waypoint drawn into the timeline: "Which one first?" The three rows are the buttons. He says "the guide" while touching the row. The agent gets both, `yl say "the guide" touched=Guide rewrite`, and the next beat is one sentence and a patch: that row moves to Now.

**Contrast.** ChatGPT voice mode gives the same talking and a blue circle. Here the talking has the same pace, but every main point lands as a mark you can see later, every picture moves with the sentence that explains it, every choice is drawn into the picture, and you can cut in at any word. Nothing stacks on top, and the whole thing is in the record afterward.

## 4. The model

Core concepts:

- **Beat.** The smallest unit of the dialogue: one or two spoken sentences, plus what they change on screen (an anchor, a picture, a patch, a waypoint). Beats play one after another, paced by the voice.
- **Anchor.** A main point, pinned on screen when its beat is spoken. Four to eight words. Anchors persist for the whole turn and the follow-ups it spawns; older ones dim, never leave, until the person starts a new topic (a new ask with no `touched=` and no `at=`). Anchors are marks: tap one to hear its beat again, hold one to ask about it.
- **Picture.** Any drawing the app already has (shapes, sketch, chart, stat, map, timeline, math, a motion hero) living under the anchors and changing by patch between beats. One picture per turn by default; a new picture morphs from the last (MorphTween) rather than replacing it.
- **Waypoint.** A pause in the flow where the person acts. Either a choice drawn into the picture (the marks are the options) or a plain pause ("Go on?"). The flow stops, the mic listens, the anchors stay. Any answer, tap or voice, continues.
- **Interruption.** The person talks while the agent does. The voice stops at once, the flow pauses on the current beat, the words go to the agent with the beat and the anchor as context, and the agent's reply continues the same flow.
- **Timeline.** Every beat of a turn, in order, on one clock. The record is the timeline written down. Scrub it like a film; tap a beat in the record to reopen the stage there.

**Both the app and the agent make beats.** The app infers beats from whatever arrives, so every agent on the channel today gets the dialogue stage with no change. An agent that wants control marks them with two small new lines. Rules for inference on device, mirrored in `site/lib/yl/beats.mjs`:

1. Plain text: each sentence is one spoken line (`LongText.sentences`, already in the app). Sentences pair into a beat when the second is under 12 words. A `Label: value` line is an anchor (the ledger rule in `StageChunks.isLabel`). A `say` of 8 words or fewer is an anchor. A sentence that starts a paragraph is a spoken line and also pins its first clause as an anchor when the paragraph has 2 or more sentences. A `page` title is an anchor and its body the spoken lines.
2. Pictures attach to the beat before them (the `open` chunk rule in `StageChunks.of`). A `~patch` attaches to the beat before it and plays when that beat is spoken.
3. Any `choose`, `pick`, `ask` or `slide` inside the flow is a waypoint where it stands. The old rule, questions wait for the end, goes. A `plan` is still gathered to one screen (it is a form, not a dialogue).
4. A `motion` film is a beat whose picture runs on the film clock; its `api.say` cues are the spoken lines and each cue's first clause is an anchor only when the agent marked it (see `anchor`).

**Spec additions, minimal and backward compatible** (YL.md section 5b, "The dialogue"):

```yui
anchor "Two pumps"
anchor "Right side: body to lungs" sub="low pressure"
wait
wait "Carry on with the left side?" "Go on"|"Ask something"
wait "Follow the blood from where?" Lungs|Body +in
```

- `anchor "words" [sub=]`: pins a main point for the rest of the turn. Words, 8 at most. Sends nothing. A tap replays its beat's line; a hold sends `[yui] <id> yl ask <words>` (the canvas rule, MOTION.md 0b). Old builds: `compat.py` downgrades it to `say`.
- `wait [question] [options] [+in]`: a waypoint. Alone, the flow pauses with a "Go on" chip and the mic open. With a question and options it is a `choose` that stops the flow where it stands; `+in` asks the renderer to draw the options into the picture (the marks whose names match the options become the buttons, the same matching `StageChunks.compare` does). The answer comes back as `[yui] <id> wait choice=<option>`; a spoken answer comes as `[yui] <id> wait say "<words>"`. Old builds: downgraded to `choose`.
- Event line for an interruption: `[yui] <turn> beat say "<words>" at=<n> [anchor="<words>"] [touched=<mark>]`. `at` is the beat the person cut into. The agent answers with beats that continue; it never resends the anchors.
- Rows on the wire: a streamed reply is several rows that share `meta.flow {id, part, last}`, exactly like a film's `film=` and `part=`. Each row is whole YL or whole sentences, never a half line. Insert only: the connector role cannot update rows, so a beat is a row and a row is never edited. A phone that missed part 1 starts from the part it has. One push, on part 1. (RELAY.md, "Flows".)

No new preset for pictures. No change to how questions are answered. Everything older still parses.

## 5. Real-time

What it needs to feel live: the first spoken word under a second after the person stops talking (native) and under two seconds (Hermes); each later beat arriving before the voice finishes the one before; silence within 150 ms when the person speaks; the first anchor pinned with the first sentence.

**Agent and plugin.**
- Exists: Hermes gateway draft streaming (`supports_draft_streaming`, `send_draft`, `_interim_send` marker, `edit_message`) in `~/.hermes/hermes-agent/gateway/platforms/base.py` and `run.py`. Film rows streamed per scene (`motion.py`). `doing` written mid-turn about once a second (`doing.py`). Stop as a control row (YUI-190). The native agent streams deltas from the model (`_native/openai.ts`) and writes film rows as they complete (`turn.ts` `makeFilm`).
- Build: the yui adapter returns `supports_draft_streaming = True` and implements `send_draft` by cutting the growing draft at sentence ends and YL line ends, inserting one flow row per cut (`meta.flow`), never editing. The final `send` writes the last part with `last`. The claude shim must forward real `stream-json` deltas as SSE deltas instead of one lump (`server.py` `make_stream_chunks`). The native agent's plain reply uses the same `onDelta` path it already uses for films and writes beat rows. `compat.py` gates flow rows behind `FLOW_BUILD` and downgrades `anchor` and `wait`.

**Relay.**
- Exists: `yui_messages` rows, RLS, Realtime (the plugin subscribes to it today), `meta.turn`, push on insert.
- Build: nothing structural. One documented meta shape (`flow`), a trigger that pushes only on part 1 of a flow, and the app subscribing to Realtime for the open thread so a beat row arrives in about 100 ms instead of the 350 ms poll (the poll stays as the fallback).

**App.**
- Exists: on-device speech in (`PushToTalk`), the hands-free state machine, AVSpeechSynthesizer with a cue scheduler (`MotionSpeech`), the YL stream parser, `MotionFilms` joining film rows, `StageChunks`, the motion look timings, the visual that already listens to the agent's voice (`VisualSound`), a Stop control.
- Build: join flow rows into one turn as they land (generalize `MotionFilms`). A `Speaker` built from `MotionCueScheduler` that speaks beats in order as they arrive and advances the stage when a line finishes (speech-paced, not word-count paced; muted falls back to `DeckFilm.window`, about 0.36 s a word). Barge-in: keep the mic open while speaking, session `.playAndRecord` in `.voiceChat` mode for echo cancellation, and treat voice energy over `PushToTalk.speaking` plus a first volatile word as the cut. Stop speech, pause the flow, show words, send on the usual 0.7 s quiet with `at=` and `anchor=`, and send Stop for the old turn. `HandsFree` gains one state: `talking` (the agent speaks, the mic listens), replacing `waiting` once the first beat lands.

Latency budget, native agent: 0.7 s end-of-speech quiet, 0.1 s insert, 0.1 s Realtime, 0.3 s model to first sentence, 0.15 s synthesizer start. About 1.4 s to the first word. Hermes adds its turn start; measure, target under 2.5 s. The film path stays a separate lane and is not on this budget: a film is one kind of picture, never the dialogue.

## 6. DeckFilm, MorphStage, StageChunks, the YUI-321 canvas

- **DeckFilm: retire as a path.** The compiled film with Replay and Answer at the end is the thing Chris rejected. Keep two parts and move them: the pacing math (`window`, `beats`, `firstBeat`, `tail`) becomes the muted fallback pace of the Speaker, and the hero scene (`DeckFilm.scene`, the kit drawing a `shapes` page part by part) becomes one picture renderer a beat can use. `DeckFilmStage`, `canFilm` and `StageDeck.film` go. `DeckFilmTests` is rewritten for the two kept parts.
- **MorphStage: fold in.** Its morph tween (`DeckMorph`, `MorphTween`) is exactly how a picture should change between beats. The page chrome (swipe to turn, page index, half-height layout) goes. A deck arriving today plays as beats: a page title is an anchor, the body is spoken, the picture morphs.
- **StageChunks: keep as the base, change two rules.** `of()` becomes the beat builder (chunks are beats with a spoken line). Drop `lift` and the questions screen for the dialogue (waypoints replace them; a `plan` keeps the one-screen form). Drop `pack` (anchors replace stacking ideas on a page). Mirror in `beats.mjs` with the same test cases. Behind a `dialogue` flag until it is the default, so nothing an agent sends today breaks.
- **YUI-321 canvas prototype: fold in, it is the home of this work.** The canvas already has the right physics: one clock, every mark touchable, hold asks, say-while-touching, drag, Back, YL as marks, keyboard, a frame budget. Beats add a voice to that clock, anchors as marks, waypoints as the pause, and real streamed replies instead of canned ones. MOTION.md 0b stays true; a new 0c says how beats ride on it. The card's native first slice is superseded by DLG-7.

## 7. Design calls

1. **Voice carries the words, the screen carries the points.** Not captions of every sentence. This is the single biggest change and the one that makes it not a slide deck. The record keeps the full text, so nothing is lost.
2. **Speech paces the stage.** The next beat's picture change lands when the sentence that explains it is spoken, not on a timer and not on a tap. Muted, the reading pace from DeckFilm applies.
3. **Anchors persist for the turn and its follow-ups.** They dim by age but never scroll away; past eight, the oldest fold into one small count the person can tap. A new topic clears them with a short sweep.
4. **Waypoints replace questions-at-the-end.** A question sits where the agent put it. A `plan` is the one exception and stays a form.
5. **Both inferred and marked.** Every agent gets beats today with no guide change. `anchor` and `wait` are the only new lines, each downgraded for old builds.
6. **Barge-in is on by default in hands-free, off in hold-to-talk.** Holding the mic already is the interruption in that mode.
7. **A film is a picture, not the show.** `motion` keeps its kit and its clock, but plays as a beat's picture under anchors, with its cues spoken by the same Speaker. No end screen.
8. **Web first.** Chris feels it in Safari on his phone before a line of Swift changes.

Anchor layout options:

- **A. The ledger (recommended).** Anchors stack top left as short bold lines in the agent's color, newest brightest, older dimming a step each. The picture takes the rest of the screen and draws around them. Reads like notes being taken while someone talks. Works with every picture type and with Reduce Motion.
- **B. Callouts.** An anchor pins beside the part of the picture it names (the ring around the right atrium carries "Right side: body to lungs"), using the canvas's part names and `callout`. Beautiful on a diagram, cramped on a chart, unplaceable on plain text. Use B when the agent marks `anchor ... to=<part>` and the picture has that part; fall back to A.
- **C. The rail.** Anchors run as chips along the top, oldest scrolling off left. Tap any chip to jump the timeline there. Clear as a timeline, weak as a summary, and it fights the top bar. Keep the jump-back idea for the record, not the stage.

Pick: A, with B as an upgrade a marked anchor can earn. Why: the stage must read at a glance from across the room and it must work for a status answer as well as a heart.

## 8. Build plan

Epic **DLG-0: Beats, the dialogue stage.** Stories in build order. Each APP story ships behind the `dialogue` flag until DLG-11.

**DLG-1 (WEB, S) The script.** Three exchanges written out as beats with seconds: the heart, "what's left before launch", roast chicken. Each as plain text plus YL, with one interruption and one waypoint. Reuses YUI-321 `films.json` asks and the heart parts.
Done when: `site/public/playground/canvas/dialogue/*.yl` exist with a timing sidecar; a reviewer can read each as a conversation.
Tests: `test-spec.mjs` parses all three with no errors.

**DLG-2 (WEB, M) Beat builder.** `site/lib/yl/beats.mjs`: text and YL ops in, `{beats:[{line, anchor?, pic?, patch?, wait?}], anchors}` out, with the inference rules of section 4. Reuses `chunks.mjs` and `readtext.mjs`.
Done when: the three scripts and twenty existing samples produce sane beats; conformance vectors `spec/conformance/beats.json` pin them.
Tests: `beats.test.mjs`, vectors in `node run.mjs`.

**DLG-3 (WEB, L) The prototype Chris can feel.** `canvas.html?mode=dialogue&script=heart`: beats play on the canvas clock, spoken with Web Speech, anchors pin as marks (layout A), the picture draws and patches per beat, a waypoint drawn into the heart pauses, the mic (Web Speech recognition, or the typed field) cuts in and pauses the flow, a canned continuation answers, the record lists beats. Send Chris the link in Yui the moment it is live. Reuses YUI-321: player harness, `yl-canvas.mjs`, `yl-say.mjs`, `yl-undo.mjs`, keyboard model, frame budget.
Done when: all three scripts run start to end on an iPhone in Safari; barge-in silences within 150 ms; Reduce Motion plays stepped stills with voice.
Tests: `test-dialogue.mjs` headless (beat order, anchor count, pause at the waypoint, the line an interruption sends); `test-perf.mjs` within budget.

**DLG-4 (SPEC, S) The words.** YL.md section 5b "The dialogue" (beat, anchor, waypoint, interruption, the `anchor` and `wait` lines, the `beat say` event), RELAY.md "Flows" (`meta.flow`, insert only, push on part 1), MOTION.md 0c (beats ride on the canvas), CHANNEL.md: "Questions wait for the end" becomes "A question sits where you ask it; `wait` pauses", plus `anchor`, kept under 120 new tokens. Eval cases for both lines.
Done when: `guide.test.mjs` passes, channel eval not worse than v50, parity map updated.
Tests: eval run, conformance vectors for `anchor` and `wait`.

**DLG-5 (PLUGIN, M) Beat rows from Hermes.** `adapter.py` implements `supports_draft_streaming` and `send_draft`: cut at sentence and YL line ends, one insert per cut with `meta.flow`, the final send closes with `last`. `compat.py` gates on `FLOW_BUILD` and downgrades `anchor` and `wait`. The claude shim forwards real deltas.
Done when: a live turn against a test account lands as 3 or more rows before the model finishes; an old build gets one row.
Tests: `hermes-plugin/tests/test_flow.py` (cuts, ordering, 409 resend, downgrade), shim test for deltas.

**DLG-6 (APP, M) Flow rows become one turn, live.** `ChatStore` joins rows by `meta.flow` as they land (generalize `MotionFilms`), subscribes to Realtime for the open thread, keeps the 350 ms poll as fallback. `StageTurn` grows as beats arrive.
Done when: a streamed reply shows its first beat under 300 ms after the row commits; the record folds continuation rows into one message.
Tests: `FlowRowsTests` (join, missing part 1, out of order, last), `StageInFlightTests` extended.

**DLG-7 (APP, L) The dialogue stage.** `BeatStage.swift`: anchors (layout A) over the picture; pictures drawn by the existing drawing views with `MorphTween` between beats and the kit hero for `shapes`; a `Speaker` from `MotionCueScheduler` speaks beats as they land and advances the stage when a line ends; mute in the bar; waypoints pause with "Go on" or the options drawn into the picture; `StageChunks.of` becomes the beat builder mirroring `beats.mjs`. Reuses YUI-321 design A for the bar (pause and mute left, hairline progress, chips).
Done when: the three scripts play on the sim from the paste box with voice; a `choose` mid-reply pauses the flow; anchors persist across a follow-up reply.
Tests: `BeatStageTests` (beats mirror the vectors, anchor persistence, waypoint pause and resume), UI tests with `-yuiDemoArriveFile` for the heart script light and dark, `MotionSpeechTests` extended for the Speaker.

**DLG-8 (APP, M) Barge-in.** Mic open while the agent speaks: `.voiceChat` mode for echo cancellation, a cut on voice energy plus a first volatile word, speech stopped and the flow paused within 150 ms, words shown, the `beat say` line with `at=` and `anchor=` on the usual quiet, Stop for the old turn. `HandsFree` gains `talking`. A heard phrase that matches the sentence being spoken is dropped as echo.
Done when: on a real phone at normal volume, speaking over the agent stops it in under 150 ms and no echo sends itself.
Tests: `HandsFreeTests` (talking, cut, resume), `voice_timing.swift` measures stop latency, a manual echo checklist on device.

**DLG-9 (APP, S) Everyone, every phone.** Reduce Motion: beats as stepped stills, still spoken, anchors still pin. VoiceOver: the Speaker yields to it. Memory: one WKWebView at most, loaded only for a `shapes` hero or a film; `memory.sh` under 300 MB peak and 15 MB growth.
Done when: `memory.sh` green on the heart script twice; VoiceOver reads each beat once.
Tests: `memory.sh`, `StageRedesignTests` a11y cases.

**DLG-10 (PLUGIN, S) Native agents stream beats.** `turn.ts` writes beat rows from `onDelta` for the plain reply, the way `makeFilm` does for scenes; honors `wait` by ending the turn there and waiting for the event.
Done when: a native agent's heart answer lands as beats on the phone with the first word under 1.5 s.
Tests: `supabase/tests/flow_native_test.py` live.

**DLG-11 (APP+WEB, M) The record is the timeline, and the flag flips.** Each beat is a record row with its anchor and picture thumbnail; tap a row reopens the stage at that beat; a drag on the stage scrubs the turn (the canvas rule). `dialogue` becomes the default; DeckFilm's path is removed; MorphStage's page chrome is removed.
Done when: no agent reply reaches the old chunk pager; full suite green; parity map says web and app match.
Tests: `DeckReopenTests` rewritten as `BeatReopenTests`; full suite; sim shots light and dark on the progress page.

**DLG-12 (SPEC/WEB, S) Learn from a live week.** Score a week of real replies with `beats.mjs`: how many anchors were inferred versus marked, how often a waypoint was hit, where inference pinned the wrong thing. Tune the rules, bump the guide once.
Done when: a progress entry with the numbers and the rule changes.
Tests: eval and vectors updated together.

Order: DLG-1 to DLG-3 first and alone, so Chris can react before anything native. DLG-4 lands with DLG-3. DLG-5 and DLG-6 can run in parallel after that. DLG-7 needs DLG-6. DLG-8 needs DLG-7. DLG-9 and DLG-10 after DLG-7. DLG-11 last. Fable 5.1 on DLG-3, DLG-4, DLG-7, DLG-8; Sonnet 5.5 on the plumbing (DLG-5, DLG-6, DLG-10).

## 9. Questions for Chris

1. **Words on screen.** Only anchors on screen, full sentences in the voice and the record? Recommend: yes. A small "Show words" toggle in the bar for a quiet room.
2. **Waypoint patience.** A `wait` holds forever, or carries on by itself after a pause? Recommend: holds forever when it asks a question; a bare `wait` carries on after 6 s if nobody speaks.
3. **Barge-in trigger.** Any voice over the agent, or only after a wake word or a hold? Recommend: any voice in hands-free, with a one-time "say anything to cut in" hint, and hold-to-talk as the quiet alternative.
4. **The voice.** Apple's on-device voice (private, instant, decent), or a cloud voice (better, 300 ms more, audio leaves the phone)? Recommend: on-device now, per-agent voice pick kept, revisit after DLG-11.
5. **Anchor layout.** A ledger, B callouts, C rail? Recommend: A, with B when a marked anchor names a part.
6. **Agents that cannot stream** (webhook, MCP, old hosts). Beats inferred from the whole reply and paced by the voice as if streamed? Recommend: yes, the person cannot tell the difference after the first word.
7. **Films.** Keep `motion` as a picture inside beats, or retire films? Recommend: keep as a picture, never as the whole answer; the guide stops saying "any explainer is a motion line".
8. **Name.** "Beats" for the concept and the lines? Recommend: yes; it already means a unit of timing in film and music and the app uses the word.

## 10. Risks

- **Memory, 300 MB ceiling.** A WKWebView for the hero, the Metal visual, the synthesizer and SpeechAnalyzer at once. Hold: one web view, created only for a `shapes` hero or a film and torn down at the end of the turn; the visual drops to its 30 fps plan behind words. Gate: `memory.sh` on every DLG APP story.
- **Latency on the Hermes path.** The gateway turn start plus the shim's fake streaming can push the first word past 3 s. Hold: DLG-5 fixes the shim; the orb's thinking state and the `doing` words cover the wait; measure with `voice_timing.swift` and show the number in every handoff.
- **Echo during barge-in.** The phone speaker feeds the mic. Hold: `.voiceChat` mode (hardware echo cancellation), drop recognized text that matches the sentence being spoken, require energy plus a volatile word, and test on a real phone at full volume, never only the sim.
- **Reduce Motion.** Continuous pictures become stepped stills; the voice still paces, anchors still pin, waypoints still wait. Covered in DLG-3 and DLG-9.
- **Agents that send long text.** Inference will pin too many anchors and talk for a minute. Hold: eight anchors on screen then fold, an automatic bare `wait` after twelve beats, and `textbomb.py` logs the senders so the guide can fix them at the source.
- **Two renderers for a while.** The flag period risks the Oct 17 disconnect again (Chris only ever saw the old one). Hold: the flag defaults on in DEBUG and TestFlight from DLG-7, off only in the App Store build until DLG-11.
- **Voice out loud in public.** A reply that starts talking on a train. Hold: the Speaker honors the ringer switch and the mute in the bar, and the first hands-free session asks once.

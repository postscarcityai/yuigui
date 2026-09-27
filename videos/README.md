# Yui brag videos

How Yui makes its launch and explainer videos: the look, the sound, the story shape, and the tools. Every video on yuigui.com and on social follows this. The same guide is loaded by the yui agent in Hermes (skill `yui-brag-videos`), so a person or an agent can make the next one the same way.

Everything is made from code on this Mac: HTML pages drawn frame by frame in headless Chromium, music synthesized with numpy from Yui's own sound bank, ffmpeg to encode. No stock footage, no samples, no paid services, no AI video or music tools.

## The brand, in one page

**Look**
- Three colors. Light: cream `#FFF9F0`, ink `#3A3340`, coral `#FF7E8A` (coral text is `#C23B4F`). Dark: plum `#16111F`/`#231D33`, off-white `#F6EEF7`, coral `#FF7E8A`. The app's own UI inside the phone keeps its real colors (an agent's look, the looper's row colors).
- One typeface: SF Pro Rounded (the app's font), weight 800 for captions. SF Mono for Yui Lines.
- Light theme by default; dark theme when the app shows dark (the lesson deck, music tools).
- A soft coral glow behind the phone; in dark videos it pulses with the kick.
- The phone is a real iPhone frame (Dynamic Island, 9:41, status icons), the app rebuilt in HTML from real screenshots in `site/public/progress/`.

**Sound: dub, always.** A heavy sub under every chord, a wobble bass that opens and closes on the beat ("womp"), offbeat chord stabs thrown into a tape echo, a one-drop beat (kick and snare on 3), a dub siren into the big drop, a melodica line. Built by `dub()` in `kit/sound.py` from Yui's sound bank (the same recipes as the app's music engine, `site/app/playground/music/engine.js`). Sound effects only for taps and sends; the music carries every transition. Masters at -14 LUFS, true peak under -1 dB.

**Motion**
- One shot, one idea. The phone sits in the center.
- Slow push-ins; close-ups on the card that just arrived. The camera aims at fixed points, never at live layout, so it never jumps.
- Transitions, not cuts: pages slide, the full-screen stage slides up, the wordmark flies into the app's header, the phone shrinks into a tilted wall of real screens.
- Eased everything (cubic in, out, in-out; a little overshoot on pops). Nothing linear.
- A finger (a soft gray dot with a white ring) taps and drags, with a coral ripple on each tap.

**Words**
- Two captions per scene: the first in ink, the second in coral. In landscape they flank the phone (left, right); in the reel they stack above it.
- Two to six words a caption. Plain words, short sentences, no em dashes, no hype.
- At least 0.3 s per word on screen, counted from when the line is fully in. Old text out before new text in.
- A mono "code line" pill under the first caption shows the one line the agent sent (`>full deck "Compound interest"`, `~loop swing=50 p=…`). Shorten it with `…` so it never reaches the phone.

## The story shape

1. **Hook, 0 to 5 s.** A pain everyone knows (you asked for a timer and got an essay; you asked for a plan and got homework), or the finished result playing (the jam), then rewind.
2. **One real use case, start to finish.** One project or one question, followed through: the ask, the screen, the taps, the result. Use the demo lines in `site/lib/yl/samples.mjs` so the video matches the playground.
3. **The agent's side.** Show what goes back to the agent (`→ agent {"done":true,"score":1,"of":1}`) and that it keeps going.
4. **Breadth, 8 to 10 s.** A tilted wall of real screens with one word per beat ("Lessons. Charts. Games. Timers.").
5. **Outro.** The wordmark, one tagline, the URL, one honest line (public beta on TestFlight; "on the web now, in the app soon").

Length: 60 s for explainers, 20 to 30 s for a single feature. Tempo 90 to 100 BPM; land cuts on bars and taps on beats.

## Honesty

- Show what is shipped. Check `site/content/showcase.json` (`app: native | later | site`) and the progress log. Anything shown that the app does not have yet goes in the video's `brag-plan.md` under "beyond the spec" and in the note to the team, and the outro says where it runs.
- Quotes and numbers come from the repo (progress.json, builds.json, timeline.json, board.json) and are dated. Feedback quotes are Chris's; never suggest an outside tester.
- Demo content inside the phone (a chat line, a card's rows) can be illustrative; claims, numbers and testimonials cannot.
- SF Pro Rounded is Apple's font; its license covers mockups of Apple-platform UI. For captions on paid or wide promotion, consider Nunito (the site's fallback, SIL Open Font License).

## Formats

- **Landscape** 1920x1080, 30 fps. The poster (a strong settled frame, no finger) is baked in as frame 0 so every thumbnail shows it.
- **Reel** 1080x1920, the same page with `?reel`. Captions and phone inside the 4:5 feed crop (y 285 to 1635), nothing under the buttons (bottom from y 1600, right strip x > 950). Reels loop, so frame 0 is not the poster; upload `*_Reel_cover.jpg` as the cover. Instagram captions say "link in bio".

## Make one

```bash
cd videos
cp -r 00-smoke NN-topic                                     # the smallest working comp
# research: showcase.json, progress.json, the spec, real screenshots; write NN-topic/brag-plan.md
python3 NN-topic/music.py                                   # work/music.wav (dub() + taps on the picture's times)
python3 kit/render.py NN-topic/comp.html stills 3 12 30     # look at every scene and mid-transition
python3 kit/render.py NN-topic/comp.html stills --reel 3 12 30
python3 kit/render.py NN-topic/comp.html video              # work/silent.mp4, poster baked in
python3 kit/render.py NN-topic/comp.html poster
python3 kit/render.py NN-topic/comp.html video --reel
python3 kit/render.py NN-topic/comp.html poster --reel
kit/mux.sh NN-topic/work/silent.mp4 NN-topic/work/music.wav NN-topic/Yui_Topic.mp4
kit/mux.sh NN-topic/work/silent-reel.mp4 NN-topic/work/music.wav NN-topic/Yui_Topic_Reel.mp4
ffmpeg -i NN-topic/work/poster.png -q:v 2 NN-topic/Yui_Topic.jpg
ffmpeg -i NN-topic/work/poster-reel.png -q:v 2 NN-topic/Yui_Topic_Reel_cover.jpg
```

Deliver per video: `Yui_Topic.mp4`, `Yui_Topic_Reel.mp4`, the poster and reel cover, `brag-plan.md` (angle, facts with sources, storyboard table, beyond the spec) and `share-copy.txt` (1 to 3 sentences, plus an Instagram version). Then pull frames from the finished files and look at them before calling it done.

## The kit

- `kit/kit.css`: the tokens (light, `body.dark`), the phone, chat, cards, captions (`.cap.L`, `.cap.R`), code lines (`.kpill`), the finger, the outro, and the reel layout (`body.reel`).
- `kit/kit.js` (`K`): easing, `textIO`, `caps` then `pills`, `phone()` and `chatPage()`, `user()`/`say()`/`agent()` messages, `measure()`/`setMsg()` (bottom-anchored inserts), `camera(t, keys)` (keys are `[time, scale, focus, rotation]`, focus a local y or a message id meaning "that card while it is the newest"), `placePhone()`, `pageAt()`/`slidePages()` for screens beside the chat, `finger(t, gestures)` (taps `{t, el}` and drags `{t, t1, el}`), `outro()`, `ready()`.
- `kit/render.py`: stills, poster and video, landscape or `--reel`.
- `kit/sound.py`: the sound bank (kick, snare, clap, hat, rim, shaker, crash, keys, pluck, bell, pad, bass, lead, sub, wobble, skank, siren, tap), `chord_notes()` (the app's voicings), `Song`, `dub()` (the house arranger: levels 1 to 4), `drop()`, `accent()`, `taps()`, the look-ahead limiter. `groove()` is the older lofi arranger; don't use it for new videos.
- `kit/mux.sh`: Apple's AAC encoder at about -14 LUFS, true peak under -1 dB (ffmpeg's own AAC encoder overshoots by up to 3 dB).

Kit rules learned the hard way:
- Every frame is a pure function of t. No state carried between frames.
- When a video shows music or taps, write the times once (a score) and read them in the picture and the music.
- Ids must be unique on the page (a wall column called `c1` eats a message called `c1`).
- Call `K.caps()` before `K.pills()`: in the reel an R caption sits under its L caption, and pills under both.
- A finger never glides in from an element that is hidden.
- Check stills before rendering: overlaps, cut-off text, captions touching the phone, and for reels a sheet with the Instagram zones drawn on.

## Git

Sources are tracked (comps, music scripts, plans, share copy, the kit). Renders, frames, audio and copied images are not (`.gitignore`): they are large and can be made again. To put a finished video on the site, copy the final `.mp4` and poster into `site/public/demo/videos/` on purpose. The films live there as `film-<topic>-16x9.mp4` and `-9x16.mp4` (1280x720 and 720x1280, x264 CRF 25, the audio copied as is, `+faststart`), posters as `.jpg` (frame 0 for landscape, the reel cover for 9:16), each with a row in `videos.json` (`sound: true`). Put one on a page with `<Films ids={[...]} />` from `site/app/components/Films.js`, and give it a See it entry in the Videos group so it gets a share link.

## The videos

| Folder | What | Page |
|---|---|---|
| 00-smoke | the smallest working comp | |
| 01-meet-yui | the first film: one line, one whole screen | / |
| 02-plan-to-launch | plan mode to launch, a pottery studio's website | / |
| 03-jam | music tools: a beat, a patch, chords, a solo | /developers/music |
| 04-lessons | a lesson is one deck | /mockups |
| 05-agents | your agents, one app | /, /start |
| 06-built-in-public | feedback to shipped, in public | /board, /changelog, /timeline |
| 07-full-screen | the new layout: Yui lives on the full screen, the chat is the record | /mockups#stage-1, /thoughts |

What each page could get next: `PLAN.md`.

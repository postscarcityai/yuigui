# Brag plan: Can I afford it? (09-afford-it)

## Angle

Marketing, not a feature tour. One real money moment everyone has had: the car you want, and the quiet question under it. You ask out loud, and instead of a paragraph of maybe, Penny (a money agent, blue, letter P) answers on the whole screen: one number that fits your budget, then a calculator you can drag, then the whole cost side by side, then two questions and one Send.

The wow is the drag. The finger pulls the down payment from $3,000 to $8,000, the monthly payment and its chart follow live, and the payment slides under the budget and turns green. The camera pushes in for it. Tagline: "Numbers you can touch."

Light theme. The chrome around the phone stays cream, ink and coral; inside the phone the stage wears Penny's blue (`#1F6FEB`, white text on it passes contrast).

## Facts used

- **calc is shipped** (showcase.json `calc`, app: native, YUI-17/YUI-19): "A formula with sliders. Drag a value and the answer and chart follow." Spec (spec/YL.md, calc): sliders from `name=min-max@value`, `plot=` names the slider swept along the chart's x-axis, the result and the chart update live as the person drags. The app draws the formula, the big result, a chart with a dot at the current value, then the sliders (screenshot `site/public/progress/yui17-projectile.webp`).
- **stat is shipped** (showcase.json `stat`, native): a big number with its change and a sparkline (YL.md stat: `stat $1840 "Grant left" delta=-420`, `$` may lead).
- **chart is shipped** (showcase.json `chart`, native): line, bar, area, scatter, pie, donut (YL.md chart: `chart bar ...`).
- **Questions last, one Send** (YL.md section 5, Stage first, YUI-119): every question waits for the last chunk, then all show on one screen with one Send. `choose` is shipped (showcase.json `choose`, native).
- **The stage** (YL.md section 5, Stage first): the reply plays as chunks, a line and one picture each, segments at the top, arrows bottom left, the mic bottom right with T and +. Updated Sep 27: the stage shipped to phones in Yui 0.4.0 (build 204, Sep 27; ROADMAP.md, showcase.json release-040 `stage-in-app`, `app: native`). The outro says: "In Yui 0.4. Public beta on TestFlight."
- **The code line** in the pill is a real calc line, checked with the site parser (`site/lib/yl/yl.mjs`, `parse()`), shortened with `…`:
  `calc "Car payment" f="M = (P-d)*i/12/(1-(1+i/12)^(-n))" P=20000-50000@32000$ d=0-12000@3000$ n=36-84@60mo i=0.065 plot=d unit=$/mo`
  Evaluated with `site/lib/yl/expr.mjs`: $3,000 down is $567.42 a month, $8,000 down is $469.59.

## The numbers (illustrative, not advice, not on screen as a claim)

All from one formula, the standard loan payment `M = L * r / (1 - (1 + r)^-n)`, with r = 6.5% / 12 and n = 60 months, computed live in `comp.html` (`pay()`) and in `music.py` (the same function, for the ticks).

| Down | Loan | A month |
|---|---|---|
| $3,000 | $29,000 | $567 |
| $4,500 | $27,500 | $538 (the first $100 step under the $540 budget) |
| $8,000 | $24,000 | $470 |

- Budget: $540 a month (Penny's stat). Illustrative: the video does not claim Yui reads a bank account; Penny is any agent the person runs, with whatever budget it knows.
- Five years, all in, $8,000 down, 6.5%, 60 months: new ($32,000) $36,175; used ($24,000, the same terms) $26,784. Used saves $9,392, said on screen as "about $9,400". Real used-car loans usually carry a higher rate; the film keeps one rate so the comparison is simple.

## Storyboard (100 BPM, a beat is 0.6 s, a bar is 2.4 s, 14 bars is 33.6 s)

| Time | Scene | Left | Right | Pill |
|---|---|---|---|---|
| 0 to 4.8 | The hook: a drawn coral car rolls in and settles; a price tag, $32,000, swings from its mirror | The car you want. | Can you afford it? | |
| 4.2 to 5.0 | The car rolls off, the phone rises: Penny's stage, "Hi Sam. Tap the mic and talk." Drop at 4.8 | | | |
| 5.4 to 9.6 | Tap the mic (5.4). "Can I afford a $32,000 car?" streams in. Working: Looking at your budget | Ask out loud. | Get one number back. | |
| 9.6 to 13.2 | Part 1, a stat: $540 a month, a sparkline, "That's what fits your budget." | (same) | (same) | |
| 13.2 to 21.0 | Tap next (13.2). Part 2, the calc: price, down payment, term; $567 a month over a chart. Push in. The finger drags the down payment $3,000 to $8,000 (15.6 to 18.6), the payment falls, crosses $540 and turns green, "Fits". Poster at 19.8 | Drag the down payment. | Watch the payment move. | `calc "Car payment" … d=0-12000@3000$ …` |
| 21.0 to 24.6 | Tap next (21.0). Part 3, a bar chart: five years, new $36,175 vs used $26,784. "Used saves about $9,400." | See the whole cost. | New or used, side by side. | |
| 24.6 to 28.8 | Tap next (24.6). Before I look: New or used? Used (25.8). How long will you keep it? 5+ years (26.4). Send · 2 of 2 (27.6), Sent | It asks what matters. | Answer once. One Send. | |
| 28.8 to 33.6 | Outro: the wordmark, "Numbers you can touch.", yuigui.com/start, "In Yui 0.4. Public beta on TestFlight." | | | |

## Beyond the spec, or approximated

- **The budget line and the Fits chip on the calc** (a dashed line at $540 on the chart, a chip that turns green with a check when the payment goes under it) are the film's, not part of `calc`. The app's calc draws the result, the chart with a dot, and the sliders.
- **Money formatting**: the app draws a `$` unit as a suffix today; the film shows `$32,000` with the sign first and thousands commas.
- **The slider snaps to $100** in the film; the app's slider moves freely.
- **Penny** is a made-up agent for the film (any agent the person runs can have a name, a color and a letter: showcase.json `looks`). Her budget and the $540 are illustrative.
- **The stat's sparkline** is illustrative (what was left over in recent months).
- **The car and the swinging tag** are drawn for the hook; they are not app UI.
- **Voice**: the words stream in as heard (spec); no real audio.
- **Motion** (the breathing orb, parts rising in) is the web mock's; the real stage motion is phase 2 (YUI-120), not claimed.

## Sound

`music.py` with `kit/sound.py` `dub()`: 100 BPM, swing 30, in C. The hook is thin (level 1 then 2, Am7 and Fmaj7), a siren and the drop as the phone rises (4.8). Level 3 for the ask and the stat, level 4 with the melodica motif for the calc drag, 3 for the chart and the questions, 2 then 1 for the outro, home on Cmaj7. During the drag, a soft pluck for every $10 the payment drops, climbing the scale, and a bell chord the moment it crosses $540 (computed from the same formula as the picture). A bell on each part, a C arpeggio on Send, a swell and a crash into the calc and the outro. Every tap in `score.js` is a tap sound on the same time as the finger.

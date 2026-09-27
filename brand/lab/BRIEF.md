# Yui brand lab: the brief

Round 1 opened Sep 27, 2026. The page is yuigui.com/brand (unlisted). The log of what we tried is [JOURNAL.md](JOURNAL.md).

## The job

Find Yui's mark, starting only from Chris's paper sketch (`brand/sketch.jpg`): the word Yui cut from cocoa paper in six pieces. The coral wordmark on the site today was a first attempt. This is the real search, done in the open, one round at a time.

## The bar

Apple's logo. One silhouette that works in one color, at 16 px, as an app icon, on anything. Everything else (paper, ink, glaze, cloth, foil) is a costume the mark can wear. If the costume is doing the work, the mark isn't done.

## Rules

- **Six pieces.** Two ears and a stem make the Y, then the u, then the i and its wedge of a dot. Nothing touches. The gaps are part of the mark.
- **Refine, keep the gesture.** Same pieces, same proportions, same weight. Edges change with the medium.
- **The Y stands alone.** It is the app icon and Yui's face.
- **The cat is a sprinkle.** Y is a face, u a body, i a tail. It is a napkin idea: one wink in the idle loop, one doodle on the page. Never the theme, never a mascot.
- **No Hangul.** The Korean feel comes from material, color and composition.
- **Korean, four ways.** Hanji and meok ink. Seoul quiet (stone, oat, clay, air). Celadon and bojagi. K-pop only as sprinkles.
- **Made in code.** SVG and WebGL shaders are the craft. Every film is motion graphics drawn frame by frame; no AI video.
- **fal for stills only.** Material plates and a few mockups, to see what image models make of the mark. Always labeled as generated on the page. Never inside a video.
- **Sound.** The brand films are deep house with grime in it, a little trap in the hats, K-pop sparkle now and then (`house()` and `sonic_logo()` in `videos/kit/sound.py`). Dub stays the sound of the product videos.
- **Words.** Plain, short, no em dashes.

## Where things live

| What | Where |
|---|---|
| The mark as numbers (six pieces, the rough to clean dial, poses) | `site/lib/brand/mark.mjs`, traced by `brand/lab/tools/trace.py` into `trace.mjs` |
| Palettes and contrast | `site/lib/brand/palettes.mjs` |
| Materials (paper, meok, quiet, celadon, bojagi, holo) | `site/lib/brand/shaders.mjs`, run by `gl.mjs`, directed by `scenes.mjs` |
| Motion (loops, wink, land times) | `site/lib/brand/motion.mjs` |
| The page | `site/app/brand/` |
| Films | `videos/13-brand/` (`build.sh` makes everything) |
| fal stills | `brand/lab/fal/` (`prompts.json`, `gen.mjs`); outputs in `brand/lab/out/` (not tracked), picks in `site/public/brand/lab/models/` |

## The fal key

`gen.mjs` reads `FAL_KEY` or `FAL_API_KEY` from the environment, then the main checkout's `.env` (worktrees don't share untracked files), then `~/.config/yui/secrets.env`. `.env` is gitignored.

## Feedback

Every direction has an id like `R1-celadon`. On the page: tap "This one", then email your picks or post them as a GitHub issue. Next, the web Yui takes this over (see the roadmap).

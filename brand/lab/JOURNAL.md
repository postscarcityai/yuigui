# Yui brand lab: journal

Newest round first. Each round says what we tried, what we learned, and what is open for feedback.

## Round 1, Sep 27, 2026

**The interview.** Chris set the direction: build only from the sketch; Apple's logo is the bar; the cat is one small idea, not the theme; all four Korean moods (hanji and ink, Seoul quiet, celadon and bojagi, a pinch of pop); no Hangul; no AI video; fal for stills; SVG turbulence and WebGL shaders are the craft; deep house with grime for the sound, K-pop only as sprinkles; the page lives unlisted at /brand.

**What we built.**
- Traced the six pieces out of the photo (`tools/trace.py`) and drew a clean version on one stroke width. A dial morphs point for point from the torn sketch to the clean cut, so the clean mark is provably the same six shapes.
- The clean mark: stroke 110 units, ears at 44 degrees, round ends where the paper was torn, flat ends where it was cut, a 34 unit gap between the ears and the stem. Tested from 180 px down to 16 px and on six grounds in one color. The Y alone is the icon.
- Six materials as shaders: cut paper, meok ink on hanji, stone deboss, celadon glaze with crackle, bojagi patchwork, pearl foil.
- Palettes per direction, each checked for contrast.
- Films, all code: five stings and the Apple one, a 60 s journey, four chapter shorts, three app loops (splash, loading, idle wink). New sound: `house()` and a six-note sonic logo (Em9 up, one note per piece).
- fal: six material plates (nano-banana 2) and six mockups each through three models (nano-banana 2, Seedream 5 Pro, gpt-image-2), 24 images.

**What we learned.**
- Today's coral on cream is 2.3:1. A mark wants 3:1 or more. The coral reads fine on the app's dark plum, but on cream it washes out. Every new palette clears 3:1.
- The Y holds at 16 px. The full word does not, which is fine: the word is for 24 px and up.
- The clean cut reads as a friendly, heavy grotesk. It needs the gaps to stay Yui; closing them makes it generic.
- The image models mostly respect the mark when given the clean reference. Seedream added letters to the seal. Nano-banana is the fastest (about 20 s), gpt-image-2 and Seedream take 80 to 140 s.
- Headless Chromium on the Mac GPU (ANGLE Metal) renders the shader films about 25 times faster than software GL. `render.py` uses it when `YUI_GL=1`.

**Open for feedback (R1).** `R1-sketch`, `R1-mark`, `R1-meok`, `R1-quiet`, `R1-celadon`, `R1-bojagi`, `R1-pop`, `R1-napkin`, `R1-loops`, `R1-films`. Questions for round 2:
1. How clean? Somewhere on the dial between the sketch and the clean cut, or the clean cut itself?
2. Which material is Yui's home? One lead, the others as seasons.
3. Coral stays, or does the cocoa from the sketch come back?
4. The dot: keep the wedge, or a plain round dot?

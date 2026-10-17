# Brand files

- `yui-logo-{coral,cream,ink,lavender,mint}.png`: the wordmark, 1701x1177, transparent, with room around it.
- `yui-logo-master-bw.png`: the master, black on white.
- `yui-mark-y-ink.png`: the Y alone, 512x512. Centered by its box; it needs no correction.
- `sketch.jpg`: Chris's sketch the wordmark came from.

## The wordmark is optically centered

The Y's left arm leaves open space under it, so a wordmark centered by its box looks like it sits to the right. Wherever the wordmark is centered, it moves **5% of its own width to the left** of its box center. Nothing moves up or down.

- The padded files here, the square logos in `site/public/brand/`, `site/app/icon.png`, `site/app/apple-icon.png` and the app icon already carry the shift. Place them centered as they are.
- Tightly cropped files (`site/public/brand/yui-wordmark-coral.png` and its webp, the app's `Wordmark` image) carry none. When one is centered, shift it in code: the videos use `translateX(-55%)`, the app's `Wordmark` view offsets itself. Left-aligned placements (the site header and footer) stay as they are.

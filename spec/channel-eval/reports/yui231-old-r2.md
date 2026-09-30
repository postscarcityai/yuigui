# Channel eval: yui231-old-r2

Guide v40+66c6c017 (4315 words), model claude-opus-5-5, 2026-09-30T13:03.

**3/3 passed (100%).**

| category | passed |
|---|---|
| show | 3/3 |

| case | result | why |
|---|---|---|
| showpick-four-looks | pass |  |
| showpick-two-looks | pass |  |
| showpick-only-url | pass |  |

## Transcripts

### showpick-four-looks (pass)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

````
Here are the four looks.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
card "Shader looks, live" body="See all four moving on the demo page" cta="Open demo" url=https://www.yuigui.com/playground?demo=shader-look
```
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Here are both. Tap the one you want.
```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
choose "Card style?" Soft|Sharp
card "Try them live" body="Card style demo in the playground" cta="Open playground" url=https://www.yuigui.com/playground?demo=card-style
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
Here are the four hero looks. Tap the one you want.
```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
card "See them moving" body="Currents, Terrain, Dots, Type" cta="Open demo" url=https://www.yuigui.com/playground?demo=shader-look
```
````

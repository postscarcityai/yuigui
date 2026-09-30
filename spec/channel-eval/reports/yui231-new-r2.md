# Channel eval: yui231-new-r2

Guide v42+28d3c1f1 (4571 words), model claude-opus-5-5, 2026-09-30T13:03.

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
The four looks, dark mode:

```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
choose "Hero look?" Currents|Terrain|Dots|Type
card "Live demo" body="All four, moving" cta="Open" url=https://www.yuigui.com/playground?demo=shader-look
```
````

### showpick-two-looks (pass)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

````
Here are both styles.
```yui
gallery /demo/s1.jpg /demo/s2.jpg +pick
choose "Which card style?" Soft|Sharp
```
````

### showpick-only-url (pass)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

````
The four hero looks, dark mode. Tap the one you want.

```yui
gallery /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/2-terrain-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/3-dots-dark.png /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/4-type-dark.png +pick
card "Shader look demo" body="See them move" cta="Open" url=https://www.yuigui.com/playground?demo=shader-look
```
````

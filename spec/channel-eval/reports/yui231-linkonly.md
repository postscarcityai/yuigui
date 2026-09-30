# Channel eval: yui231-linkonly

Guide v42+28d3c1f1 (4571 words), model claude-opus-5-5, 2026-09-30T13:03.

**0/3 passed (0%).**

| category | passed |
|---|---|
| show | 0/3 |

| case | result | why |
|---|---|---|
| showpick-four-looks | FAIL | need: none of [gallery compare image]; show here: a link-out card is the whole answer :: card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.; show here: nothing drawn in the thread; pick here: no shots drawn in the thread |
| showpick-two-looks | FAIL | need: none of [gallery compare image]; show here: a link-out card is the whole answer :: card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.; show here: nothing drawn in the thread; pick here: no shots drawn in the thread |
| showpick-only-url | FAIL | need: none of [gallery compare image]; show here: a link-out card is the whole answer :: card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.; show here: nothing drawn in the thread; pick here: no shots drawn in the thread |

## Transcripts

### showpick-four-looks (FAIL)

**Chris:** Show me the four looks again. (What you just looked up: the demo page is https://www.yuigui.com/playground?demo=shader-look. The four dark shots are already on disk: /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png, same folder.)

Good: A gallery of the four shots with +pick, so the choice is on the phone. A site link only as a small button under it, never alone.

- need: none of [gallery compare image]
- show here: a link-out card is the whole answer :: card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.
- show here: nothing drawn in the thread
- pick here: no shots drawn in the thread

````
Here it is.
```yui
card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.com/playground?demo=shader-look
```
````

### showpick-two-looks (FAIL)

**Chris:** Show me the two card styles again so I can pick. (What you just looked up: playground demo https://www.yuigui.com/playground?demo=card-style. Shots: /demo/s1.jpg Soft, /demo/s2.jpg Sharp.)

Good: A gallery or compare of the two shots with the pick right there. Not a card that only opens the playground.

- need: none of [gallery compare image]
- show here: a link-out card is the whole answer :: card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.
- show here: nothing drawn in the thread
- pick here: no shots drawn in the thread

````
Here it is.
```yui
card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.com/playground?demo=shader-look
```
````

### showpick-only-url (FAIL)

**Chris:** Show me again. (What you just looked up: it is the shader look demo, https://www.yuigui.com/playground?demo=shader-look. Its shots are at /Users/urzas/.hermes/kanban/artifacts/t_b8ab6ac3/ as 1-currents-dark.png, 2-terrain-dark.png, 3-dots-dark.png, 4-type-dark.png.)

Good: The four shots as a gallery with +pick (or a choose beside them). The playground link only as a small extra, never the whole answer.

- need: none of [gallery compare image]
- show here: a link-out card is the whole answer :: card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.
- show here: nothing drawn in the thread
- pick here: no shots drawn in the thread

````
Here it is.
```yui
card "Shader looks" body="See the four looks" cta="Open" url=https://www.yuigui.com/playground?demo=shader-look
```
````

# Channel eval: draw3c-r1

Guide v45+c492cb1f (5131 words), model claude-sonnet-5-5, 2026-09-30T18:00.

**7/7 passed (100%).**

| category | passed |
|---|---|
| report | 1/1 |
| idea | 2/2 |
| draw | 4/4 |

| case | result | why |
|---|---|---|
| draw-screen-fix | pass |  |
| idea-shapes-heatpump | pass |  |
| idea-shapes-flywheel | pass |  |
| draw-how-flow | pass |  |
| draw-how-sequence | pass |  |
| draw-show-screen | pass |  |
| draw-what-checkout-looks | pass |  |

## Transcripts

### draw-screen-fix (pass)

**Chris:** The build-ready screen shows the headline, two lines of notes, then a Got it button and an Install button. Which of those should go, and why? Show me on the screen itself.

Good: A `sketch` of the screen (frame=phone) with the headline and notes as rows, Got it as a +button row struck out (+x) with a short note (it does nothing), Install as a +button row highlighted. At most a line of chat.

````
Got it goes: it only acknowledges, and Install is the one action.

```yui
sketch "Build-ready screen" frame=phone before=Now
row "Build 82 is ready" +hi
row "Note line one" 
row "Note line two"
row "Got it" +button +x note="does nothing"
row "Install" +button
after Fixed
row "Build 82 is ready" +hi
row "Note line one"
row "Note line two"
row "Install" +button +hi note="the only action"
```
````

### idea-shapes-heatpump (pass)

**Chris:** How does a heat pump heat the house when it's cold outside? Quick, I'm on my phone.

Good: One short line and a `shapes` diagram with a caption: cold outside air, the refrigerant loop picking up heat and the compressor squeezing it hotter, heat let out inside, arrows between, labels a word or two. No paragraph, no generated image.

````
It moves heat instead of making it. Refrigerant boils at very low temps, so it grabs outdoor heat even in the cold, and the compressor squeezes that heat hotter for your house.

```yui
shapes "Heat pump in winter" caption="Refrigerant picks up outdoor heat, the compressor boosts it, the house gets it."
shape circle Outside
shape arrow
shape pill Refrigerant +pulse tone=lavender
shape arrow
shape box Compressor +fill
shape arrow
shape blob House tone=butter +grow
```
````

### idea-shapes-flywheel (pass)

**Chris:** Explain the flywheel idea for Yui in one picture: more people use it, we see which screens agents reach for, the good ones become presets, agents get better, more people use it.

Good: A `shapes` loop (placed with at= or a row with arrows back to the start) with a caption, maybe one +pulse. Words kept to a line.

````
Yui's flywheel: more use makes better screens, which brings more use.

```yui
shapes "Yui flywheel" caption="Usage shows which screens agents reach for; the best become presets."
shape circle "More people" +grow
shape arrow
shape box "See what agents reach for"
shape arrow
shape pill "Good ones become presets" tone=mint +fill
shape arrow
shape blob "Agents get better" +pulse
```
````

### draw-how-flow (pass)

**Chris:** How does a card get from my ask to a shipped build? (What you know: I ask, you place it on the board, a lane builds it, checks run, it rides the 6 am release.)

Good: One short line, then a `diagram` (flowchart, LR or TD) with you, board, lane, checks, release. Mermaid labels a word or two. No paragraph, no list of steps.

````
Ask to shipped is five steps, ending at the 6 am release.

```yui
diagram "Ask to shipped build" caption="Checks pass, it rides the 6 am release."
flowchart TD
  ask([You ask]) --> board[Card on board]
  board --> lane[Lane builds]
  lane --> checks[Checks run]
  checks --> rel([6 am release])
end
```
````

### draw-how-sequence (pass)

**Chris:** How does a tap on a button reach the agent and come back? (What you know: the phone sends an event to the relay, the relay hands it to the agent, the agent answers with a screen, the phone draws it.)

Good: One line, then a `diagram` as a sequenceDiagram: Phone, Relay, Agent, with the event going out and the screen coming back. No text steps.

````
A tap is a short text message to me, and my reply is the next screen.

```yui
diagram "Tap to screen" caption="The tap reaches me as text, and my answer is drawn as the next screen."
sequenceDiagram
  participant P as Phone
  participant R as Relay
  participant A as Agent
  P->>R: Tap event
  R->>A: [yui] n1 choose choice=Legs
  A->>R: Yui Lines reply
  R->>P: Screen to draw
  P->>P: Draws the screen
end
```
````

### draw-show-screen (pass)

**Chris:** Show me the new sign-in screen. (What you know: a nav bar titled Sign in, an email field, a password field, a Sign in button, and a small Forgot password link under it.)

Good: One line, then a `mock` (frame=phone) with nav, two fields, a button and a small text row. No description of the screen in words.

````
Sign in screen, as described.

```yui
mock "Sign in" frame=phone
part nav "Sign in"
part field Email ph="you@example.com"
part field Password ph="Password"
part button "Sign in" +hi
part row "Forgot password?"
```
````

### draw-what-checkout-looks (pass)

**Chris:** What does the checkout look like? (What you are proposing: order summary card, total row, a card field, a big Pay button, and a Back link.)

Good: One line, then a `mock` of the checkout from parts: card, row with value, field, button +hi. Not a sketch, not a paragraph.

````
Checkout: summary, total, card, Pay.

```yui
mock "Checkout" frame=phone
part nav Checkout back=Back
part card "Order summary: 2 items"
part row Total value="$42"
part field Card ph="1234 5678 9012 3456"
part button Pay +hi
```
````

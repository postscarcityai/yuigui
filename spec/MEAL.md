# Meal photo to macros

Take a photo of a meal, get a macro estimate, fix what the agent got wrong, and save it as a row in your meals table. No new words: it is `camera`, `image`, `stat`, `form` and the agent tables from [Agent tables](/developers/tables), in two short replies.

Status: YUI-35. Step 1 (this page and the playground demo) shipped Sep 25; try it at [/playground?demo=meal](/playground?demo=meal). Step 2 shipped Sep 27 in native Basil (YUI-103, [Native Yui](/developers/native)): send a photo, with any words, and nothing gets weighed. Basil answers at once, works the macros out behind the scenes, then posts one breakdown and keeps each food in your food memory. Section 6 has how it works.

## 1. The flow

1. **The ask.** The agent makes the table (safe to send every time) and asks for a photo.
2. **The photo.** The person takes one, or picks one they already have. It goes to the agent as a `camera` event.
3. **The estimate.** The agent looks at the photo with a vision model and answers: the photo with what it sees, one line with the guess and how sure it is, four tiles (calories, protein, carbs, fat), and a form to fix it.
4. **The fix.** The person picks a portion and adds anything the photo missed, then taps Save.
5. **The save.** The agent writes the row with `put` and shows today's totals with `query`. Queries are live, so the next meal redraws them without being sent again.

The ask:

```
table create meals Day:date Food:text Cal:number:kcal Protein:number:g Carbs:number:g Fat:number:g
say "Snap your plate. I'll guess the macros, you fix what I got wrong, and it goes in your log."
camera@plate "Snap your meal" +inline
```

`+inline` keeps the camera in the chat (a `camera` opens on the stage by default, YL.md section 5), so the photo, the estimate and the save read as one thread.

The estimate, after `{"id":"plate","preset":"camera","photo":...}`:

```
image@meal1 /demo/meal-salmon.jpg "Salmon steak, greens, cherry tomatoes, avocado"
say "Grilled salmon, about 560 kcal. Sure on the salmon. Less sure on the avocado and any oil on the greens."
stat@kcal1 560kcal Calories sub="a guess"
stat@protein1 42g Protein
stat@carbs1 12g Carbs
stat@fat1 38g Fat
form@fix1 "Fix it before I save" portion:Half|"As shown"|Bigger|Double "Anything I missed?":text submit=Save
```

The save, after `{"id":"fix1","preset":"form","form":{"portion":"Bigger"}}`:

```
put meals Day=today Food="Grilled salmon (bigger)" Cal=840 Protein=63 Carbs=18 Fat=57
~kcal1 value=840 sub="bigger"
~protein1 value=63
~carbs1 value=18
~fat1 value=57
say "Saved to your meals. Here's today."
query@today meals where=Day=today sum=Cal|Protein|Carbs|Fat as table "Today so far"
query@meals meals where=Day=today cols=Food|Cal|Protein as table "Meals today"
```

Number each estimate's ids (`meal1`, `fix1`, then `meal2`, `fix2`) so a second photo in the same thread adds a second answer instead of patching the first. Send the two `query` lines once; later saves only need the `put`.

## 2. The estimate is a guess

- **Say how sure, in words.** Every estimate carries one plain line on what the agent is sure of and what it is not ("the rice is under the toppings, so its size is the big unknown"). No percentages: a number like 82% reads as more exact than a photo can be.
- **Mark the tiles.** The calories tile says `a guess` until the person saves. After a fix it says what changed (`bigger`).
- **Nothing is saved without a tap.** The row is written only after Save. The person can change the portion (Half, As shown, Bigger, Double) and add what the photo missed. When they add something, the agent either re-estimates or says plainly that it left it out of the numbers.
- **Round numbers.** Whole kcal and grams. An estimate from a photo is never better than about a fifth either way, so decimals only add false precision.
- **No advice unless asked.** The demo logs food. It does not judge the meal or set targets; a coach agent can, when the person asks it to.

## 3. Where the photo goes

- **In the playground,** nothing leaves the browser. The sample photos are files on this site, a photo from your own camera stays in the page, and the stand-in agent is a script: it cannot see your photo, so it answers with stand-in numbers and says so.
- **In the app,** the photo takes the same path as any photo a person sends an agent: through Yui's private media storage as a short-lived link, to the agent's own host (Relay, YUI-21), where the agent reads it as a local file. Yui never sends the photo to a model.
- **The model is the person's.** The vision call runs on the agent's host with the agent's own model, or with the person's own key from the key vault (YUI-34). Yui has no model of its own in this flow and pays for none.
- **Native agents are the exception.** Basil and the rest of the crew run on Yui's own runtime ([Native Yui](/developers/native)), so for them Yui does call a model: a turn with a photo goes to GLM-5V-Turbo on OpenRouter as a short-lived signed link to the person's own upload, with data collection turned off. One photo per turn, the newest; when more came, the agent is told so and asks for the rest one at a time. With the person's own key (YUI-139), the photo goes to their own model on that key.
- **The row stays on the phone.** The meals table lives on the phone like every agent table (Agent tables, section 4): never in a `yui_` table, never in a push. The agent sees rows only when the person sends them.

## 4. What step 2 needs (the app)

- **The table store and views** (YUI-89): `table create`, `put` and a live `query` drawn natively, in SQLite on the phone. Until then the app cannot draw `put` or `query`, so agents are not taught this flow yet.
- **The camera preset** already runs natively and already hands the photo to the host. Step 2 checks that `+inline` keeps it in the chat, as the playground does.
- **The vision call** on the host: the host's own vision tool (Hermes has one), or a key from the key vault (YUI-34) for agents that bring none.
- **The channel guide** (CHANNEL.md) learns the pattern once tables ship: the estimate shape above, the confidence line, and Save before any write.
- **Tiles two across** (optional): the playground pairs the four stat tiles two across in this demo. The app draws stat tiles full width; pairing a run of tiles is a renderer choice, not a new word.

## 5. Sample photos

The three playground photos are CC0 (public domain) from Wikimedia Commons, resized: "Pancakes with Berries (Unsplash)", "Grilled plated salmon fillet" and "Salmon Poke Bowl (S) with Spicy mayo sauce - Kitokito". No people in any of them. The macro numbers are a stand-in written for the demo, not a model's output.

## 6. Step 2: native Basil (YUI-103)

Chris, on build 244: "I don't wanna make the user weigh that much... It should go as a separate task in a queue, analyze behind the scenes, and then update your screens when ready." And: "a full breakdown of all the calories and all the macros, and I don't need eight screens for that."

- **An answer at once.** A photo to Basil, with or without words (hold to snap and say, YUI-166), gets "Got it, working out the macros." in about two seconds, with no model call. It used to sit on Thinking for 14 seconds.
- **The work runs as a job.** The meal goes into a queue on Yui's server. The model that sees reads the photo and the words and names each item with a portion in plain words ("1 fillet", "a little"), never grams. The runtime does the sums, not the model. A job is claimed once, the minute tick picks up any that stalled, and it gives up after three tries.
- **One breakdown.** One reply, not a page per number: a line with the total and how sure it is, a table of every item with calories, protein, carbs and fat and a total row, today so far, and one donut of today's macros.
- **At most one question.** Only when the answer moves the total by about 100 kcal (the oil, the butter, a portion), and never about something they already said ("cooked in a little butter" is not asked again). The tap is applied with no model turn. What they said no to ("no mayo on mine") comes off the plate.
- **A food memory.** Each food lands in the person's `myfoods` table with its numbers per portion, how often and when last. Next time it is reused with its own numbers, so "my usual oatmeal" means their oatmeal. Every meal is rows in `meals` ([Agent tables](/developers/tables)).
- **A meal in words** ("two eggs and toast with butter for breakfast") is logged the same way.

The Hermes, MCP and A2A version of this pattern comes with the same tables for any agent (YUI-171); until then the channel guide does not teach it.

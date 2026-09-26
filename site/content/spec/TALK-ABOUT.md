# Talk about this | spec v1 (YUI-69, built)

Chris, Sep 25: "Would it be cool if I could just bring in a certain setting or piece of markdown or whatever setting the agent has into context and then chat about it and have it updated itself."

Controls (spec/CONTROLS.md, YUI-70) lets you change your agent by hand. Talk about this lets you change it by talking. Open any item in Controls, tap **Talk about this**, and the chat opens with that item pinned above the composer. Say what you want ("calmer after 9pm", "stop the Friday review, I do it myself now"). The agent reads the item, proposes the change as a before and after, and one tap applies it. The write is the same Controls operation a hand edit uses, so the host checks it, logs it and keeps the old copy in its trash.

Step 1 (this page) is the design. The mock is in the playground: [/playground?demo=talk-about](/playground?demo=talk-about). Step 2 builds it in the app and the Hermes plugin, after Controls itself (YUI-70 step 2); its acceptance is at the end.

## 1. Where it starts

Every item screen in Controls gets a **Talk about this** button under the item:

| Area | Item | What you might say |
| --- | --- | --- |
| Personality | SOUL.md | "Less playful when I'm working." |
| Memory | one entry | "That's out of date, I moved to mornings." |
| Skills | one SKILL.md, or its on and off switch | "Make it ask before it books anything." |
| Schedules | one job | "Move it to 7:30 and skip weekends." |
| Model and tools | the model card | Read only in step 2: you can talk about it, the agent cannot change it. |

The tap closes the drawer, lands on screen 1 of that agent's chat and puts the item on the composer as a chip. The keyboard comes up.

## 2. The chip

- One chip above the composer: an icon for the area, the item's name and its area in small type (`SOUL.md · Personality`, `morning brief · Schedule`). An **x** takes it off. Nothing is sent until the person sends a message.
- A tap on the chip opens the item as Controls shows it (rendered, read only), and closes back to the chat.
- One chip at a time. Talk about this on a second item replaces the first.
- The chip stays while the conversation is about the item: every message sent with it carries the attach line (section 3). It leaves when the person taps x, when a proposal for it is applied, or when they leave the thread for another agent.
- It is the same idea as typing on a screen (YUI-62): the words are about something on screen, so the agent answers about that thing. In the thread, the person's message shows a small "About SOUL.md" tag over the bubble, like "From screen 2".

## 3. What the agent receives

The message goes as a normal user message whose first line names the item, then the words:

```
[yui] attach section=soul id=SOUL.md rev=b41c09
Less playful when I'm working. Keep the warmth.
```

- `section`, `id` and `rev` are the Controls names (spec/CONTROLS.md, Control rows). They are a **reference**, not the content: the relay carries the same small line whatever the item's size, and the text itself never crosses the relay again.
- The Hermes plugin sees the attach line before the agent does, reads the item from the host (the same `get` Controls uses, with the same secret redaction), and puts it in the turn right under the line:

```
[yui] attach section=soul id=SOUL.md rev=b41c09 readonly=no
--- SOUL.md (current) ---
# Scout
Warm, quick, a little playful. Short sentences...
--- end ---
Less playful when I'm working. Keep the warmth.
```

- **Secrets never.** A line that looks like a key reaches the agent as `[hidden on your Mac]`, exactly as the phone saw it, and the item comes with `readonly=yes`: the agent can talk about it, and any proposal for it is refused (section 4), because a write would put the placeholder over the real value. `.env`, auth files and keys cannot be attached at all: Controls never lists them.
- **Once per turn, not every turn.** When later messages carry the same `rev`, the plugin adds only the line; the agent already has the text in its context. A new `rev` (the item changed on the host) gets the new text.
- A host that cannot expand the line (one that reports no Controls, CONTROLS.md section 2) never gets one: the app only offers Talk about this where Controls is shown.

## 4. How the agent proposes a change

The agent never writes the file itself. It calls one tool the plugin adds, `yui_propose`:

```
yui_propose(section="soul", id="SOUL.md", rev="b41c09",
            value={"text": "# Scout\nWarm, quick. Calm and brief while you work..."},
            why="Quieter while you work, same warmth after.")
```

- The same shapes as a Controls request: `value` for a `put`, or `verb` (`pause`, `resume`, `run`, `enable`, `disable`) for an `act`, or `delete: true`. `rev` is the one the agent was given, so a proposal made against an old copy can never land on a new one.
- The plugin checks the proposal with the same rules as a hand edit (CONTROLS.md, section 3) before anything reaches the phone: a read-only item, a SKILL.md without frontmatter, a schedule time that does not parse, a value over 32 KB or with a key in it, SOUL.md or a bundled skill for delete. A refused proposal comes back to the agent as the tool's error, in plain words, and the agent can try again or explain.
- An accepted proposal gets an id (`p-3`) and the plugin draws it into the chat, built from the real file on the host, not from the agent's words:

```
sketch "SOUL.md" frame=window before=Now
row "Warm, quick, a little playful." +x note="removed"
row "Short sentences." +dim
after Proposed
row "Warm and quick. Calm and brief while you work." +hi note="new"
row "Short sentences." +dim
choose@prop-p-3 "Apply this change?" Apply|"Keep it as is"
```

- The before and after is a `sketch`: removed lines struck out, new lines highlighted, a line or two of context greyed on each side. Long files show only the changed parts, with "12 lines unchanged" as a dimmed row between them. A tap on the chip still opens the whole file.
- An `act` or a delete draws as one line each side (`Morning brief: runs weekdays 8:00` then `Morning brief: paused`), and a delete asks in the Controls words ("Forget this? Scout will not remember it next time." Forget | Keep it).
- The agent's `why` goes above the sketch as its own short message. The agent adds nothing else: no "here is the diff", no restating the change.

## 5. Apply, keep, and the receipt

- **Apply** is taken by the plugin with no agent turn, the way one-tap answers and the board reorder work (YUI-73, YUI-66). It runs the Controls operation with the proposal's `rev`: the same checks, the trash copy, the `controls.log` line (with `via: "talk"` and the proposal id).
- **The receipt.** The choose locks on Apply and a card lands under it: `card "Personality updated" "Calm and brief while you work." tag=Applied sub="just now · from this chat" cta="Open in Controls"`. The chip leaves the composer. On its next turn the agent gets the Controls note, marked as its own proposal: `[yui] Applied in Controls: SOUL.md changed (your proposal p-3).`
- **Keep it as is** writes nothing. The choose locks on "Keep it as is"; the chip stays so the talk can go on. The agent hears `[yui] Proposal p-3 kept as is.` on the next turn, and nothing happens until the person says more.
- **Changed since.** If the item changed on the host after the proposal was made (a hand edit, a terminal, another proposal), Apply gets the Controls `conflict` answer. The card says "SOUL.md changed on your Mac since this was proposed" with **Ask again**: a tap sends the attach line with the new `rev` and the words "Propose that again against the current file.", as the person's message.
- **Offline.** A host with no heartbeat for 2 minutes cannot take the tap: the Apply button greys out with "Your Mac is offline". The proposal stays; it can be applied once the host is back if the `rev` still matches.
- **One live proposal per item.** A new proposal for the same item locks the older one's choose ("Replaced by a newer proposal").
- Proposals expire after 7 days, with the control rows.

## 6. Who can do this

- **Owner only.** Talk about this lives in Controls, and only the agent's owner sees Controls. On an agent shared with someone (spec/AGENTS.md, Shared agents), the grantee has no Controls tab, no chip and no Apply.
- The host does not trust the phone here either. The plugin strips an attach line from anyone but the owner (the agent sees the words, never the item), `yui_propose` refuses in a turn the owner did not start, and an Apply tap from anyone but the owner does nothing.
- In a group thread (spec/GROUPS.md) Talk about this is not offered: one agent's settings belong in that agent's own thread.

## 7. Not yet

- Talking about several items at once (a skill and the schedule that runs it).
- Proposing a new memory or a new skill from the chat. Today the agent already remembers things itself; a proposal changes something that exists.
- The model and toolsets, until Controls can edit them.
- A Restore button for an applied change: the old copy is in the host's trash, and restoring it comes with the Controls Restore (CONTROLS.md, section 6).

## Step 2 (native)

Done when all of this is true, with proof on the card:

1. **Talk about this** on every item screen in the Controls tab (personality, a memory, a skill, a schedule, the model card read only), owner only, light and dark.
2. **The chip.** Tapping it lands on screen 1 with the item as a chip above the composer; x removes it; a tap opens the item read only; a second item replaces the first; the sent bubble shows "About SOUL.md". The app sends `[yui] attach section= id= rev=` as the first line, with reference functions `attachBody`/`readAttach` in `yl.mjs`, the app and the Python port, and conformance vectors for them.
3. **Plugin expand.** `hermes-plugin/yui` expands the attach line with the redacted item (once per `rev`), marks redacted items `readonly=yes`, and strips the line from anyone but the owner. Tests cover each.
4. **`yui_propose`.** The plugin tool validates with the Controls rules, draws the `sketch` before and after from the host's file plus `choose@prop-<id>`, and takes Apply and Keep with no agent turn. Tests cover a put, an act, a delete, a stale `rev` (conflict card with Ask again), a read-only item refused, a key-shaped value refused, a grantee refused, the trash copy and the log line with `via: "talk"`.
5. **Round trips on a real phone,** each with a screenshot before and after: talk SOUL.md into a new line and see it on the host; talk a memory out of date and forget it; talk a schedule to a new time. One Keep it as is, and one conflict from a terminal edit mid-proposal.
6. **No secrets.** With a token-shaped line in a memory entry, attach it and ask for a change: the agent's turn shows the placeholder, the proposal is refused, and nothing key-shaped reaches `yui_messages`.
7. Shipped in a VALID TestFlight build, with a progress entry and screenshots.

## As built (step 2, YUI-69)

- **The line.** `attachBody(item, words)` and `readAttach(body)` in `yl.mjs`, `YuiLines.attachBody`/`readAttach` in the app, `attach_body`/`read_attach` in Python; vectors in `spec/conformance/33-attach.json`. An id that is not a Controls id (a space, `..`) or a missing rev sends the words as they are. The person's row also carries `meta.about` (`section`, `id`, `title`), which is how the bubble shows "About SOUL.md" after a reload; the agent never reads meta.
- **Plugin.** `hermes-plugin/yui/talk.py`, wired in the adapter. Before a turn, an attach line from the owner in the owner's thread gets the item under it, read with the same Controls `get` (same redaction), once per rev per thread; the host sends its current rev, so a phone holding an old one still gets the new text. `readonly=yes` when a line was hidden, and always for the model card. From anyone else, or in a group, only the words go through. The item comes with one line on how to propose.
- **Proposing.** The `yui_propose` tool (toolset `yui`, so it rides the auto `hermes-yui` toolset), and for hosts whose model has no Hermes tools (a Claude Code shim) `hermes -p <profile> yui propose --section --id --rev (--text-file | --text | --schedule | --verb | --delete) --why`. Both run the Controls checks without writing (`controls.Host.handle(dry=True)`), then refuse a read-only item, a value or reason with anything key-shaped, and a turn the owner did not start (the gateway records whose turn is running; the tool also knows its own session). The proposal is drawn from the host's copy: the reason as text, then `sketch ... +inline` (changed lines struck and highlighted, one line of context, long runs folded into "N lines unchanged") and `choose@prop-p-N ... +inline`. `+inline` keeps it in the chat for agents whose look opens screens full screen. A delete asks Forget/Delete or Keep it; an act asks Pause, Resume, Run now, Switch on or Switch off. A newer proposal for the same item retires the older one ("Replaced by a newer proposal."). State (proposals, which revs each thread has read, whose turn it is) is `<profile home>/yui/talk.json`, shared by the gateway and the CLI; proposals are dropped after 7 days.
- **Taps.** Taken by the gateway with no turn, owner only. Apply runs the Controls write with the proposal's rev: trash copy, and a `controls.log` line with `"via": "talk"` and `"proposal": "p-N"`. The receipt is a card (`Personality updated`, the reason, `tag=Applied`) whose row carries `meta.talk.applied`; the app takes the chip off when it sees it. There is no Open in Controls button yet: the chip already opens the item, and a button that only navigates would need an app route (later). Keep it as is writes nothing; answers can change, so Apply after Keep still applies. A moved rev gets `card@again-p-N "... changed on your Mac since this was proposed"` with Ask again, which becomes the person's message: the attach line at the current rev and "Propose that again against the current file." The agent hears `[yui] Applied in Controls: SOUL.md updated (your proposal p-3).` or `[yui] Proposal p-3 kept as is.` on its next turn.
- **App.** Talk about this under the item on Personality, a memory, a skill, a schedule and Model and tools (owner only: Controls is). It closes the sheet and the drawer, turns to screen 1, puts the chip over the composer and brings the keyboard up. The chip: the area's icon, the item's name, the area in small type; a tap opens it read only; x takes it off; a second item replaces it; moving to another agent clears it. While it is on, a reply quote waits and a slash command goes plain.
- **Not built.** The offline grey-out on Apply (a tap while the Mac is asleep waits in the relay and is taken when it wakes, if the rev still matches).
- **Proof.** `hermes-plugin/tests/test_talk.py` (27), `YuiTests/TalkAboutFormatTests`, `YuiUITests/TalkAboutTests` (light and dark on the demo host), and `supabase/tests/talk_e2e.py --sim` (live relay, the plugin's code as the host, a scripted agent: SOUL.md gets a line, one Keep it as is, a terminal edit mid-proposal then Ask again, a memory forgotten, a schedule moved to 7:30, a token-shaped memory refused, then a query for anything key-shaped in `yui_messages`).


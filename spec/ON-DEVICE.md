# The model on the phone | spec v0 (YUI-41 step 1, Sep 26 2026)

Every small thing Yui does with words today waits on the network: a reply goes to an agent, a push says "Coach has something for you in Yui", and with no signal nothing happens at all. iPhones with Apple Intelligence carry a language model of their own, and apps can use it. This spec gives it four small jobs in Yui: suggest a reply to the last screen, send an ask in a group to the right agent, sum up a reply for its push, and draft a screen while offline. It never answers as an agent.

Status: design only. Nothing in the app changed, no account was made, nothing was spent. The mock runs in the playground: [/playground?demo=on-device](/playground?demo=on-device). Building it natively is step 2.

```
 agent's screen lands  -->  model on the phone  -->  2 or 3 reply chips under it     (a tap sends, like typing)
 you type in a group   -->  model on the phone  -->  "To Sage" pill over the composer (Change, then send)
 push arrives          -->  model on the phone  -->  one plain line for the lock screen
 no signal, you ask    -->  model on the phone  -->  a draft screen, marked as a draft (the ask waits for the agent)
                             nothing leaves the phone
```

## 1. What the phone's model can do

Apple's Foundation Models framework gives apps the on-device model behind Apple Intelligence ([Foundation Models](https://developer.apple.com/documentation/foundationmodels), [Meet the Foundation Models framework, WWDC25](https://developer.apple.com/videos/play/wwdc2025/286/)). What matters for Yui, checked against Apple's documentation on Sep 26 2026:

| | What Apple says | What it means for Yui |
|---|---|---|
| Size of a conversation | 4,096 tokens per session, instructions, prompt, tool schemas and answer together ([TN3193](https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window)). About 3 to 4 characters a token in English, about 1 in Chinese, Japanese or Korean. | Every job is a fresh, short session with a fixed budget (section 7). No job reads a whole thread. |
| Structured answers | `@Generable` types and `@Guide` constraints: `anyOf`, `pattern` (regex), `range`, `count`, `maximumCount`. Decoding is constrained, so the shape is guaranteed ([GenerationGuide](https://developer.apple.com/documentation/foundationmodels/generationguide)). Streams arrive as partial snapshots. | The model fills Swift types; it never writes Yui Lines. A route is `anyOf` the group's member names, so it cannot invent an agent. |
| Tools | A `Tool` has a name, a description, `Arguments` and `call`. The model may call tools more than once, in parallel. Apple suggests 3 to 5 tools at most ([Tool](https://developer.apple.com/documentation/foundationmodels/tool)). | Not used in step 2. Every job gets what it needs in the prompt. |
| Who has it | `SystemLanguageModel.default.availability` is `.available` or `.unavailable` with `deviceNotEligible`, `appleIntelligenceNotEnabled` or `modelNotReady` (still downloading) ([UnavailableReason](https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel/availability-swift.enum/unavailablereason)). iPhone 15 Pro, 15 Pro Max, iPhone 16 models or later, in a region with Apple Intelligence ([Apple Intelligence devices](https://support.apple.com/en-us/121115)). | Many Yui users will not have it. Every job has a fallback that is the app as it is today (section 6). |
| Languages | English, Danish, Dutch, French, German, Italian, Norwegian, Portuguese, Spanish, Swedish, Turkish, Vietnamese, Chinese, Japanese, Korean. Other locales throw `unsupportedLanguageOrLocale` ([Supporting languages](https://developer.apple.com/documentation/foundationmodels/supporting-languages-and-locales-with-foundation-models)). | Check `supportsLocale` first; an unsupported language is the fallback, not an error. |
| One at a time | A session answers one request at a time (`isResponding`). `prewarm()` helps only with a second or more of warning. In the background, requests may be rate limited ([LanguageModelSession](https://developer.apple.com/documentation/foundationmodels/languagemodelsession)). | Jobs queue on one small actor. Chips wait for the screen to land; a push line in the background may be refused, and then the relay's line stands. |
| Safety | Guardrails can refuse (`guardrailViolation`, `refusal`). | A refusal is the fallback, never an error on screen. |
| What it is bad at | Math, code, reasoning, world knowledge ([Generating content](https://developer.apple.com/documentation/foundationmodels/generating-content-and-performing-tasks-with-foundation-models)). | None of the four jobs needs them. Advice, facts and numbers stay with the agent. |
| Privacy | "All of this runs on-device, so all data going into and out of the model stays private... it can run offline" (WWDC25 session 286). | The reason to do this at all. |

**Versions.** The model changes with the OS: one for iOS 26.0 to 26.3, one for 26.4, one for 27 ([Updating prompts for new model versions](https://developer.apple.com/documentation/foundationmodels/updating-prompts-for-new-model-versions)). Yui's prompts are tested per version (section 10). iOS 27 renamed the errors (`LanguageModelError`); Yui targets iOS 26.0, so it handles both.

**Not used, on purpose.** iOS 27 also offers Private Cloud Compute, a bigger model on Apple's servers, and a way to plug in other models. Both send words off the phone, so neither is in this plan (question 7). Custom adapters (about 160 MB each, retrained for every model version) are not needed for four short jobs.

## 2. Suggested replies

When an agent's screen asks something in words, Yui offers two or three short replies under it. A tap sends that reply as the person's own message, exactly as if they had typed it.

- **Only when the screen asks in words.** A `say` that ends in a question and nothing on the screen to tap. A screen with its own `choose`, `pick`, `ask`, `form` or `slide` gets no chips: the agent already gave the answers.
- **What the model sees.** The agent's name, the words of the last screen (text of `say`, `card`, `stat` labels and values, `list` items; ids, props and picture links dropped), cut to 600 tokens from the end, and the person's last message. Nothing else from the thread.
- **What comes back.** `@Generable struct Replies { @Guide(.count(1...3)) var replies: [String] }`, each at most 40 characters (`pattern`), in the person's language. Greedy sampling, so the same screen gives the same chips.
- **How it looks.** A row of chips under the reply, above the composer, with a small "on this phone" mark. They fade in when ready, never push the screen around, and go away when the person types, scrolls up or taps one.
- **Budget.** The chips must be ready within 800 ms of the screen landing, or they don't show for that screen. Late chips that jump in while someone reads are worse than none.
- **What the agent gets.** The words, as a normal message. The row carries `meta.via = "suggested"` so the flywheel (spec/FLYWHEEL.md) can count how often chips are used; agents need not read it, and the channel guide does not change.

## 3. Routing an ask

In a group ([Group threads](/developers/groups)), a message that names no one goes to the lead today. With the model, Yui guesses which member it is for and says so before it goes.

- **The pill.** As the person types, a pill over the composer reads "To Sage · sleep and calm · on this phone". Change cycles through the members; a tap on the pill's face opens the full list. The message goes where the pill says. The guess is made once the typing pauses for 400 ms, and the pill never changes while a finger is on Send.
- **An @name always wins.** Named agents are routed by the database as today; the model is not asked. No match, a tie or a low-confidence answer means the lead, as today, and the pill says "To Coach, the lead".
- **What the model sees.** The message and, for each member, the name and one line of what it is for: the agent's own description from its profile, or what the person wrote when they made the group. Never the members' threads.
- **What comes back.** `@Generable struct Route { @Guide(.anyOf(memberNames + ["lead"])) var to: String }`. It cannot name anyone outside the group.
- **On the wire.** The same `meta.group.to` the app writes when you @name someone, plus `meta.group.routed = "on-device"`, so the relay can tell a guess from a choice. The trigger routes it exactly as a named message. No schema change.
- **The drawer.** The drawer's agent switcher gets the same pill: typed words there pick an agent and open its thread with the words in the composer, not sent. That is the only place outside a group where the model picks an agent.

## 4. A line for the push

Today a reply that is all screen and no words gets the relay's line: "Coach has something for you in Yui". The phone can do better without the words ever leaving it.

- **Where.** A notification service extension (the push already carries `mutable-content: 1`). It reads the message row the push names, with the app's own session from the shared keychain, and asks the model for one line.
- **What the model sees.** The words of that one reply, as in section 2, cut to 1,000 tokens. For a push after a long run of replies ("5 new from Coach"), the words of the newest three, cut the same way.
- **What comes back.** One line, 90 characters at most, saying what the reply holds: "Weight down 2.3 lb. Rest day or a light 3k tomorrow?" No greeting, no "Coach says", no advice of its own.
- **Only the text changes.** The screen in the thread is the agent's own and opens as sent. A group handoff and a quote keep the relay's line.
- **Unknown until tried.** Apple's documents say nothing about calling the model from a notification extension, which has little memory and about 30 seconds. Step 2 tests this first. If it cannot, the relay's line stays for pushes, and the summed-up line is written the next time the app runs and used for the thread's last-message line in the agent list.

## 5. Drafting a screen offline

With no signal, a message waits in the outbox. With the model, the person also gets something to use right away.

- **When.** The phone is offline and the person sends a message. The message waits for the agent as today. Under it, the phone draws a draft.
- **What comes back.** A Swift type the model fills, then the app draws: `enum Draft { case checklist(title, items), timer(label, minutes), card(title, body) }`, items and words limited by `@Guide`. The app turns it into nodes with the same code the parser feeds; the model never writes Yui Lines.
- **How it looks.** A dashed frame, in Yui's own neutral look, never the agent's: "Draft on this phone, not from Coach". Ticks and timers work. Two buttons: **Ask Coach when online** (the default, the message is already waiting) and **Discard**.
- **When the agent answers,** its reply replaces the draft in place. Ticks made on the draft go with the waiting message as a note (`meta.draft_ticks`), so the agent knows what the person already did.
- **Only drafts things that don't need an expert.** Lists, timers and notes. A question about health, money or anything the agent knows and the phone doesn't gets no draft: "Saved. It goes to Coach when you're back online."

## 6. When the model is not there

Every job falls back to the app as it is today. Nothing is greyed out and nothing says "upgrade your phone".

| Job | Fallback |
|---|---|
| Suggested replies | No chips. The composer, as today. |
| Routing | Named agents, else the lead, as today. The pill still shows who it goes to. |
| Push line | The relay's line. |
| Offline draft | "Saved. It goes to Coach when you're back online." |

Fallback cases: `deviceNotEligible`, `appleIntelligenceNotEnabled`, `modelNotReady`, an unsupported language, a refusal, a guardrail, a rate limit, the context budget exceeded, or the job missing its time budget. Settings > **On this phone** shows one switch and one line of why it is off when it is ("Turn on Apple Intelligence in Settings to use this"). The switch is on by default where the model is available.

## 7. Budgets

Every job is a new `LanguageModelSession` with short instructions, so none can grow toward the 4,096-token ceiling:

| Job | In (at most) | Out (at most) | Time budget |
|---|---|---|---|
| Suggested replies | 800 tokens | 60 | 800 ms after the screen lands |
| Route | 400 tokens (8 members) | 10 | 400 ms after typing pauses |
| Push line | 1,300 tokens | 40 | the extension's own limit |
| Offline draft | 300 tokens | 250 | 3 s, streamed as it fills |

- `prewarm()` when a thread opens and when the composer takes focus in a group.
- The Speed panel ([Speed](/developers/perf)) gets one row per job: how often it answered in budget, and the median time, per build and per model version.
- It costs nothing per use: no tokens billed, no network. What it costs is battery and a moment of the phone's attention, which is why every job is small.

## 8. What it never does

- **Never answers as an agent.** It suggests what the person might say, picks who hears it, sums up what an agent said, or drafts a placeholder that says it is one. It never writes an agent's reply, never speaks in an agent's look and never gives advice.
- **Never sends without a tap.** Chips send when tapped. A route goes when the person taps Send. A draft is never sent to anyone.
- **Never reads other agents' threads.** Each job sees one thread's latest words, or, for routing, the members' one-line descriptions. A group guess never reads the members' conversations, the same boundary groups keep today.
- **Never acts.** No tools, no purchases, no deletes, no messages to anyone but the person's own agents.

## 9. Privacy

- Nothing the model reads or writes leaves the phone. No prompt, suggestion, route guess or summary is logged or sent anywhere; only the fact that a message came from a chip or a guess (`via`, `routed`) goes with the message.
- The model is Apple's, on the phone, under Apple's own privacy terms. Yui adds no model files and no account.
- The notification extension reads one message with the person's own session, the same row the app would show.

## 10. Step 2, the build

None of it is started:

- An `OnDevice` actor in the app: availability, locale check, one queue, `prewarm`, the four jobs with their `@Generable` types, budgets and fallbacks.
- Chips under the last screen; the route pill in groups and the drawer switcher; the offline draft frame; Settings > On this phone.
- A notification service extension, tested first for whether it may call the model at all (section 4).
- `meta.via`, `meta.group.routed` and `meta.draft_ticks` on the rows the app writes (no migration: `meta` is already free-form).
- Tests: a prompt suite per model version (fixed screens, expected chip shapes, routing cases with known answers, drafts that must parse), run on a device with Apple Intelligence; UI tests with the model faked on and off, light and dark; the fallbacks with the model off.

The channel guide does not change. Agents see messages, as they do now.

## Open questions for Chris

1. **Does a chip send at once, or fill the composer?** (a) send at once, like a button (the plan); (b) put the words in the composer to edit, then Send.
2. **Chips on every question, or only when the agent asks in words?** (a) only when the screen has nothing to tap (the plan); (b) also next to an agent's own buttons.
3. **Routing in a group: guess, or always the lead?** (a) guess and show the pill (the plan); (b) the lead unless named, and the pill only as a suggestion.
4. **Offline drafts: which kinds?** (a) checklists, timers and notes (the plan); (b) notes only; (c) skip drafts in the first build.
5. **Push lines if the extension cannot use the model:** (a) keep the relay's line (the plan); (b) send the full reply's words in the push so the line is always specific (it passes through Apple's push service).
6. **On by default?** (a) on where the model is available, with the switch in Settings (the plan); (b) off until the person turns it on.
7. **Private Cloud Compute** (iOS 27, a bigger Apple model off the phone): (a) never, on-device only (the plan); (b) later, for longer summaries, with its own switch.

## Sources (read Sep 26 2026)

- Foundation Models framework: https://developer.apple.com/documentation/foundationmodels
- The 4,096-token context window: https://developer.apple.com/documentation/technotes/tn3193-managing-the-on-device-foundation-model-s-context-window
- Guided generation and its constraints: https://developer.apple.com/documentation/foundationmodels/generationguide and https://developer.apple.com/documentation/foundationmodels/generable
- Tools: https://developer.apple.com/documentation/foundationmodels/tool
- Availability and the reasons it is off: https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel/availability-swift.enum/unavailablereason
- Devices and languages: https://support.apple.com/en-us/121115
- Languages and locales: https://developer.apple.com/documentation/foundationmodels/supporting-languages-and-locales-with-foundation-models
- Sessions, prewarm and rate limits: https://developer.apple.com/documentation/foundationmodels/languagemodelsession
- Model versions: https://developer.apple.com/documentation/foundationmodels/updating-prompts-for-new-model-versions
- What changed in 26.4 and 27: https://developer.apple.com/documentation/updates/foundationmodels
- WWDC25: https://developer.apple.com/videos/play/wwdc2025/286/ and https://developer.apple.com/videos/play/wwdc2025/301/

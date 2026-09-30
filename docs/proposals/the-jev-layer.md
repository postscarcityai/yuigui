---
id: PROP-2
title: The Jev layer
summary: One fast Jev call on every turn picks the shape of the reply, so the agent writes into it.
status: Building
date: 2026-09-28
becomes: A four-step epic: spec and mock, shadow mode on the Hermes plugin, Jev routing behind a flag, an on-device fallback (YUI-41). Steps 2 and 3 are built and measured (YUI-215, 2026-09-30): shadow mode and the hint flag are in the plugin and off, the crew tool router runs in shadow. Whether to turn the hint on is Chris's call. Step 4 stays in the backlog.
cost: L
call: recommend
by: Chris
---

```hero
say Am I up to date?
card "You are up to date" "Build 160 is the newest. Nothing new since Sunday." sub="one line, not a deck" cta="Open TestFlight"
```

## The problem

Today the agent's model reads a long guide on every turn and decides what the screen looks like. It picks one line or a deck, a card or a full screen, a map or none, a camera or none. It gets it wrong in ways you can see. A yes or no gets a deck. Chris, 2026-09-26: "eight screens of basically nothing just to tell me that I'm up-to-date". A status question gets a wall of text.

The native agents do it with hand-written patterns. "Plan my week" works. "Could you sort my week out" misses.

We found about twenty decisions like this on one turn. Most are small, closed questions on a short message. A big model is a slow, pricey way to answer them.

## Who it is for

Anyone who talks to an agent in Yui and wants the answer in the right shape the first time. One line when a line is enough. A map when they asked where. The camera when the agent needs a photo.

## How it works

Jev is a new kind of model from TypeSafe AI. It cannot write text. You give it a message and a list of typed questions. It answers each with a choice or a yes/no probability, plus how sure it is. Then the agent writes into the shape Jev picked.

This is one extra step on every call to an agent:

<figure class="prop-turn" id="turn">
<svg viewBox="0 0 360 590" role="img" aria-label="One turn, top to bottom. The message goes to the Jev layer. Jev returns a typed decision. The agent writes into that shape. Jev checks the draft, log only. The phone shows one line." xmlns="http://www.w3.org/2000/svg" font-family="ui-rounded, system-ui, sans-serif" font-size="14" fill="currentColor">
<defs><marker id="pj-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
<rect x="30" y="8" width="300" height="56" rx="16" style="fill:var(--raised);stroke:var(--outline)" stroke-width="2"/>
<text x="46" y="32" font-weight="800">1 Message</text>
<text x="46" y="52" style="fill:var(--muted)" font-size="13">"Am I up to date?"</text>
<path d="M180 64 V96" stroke="currentColor" stroke-width="2" marker-end="url(#pj-arr)"/>
<rect x="30" y="100" width="300" height="56" rx="16" style="fill:var(--lavender)" stroke-width="0"/>
<text x="46" y="124" font-weight="800" fill="#2A2238">2 Jev layer</text>
<text x="46" y="144" fill="#2A2238" font-size="13">One call, five questions, 70 to 500 ms</text>
<path d="M180 156 V188" stroke="currentColor" stroke-width="2" marker-end="url(#pj-arr)"/>
<rect x="30" y="192" width="300" height="134" rx="16" style="fill:var(--butter)" stroke-width="0"/>
<text x="46" y="216" font-weight="800" fill="#2A2238">3 Typed decision</text>
<text x="46" y="240" fill="#2A2238" font-size="13" font-family="ui-monospace, Menlo, monospace" style="white-space:pre">shape        line     0.91</text>
<text x="46" y="260" fill="#2A2238" font-size="13" font-family="ui-monospace, Menlo, monospace" style="white-space:pre">things       1        0.88</text>
<text x="46" y="280" fill="#2A2238" font-size="13" font-family="ui-monospace, Menlo, monospace" style="white-space:pre">map          no       p 0.02</text>
<text x="46" y="300" fill="#2A2238" font-size="13" font-family="ui-monospace, Menlo, monospace" style="white-space:pre">camera       no       p 0.01</text>
<text x="46" y="320" fill="#2A2238" font-size="13" font-family="ui-monospace, Menlo, monospace" style="white-space:pre">camera_kind  none     0.95</text>
<path d="M180 322 V354" stroke="currentColor" stroke-width="2" marker-end="url(#pj-arr)"/>
<text x="192" y="343" style="fill:var(--muted)" font-size="12">one hint line</text>
<rect x="30" y="358" width="300" height="70" rx="16" style="fill:var(--mint)" stroke-width="0"/>
<text x="46" y="382" font-weight="800" fill="#2A2238">4 Agent</text>
<text x="46" y="402" fill="#2A2238" font-size="13">The model writes into "one line".</text>
<text x="46" y="419" fill="#2A2238" font-size="13">It can overrule the hint.</text>
<path d="M180 428 V456" stroke="currentColor" stroke-width="2" marker-end="url(#pj-arr)"/>
<rect x="30" y="460" width="300" height="52" rx="16" style="fill:var(--raised);stroke:var(--outline)" stroke-width="2" stroke-dasharray="6 5"/>
<text x="46" y="482" font-weight="800">5 Check, log only</text>
<text x="46" y="500" style="fill:var(--muted)" font-size="13">Long reply? Jev flags a deck for a yes/no.</text>
<path d="M180 512 V536" stroke="currentColor" stroke-width="2" marker-end="url(#pj-arr)"/>
<rect x="30" y="540" width="300" height="42" rx="16" style="fill:var(--brand)" stroke-width="0"/>
<text x="46" y="566" font-weight="800" fill="#2A2238">6 Screen: one line</text>
</svg>
<figcaption>One turn. Jev sits before the agent and, on long replies, after it. The dashed step only logs.</figcaption>
</figure>

1. The message arrives. The plugin cuts it to 400 characters and adds a few facts: the last reply shape, whether a photo came with it, the agent's tool names.
2. One Jev call asks up to five questions at once: the reply shape (one line, yes/no, card, pages, full screen), how many things there are to read, whether it needs a map, whether it needs the camera, and which camera (plain, meal, document, barcode, tuner mic).
3. Each answer has a confidence. Above the line (0.80 for a choice, 0.85 or 0.15 for a yes/no, to be tuned) it becomes one plain hint line. Under the line it says nothing.
4. Under the line, or if Jev is down or slower than 600 ms, the agent reads the channel guide and decides, exactly as it does today. Jev never blocks a turn.
5. On long replies only, a second call checks the draft against the shape it should have had. At first it only writes a log line.
6. Later, the same questions go to more places: the photo intent on a meal turn, and the tool router that catches "could you sort my week out".

What is real and what is a claim. TypeSafe says: 70 to 500 ms, $0.042 per million input tokens, output free, and answers that are "calibrated", so 0.9 means right about nine times in ten. Since this page went up, Jev became available on OpenRouter (`typesafe/jev-1.13`, billed to our own OpenRouter key), so we ran it: about 770 calls on the channel eval's messages, real Yui messages and made-up phrasings for the crew's tools. The measured numbers are in [the results](https://github.com/postscarcityai/yuigui/blob/main/docs/research/jev-results.md):

- **Speed and cost hold.** Median 248 ms, 95th percentile 323 ms. About 3 cents per 1,000 shape calls.
- **The crew's tool router is a clear win.** Today's patterns catch 52% of the ways to ask for a tool. Jev catches 92%, and 97% with the patterns first. "Get my week into some kind of order" reaches plan my week.
- **The reply-shape hint depends on the shape.** On every shape it made the channel eval worse. On card, pages and full screen only, it lost no case in two runs. So the plugin hints only those, and the whole hint is off until Chris says.
- **Confidence is honest on real messages** (0.9 and up: right 96% of the time) and overconfident in the middle on the eval's richer asks.

The labels behind these are hand-made by the Yui agent, and nothing has run on live turns yet. The results page says where that limits each number.

What we can work out from those claims:

| | Per turn | Per 1,000 turns |
|---|---|---|
| Shape call, about 800 tokens in (measured: $0.034 per 1,000) | about $0.00003 | about 3 cents |
| Check call on a long reply, about 1,500 tokens | about $0.00006 | about 6 cents |
| Both, worst case | under $0.0001 | under 10 cents |
| Added wait, shape call | 70 to 500 ms claimed | runs beside the work the plugin already does |

Cost is not the limit. Privacy and trust are.

## Pros

- Fixes the complaint Chris keeps making: a deck for a yes/no, a wall of text for a status.
- Fast and nearly free next to a big model, if TypeSafe's claims hold.
- A choice from a fixed list cannot be a broken screen. Jev can pick the wrong option, but not one outside the list.
- Never blocks: under the confidence line, Yui works as it does today.
- The log gives us labelled data. We learn how often the model picks the wrong shape.
- One place to tune reply shape, instead of a longer guide.

## Cons

- The person's words leave the phone for a third party. Today they go only to their own agent.
- Text only. Jev cannot see a photo or a map, so camera and photo decisions come from the words.
- A days-old model, in early access, with a price that can change.
- One more moving part on every turn, and one more thing to watch.
- Calibration is TypeSafe's claim. Nobody outside has proven it.

## Cost

L. The hint plumbing in the plugin is a few days. The real work is the eval set (about 100 labelled turns), the shadow run and the tuning. Steps, each a backlog card:

1. **Spec and playground mock.** Write the questions and the hint line down, and mock the diagram and the hint in the playground. No key, no call. Card: SITE, "Jev layer spec and playground mock". S. (Done: the hero on this page.)
2. **Shadow mode on the Hermes plugin.** Jev decides and logs. The model still decides. We compare on real turns and score Jev against the eval set. Needs the key and a yes on question 1 below. Card: YUI, "Jev shadow mode in the Hermes plugin". M. (Built in YUI-215 and scored offline. Live logging waits for the key in the gateway's environment.)
3. **Jev routes for real, behind a flag.** The hint goes into the turn, owner turns only, with a switch in Settings. The post check stays log only. Card: YUI, "Jev shape hint behind a flag". M. (Built in YUI-215, off. It hints card, pages and full screen only. The Settings switch is not built: the flag is in the profile's config.)
4. **An on-device fallback.** The easy calls (shape, camera) run on the phone with the small model from YUI-41, so no words leave the phone. Jev stays for the rest. Card: YUI-41 (exists), extended. L.

Chris picks which of these become work, and in what order.

## Risks

- **Private text goes to a third party.** TypeSafe says it will not train on inputs. It keeps them "as long as reasonably necessary", with no fixed period. Mitigation: 400 characters, no thread, owner turns only, a switch in Settings.
- **Shared agents carry someone else's words.** Start with owner turns only.
- **Wrong hints.** A wrong hint could make a worse screen. Mitigation: the model can overrule, two clashing hints are dropped, and shadow mode measures before any hint reaches a person.
- **Vendor risk.** Early access, an outage at launch, price unknown. Every row falls back to today's behavior, so the loss is the gain, not the app.
- **Claims checked once, offline.** Speed and price held in about 770 calls (p95 323 ms, 3 cents per 1,000). Calibration held on real messages and not in the middle range on the eval. We keep watching p95 and the wrong-shape rate in shadow mode, and stop if either is bad.

## Open questions

- **Can a person's message leave the phone for Jev?** (a) Yes, owner turns only, 400 characters, behind a switch in Settings. (b) No, Jev only on our own test turns. (c) Only for agents the person marks. Yui would start with (a).
- **Who makes the Jev account and key?** Answered: Jev is on OpenRouter, so our existing OpenRouter key works and bills there. No TypeSafe account is needed. Putting the key in the yui gateway's environment is what turns the live shadow on.
- **Where does the call run?** On the Hermes plugin (one place, easy to log), in the app (works with any agent, the phone holds a key), or through a proxy on yuigui.com. Yui would start on the plugin.
- **Groups: wait for the on-device model or use Jev?** On-device keeps the words on the phone. Jev works on every phone. Yui would wait.

## Yui's call

Recommend, as a small step first. The mock, the shadow mode and the flag are built and measured. The crew's tool router is worth turning on after a live shadow week. For the reply shape, hint card, pages and full screen only, and leave lines and yes/no to the agent until live turns say more.

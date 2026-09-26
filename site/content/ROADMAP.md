# Yui | roadmap (draft 13, Sep 25 2026)

yuigui.com. Generative UI front end for your AI agents. Source: Chris's pitch recording 366 (transcript `pitch/rec366.txt`, summary `pitch/SUMMARY.md`). The recording calls it "Nexus". This document says Yui throughout.

## Where Yui is now (Sep 26)

- **On phones:** Yui 0.3.0, build 138, on TestFlight since Sep 26. The smooth release: taps answer at once, a long thread scrolls smooth and opens fast (YUI-101), typing keeps up like Notes (YUI-99), shapes that move (YUI-104), restyle Yui by asking (YUI-96), shared agents (YUI-95, YUI-97), group threads in the database and the plugin (YUI-93), speed numbers from real phones (YUI-102), and two fixes from deck feedback (an inline deck as tall as its page, full-screen pages that never come up blank).
- **Also on phones, build 148 (Sep 26):** YUI-106 (send and the drawer taps answer faster), YUI-70 (agent controls in the drawer), YUI-69 (talk about a setting), YUI-111 (a patch moves a timeline row in place) and YUI-112 (a timeline alone on the stage keeps its row heights). [See it](/mockups#build-148).
- **Up next:** YUI-100 memory audit, YUI-29, then the backlog in the order below. Feel and ease of use first; integration work waits in the backlog.
- **Waiting on Chris:** one look in claude.ai (INT-7) and one in chatgpt.com (INT-8). YUI-91 waits on a Yui Dev install.
- **MVP:** every card has shipped except YUI-29, a stranger running the whole path alone.

## What the pitch actually says

- "Generative UI is different from regular UI because it's more of a system and it can be totally unique each time."
- "The default state is you can just talk to it... And then also it can just take over the screen at any time and generate UI for you."
- "This one app is approved on the App Store. You can hook your agent up to it."
- "Hey Arnold, I want to do a countdown timer."
- "The real problem I'm having with my lobster agents is that I just can talk to them via text. If it asks me a question, I just want a button."
- "Probably for V1, I would love it to just plug into my open claw... my early adopters of this are going to be open claw users."
- "In all phase ones, we're plugging into outside services and then slowly but surely we bring them in house."
- "The goal is that you download this app, you put in your credit card and you're off to the races with a multi-agent in your life."
- "You're not going to one shot this whole company."

Short version: chat first, screens on demand, many agents in one app, Chris's own Hermes fleet is customer zero.

## MVP: the smallest Yui a stranger can use

Chris, Sep 24: do not lose focus on the MVP, and keep a deep backlog to pull from. This section is the focus. Everything else in this document is the backlog.

**The MVP is done when someone outside PostScarcity who already runs Hermes can:**

1. Install Yui from a public TestFlight link.
2. Sign in with Apple.
3. Connect their own Hermes in minutes: one command to install the plugin, one code to pair.
4. Talk to their agents and get screens back: buttons, choices, forms, timers. They can change an answer after tapping.
5. Get a push when an agent answers while the app is closed.
6. Delete their account from inside the app, and have it actually gone.

And they do all of that without help from us. Card YUI-29 is the test: a real outside tester runs the whole path with a stopwatch.

**Not in the MVP:** people with no agent yet, other frameworks, full-screen mode, voice, per-agent themes, the bigger preset families, Android, the Watch, payments. All of those are good, and all of them wait.

The progress bar on yuigui.com counts the cards below. Their statuses come from the live board every 30 minutes; the list of which cards count is kept by hand in `site/content/mvp.json`.

### In the MVP

Shipped:

- YUI-1: Yui Lines, the screen language, with a web renderer.
- YUI-2: the app's look, light and dark.
- YUI-3: the shared test suite and the Swift parser.
- YUI-4: the first six screens in chat: ask, choose, pick, form, list, timer.
- YUI-5: the coral wordmark in the app.
- YUI-6: accounts (Sign in with Apple and in-app account deletion) and the relay on Supabase Realtime.
- YUI-9: typographic identity, no mascot.
- YUI-11: the debug screen is gone; the top button opens your agents.
- YUI-15: you add, rename and remove your own agents.
- YUI-7: the Hermes `yui` plugin. Each agent gets a thread and answers with screens.
- YUI-10: the channel guide every agent gets, with an eval.
- YUI-12: change your answer after tapping.
- YUI-23: one-command plugin install on any Hermes host, plus a Getting started page.
- YUI-24: a push when an agent answers and the app is closed.
- YUI-25: first run, from sign-in to your agent's first screen, with no guessing.
- YUI-28: messages survive a sleeping Mac, a dropped network or a killed app.
- YUI-26: safe for strangers: rate limits, a kill switch, and a fresh security audit of the shared backend.
- YUI-27: ready for Apple's beta review: privacy labels, review notes, a demo code with a scripted demo agent for the reviewer, a help link.
- YUI-52: build 57 on TestFlight with every fix from the Sep 24 feedback, each one checked again on that build: the composer clears, the gallery closes, photos stop overlapping (tall screenshots too), a working note on long answers, a natural voice, more colors, photos and hold-to-talk in the composer.
- YUI-22: the public TestFlight link. Apple approved the beta on Sep 24: [https://testflight.apple.com/join/ykrYHwet](https://testflight.apple.com/join/ykrYHwet).
- YUI-50: chat polish. The composer clears when you send, your text floats up into its bubble, and a down arrow takes you back to the newest message. Shipped in build 57.
- YUI-74 (shipped Sep 25, in build 91): after sending a photo and dragging the keyboard away, check the thread settles on the newest message and nothing sits under the page pill.

Up next, the last MVP card:

- YUI-29: the acceptance run. A stranger does the whole path.

### Next after the MVP

Several of these shipped early, on Sep 24, while the MVP was being built: YUI-20 (every agent has its own look), YUI-8 (pick it up in Yui from Telegram), YUI-13 (full-screen mode), YUI-16 to YUI-19 (media, charts and science, learn and plan presets, on the web and native in the app), YUI-21 (agents send real images and videos), YUI-42 (the preset flywheel: custom screens agents keep sending get flagged for promotion to presets, checklist in spec/FLYWHEEL.md), SITE-15 (Yui Lines back on the home page, and every spec doc readable on the site), SITE-16 (watch Yui grow: the whole GitHub history, builds and screenshots, day by day, at /timeline), INT-0 (the adapters plan), INT-1 (OpenClaw agents talk in Yui) and INT-2 (a webhook bridge for any agent that answers HTTP). Build 57 (Sep 24) brought more to phones: YUI-49 (hold a message to react: 👍 build it, 👎 no, 🤔 ask me, ❤️ love it, ⏳ later, 🔥 priority; definitions in spec/REACTIONS.md, live at /reactions), YUI-53 (no dead buttons: a plan ends in Send, and the channel guide bans "Got it" buttons), YUI-51 (one full-screen flow holds the pages and the questions with one Send, and afterwards the chat keeps an expandable record and your answers as your own message), YUI-32 (named screens: an agent saves a screen, it sits on a shelf at the top of the thread, and `show busy day` or one tap brings it back), YUI-31 (screens per agent: the chat plus screens a swipe away, which keep what the agent puts there) and YUI-30 (the timer keeps counting on the lock screen). Builds 61 and 64 (Sep 24 and 25) followed from TestFlight feedback: hold to talk no longer crashes and now works like WhatsApp (a waveform, let go sends, slide to the trash cancels), screens go from 2 to 12 and each one gets the whole phone. YUI-55 sends test builds by link, and YUI-67 (links in a card open Safari) reached phones in build 74. What is left to pull once the MVP passes, roughly in this order:

Chris's picks for the short term (Sep 25), in this order. The site cards run alongside in their own lane:

- YUI-54 (first, Chris Sep 24; shipped in 0.2.0, build 122, Sep 25, with YUI-86 agents fill the drawer and YUI-75 screens update in place): the top-left menu becomes each agent's home. Your agents in a drop-up at the bottom left that springs open, and the rest of the menu about the agent you are talking to: pinned screens, things waiting for you, a page about it.
- YUI-70 (step 1 shipped Sep 26: the [spec](/developers/controls) and the [mock](/playground?demo=controls); step 2 shipped Sep 26 in build 148: native in the drawer, live on the relay and the Hermes plugin; Chris Sep 25): agent controls in that drawer. Basic create, read, update and delete for what the agent is made of: its personality file, its memory, its skills, its schedules. Changes go straight to the agent's host with no chat turn in between, secrets never leave the host, and deletes ask first.
- WAR-1, the war room, built out (Chris Sep 25: "to the fullest extent"): YUI-65 the timeline, YUI-73 the other panels (needs you, running now, builds, feedback, the MVP bar, quick links), YUI-66 drag to reorder. All three shipped in build 74 (Sep 25).
- YUI-68 (Chris Sep 25, shipped in build 74): reply to a message, and the gestures around it. Hold a bubble or a card for reactions, Copy, Select text and Reply. Swipe a bubble left to reply. Drag the background beside a bubble to switch screens. The agent gets the quote with your answer, and tapping the quote on your reply scrolls back to the original. Copying any part of a message (Select text) shipped the same day from his TestFlight feedback.
- SITE-29 (site, Chris Sep 25, shipped Sep 25): the Build to earn proposal on /earn. Our position (ownership here is earned by work, never sold) and numbered open questions for a crypto lawyer. Page only; no token work.
- SITE-30 (shipped Sep 25): [Thoughts](/thoughts), Yui's blog, written by Yui. Release, Why and Call posts built from screenshots, clips, live Yui screens and before/after compares, never more than a few paragraphs between pictures. First posts: the build 64 release, why presets and not generated code, and a call to agents that want to earn by sending pull requests. RSS, share previews, and the weekly update drafts one. /notes moved here.
- SITE-33 (shipped Sep 25, TestFlight feedback, Chris: "the beginnings of our core values"): [Yui's values](/developers/values). Eight rules every agent, card brief and page is held to: screens not text bombs, one idea per page, type tells the story, full screen is the whole stage, draw it rather than describe it, say what is being done, nothing cut off mid-sentence, every button does something.
- SITE-34 (shipped Sep 25): the site reads like the app. One type scale for every page, the one the app uses.
- SITE-35 (shipped Sep 25): [See it](/mockups#release-020) catches up. A Yui 0.2.0 group with the drawer (YUI-54), the menu word (YUI-86), ids that last (YUI-75), native sketches (YUI-84) and the Update chip (YUI-87), live screens where the web draws them. It reads In the iPhone app since build 122 went VALID (SITE-36).
- PERF-1 (Chris Sep 25 night: "very efficient like Telegram"; shipped in 0.3.0, build 138, Sep 26): YUI-101 taps answer at once, smooth scroll and a fast thread open, YUI-99 typing keeps up, YUI-102 speed numbers from real phones. [See it](/mockups#release-030).

Then:

- YUI-61 (second, shipped in build 82): slash commands. Type / to see what your agent already understands (Hermes commands first); later, Yui's own /commands that run a skill or a flow.
- YUI-44 step 1 (third, shipped in build 82): @mention another agent from the composer and its reply lands in the thread in its own look. Group threads come after.
- YUI-80 (shipped Sep 25, in build 91; TestFlight feedback Sep 25, Chris: "the whole app shrinks and has a border... I can't undo it"): the chat never gets stuck stepped back. The shrink is the full-screen stage stepping the chat back; it will only happen while a stage is really on screen, and a tap on the chat always brings it back. Lands before YUI-54 reworks that top-left button.
- YUI-79 (shipped Sep 25, app part in build 91; TestFlight feedback, Chris: "the whole reason of this app is I don't want these text bombs"): no text bombs. Board reports and long agent answers arrive as one line and a card, with the detail as pages you swipe through. The channel guide caps chat text, and the app folds any long message into pages instead of a wall.
- YUI-82 (shipped in 0.2.0, build 122, Sep 25; TestFlight feedback on build 96, Chris: "we're telling a story visually with the letters"): full-screen pages tell a story. No card inside full screen, one idea per page, the headline set big and sized to its words, words that spring on and off with the page, titles that never stop mid-sentence. Drawn pictures on those pages are YUI-83 (web) then YUI-84 (app).
- YUI-104 (shipped in 0.3.0, build 138, Sep 26; Chris: "simple SVG style vector graphics"): shapes that move. `shapes` and `shape` lines draw circles, boxes, pills, dots, blobs, labels, lines, arrows and curves that come on in order (draw, grow, glide, pulse), with a caption, in the chat. A row by default with arrows that find their ends; colors from the agent's look; Reduce Motion shows the still. Spec, four parsers, playground, channel guide v22 and the native view are done; older phones get the diagram as words.
- YUI-78 (shipped Sep 25, in build 96; TestFlight feedback Sep 25, Chris: "the copy button and the emojis are competing"): the hold menu fits on any message. Reactions always above, the message, the menu always below, never on top of each other; a tall message lifts as a faded preview of its top. Shipped with YUI-76 (agent bubbles draw bold, code and lists instead of raw ** marks).
- YUI-14 (on main Sep 26, rides the next release; Chris: "human voice in, text out, fast and smooth"): tap the mic for hands-free. Words show as you speak (SpeechAnalyzer, on the phone), a short pause sends, the answer comes back as text and the mic reopens. Each agent starts with typing or talking. Audio never leaves the phone.
- YUI-62 (shipped in 0.2.0, build 122, Sep 25): chat with a screen. Screens stay full screen with no composer, unless the agent keeps one on a page with `>2 talk`; what you type there reaches it as `[yui] screen=2` then your words, and shows in the chat marked "From screen 2".
- YUI-63 step 1 (shipped in build 82): one working row instead of three dots plus a timer, a working word and the seconds ("Pondering · 12s"). Step 2, later: the agent sends a few words on what it is doing, with a small progress bar when it knows the steps.
- YUI-64 (shipped in build 82): an agent that is paired but not listening says so. Presence is per agent now, not per computer: each gateway names the profile it serves. Right after pairing, the agent's sheet shows the one step left with the exact `hermes -p <profile> gateway restart`; a message to it says it waits, with no timer, and is answered once the gateway starts. From Chris's feedback on build 61.
- YUI-69 (step 1 shipped Sep 26: the [spec](/developers/talk-about) and the [mock](/playground?demo=talk-about); step 2 shipped Sep 26 in build 148: native in Controls and the chat, the Hermes plugin proposes and applies; Chris Sep 25): talk about a setting. Bring a piece of the agent (its personality, a memory, a skill, a schedule) into the chat, the agent proposes the change as a before and after, one tap applies it through the same Controls path.
- YUI-92 (shipped in 0.2.0, build 122, Sep 25; Chris Sep 25, from Settings on build 96: "so I can know what version I'm looking at at any given time"): the bottom of Settings says exactly which Yui is on the phone. Version and build, channel (TestFlight, Dev link build from YUI-91, App Store), commit and build date, channel guide version, tap to copy for feedback. Pairs with YUI-91, so a Dev copy and the TestFlight copy never get mixed up. YUI-91, the Yui Dev copy that installs beside TestFlight Yui, is built and waits on one install on Chris's phone, paused with the test builds.
- INT-19 onward: more agent frameworks. The Yui MCP server shipped Sep 25 (INT-3), with OAuth (INT-19). Claude (INT-7) and ChatGPT (INT-8) are built, screens in the chat included, and each waits on one look in its own app (see Adapters below).
- The phase backlog below, from YUI-33 on.

## Epics

Work ships in epics: a set of cards that together make one release worth trying. Cards land as they finish; the app goes to TestFlight once per epic, with a list of what to try. Crashes and blockers ship on their own.

**Done: GTM-1, grassroots go-to-market (complete Sep 24).** While the next build waited on Apple, the site and the story came first. Investor material is out for now; nothing gets posted without Chris.

- SITE-19 (shipped): shareable moments. Every screen on See it, every playground sample and every clip has its own link at /s/, with a preview card that shows the lines and the screen they draw; a Share button in the playground; an embed that shows a live Yui Lines screen; a "Made with Yui Lines" badge. How to use them: [/developers#share](/developers#share).
- SITE-20 (shipped): the go-to-market plan, in public: who it is for, the social plan per channel, the first 30 days. Read it: [go-to-market plan](https://www.yuigui.com/business/gtm).
- OSS-5 (shipped): a grassroots kit for Yui Lines: who builds with it, how to contribute, a first "draw your best screen in three lines" challenge. Live at [/developers/community](/developers/community).
- SOC-3 (shipped): three short videos: Yui in 15 seconds, Yui Lines in 30, your own Hermes on your phone in 60. Watch them on [See it](/mockups).
- SITE-24 (shipped): Yui@home, the story. Like SETI@home, but you lend idle AI tokens: the post [Donate your idle tokens to Yui](/thoughts/donate-your-idle-tokens-to-yui), a [Contribute with your agent](/contribute) page with a feature spec template, a "Lend your agent" option at the bottom of every page, and an [llms.txt](/llms.txt) so assistants that read the site can pass the invitation on.
- BIZ-7 (parked): one brand system from the website to social to print.

**Now: INV-1, invite-only beta and client onboarding.** A request-an-invite form (name, Apple ID email, phone) replaced the waitlist. Chris approves each invite from Yui, Apple sends the TestFlight email, and the new account opens with the agents picked for it. Built for inviting clients fast; download-and-go stays the long-term path.

- YUI-56 (built, in build 61): invites end to end, from request to first sign-in. It waits on one live test with Apple's TestFlight email before it counts as done.
- YUI-57: default agents per invite, client-safe agents only. Step 1, the spec and a playground mock, shipped Sep 25 ([Shared agents](/developers/agents): templates an invite carries, grants a client holds, revoke, and the client-safe rule a shared agent must pass). Step 2, YUI-95, shipped Sep 25: grants and templates in the database, `grant.py` (refuses any agent that is not client-safe), the host's sandbox check before every turn for someone who is not the owner, and a first sign-in on the simulator (the invitee finds the agent in its look with its first message; a revoke removes it). Next in the app: the owner's invite plan and the client's "Shared by" settings.
- SITE-26 (shipped Sep 24): Request an invite replaced the waitlist on the site.

**Done: WAR-1, the war room (shipped in build 74, Sep 25).** Screen 2 becomes a real dashboard for running Yui from Yui: a timeline of what shipped and what is queued, quick links to the site, and a reorder mode that sets board priority by dragging, with no agent turn in between (Chris, Sep 25).

- YUI-65 (shipped Sep 25): a timeline preset: done above, now, queued below. In build 74.
- YUI-66 (shipped Sep 25): reorder mode, drag to set priority on the board, with no agent turn. In build 74.
- YUI-73 (shipped Sep 25): the rest of the war room. Needs you (cards waiting on Chris; a card with choices gets one-tap answers that land on the card and send it back to the queue, with no agent turn), running now (one row per lane), builds with the Install button, the latest feedback and the card it became, the MVP bar, quick links. Built from presets the app already draws. In build 74.
- YUI-90 (step 1 shipped Sep 25; Chris Sep 25: "a totally dynamic, live update of the harness... really good real estate in the war room"): the release timeline goes live. Step 1 is on the site: the [Release timeline](/developers/release) page, a `release` block in the board export (the YUI-SHIP card and its parent cards), and the panel drawn from the board's own exports at `/playground?demo=release`, linked from [Builds](/changelog): cards done, now and next, the ship steps (tests, upload, VALID, what to try), and what is on main since the last build. Step 2 is YUI-105 (backlog): the panel at the top of the war room on the phone, patched in place as cards move (YUI-75 ids), with no agent turn. Needs build 74+, patches build 111+.
- YUI-112 (shipped Sep 26 in build 148; seen Sep 26 on the simulator): a timeline opened alone on the full-screen stage, from the shelf, spreads its rows over the whole height, with big gaps and a running row's highlight about 400 pt tall. Now rows keep their own height and the timeline sits at the top.

**Done: PERF-1, Telegram-smooth (Chris Sep 25; shipped in 0.3.0, build 138, Sep 26).** "Optimize for pure user experience... very efficient like Telegram." The design stays as it is; the app gets fast. Measure first, so every fix has a before and after, and Yui watches the numbers from then on.

- YUI-98: speed reporting. Step 1 shipped Sep 25: the speed budget ([Speed budget](/developers/perf)), seven named intervals with p50 and p95 targets, hang, hitch and memory budgets, what the phone sends (numbers only) and the proposed `yui_perf` table, the daily report and the rule for the briefing line, and the war room Speed panel in the playground (`/playground?demo=speed`). Step 2 (YUI-102, shipped in 0.3.0, build 138) built Sep 25, app main 9385fc2: signposts and a frame clock on the nine intervals, MetricKit metrics and diagnostics, memory every 30 s, one batch an hour and on background, the `yui_perf` table on PROOF (numbers only, owner only, 500 a day, 90 days), `yui_perf_report.py` and the Speed panel under Builds in the war room, and the briefing line only when a number got worse. Dev builds get a Speed switch. As built: PERF.md section 10. First real numbers Sep 26, from Chris's phone on TestFlight 135 (before YUI-99 and YUI-101): typing p95 70 ms on 52 keystrokes (budget 33), memory peak 328 MB (budget 300); 0.3.0 (138) is the first build to compare against. The same rows showed one batch sent twice across a relaunch: the report drops repeats, YUI-107 fixes the phone.
- YUI-99 (shipped in 0.3.0, build 138): typing keeps up. Holding backspace and double-space for a period run as fast as in Notes, even on a long thread.
- YUI-100 (on main Sep 26, rides the next release): memory audit. On a scripted simulator session (5 agents, 486-row threads, decks, galleries, games, screens 2-12, idle) the inline deck pager leaked about 1,550 objects; it pages with a ScrollView now and the session ends with 0 new leaks. Pictures decode at display size into one 48 MB cache emptied on a memory warning, videos drop their player, the thread window trims back at the bottom. Peak 243 to 203 MB, launch 137 to 124 MB. `scripts/memory.sh` runs before every ship and fails on over 100 new leaks, 15 MB growth or a 300 MB peak.
- YUI-101 (shipped in 0.3.0, build 138): taps answer on the same frame, 120 fps scroll, fast thread open. On the simulator a long thread opens in about 0.3 s instead of 3, taps answer in under 100 ms, and scroll hitches fell from 63 to 2 ms a second.
- YUI-107 (backlog, after YUI-102): speed rows send once. A row key and a unique index, so a batch resent after iOS suspends the app is stored once.

**Distant: EARN-1, build to earn.** Yui is built by whoever shows up, human or agent, and the work is what earns. No token sale: the only way in is brain power or compute that lands in Yui, a merged PR or TestFlight feedback that ships, rewarded by one mechanism. 10% of voting equity is set aside for the public pool, with more to follow. Humans first, and an open call to autonomous agents. Stories get sprinkled in; nothing mints or sells until counsel and Chris sign off (BIZ-10). Builds on Yui@home (SITE-24).

Chris, Sep 25: only the proposal moves for now. A crypto lawyer will review /earn; the token, chain, NFT and ledger cards stay frozen until then.

- SITE-27 (shipped Sep 24): Build to earn, a V1 page on the site, marked draft.
- SITE-29 (shipped Sep 25): the proposal. Our position, the forms it could take (points plus equity, stock options or units for contributions, a community round kept separate), and open questions for counsel.
- BIZ-8 (backlog): tokenomics v1: supply, emissions, how value holds.
- BIZ-9 (backlog): the chain. Chris picked Sui on Sep 24; Polygon is the fallback.
- BIZ-10 (backlog): legal review, token and equity.
- BIZ-11 (backlog): contributor NFTs with real perks (First Contributor, Hat Trick).
- OSS-7 (backlog): a public contribution ledger, points first, tokens later.
- SITE-28 (backlog): "How can I help?" around the site, and an open call to agents.
- BIZ-12 (backlog): build to earn in the go-to-market plan and the pitch.

**Latest release: Yui 0.3.0, build 138, Sep 26: the smooth release.** Taps answer at once, a long thread scrolls smooth and opens in about a third of a second (YUI-101), typing keeps up like Notes (YUI-99), and Yui times itself on real phones (YUI-102). Agents draw shapes that move (YUI-104), you can restyle Yui by asking any agent (YUI-96), an agent can be shared with a client and taken back (YUI-95, YUI-97), and group threads work in the database and the plugin (YUI-93). Two deck fixes from TestFlight feedback: an inline deck is as tall as its page, and a full-screen page never comes up blank. See it: [Yui 0.3.0](/mockups#release-030).

Before it, **Yui 0.2.0, build 122, Sep 25: every agent gets a home.** Each agent has a drawer (YUI-54) that agents fill with asks, a backlog and shortcuts (YUI-86), screens update where they sit (YUI-75), full-screen pages tell a story (YUI-82), the app draws sketches (YUI-84), you can type on a screen (YUI-62), Needs you is one block, lines a build can't draw fold into one Update chip (YUI-87), and Settings says which Yui you have (YUI-92, with the Yui Dev copy from YUI-91). Build 96 (Sep 25) fit the hold menu to any message (YUI-78) and drew agent markdown (YUI-76). Build 91 (Sep 25) brought no text bombs, long answers fold to pages (YUI-79), the chat never gets stuck shrunk (YUI-80) and the thread rests on a photo you just sent (YUI-74). Build 82 (Sep 25) brought slash commands (YUI-61), @mentions of your other agents (YUI-44 step 1), one working row (YUI-63), agents that say when they are not listening yet (YUI-64) and the approval sheet for Claude and ChatGPT (INT-19). Build 74 (Sep 25) brought the war room (WAR-1), replies, select text and links that open Safari. Build 57 (Sep 24) was the big one, chat feels right: the lock screen timer (YUI-30), screens per agent (YUI-31), named screens on a shelf (YUI-32), the preset flywheel (YUI-42), message reactions (YUI-49), a way back to the newest message (YUI-50), one full-screen flow for pages and questions (YUI-51), no dead buttons (YUI-53), and every Sep 24 feedback fix checked again (YUI-52). Build 61 fixed a crash in hold to talk and brought invites (YUI-56) and test builds by link (YUI-55). Build 64 made hold to talk work like WhatsApp and gave screens 2 to 12 the whole phone.

**Build 148, Sep 26** added YUI-106 (send and the drawer taps answer faster), YUI-70 (agent controls in the drawer), YUI-69 (talk about a setting), YUI-111 (a patch moves a timeline row in place) and YUI-112 (a timeline alone on the stage keeps its row heights) to 0.3.0. [Builds](/changelog) lists it. Releases ship as versions, one upload per epic, and Chris picks each one's scope.

## North star: not just another AI chatbot

Chris, Sep 24: "I want these to be truly unique experiences." Every decision gets checked against this. Chat is the doorway, not the product. Three commitments follow:

1. **Immersive by default when it matters.** The agent's UI can take over the whole screen, not just sit as a bubble in chat. The agent decides when a full-screen view is worth it; workouts always go full screen. The user can always leave with a swipe down or an X, and the chat is right underneath. Shipped 2026-09-24 as Yui Lines `>full` (route the following lines to a full-screen stage) and `close`, plus a per-preset default (timer, camera, mic and deck open full screen, `+inline` keeps them small) and the agent's `screen=` style. Card YUI-13.
2. **Voice in, text out, fast.** Talk naturally, read the answer. On-device speech (iOS 26 SpeechAnalyzer) streams words as you speak, a hands-free mode keeps the mic open between turns, and the first word of the reply lands in well under a second of you finishing. Card YUI-14.
3. **Answers are never locked.** Change your mind on any choice and the agent adapts (YUI-12, shipped Sep 24). An agent can lock something on purpose, like a confirmed booking.

In-chat screens stay: they are right for quick asks. Full screen is for the moments that deserve it.

## The core bet: presets and settings, not generated UI code

Chris, Sep 23: optimize for speed. The UI should work like settings. The agent picks a preset and fills in a few parameters. It never writes HTML, and even JSON is too heavy.

- **Presets carry the weight.** The app ships prebuilt presets: `timer`, `ask`, `choose`, `pick`, `slide`, `form`, `list`, `table`, `card`, `image`, `camera`, `mic`, `chart`. Each already has its layout, animation, big tap targets, and one primary call to action. Target: presets alone deliver 80% of the value at launch.
- **Yui Lines (YL) is the wire format.** One line per component: preset name plus terse positional args, defaults for everything else. No braces, no quoted keys. The app renders each line the moment it arrives.
  ```
  timer 40/20x8 Tabata                  # 40s work, 20s rest, 8 rounds
  ask "Log this set?"                   # yes/no by default
  choose "Split?" Push|Pull|Legs +other # single choice + type your own
  pick "Gear" DB|Bench|Bands            # multi-select
  slide "AI experience" 1-5
  form name:text goal:voice level:1-5
  list Today "Squat 5x5 225" "Bench 5x5 185"
  table meals                           # bound to an agent data table
  >2 timer 60                           # send to screen 2
  ~timer rounds=10                      # patch a live component, no re-send
  save workout / show workout           # named screens, reopened in two tokens
  ```
  Measured Sep 23 (o200k tokenizer): the Tabata timer is 9 tokens in YL, 25 as minified JSON, 75 as a component tree. Across ten screens YL is 1.6x smaller than lean JSON and 3.9x smaller than a tree. Details in `spec/BENCHMARK.md`.
- **The channel guide is the cheatsheet.** Every agent on the Yui channel gets a short guide (`spec/CHANNEL.md`, YUI-10) listing the presets and their args, so it carries the whole vocabulary for a few hundred tokens. An eval scores every change to it.
- **Escape hatch, then promotion.** `custom {json}` covers the long tail. Every custom use is logged. Patterns that repeat get promoted to presets. That is the flywheel that grows the 80% toward 95%.

Why this over generated code:

1. App Store. Apps that download and run new executable code get rejected (guideline 2.5.2). Rendering data against a fixed native preset set is the pattern Apple accepts.
2. Speed. No codegen, no build. A screen costs one short line of output and renders instantly.
3. Quality. UX rules live in the presets, not in every prompt, so an agent cannot produce a bad layout.
4. Portability. The same line renders in the app, on the web tracker, and degrades to Telegram buttons (`ask` and `choose` map straight to inline keyboards).

## Stack: native SwiftUI on iPhone (decided Sep 23 2026)

Chris decided: all Swift. Draft 1 recommended Expo/React Native with Swift modules; draft 2 reverses that. Why:

- **The product is native feel.** Yui should behave like part of the phone: Apple's navigation, sheets, haptics, Dynamic Type, accessibility and the iOS 26 Liquid Glass look come free in SwiftUI and are imitations anywhere else.
- **The differentiators are Apple surfaces.** Live Activities and the Dynamic Island (a timer on the lock screen), widgets, App Intents (Siri, Shortcuts, Spotlight, Action button), the on-device Foundation Models framework, and on-device speech. In React Native every one of these is Swift glue anyway.
- **The preset design makes native cheap.** The app is a Yui Lines parser, roughly 13 presets, a chat view and a relay client. New screens arrive as data, so React Native's over-the-air updates buy little, and an Android port later is a port of the presets, not a redesign.

Rules that follow from the decision:

- **iPhone only for now. No Apple Watch app yet** (Chris, Sep 23). Parked until after the MVP (YUI-47).
- **Yui Lines stays platform-neutral.** `spec/YL.md` plus a shared conformance suite (input lines, expected parse) is the contract. The JS parser (web playground) and the Swift parser must both pass it. An Android build later (Kotlin + Jetpack Compose) passes the same suite.
- **The web stays React.** The hub site and playground keep the JS renderer as the public, clickable reference.
- **Fast feedback loop.** The Mac mini builds and ships TestFlight builds with no cable, running since Sep 23. Since Sep 24 TestFlight gets one build per epic (Apple caps uploads per day), and test builds by link (YUI-55) put the newest main on Chris's phone in between.
- **Target iOS 26.** It is the current release, it has Foundation Models and Liquid Glass, and a new app has no install base to protect.

## Architecture in one paragraph

Agents stay where they live: Hermes on the owner's own Mac or Linux box. The Hermes `yui` plugin dials out to the **Yui relay**, which today is Supabase Realtime plus a few Supabase edge functions (YUI-6, YUI-7), so the agent's machine opens no ports. The agent sends chat messages and Yui Lines to the relay; the relay hands them to the phone live when the app is open and sends an APNs push when it is closed (YUI-24). The phone sends taps, picks and form results back as events. Messages wait in the relay when either side is offline, so nothing is lost when the Mac sleeps or the app is killed (YUI-28), and they are deleted after 90 days (YUI-26). Pictures and videos go through a private storage bucket (YUI-21). "Pull this up on Yui" from Telegram is one tool call (YUI-8). A multi-tenant relay for zero-install connections, possibly on Cloudflare's Agents SDK, is future work (INT-5, INT-6). On-device data tables are Phase 3 (YUI-33).

## Phases

Updated Sep 24 2026 (SITE-10). The first plan assumed work would start the week of Sep 28 and run in monthly phases to June 2027. Work started Sep 23 instead. By Sep 24, Phases 0 and 1 had shipped, and so had half of Phase 2. The MVP above cut across the phases: it pulled push, first run, safety limits and beta review prep forward, and left the rest for later.

Dates below are real ship dates from the board and the git log. A phase that has not shipped carries no date. The old month targets no longer mean anything, and new ones are Chris's call. Each phase still ends with something Chris can touch.

### Phase 0 | shipped Sep 23 2026: foundations and the tracker site

Goals: a place to watch the project, and the protocol written down before any app code.

Deliverables:
- DONE Sep 23: hub site (roadmap, progress log, business plan draft, deck outline, mockups), source on GitHub at postscarcityai/yuigui.
- DONE Sep 23: Yui Lines v0 (spec, 12 presets, JS parser, web playground, token benchmark). Replaces the JSON protocol from draft 1.
- DONE Sep 23: yuigui.com live, built in public (progress log per ship, weekly update Fridays).
- DONE Sep 23: waitlist on yuigui.com (replaced by Request an invite on Sep 24, SITE-26), stored in `yui_waitlist` in the existing PostScarcity AI Supabase project (PROOF). All Yui tables use the `yui_` prefix there; no new Supabase instance.
- DONE Sep 23: Apple Developer account (Chris, individual enrollment, no D-U-N-S).
- DONE Sep 23: the Yui Lines conformance suite, and the Swift parser that passes it (YUI-3). Events back to the agent (tap, submit) are in the spec from day one; voice events wait for YUI-14.
- DONE Sep 23: Xcode on the Mac mini and a TestFlight pipeline on the App Store Connect API. The first build went out the same day.
- DONE Sep 23: web mockups of the canonical screens at /mockups. Replaced Sep 24 by See it (SITE-14): every shipped screen, drawn live from Yui Lines or recorded in the app, each tied to its card and ship date.
- DONE Sep 24: theme schema, as per-agent themes and theme lines (YUI-20).
- MOVED: the Telegram quick win (inline buttons on Hermes questions) became INT-4. Step 1 (renderer and Mini App) done Sep 25, `spec/TELEGRAM.md`.

### Phase 1 | shipped Sep 24 2026: talk to your own Hermes agents in Yui

Goals: Chris talks to each of his Hermes agents in the app, gets GUI answers back, and can hand a Telegram conversation over to Yui with one push.

How it plugs in: **Yui is a Hermes messaging platform**, built as a Hermes platform plugin, the same way Telegram is. Each agent keeps one brain and one memory across Telegram and Yui. Each Hermes profile shows up in the app as its own agent with its own thread. The plugin dials out to the relay (Supabase Realtime today), so the Mac needs no open ports.

Deliverables, in build order:
- DONE Sep 23: SwiftUI app on TestFlight, Korean-cute theme with light/dark (YUI-2), typographic identity with coral wordmark and letter avatars (YUI-9), coral wordmark icon. Yui Lines Swift parser passing the shared conformance suite (YUI-3).
- DONE Sep 23, YUI-4: first 6 presets in chat (ask, choose, pick, form, list, timer).
- DONE Sep 23, YUI-6: accounts. Sign in with Apple, and in-app account deletion as App Store rule 5.1.1(v) requires, including Apple token revocation. Yui users are kept fully separate from any other PostScarcity data.
- DONE Sep 23, YUI-5: coral wordmark across the UI.
- DONE Sep 24, YUI-7: the Hermes `yui` platform plugin. Pairing by code, one thread per agent, agents taught Yui Lines so they answer with screens, taps flow back as messages.
- DONE Sep 24, YUI-8: push handoff. From Telegram, "send it to Yui" drops the screen into that agent's thread and sends a push that opens it.

Dependencies: an Apple key with Push Notifications and Sign in with Apple. Done: both are live in the app.

### Phase 2 | partly shipped Sep 24 2026: many agents, identities, cross-channel

Goals: Yui is a hub, not an Arnold app.

Deliverables:
- DONE Sep 23, YUI-15: an agent list you manage yourself: add, rename, remove.
- OPEN: Urza, Arnold and R0SS all connected in Chris's app. Not tracked on a card, so not confirmed here.
- DONE Sep 24, YUI-20: per-agent theme and avatar, light and dark. Per-agent voice is not built; it comes with YUI-14.
- DONE Sep 24, YUI-24: push notifications when an agent answers, with presence and per-agent mute. YUI-8 pushes open the handed-off screen.
- DONE Sep 24, YUI-8: cross-channel handoff. From Telegram, "pull this up on Yui" pushes the screen to the phone.
- DONE Sep 24, YUI-13: the full-screen stage with swipe-down or X to exit, and workouts always full screen.
- DONE Sep 24 (build 57), YUI-31: screens per agent. The chat, then screens a swipe away; agents send things that should stay put there (`>2 timer 25m Focus`), and the page slides forward with a spring, or cross-fades with Reduce Motion. Build 64 (Sep 25) takes it to screens 2 to 12, each with the whole phone.
- DONE Sep 26, YUI-14 (on main, rides the next release): voice input on Apple's on-device SpeechAnalyzer (classic recognizer as an on-device-only fallback), per-agent default of talk vs type, hands-free voice in with text out. Final words ~90 ms after you stop talking; replies fetched every 350 ms while one is owed. Hold to talk still works (builds 57 and 64). Later: the agent's reply streaming token by token (today it lands whole).
- DONE Sep 24 (build 57), YUI-30: Live Activity for the timer preset: rounds keep counting on the lock screen and Dynamic Island.

### Phase 3 | started Sep 25 2026: data and keys

Goals: agents can make things that persist.

Deliverables:
- YUI-33: on-device tables: agents create tables and rows through the protocol (`table create`, `put`, `query`). Views render as table, list, chart or one number. Starter schemas: workout log, macros, simple CRM. Step 1, the spec and the web playground, shipped Sep 25 ([Agent tables](/developers/tables)); the app's store and views are YUI-89.
- YUI-34: key vault in the iOS Keychain for BYO keys: fal, Replicate, OpenRouter, Anthropic.
- Image generation through the user's own fal key (agent avatars first, then in-chat images). YUI-21 (Sep 24) already lets agents send images they made elsewhere.
- YUI-35: nutrition demo: photo of a meal to macro estimate to a row in the macros table. Step 1, the spec and a playground demo, shipped Sep 25 ([Meal photo to macros](/developers/meal), `/playground?demo=meal`); the app is YUI-103, after YUI-89.
- YUI-36: optional encrypted sync of tables via the relay (off by default, on-device first per Chris).

Dependencies: a decision on whether sync is needed at all for v1.

### Phase 4 | not started: onboarding and a built-in agent

Goals: someone with no agent can download Yui and start.

Deliverables:
- YUI-37: hosted default agent (runs on the relay, model via OpenRouter on the user's key at first). Step 1, the spec with a cost model and a playground mock, shipped Sep 26 ([Starter agent](/developers/starter), `/playground?demo=starter`): it runs on the hosted connector beside the relay, the person's own OpenRouter account first, no tools with side effects, about $0.0013 to $0.0096 a turn. Step 2, the hosted build, is parked: it needs a Cloudflare account and spend, and Chris signs off first.
- YUI-38: generative onboarding interview: name form, AI-knowledge slider, "what do you want to do" with a mic button, then starter agents suggested (trainer, nutritionist, personal assistant). Step 1, the spec and a saved flow that runs in the playground, shipped Sep 25 ([Onboarding](/developers/onboarding), `flow onboarding`). Step 2, native in the app on first launch, is parked until after 0.2.0.
- YUI-39: connector library v0: MCP servers the user logs in to via OAuth (HubSpot, Google Calendar, Gmail first). Step 1, the spec and the connect flow in the playground, shipped Sep 25 ([Connectors](/developers/connectors), `flow connect`). Step 2, real sign-in on the agent's host, is parked: it needs a Google Cloud project and a HubSpot app registered, and Chris signs off on those first.

Dependencies: the Phase 3 vault. Cost model for hosted agent calls.

### Phase 5 | started: open adapters and a beta

Goals: other agent owners can plug in.

Deliverables:
- DONE Sep 24, YUI-23: other people's Hermes installs connect with one command to install the plugin and one code to pair.
- DONE Sep 24, OSS-1: Yui is open source (Apache-2.0), Yui Lines spec included.
- DONE Sep 24, YUI-27: beta review prep: privacy answers, review notes, demo account, help link.
- DONE Sep 24, YUI-22: public TestFlight link. Anyone can install Yui: https://testflight.apple.com/join/ykrYHwet
- OPEN: the private beta of 20 to 50 technical users from the Hermes and OpenClaw communities. The public link may replace it; Chris's call.
- NOT STARTED, INT-5: zero-install connect through Hermes's relay connector contract (`hermes gateway enroll`): Yui hosts the connector, the user enrolls once, their agents appear in the app.
- DONE Sep 24, INT-2: the webhook bridge, Python and Node. Any agent that answers an HTTP POST can talk in Yui, no Hermes needed.
- DONE Sep 24, INT-1: the OpenClaw channel plugin. An OpenClaw agent talks in Yui the way a Hermes agent does, screens and taps included.
- DONE Sep 25, INT-4 step 1: Yui in Telegram. Questions as inline keyboards whose taps come back as the phone's event line, the rest in a Telegram Mini App at yuigui.com/tg (`spec/TELEGRAM.md`). A bot that runs it is next.
- DONE Sep 25, INT-12 step 1: the model bridge. Put a model you run yourself (Ollama, LM Studio, vLLM, llama.cpp) into Yui; Yui holds the thread and the guide is the system message (`spec/MODELS.md`). Cloud APIs on the hosted connector come later.
- DONE Sep 25, INT-18 step 1: the A2A bridge. Add any A2A agent (ADK, LangGraph, CrewAI, Microsoft Agent Framework) by its Agent Card URL; A2A 1.0 and 0.3 (`spec/A2A.md`). The hosted version is step 2.
- DONE Sep 25, INT-3: the Yui MCP server. Claude Code, Cursor or any MCP client puts a screen on your phone and reads the taps back (`spec/MCP.md`).
- DONE Sep 25, INT-19: OAuth for the MCP server. The Claude and ChatGPT apps add Yui by pasting one URL; you approve in the app. The approval sheet shipped in build 82.
- BUILT Sep 25, INT-7: Claude. A guide for Claude's apps, Claude Code and Agent SDK agents (`spec/MCP.md` "Claude"), and Yui screens drawn inside the chat as an MCP App, tappable there too. Checked in the MCP Apps reference host and with Claude Code on a Mac; one look inside claude.ai itself is still to come.
- BUILT Sep 25, INT-8: ChatGPT. Add Yui in ChatGPT developer mode by its URL (`spec/MCP.md` "ChatGPT"); the screen draws in the chat as the same MCP App. Checked in a ChatGPT-shaped test host, both of ChatGPT's ways of talking to an app; one look inside chatgpt.com itself is still to come. Not listed in ChatGPT's directory.
- NOT STARTED, YUI-48: SMS channel (text a number, get a push that opens the screen).

Dependencies: App Store submission sign-off from Chris.

### Phase 6 | not started: money, polish, on-device

Goals: the "put in your credit card and go" version.

Deliverables:
- YUI-45: in-app purchase credits for image generation and hosted model usage (keys stay optional for power users).
- YUI-41: on-device Foundation Models for routing and quick replies, cutting cloud cost and latency.
- YUI-40: widgets for agent dashboards, App Intents for Siri, Shortcuts and the Action button.
- Design system v1 from beta feedback.
- Decision gate: Android port (YUI-46, Kotlin + Jetpack Compose against the same Yui Lines suite), Apple Watch app (YUI-47), public launch.

Dependencies: beta learnings, payments setup (financial, needs Chris).

### Preset library | what agents can build on your screen (Chris, Sep 24)

Simple first, flexible combinations always: layout and style are props, so a handful of presets cover a lot of experiences. Each family ships in the web playground first, then natively in the app.

- **Media (YUI-16):** gallery of images and videos with layouts feed, flat row, 3D row and grid; single video; before/after compare (slider, side by side, toggle) with highlights pointing at what changed; storyboards for videos, sites and posts with reorder and per-frame notes; image edit where you mark an area and say what to change.
- **Data and science (YUI-17):** line, bar, area, scatter, pie charts, live from agent tables; big-number stats with sparklines; rendered equations; a formula tool whose sliders redraw a chart as you move them; step-by-step derivations and protocols.
- **Learn and plan (YUI-18):** presentations built on any topic you want to understand, with generated images and a quiz at the end; workflows, starting with plan mode, a guided series of screens that ends in a project (saved, branching workflows authored in Mermaid: FLOW-1, step 1 on the web); narrated walkthroughs where the agent talks you through what changed, before and after, step by step.
- **Media pipeline (YUI-21):** agents generate and send real images and videos into Yui; your photos go back to the agent.
- **Native versions (YUI-19)** of all of the above.
- **Games (YUI-59, built Sep 25; the app part shipped in build 74):** tic-tac-toe against the agent, snake and memory match, each one Yui Line (`game tictactoe`), playable on the phone, moves and scores coming back to the agent. Live in the web playground now. Later, Yui Lines that describe a whole new game instead of picking one (YUI-60, spec draft written, parked by Chris for later).
- **Drawings (YUI-83, web and spec shipped Sep 25; YUI-84, the app draws them, shipped in 0.2.0, build 122, Sep 25; TestFlight feedback, Chris: "draw a little window that has certain things crossed out and other things highlighted"):** `sketch` draws a small window, phone or chat bubble with rows struck out, highlighted or called out with an arrow, and an optional before and after, so an agent shows a change instead of describing it. No image to generate, no screenshot. Live in the web playground, the MCP App and the app. A sketch right after a page is that page's picture on a full-screen story page, its rows coming on one by one.
- **Shapes that move (YUI-104, shipped in 0.3.0, build 138, Sep 26; Chris: "simple SVG style vector graphics... to show some complex ideas very quickly"):** `shapes` draws a small diagram in the chat, circles, boxes, blobs, labels and arrows that come on in order with a caption, so an agent explains how something works without generating a picture. Live in the web playground and in the app since Yui 0.3.0.

### Every agent looks like itself (YUI-20)

Chris, Sep 24: in most agent tools every agent sits in the same interface and the only tell is a tiny ID in a corner. In Yui each agent has its own color scheme, with light and dark, its own feel, and its preferred kinds of screens. Open Arnold and the whole app is Arnold's. Ask an agent to change its look and it restyles itself.

### Look and feel | friendly by default, restyled by agents later

Chris, Sep 23: friendlier, a South Korean aesthetic, happy-cat energy, a little fun by default, light and dark mode. v1 (card YUI-2): soft pastels, rounded type, gentle spring motion, warm microcopy. The identity is typographic only (card YUI-9): the coral bunny-ear wordmark already reads as an abstract cat, so there is no mascot. Yui's avatar is the wordmark's Y; each agent gets its initial on a pastel chip.

**Generative app styling (future).** All styling lives in one token set (colors, radii, type, motion, agent avatar colors) stored as plain data, not code. That makes the app itself restylable at runtime: an agent sends a `theme` line in Yui Lines (for example `theme peach round`) or a full token set, and the whole app re-skins, within guardrails that keep contrast readable and tap targets big. Per-agent themes (Arnold in Arnold's colors) are the first use, shipped Sep 24 (YUI-20). A user asking "make Yui feel like autumn" is the second (YUI-43): step 1, the spec, the `theme app` line and a playground mock, shipped Sep 25 ([Restyle Yui](/developers/restyle)); step 2 is YUI-96, the native app.

### Parallel track | Telegram fallback (any time)

If Apple rejects the app or it stalls, Telegram already supports most of what the pitch needs: inline keyboards with callback buttons, reply keyboards, and **Telegram Mini Apps** (full web apps inside Telegram, with theme colors, haptics, and cloud storage). The same Yui Lines can render as a Mini App using the web renderer. This is the insurance policy, card INT-4. Step 1 shipped Sep 25: `adapters/telegram` in the app repo turns a reply into Telegram messages (questions as inline keyboards whose taps come back as the phone's event line, the rest behind an Open in Yui button), and yuigui.com/tg is the Mini App, in the chat's own theme colors (`spec/TELEGRAM.md`). A bot that runs it is step 2 and needs its own Telegram bot token.

## Adapters | every agent framework, Hermes first (INT-0)

Chris, Sep 24: Yui should work with any agent, not just ours. The full plan is `spec/ADAPTERS.md`. It all waits until the MVP passes.

There are only five ways in, so five pieces of code cover every framework:

- **A plugin inside the agent's own app.** Hermes today. OpenClaw and Flue next.
- **A hosted connector** that speaks a standard protocol: Hermes's relay contract, and A2A, which Gemini, LangGraph, CrewAI and Microsoft's Agent Framework all speak. The A2A part shipped Sep 25 as a bridge you run yourself (INT-18): add any A2A agent by its card URL, `spec/A2A.md`. The hosted version comes next.
- **A model connector.** Point Yui at any OpenAI-compatible API: Meta's Muse Spark, Grok, Gemini, or a model on your own machine through Ollama, LM Studio or vLLM. The local part shipped Sep 25 (INT-12): a bridge next to your model server, `spec/MODELS.md`. Cloud APIs come with the hosted connector.
- **A Yui MCP server.** Claude, ChatGPT, Grok and n8n add it as a tool and push screens to your phone. Shipped Sep 25 (INT-3) for clients that take a header, like Claude Code and Cursor: `spec/MCP.md`.
- **A webhook.** If your code can answer an HTTP request, it can talk in Yui. Shipped Sep 24 (INT-2): the webhook bridge, `spec/WEBHOOK.md`.

Every one of them ends in the same messages and the same screens, and every agent gets the same channel guide, so it knows it can draw.

Order: Hermes, OpenClaw and the webhook (done), then the MCP server, then Claude, ChatGPT, open models, Flue and A2A, then the rest. Each framework is a card on the board, INT-1 to INT-18.

## Cloudflare

Chris mentioned a new Cloudflare agent he thought was called "Flue". Checked Sep 24: Flue is real, an open-source TypeScript agent framework from the team behind Astro, launched with Cloudflare in June 2026. It runs agents as Durable Objects on Cloudflare's Agents SDK and has channels for Slack, Discord and others, so a Yui channel fits (INT-13). Decided Sep 25 (INT-6, [the hosting memo](/developers/hosting)): Yui's hosted connector for paths B and C runs on Cloudflare Workers and Durable Objects through the Agents SDK, beside the Supabase relay, not replacing it. The relay, its limits and its kill switch stay in Postgres. Nothing is set up yet: a Cloudflare account is Chris's call when INT-12 or INT-18 reach their hosted step. His point about Cloudflare gating the agentic web (bot blocking) is relevant to connectors that scrape; Yui should prefer official APIs and MCP.

## What stays out of scope for now

- A realistic human avatar you talk to (Chris: "I don't think we're going to do that right now").
- White label.
- Our own payment processing before Phase 6.
- Running the Claude CLI on the phone. Mobile goes through APIs (OpenRouter or Anthropic keys).

## Risks

1. App Store review. The app only renders a fixed set of native presets and never runs downloaded code, which is the pattern Apple accepts (guideline 2.5.2). The open question is different: Yui needs an agent the user runs elsewhere, and a reviewer has none. The review notes say so, and a demo code opens an account with a scripted demo agent (YUI-27). If Apple still says no, the Telegram Mini App fallback (INT-4) and a built-in starter agent (YUI-37) are the ways around it.
2. Bad screens. Agents will get lines wrong. Mitigated by a small preset set, one parser spec with a shared conformance suite on web and Swift (YUI-3), a parser that forgives the slips agents make most, and a channel guide scored by an eval (YUI-10).
3. A shared backend open to strangers. Anyone with the beta can reach the relay. Mitigated by per-account and per-computer rate limits, size caps, a kill switch and 90-day message retention (YUI-26). Strangers bring their own agent and model, so their usage costs Yui no inference.
4. Nobody outside has done the whole path yet. Every step works for us; YUI-29 is the first outside tester running it alone with a stopwatch. What they trip on is the next work.
5. Scope. Every phase is cut to one demo that works. New ideas go on the board, not into the current phase.

## Open questions for Chris

1. ANSWERED Sep 23: all Swift, iPhone first, no Watch yet, Android later.
2. ANSWERED Sep 23: yuigui.com goes live now. Built in public.
3. ANSWERED Sep 23: enrolled and paid, no D-U-N-S. Trademark search deferred until there is something to protect.
4. Should agents that do client work be in Yui at all, given client confidentiality, or is Yui for personal agents only for now?
5. Is Yui a product you intend to sell, or a personal tool that might become one? It changes how much Phase 4 to 6 matters.

## Deep backlog

Parked cards, so the build never runs dry. None of these start until the MVP lane has nothing ready. Each one is on the board with a short brief. Anything that spends money or reaches out to people still needs Chris first.

**The app**

- YUI-89: agent tables in the app, step 2 of YUI-33 (the spec and the playground shipped Sep 25): the phone's store, native views, the other parsers.
- YUI-34: a key vault for your own fal, OpenRouter and Anthropic keys.
- YUI-35: photo of a meal to a macro estimate to a row in your macros table. Step 1 shipped Sep 25: [Meal photo to macros](/developers/meal), `/playground?demo=meal`.
- YUI-103 (backlog): step 2 of YUI-35, the app: camera in the chat, the host's vision call, the save into the phone's meals table. After YUI-89.
- YUI-36: optional encrypted sync for agent tables, off by default.
- OSS-6: Yui@home, the machinery. Step 1 shipped Sep 26: the agent-ready backlog, exported from the board to [/contribute](/contribute) and [backlog.json](/contribute/backlog.json) (a card is claimed by a draft pull request titled with its key; the first one merged wins), CONTRIBUTING-AGENTS.md and AGENTS.md in both repos, and a feature spec template. Step 2 shipped Sep 26: weekly routine prompts for Claude, Codex, Jules, Cursor, Copilot and any agent on [/contribute](/contribute#weekly), each checked against its platform's docs; `checks` CI on every pull request in both repos with no secrets, CODEOWNERS on CI, signing, release and generated files, no auto-merge; a merged `[KEY]` pull request closes its card, and credit on /progress is opt-in. Left: the first real run end to end, on a throwaway fork.
- YUI-77: group threads, several agents in one conversation (split from YUI-44; @mentions shipped in build 82). Step 1, the spec and a playground mock, shipped Sep 25 ([Group threads](/developers/groups): the agent you @ answers, else the lead; a handoff row between agents; a hop budget with a Let it / Stop here guard; a thread id of its own). Step 2, the database and the Hermes plugin, reached phones with Yui 0.3.0, build 138 (YUI-93: group tables and routing live, hop budget, turn cap, Let it and Stop, host notes, channel guide v20 with a Groups section). Step 3 is YUI-94: the native app (New group sheet, the thread, the guard) and an end-to-end test, after 0.2.0.
- YUI-47: Apple Watch, timer and quick answers on the wrist (parked by Chris until after the MVP). Build to earn: open to outside contributors.
- YUI-60: Yui Lines that describe a game (board, pieces, rules, win), so agents can make new ones. The spec draft is written ([Games](/developers/games): a board kit, three sample games, what Apple's rules allow). Parked by Chris on Sep 25: no build until he picks it back up.

**People with no agent yet**

- YUI-37: a starter agent that works with no setup. Step 1 (spec, cost model, playground mock) shipped Sep 26; step 2, the hosted build, waits on Chris's sign-off for Cloudflare and spend.
- YUI-38: an onboarding interview that suggests your first agents. Step 1 (spec + playground flow) shipped Sep 25; step 2, native in the app, after 0.2.0.
- YUI-39: log in to your tools once (Google Calendar, Gmail, HubSpot) through MCP. Step 1 (spec + playground flow) shipped Sep 25; step 2, real sign-in on the agent's host, waits on Chris's sign-off for the Google and HubSpot app registrations.

**Smarter and faster**

- YUI-41: an on-device model answers the easy things for free.
- YUI-42: the preset flywheel. Log custom screens, turn the repeats into presets. Shipped Sep 24: the Hermes plugin logs custom shapes (never values) when its owner turns it on, a weekly report flags repeats, checklist in spec/FLYWHEEL.md.
- YUI-43: restyle the app by asking ("make Yui feel like autumn"), with contrast guardrails. Step 1 shipped Sep 25: [Restyle Yui](/developers/restyle), `theme app` in the parser, `/playground?demo=restyle`.
- YUI-96: step 2 of YUI-43, the native side, built Sep 25: the preview card (Now beside the new look, light and dark, Use or Keep mine, then Undo), the chrome that follows the look while agent threads keep theirs, Settings > Look with Back to Yui's look, the look saved on the account, and the host gate. Rides the next Yui release.
- YUI-40: widgets and Siri, so agents work outside the app.

**Flows**

- FLOW-1: flows. A saved series of screens, written in Mermaid, that any agent can run: client intake, scoping a project, an investor deck. Agents can make variants. You manage your flows in the app. Step 1 done Sep 25: spec/FLOWS.md (steps on the nodes, conditions on the edges, one `{flow}` event with the path), the JavaScript parser and the web runtime, three starter flows in the playground (website intake, self-scoping, workout check-in). Next: the app runs flows, then My flows.
- FLOW-2: a library of components and flows on yuigui.com that people browse and agents can search and "shop". Later, a store.

**Other agents and channels**

- INT-1 (done Sep 24): an OpenClaw channel plugin. Install it, pair with the app's code, and your OpenClaw agent answers in Yui.
- INT-2 (done Sep 24): a webhook bridge in Python and Node. If your agent can answer an HTTP request, it can talk in Yui.
- INT-3 (done Sep 25): a Yui MCP server, so any MCP agent can draw a screen. Claude Code and Cursor today; OAuth for the Claude and ChatGPT apps is INT-19.
- INT-4 (step 1 done Sep 25): the Telegram fallback: Yui Lines as buttons and a Telegram Mini App (spec/TELEGRAM.md). Next: a bot that runs it, then a live test.
- INT-5: connect without installing anything, through a hosted connector.
- INT-6 (done Sep 25): where the hosted connector runs. Cloudflare, beside the Supabase relay (spec/HOSTING.md).
- INT-7 (built Sep 25, one look in claude.ai left): Claude, through the MCP server, and Yui screens drawn inside Claude as an MCP App.
- INT-8 (built Sep 25, one look in chatgpt.com left): ChatGPT, the same way, as a developer-mode connection.
- INT-9 (step 1 done Sep 25): Gemini, as a model (`--server gemini` on the model bridge, spec/MODELS.md) or as an A2A agent (a Google ADK agent, spec/A2A.md). Next: one live call with an AI Studio key, then the hosted connector.
- INT-10 (step 1 done Sep 25): Grok, as a model (`--server grok` on the model bridge, spec/MODELS.md) or calling the MCP server from a Responses API request (spec/MCP.md). Next: one live call with an xAI key, then the hosted connector.
- INT-11 (step 1 done Sep 25): Meta's Muse Spark, as a model (`--server meta` on the model bridge, spec/MODELS.md). The Model API is in public preview for US developers. Next: one live call with a Model API key, then the hosted connector.
- INT-12 (step 1 done Sep 25): open models on your own machine (Ollama, LM Studio, vLLM) and any OpenAI-compatible API. Today as a bridge next to the model server (spec/MODELS.md); cloud APIs on the hosted connector next, with YUI-34's key vault.
- INT-13 (step 1 done Sep 25): a Yui channel for Flue. A Flue app on Node dials out to Yui, and each turn goes to the agent through Flue's own dispatch; the blueprint for `flue add channel` is in the app repo (spec/ADAPTERS.md "Flue"). Next: on Cloudflare, Yui pushes turns to the channel's signed route once the hosted connector exists (INT-20, and a Cloudflare account).
- INT-14 (step 1 done Sep 25): LangGraph, as an A2A agent on LangGraph's own Agent Server; the guide reaches the graph's state (spec/A2A.md). Next: the hosted connector.
- INT-15 (step 1 done Sep 25): CrewAI, as an A2A agent served by CrewAI's own A2A server config; the guide goes into the agent's backstory (spec/A2A.md). Crews run as scripts use the webhook bridge. Next: the hosted connector.
- INT-16 (step 1 done Sep 25): Microsoft Agent Framework, the successor to AutoGen, as an A2A agent served by its own A2AExecutor; the guide goes into the run's instructions (spec/A2A.md). The AG-UI spike says Yui can be an AG-UI client: parked as INT-21. Next: the hosted connector.
- INT-21 (step 1 done Sep 25): an AG-UI client, so any agent served over AG-UI (Agent Framework, CopilotKit, Mastra, Pydantic AI) joins by its URL. Yui screens are a frontend tool the agent calls, `yui_show`, and the tap comes back as the tool's result. Today as a bridge on your own computer (spec/AGUI.md); hosted with INT-18's. Open for Chris: A2UI as a second screen format (recommendation: not now).
- INT-17 (step 1 done Sep 25): n8n, as a node ("Yui: ask and wait"), through the MCP Client Tool and through a Webhook trigger (spec/MCP.md "n8n"). Next: publish the node on npm and n8n's community list.
- INT-18 (step 1 done Sep 25): an A2A client, so any agent with an Agent Card can join. Today as a bridge on your own computer (spec/A2A.md); hosted next, once Yui has a Cloudflare account.
- YUI-48: text an agent from any phone over SMS.

**Money and platforms**

- YUI-45: pay-as-you-go credits for images and hosted models.
- YUI-58: Yui for macOS, a matching desktop app under the same App Store listing. The first card marked for Yui@home contributors. Build to earn.
- YUI-71: Yui in the browser, on the same relay with the web renderer. Build to earn. Watch, desktop and browser each translate Yui Lines where they must: what fits renders, the rest says "open on your iPhone".
- YUI-109 and YUI-110 (agent-ready): the first pull request of the browser and of the Mac app, open to outside contributors on [/contribute](/contribute).

**Running Yui**

- YUI-72 (scope done Sep 25, spec/ADMIN.md): the admin console. Five roles (owner, super user, admin, support, a client's own admin), what each can control (invites, accounts, default agents, the kill switch and limits, feature flags, announcements, feedback, usage numbers, an audit log). Recommendation: an Admin section inside the app, Sign in with Apple plus a role row, a second check for anything destructive. Admins never read messages. Three phases and six card candidates wait on a pick. Read it: [admin console](/developers/admin).
- YUI-46: Android, starting with a prototype that passes the shared test suite.

**Open source and the site**

- OSS-2 (done Sep 24): Yui Lines parsers in Python and Kotlin, next to the JavaScript and Swift ones.
- OSS-4 (done Sep 25): a Yui Lines parser in Rust, a crate with no dependencies (parsers/rust). All 445 vectors pass, and it matches the JavaScript parser on 35,000 random documents.
- OSS-8 (agent-ready): a Yui Lines parser in Go, open to outside contributors on [/contribute](/contribute).
- OSS-3: the public backlog mirrored as GitHub issues for contributors.
- BIZ-6 (done Sep 24): who the first 20 to 50 outside testers are, and where they gather. Read it: [beta list](/business/beta-list).

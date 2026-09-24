# Yui | social accounts, voice and copy

Draft 1, Sep 24 2026. Card BIZ-5. Public, like the rest of the project. Google Doc: https://docs.google.com/document/d/1ODItVuNyB493joVkMM8T4g8_OrxiXHvvT3ShqdyUDXw/edit

**Current plan:** the [go-to-market plan](https://www.yuigui.com/business/gtm) (SITE-20, Sep 24) pulls this doc and BIZ-4 (content plan) into one page with the first 30 days. This doc stays as the detail. Where they differ, the GTM plan wins.

Companion docs: [BIZ-1 marketing and positioning](https://www.yuigui.com/business/biz-1-marketing-positioning) (what we say, what we never claim), [BIZ-2 outreach plan](https://www.yuigui.com/business/biz-2-outreach-plan) (communities, Chris-gated), [BIZ-4 content plan](https://www.yuigui.com/business/biz-4-content-plan) (the engine, formats, cadence, first six weeks). BIZ-4 decides what gets posted and when. This doc decides who each account is.

**Nothing here has been posted and no account has been created.** Chris creates the pages. Every post below is an example of the voice, not an approved post. Posts on social accounts go out only after Chris approves them (BIZ-4 Part 4).

## The short version

- **Handle:** `yuiguiai` everywhere. It is free on every platform we could check (table below). The shorter `yuigui` is already taken on GitHub and YouTube by accounts that are not ours, so `yuiguiai` is the right call.
- **Display name:** `Yui` on every account. Where the name field is searchable (Instagram, TikTok, LinkedIn, YouTube), add a short qualifier so people searching "agent app" find it.
- **One voice, many cuts.** The brand speaks as the project: friendly, short, plain words, always showing a real screen. It never hypes and never claims "first". Each platform gets its own cut, never the same text pasted twice.
- **What every account posts:** only things that shipped. The raw material is `site/content/progress.json` plus the screenshot or clip that proves it.
- **Why anyone follows:** to watch a native iPhone app for AI agents get built in the open, one new screen every few days, with honest numbers.
- **Art:** coral wordmark on cream is the default avatar (it matches the app icon). The bunny-ear Y mark on cream is the small-size fallback. Banners put the wordmark and the line "Your agent, a real screen." on cream with the app's pastel chips. Rendered files are listed in Part 3.
- **Hashtags:** none on X, Instagram, Threads, Bluesky or LinkedIn. Two or three plain topic tags on TikTok and YouTube Shorts, where search runs on them.
- **Skipped or reduced:** Reddit (reserve the name, never post as a brand), Product Hunt (a product page on launch day, not a running account), GitHub (reserve the name, the code stays under postscarcityai). Reasons in Part 2.

## Part 1 | Handle availability

Checked Sep 24 2026. Every browser check ran in real Chrome and was bracketed by controls at the start and the end: a known-taken handle and a nonsense handle (`zzqxnonsense99xyzq`). A result counts only when both controls returned what they should. Evidence files: `browser_checks.json`, `ph_check.json`, `curl_checks.txt` in the BIZ-5 card workspace.

| Platform | `yuiguiai` | How we know | Controls |
|---|---|---|---|
| X | **Free** | x.com profile returns 404 "User Profile Not Found" | @nasa 200 profile, nonsense 404, both ends |
| Instagram | **Free** | "Profile isn't available" title | @nasa profile, nonsense unavailable, both ends |
| Threads | **Free** | Threads handles come from the Instagram account, and the page matches the nonsense control (login wall) | @nasa profile, nonsense login wall |
| TikTok | **Free** | "Couldn't find this account" title | @nasa profile, nonsense not found, both ends |
| YouTube | **Free** | youtube.com/@yuiguiai returns 404 | @nasa 200, nonsense 404 |
| Bluesky | **Free** | `yuiguiai.bsky.social` does not resolve | bsky.app and jay.bsky.team resolve |
| LinkedIn company page | **Likely free** | /company/yuiguiai hits the sign-up wall (HTTP 999), the same as the nonsense control. A real company page (Microsoft) loads | Consistent both ends, but a sign-up wall is a weaker signal than a 404 |
| Reddit user | **Free** | "Sorry, nobody on Reddit goes by that name" | u/spez loads (after one bot check), nonsense not found |
| GitHub | **Free** | api.github.com/users/yuiguiai returns 404 | nasa 200, nonsense 404 |
| Product Hunt | **Unknown** | Cloudflare blocked every load after the first, including the controls. Not checkable from this machine | Opening control loaded, then everything 403 |
| yuiguiai.com | **Unregistered** | Verisign RDAP 404 | n/a |

Worth knowing:

- `yuigui` is **taken** on GitHub (an empty personal account created Mar 24 2026, no repos) and on YouTube (a channel titled "Yui Gui"). Neither is ours. Another reason to use `yuiguiai` everywhere.
- Bluesky can use a domain as the handle. We own yuigui.com, so the account can be `@yuigui.com` after it is created (one DNS TXT record at `_atproto.yuigui.com`). That is the best handle we can have there: it proves the account is ours. Recommendation: create it as `yuiguiai.bsky.social`, then switch the handle to `yuigui.com`.
- Threads needs the Instagram account first. Create Instagram, then Threads from it.
- Order to create, most useful first: X, Instagram, Threads, YouTube, TikTok, Bluesky, LinkedIn page, then reserve Reddit and GitHub.
- yuiguiai.com is unregistered. It costs about $10 a year to hold. Optional: it only matters if someone squats it to confuse people. Buying it is Chris's call.

## Part 2 | The accounts

The shared rules, so each platform section only says what is different:

- **Who is speaking:** the project, as "we" (Chris and the agents that build Yui with him). Warm and a little playful, like the app. Never cute at the expense of clear.
- **What it shows:** a real screen from the app or the playground in every post that can hold an image. Text-only posts are the exception.
- **What it never says:** "first", "most compact", "any agent" (today it is Hermes only), "open source" as the headline differentiator, "chatbot" except to say what Yui is not, or any token saving as one big multiplier. The benchmark is always quoted as the split: 1.6x fewer tokens than lean JSON, 2.7x than pretty JSON, 3.9x than a component tree.
- **Words we use:** show, screen, tap, your agent, native, open, plug in. **Words we avoid:** revolutionary, seamless, AI-powered, next-generation, supercharge, "the future of", plus the fleet list.
- **Links:** yuigui.com or a deep link (/playground, /progress, /yl). The public TestFlight link only once Apple approves it (card YUI-22 is in Beta App Review).
- **Gated posts** are marked [needs X] below. They wait for the thing named.

### 2.1 X (@yuiguiai)

- **Display name:** Yui
- **Bio (160 max):** Your agent, a real screen. A native iPhone app where Hermes agents draw the screen: timers, choices, forms, galleries. Open source, built in public.
- **Location field:** yuigui.com/progress
- **Link:** yuigui.com
- **Pinned post:** the ship log (example 1 below).
- **Avatar:** coral wordmark on cream. **Banner:** `banner-x-bluesky-1500x500.png` (wordmark centered, clear of the avatar, which covers the bottom left).

**The story.** X is the build log with a pulse. It is where builders, iOS developers and Hermes users already talk about agents, and where a new screen can be shown in one image and one line. Each post is one thing that shipped, the line of Yui Lines that draws it, and the screen. Someone follows because every few days there is something new to see, the numbers are honest, and they can try most of it in a browser today.

**What it posts:** ship posts, the Friday thread from the weekly update, the benchmark with all three numbers, replies to people who try the playground. Up to one post a day (BIZ-4).

**Hashtags:** none. X search does not need them and they read as spam in this crowd.

**Example posts.** Each one stands alone and fits in 280 characters.

1. We are building Yui in public. Every ship gets a dated line on the site, and every Friday gets a write-up. Here is the whole record so far: yuigui.com/progress
2. Your agent sends one line: `timer 40/20x8 Tabata`. Yui draws a full-screen workout timer on your phone. Native SwiftUI, no web page, no code from the agent. [clip of the timer]
3. Same Tabata timer, three ways to send it. Yui Lines: 9 tokens. Minified JSON: 25. A component tree: 75. Across ten screens the saving is 1.6x against lean JSON, 3.9x against a tree. Method and numbers: yuigui.com/yl
4. A beta tester told us the debug screen made no sense to them. It was gone the same day. That is the deal with an open beta: you tell us, we fix it, it goes in the log.
5. New in Yui Lines: pictures and video. `gallery` shows a set of images you can swipe or pick from. `compare` puts a before and after under a slider. Try both in your browser: yuigui.com/playground [image pair]
6. Yui does not replace your agent. It plugs into Hermes as a platform, the same way Telegram does. Same agent, same memory, and now it can draw a screen. [screenshot of the agents screen]
7. Every agent in Yui gets its own color and initial, so you can tell who is talking at a glance. More on the way: agents that restyle themselves. [screenshot of three agents]
8. Charts, equations and step-by-step experiments are now Yui Lines too. One line per screen. yuigui.com/playground
9. Yui is open source under Apache-2.0: the app, the spec, the site, even the business docs. Read how we plan to make money before we charge anyone: yuigui.com/business
10. [needs YUI-22] The public beta is open. If you run Hermes, install Yui from TestFlight and pair your agent with a 6-digit code: [TestFlight link]

### 2.2 Instagram (@yuiguiai)

- **Name field (searchable):** Yui | agent screens for iPhone
- **Bio (150 max):** Your agent, a real screen. ✨ Hermes agents draw native iPhone screens. Open source, built in public.
- **Link:** yuigui.com
- **Avatar:** coral wordmark on cream. No banner on Instagram. **Highlights covers:** the Y mark on cream, mint, lavender and butter chips, one per highlight (Screens, How it works, Builds).

**The story.** Instagram is where Yui is seen, not explained in paragraphs. It is a visual product with a soft, friendly look, and that look is the point: people who would never read a spec will stop for a clean screen in pastel. Every feed post is an explainer carousel (5 to 8 slides, 4:5, one idea per slide, a hook on slide 1), following what worked for Vibe Jam. Reels carry the preset clips. Someone follows because the feed is pretty, easy to understand, and shows a new kind of phone screen they have not seen from an AI app.

**What it posts:** one carousel a week, Reels cut from the preset clips (up to two a week once recording works), Stories for builds.

**Hashtags:** none. One-line captions, no tags, no credit lines.

**Example posts** (carousels unless marked Reel; the caption is the one line shown):

1. Carousel, 6 slides: "How one line of text becomes a screen." Slide 1 the hook, slide 2 the line `timer 40/20x8 Tabata`, slides 3 to 5 the timer running, slide 6 "Try it: yuigui.com/playground". Caption: One line in, one screen out.
2. Carousel, 5 slides: "Before and after." Left, the paragraph a trainer agent sent in a chat app. Right, the same answer as a Yui screen with two big buttons. Caption: Same agent. Better answer.
3. Reel, 8 seconds: the Tabata timer counting down in the agent's colors. Caption: Your agent can start the timer too.
4. Carousel, 7 slides: "Six screens your agent can draw today": ask, choose, form, timer, gallery, compare, one per slide. Caption: Pick your favorite.
5. Carousel, 5 slides: "Every agent looks like itself." Three agents, three colors, same app. Caption: Tell them apart at a glance.
6. Reel, 10 seconds: the before and after slider dragged across a room makeover. Caption: Drag to compare.
7. Carousel, 6 slides: "What we will never do": no ads, no streak guilt, no fake countdowns, cancel in two taps, credits never expire, open core free forever (from BIZ-3). Caption: Rules, not slogans.
8. Carousel, 5 slides: "Light and dark." The same screens in both. Caption: Which one are you?
9. Carousel, 6 slides: "Built in public": the progress log, the roadmap, the business docs, the open repos. Caption: Everything is on yuigui.com.
10. [needs YUI-22] Carousel, 5 slides: "Try Yui": install from TestFlight, pair with a 6-digit code, ask your agent for a timer. Caption: Link in bio.

### 2.3 Threads (@yuiguiai)

- **Name and avatar:** carried over from Instagram.
- **Bio (150 max):** Notes from building Yui, the iPhone app where your Hermes agent draws the screen. Open source. yuigui.com

**The story.** Threads is the casual room. Same people as Instagram, but they came to talk. Posts here are the thinking out loud behind a ship: why presets and not generated code, what a tester said, what we got wrong. Someone follows for the honest, human side of building a product with a team of agents.

**What it posts:** the X ship posts rewritten as a thought, not pasted; short questions to the audience. Lower priority than X (BIZ-4).

**Hashtags:** at most one topic tag a post (Threads allows one), and usually none.

**Example posts:**

1. We keep being asked why Yui's agents do not just write their own UI code. Short answer: a line like `choose "What are we training?" Push|Pull|Legs` is cheap, safe and always looks right. Long answer coming on the site.
2. A tester said the debug screen made no sense. They were right. It shipped out the same day. Tell us what else makes no sense.
3. Question for anyone who talks to an agent every day: when would you rather tap a button than type a reply?
4. The cat is gone. Yui's first look had a mascot. It felt like a toy, so the brand is now just the wordmark. The ears stayed.
5. Most of Yui is built by agents working off a shared board, with one human saying yes or no. We write down what that is really like on yuigui.com/progress.
6. We published our business docs, including how we plan to make money. It felt strange for about a minute. yuigui.com/business
7. Pictures and video are in. Your agent can now show you a gallery or a before and after instead of describing it.
8. Honest number of the week: Yui Lines use 1.6x fewer tokens than lean JSON. Not 8x, not 10x. That is still real money on a small model.
9. Every agent gets its own color. It sounds small until you have four agents in one app.
10. [needs YUI-22] You can try Yui now if you run Hermes. What should your agent draw first?

### 2.4 Bluesky (@yuiguiai.bsky.social, then @yuigui.com)

- **Display name:** Yui
- **Bio (256 max):** Your agent, a real screen. Yui is an open source iPhone app where Hermes agents draw native screens: timers, choices, forms, charts, galleries. Open spec (Yui Lines), open repos, dated build log. yuigui.com
- **Avatar:** coral wordmark on cream. **Banner:** `banner-x-bluesky-1500x500.png` (same 3:1 size as X).

**The story.** Bluesky has a strong open source and indie developer crowd, and people there like specs, protocols and receipts. This is where Yui talks most about the open parts: the Yui Lines spec, the conformance suite, how to write a parser, what the benchmark measured and what it did not. Someone follows because they care how things are built and like seeing it done in the open.

**What it posts:** the X posts rewritten for a more technical ear, spec changes, good-first-issues, links to long-form pieces. Mirrors X at lower priority.

**Hashtags:** none. Bluesky feeds pick up posts by topic without them.

**Example posts:**

1. Yui Lines is the tiny format Yui's agents use to draw a screen. One line, one screen: `form name:text! goal:voice level:1-5 submit="Next"`. The spec is open: yuigui.com/yl
2. Our parser runs 198 shared test cases, and the web and Swift parsers must pass the same suite. If you want to write one in another language, the suite is in the repo under spec/conformance.
3. We benchmarked Yui Lines on ten screens with the o200k tokenizer. 1.6x fewer tokens than minified JSON, 2.7x than pretty JSON, 3.9x than a component tree. The small number goes first. yuigui.com/yl
4. We have not benchmarked Yui Lines against OpenUI Lang yet. If you have, we would like to see it.
5. The app is native SwiftUI, not a web page in a wrapper. That means real iOS navigation, haptics, Dynamic Type and VoiceOver on every screen the agent draws.
6. New presets: `chart`, `stat`, `math`, `step`, `calc`, and units and sorting on `table`. All in the playground now.
7. Yui plugs into Hermes as a platform, next to Telegram and the rest. The relay spec is public: github.com/postscarcityai/yuigui/blob/main/spec/RELAY.md
8. Our privacy page lists every table we hold, by name. When the schema changes, the page changes in the same week. yuigui.com/privacy
9. Good first issue: a Yui Lines parser in Rust or Go. Spec, test suite and two reference parsers are all in the repo.
10. [needs YUI-22] Public TestFlight is open. Bring your own Hermes, pair in a minute, and tell us what breaks.

### 2.5 TikTok (@yuiguiai)

- **Name field (searchable):** Yui | AI agent app
- **Bio (80 max):** Your agent draws the screen. iPhone app, open source. 👇
- **Link:** yuigui.com (TikTok only shows bio links once the account qualifies; until then, the site goes in the bio text)
- **Avatar:** coral wordmark on cream. No banner.

**The story.** TikTok is for the moment where text turns into a screen. The format is short and satisfying: 7 to 15 seconds, the line of text appears, the screen builds itself, someone taps it. No talking head needed, a caption on screen does the work. Someone follows because the clips are quick and oddly satisfying, and they want to see what the agent can draw next.

**What it posts:** the same preset clips as YouTube Shorts and Reels, with captions rewritten for TikTok. Up to two a week once the recording pipeline (SOC-2) exists.

**Hashtags:** two or three plain topic tags per post, for search: `#iosdev`, `#buildinpublic`, `#aiagents`. Never trending tags that do not fit.

**Example posts** (every one needs the recording pipeline, card SOC-2):

1. On-screen text: "My AI agent can start a workout timer." The line types itself, the timer fills the screen, counts down. Caption: One line of text. #aiagents #buildinpublic
2. "Asked my agent what to train. It gave me buttons." The choose screen, a tap on Legs. Caption: Tap, do not type. #aiagents
3. "Before: a paragraph. After: this." Split screen, chat reply vs Yui screen. Caption: Same agent. #iosdev #aiagents
4. "Drag to see the makeover." Compare slider across a room. Caption: Your agent can show you, not tell you. #buildinpublic
5. "Four agents, four colors." Scroll through the agents screen. Caption: Who is talking? You know at a glance. #iosdev
6. "Pairing my agent takes a 6-digit code." Phone and terminal side by side. Caption: No accounts to link, no keys to paste. #aiagents [needs YUI-22]
7. "Light or dark?" Same timer flipping themes. Caption: Pick one. #iosdev
8. "How many screens can one line draw?" Rapid cut through six presets. Caption: Six so far. #buildinpublic
9. "A tester hated this screen. It was gone the same day." The debug screen, then the app without it. Caption: Building in public means this. #buildinpublic
10. "My agent made me a chart." A stat and chart screen drawing in. Caption: Numbers, not paragraphs. #aiagents

### 2.6 YouTube (@yuiguiai)

- **Channel name:** Yui | agent screens for iPhone
- **Handle:** @yuiguiai
- **Description (1000 max):** Yui is an open source iPhone app where your Hermes agent draws the screen. Instead of a paragraph, your agent sends one short line and you get a native screen: a workout timer, a quick choice, a form, a chart, a gallery, a before and after. This channel has short clips of every screen, a pairing walkthrough, and longer videos on how Yui is built in public by a small team of agents and one human. Everything is open: the app, the spec, the build log and the business plan. yuigui.com
- **Links:** yuigui.com, yuigui.com/playground, github.com/postscarcityai/yuigui
- **Avatar:** coral wordmark on cream. **Banner:** `banner-youtube-2560x1440.png`, wordmark and line inside the 1546x423 safe area so it reads on phone, desktop and TV.

**The story.** YouTube is the library. Shorts carry the preset clips, and the long videos are the ones people search for and come back to: how to pair Hermes with Yui, a full walkthrough of the app, and the story of building an iPhone app with a team of agents. Someone subscribes because they want to set Yui up, or because they are curious how an agent-built product actually gets made.

**What it posts:** two Shorts a week once recording works, one long video a month at most (pairing video, walkthrough, build story).

**Hashtags:** up to three in the description of Shorts, same plain topic tags as TikTok. None on long videos.

**Example videos:**

1. Short: "One line of text, one workout timer." The Tabata clip.
2. Short: "Your agent, with buttons." The choose preset.
3. Short: "Drag to compare." The before and after preset.
4. Short: "Charts from your agent." The chart and stat presets.
5. Short: "Every agent in its own color." The agents screen.
6. Long, 3 to 5 min [needs YUI-22]: "Pair your Hermes agent with Yui in two minutes." Install, run the command, type the code, first screen.
7. Long, 8 to 12 min: "A full tour of Yui." Every preset, light and dark, full screen, settings, delete account.
8. Long, 10 to 15 min: "We built an iPhone app with a team of agents." The board, the cards, what went wrong, what a human still has to do (the L5 long-form piece as video).
9. Long, 5 to 8 min: "Yui Lines explained." The spec in plain words, and the benchmark with all three numbers.
10. Short: "A tester hated this screen." The debug screen fix, start to finish.

### 2.7 LinkedIn (company page, linkedin.com/company/yuiguiai)

- **Page name:** Yui
- **Tagline (120 max):** An open source iPhone app where your AI agent draws the screen. Built in public.
- **About:** Yui is a native iPhone app for talking to the AI agents you already run. When words are not enough, your agent draws the screen: a timer, a choice, a form, a chart. Yui plugs into Hermes Agent as a platform, keeps your agent's memory and model, and gives every agent its own look. The app, the spec, the roadmap and the business plan are all public at yuigui.com. A PostScarcity AI project.
- **Industry:** Software Development. **Website:** yuigui.com.
- **Logo:** Y mark on cream (`avatar-mark-cream-1024.png`) reads best at LinkedIn's small logo size. **Cover:** `banner-linkedin-1128x191.png`.

**The story.** BIZ-4 puts the LinkedIn voice on Chris's personal account, and that stays true: people on LinkedIn follow people. The company page is the credible home Chris's posts link to, and a place for people who want to follow the project without following him. It posts less and reads more considered: the long-form pieces, milestones, the open business model. Someone follows because they are thinking about how agents will show up in real products and want a working example, with its numbers.

**What it posts:** one post a week at most, usually the long-form piece of the week or a milestone. Chris reshares when it fits his voice.

**Hashtags:** none, or at most two on a milestone post.

**Example posts:**

1. Yui is open source. The app, the spec, the website and the business docs, including how we plan to make money, are public under Apache-2.0. Why we chose to build this way: [L4 link]
2. Most AI answers still arrive as a paragraph. We think agents should be able to answer with a screen. Here is what that looks like on a phone today. [carousel PDF: six presets]
3. We published our revenue model before charging anyone. The rules come first: the open core is free forever, no ads, no dark patterns, cancel in two taps. yuigui.com/business/biz-3-revenue-models
4. Yui is built by a team of agents working off a shared board, with one human who says yes or no. What that is really like, including what went wrong: [L5 link]
5. Honest numbers matter more than big ones. Our compact UI format saves 1.6x tokens against lean JSON and 3.9x against a component tree. We lead with the smaller number. yuigui.com/yl
6. A beta tester flagged a confusing screen in the morning. It was gone by the afternoon. Short feedback loops are the main reason to build in the open.
7. Yui does not replace your agent. It plugs into Hermes Agent as a platform, the same way a messaging app does, so the agent keeps one memory across every place you talk to it.
8. Milestone: [needs YUI-22] Yui's public beta is open on TestFlight. If your team runs Hermes, we would like to hear what screens you need.
9. Every AI agent in Yui gets its own color and feel. When you work with several agents, knowing who is talking matters.
10. Our privacy page lists every database table we hold, by name, and it changes when the schema does. yuigui.com/privacy

### 2.8 Reddit (u/yuiguiai): reserve only, do not post

- **Why reduced:** Reddit communities distrust brand accounts, and r/hermesagent and similar subs expect a person with disclosure, not a logo. BIZ-2 already plans one build write-up from Chris's own account with the disclosure line. A brand account posting there would cost more trust than it earns.
- **What to do:** register u/yuiguiai so nobody else takes it, set the profile, and leave it quiet. Do not create r/yuiguiai until there are users asking for a place to talk.
- **Display name:** Yui
- **About (200 max):** The team account for Yui, an open source iPhone app where Hermes agents draw the screen. We post as ourselves; you will find us on yuigui.com.
- **Avatar:** Y mark on cream. **Banner:** `banner-reddit-1920x384.png`.
- **Posts:** none. If the account ever speaks, it replies in threads that mention Yui, with a disclosure, after Chris approves the reply.

### 2.9 GitHub (reserve @yuiguiai, code stays at postscarcityai)

- **Why reduced:** the repos are public at postscarcityai/yuigui and postscarcityai/yui, and moving them would break the plugin catalog entry and every link we have published. GitHub already is Yui's most important account, it just lives under the company name.
- **What to do:** reserve the `yuiguiai` org as a placeholder with a profile README that points to the real repos. On the real repos, set the description, topics and social preview.
- **Placeholder org README:** "Yui lives at [postscarcityai/yuigui](https://github.com/postscarcityai/yuigui) (spec, site, docs) and [postscarcityai/yui](https://github.com/postscarcityai/yui) (the iPhone app)."
- **Repo description, yuigui (160 max):** Yui: your agent, a real screen. The Yui Lines spec, playground, conformance suite and yuigui.com. Hermes agents draw native iPhone screens.
- **Repo topics:** `hermes-agent`, `generative-ui`, `swiftui`, `ios`, `ai-agents`, `build-in-public`.
- **Avatar:** Y mark on cream. **Social preview:** `github-social-preview-1280x640.png` (upload in repo settings; it shows when the repo link is shared anywhere).

**The story.** GitHub is where people decide whether the project is real. The voice is plain and exact, like good docs. Someone stars or watches because they want the spec, want to write a parser, or want to see the app's code. Issues and PRs from outside matter more than stars (BIZ-4 Part 7).

**Hashtags:** not a thing here. Topics do that job.

**Example posts** (release notes, discussions and good-first-issues; GitHub Discussions would need turning on):

1. Release note, spec v1.1: "Yui Lines learns pictures and video: `gallery`, `video`, `compare`, `storyboard`, `image +edit`. 198 conformance cases, all passing on web and Swift."
2. Good first issue: "Write a Yui Lines parser in Rust. The spec, the test suite and two reference parsers are in `spec/`."
3. Good first issue: "Add a Go parser that passes `spec/conformance`."
4. Release note, app build: "Build 16: talk to your agent in Yui over the Hermes relay. Pair with a 6-digit code."
5. Issue template intro: "Tell us what screen you wanted your agent to draw, and what it drew instead."
6. Release note: "Presets for data and science: `chart`, `stat`, `math`, `step`, `calc`, plus units and sorting on `table`."
7. README section: "Try it without an iPhone: every preset is clickable at yuigui.com/playground."
8. Discussion: "Benchmark method: why we quote 1.6x, 2.7x and 3.9x, and what we have not measured yet (OpenUI Lang)."
9. Good first issue: "Add a Yui Lines syntax highlighter for VS Code."
10. Release note: "Every agent gets its own color: `YuiTheme.agents` maps agent names to palette tokens."

### 2.10 Product Hunt: a product page on launch day, not an account

- **Why reduced:** Product Hunt maker pages belong to people, not brands. The maker is Chris. What Yui needs is a product page, used once, after Show HN (BIZ-1 Stage 3, BIZ-4 Part 3). Handle availability could not be checked from here (Cloudflare), so Chris should claim `yuiguiai` when he signs in, if he wants a team profile at all.
- **Product name:** Yui
- **Tagline (60 max):** Your AI agent draws the screen, on your iPhone
- **Description (260 max):** Yui is an open source iPhone app for the Hermes agents you already run. Instead of a paragraph, your agent sends one short line and Yui draws a native screen: a timer, a choice, a form, a chart, a gallery. Every agent gets its own look.
- **Topics:** iPhone, Artificial Intelligence, Open Source, Developer Tools.
- **Thumbnail:** Y mark on cream. **Gallery:** `producthunt-gallery-1270x760.png` first, then the six screenshots from the BIZ-1 shot list, then a 30 second video.

**The story.** Product Hunt is launch day only. The page explains Yui to someone who has never heard of Hermes, in under ten seconds, and the maker comment tells the real story in Chris's voice.

**Hashtags:** none.

**Launch copy** (the gallery and the maker comment are the "posts" here; all [needs BIZ-1 Stage 3 gate]):

1. Maker comment, opening: "Hi, I'm Chris. My trainer agent kept sending me a paragraph when I needed a timer. So we built Yui: your agent sends one line and your phone shows the screen."
2. Maker comment, the honest part: "Yui works with Hermes today. Other agents are on the roadmap, not in the app."
3. Maker comment, the ask: "What screen would you want your agent to draw first?"
4. Gallery caption 1: "One line of text, one native screen."
5. Gallery caption 2: "Tap instead of typing."
6. Gallery caption 3: "Before and after, with a slider."
7. Gallery caption 4: "Every agent in its own color."
8. Gallery caption 5: "Pair your agent with a 6-digit code."
9. Gallery caption 6: "Open source: the app, the spec, even the business plan."
10. Video title: "Yui in 30 seconds."

## Part 3 | Art direction and rendered files

The identity is typographic: the coral wordmark (#FF7E8A) with its bunny-ear Y, on the app's cream (#FFF9F0) or dark plum (#231D33). No mascot. Pastel chips (lavender #D9CCF7, mint #BDEBD6, butter #FFE8A3) are the only decoration. They echo the rounded agent chips in the app. Type is SF Pro Rounded, bold, in ink (#3A3340 range) on cream. The one line on banners is pillar 1 from BIZ-1: "Your agent, a real screen."

- **Default avatar:** coral wordmark on cream. Same as the app icon, so the account and the app look like one thing.
- **Small sizes (LinkedIn logo, GitHub, Reddit, favicons):** the Y mark alone on cream. The full wordmark gets too small to read under about 64 pixels.
- **Dark variant:** coral on plum, for Bluesky or X if Chris prefers dark. Coral is 6.4:1 on plum.
- **Circle crops:** every avatar keeps the art inside the center circle, so round crops on X, Instagram and YouTube do not clip the ears.

Rendered files (in the BIZ-5 card artifacts, `~/.hermes/kanban/artifacts/t_dcf973be/`):

| File | Size | Use |
|---|---|---|
| avatar-wordmark-cream-1024.png | 1024x1024 | Default avatar: X, Instagram, Threads, TikTok, YouTube, Bluesky |
| avatar-wordmark-plum-1024.png | 1024x1024 | Dark alternative |
| avatar-mark-cream-1024.png | 1024x1024 | LinkedIn logo, GitHub org, Reddit, Product Hunt thumbnail |
| banner-x-bluesky-1500x500.png | 1500x500 | X header, Bluesky banner |
| banner-x-bluesky-dark-1500x500.png | 1500x500 | Dark alternative |
| banner-youtube-2560x1440.png | 2560x1440 | YouTube banner, art inside the 1546x423 safe area |
| banner-linkedin-1128x191.png | 1128x191 | LinkedIn company cover (art right of center, clear of the logo) |
| banner-reddit-1920x384.png | 1920x384 | Reddit profile banner |
| github-social-preview-1280x640.png | 1280x640 | Repo social preview for postscarcityai/yuigui and /yui |
| producthunt-gallery-1270x760.png | 1270x760 | First Product Hunt gallery image |

## Open questions for Chris

1. Bluesky: OK to switch the handle to `@yuigui.com` once the account exists? It needs one DNS TXT record on yuigui.com, which the fleet can add.
2. yuiguiai.com: hold it for about $10 a year, or skip?
3. Default avatar: coral on cream (matches the app icon, my pick) or coral on plum?
4. LinkedIn: create the company page now, or wait until there is a milestone worth announcing?

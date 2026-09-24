# Yui | revenue models and mission principles

Draft 1, Sep 24 2026. Card BIZ-3. Public, like the rest of the project (Chris, Sep 24: "everything can be totally visible"). Google Doc: https://docs.google.com/document/d/1XcJ2TqzkrG2VC0DpfV4dn5UaX7l4YCJjoPP1IZvsHt4/edit

Chris, in the pitch (rec 366): "The goal is that you download this app, you put in your credit card and you're off to the races with a multi-agent in your life." And: "Image generation is in no way free. So people have to pay for it." And: "In all phase ones, we're plugging into outside services and then slowly but surely we bring them in house."

## The short version

- Yui stays free and open source for anyone who brings their own agent and keys. That is the core, and it never shrinks.
- Money comes from things that cost us real money to run: hosted agents, image and voice generation, hosting other people's agents. We charge a fair, visible margin on those.
- Recommended order: sponsors and one grant now, image credits in Phase 3 to 4, a hosted-agent subscription in Phase 4 to 6 once beta shows real per-user cost, managed hosting in Phase 5, a team tier after launch. Theme packs are optional and last.
- Nothing here gets priced until the beta measures real inference cost per user. Every number below is either a sourced comparable or a labeled estimate.

## Part 1 | Mission principles

These are rules, not slogans. Each one says what it forbids.

1. **The open core is free forever.** Anyone who brings their own agent (Hermes, OpenClaw, any MCP agent) and their own keys gets the full app: every preset, every screen, per-agent themes, voice, full screen. We never move a free feature behind a paywall later. Apple's rule 3.1.2(a) already forbids taking away paid-for features; we hold ourselves to the same rule for free ones.
2. **We charge only where we carry a cost.** Hosted model calls, image and video generation, voice, hosting, human support. If a feature costs us nothing to serve, it is free.
3. **No dark patterns.** No ads. No fake scarcity or countdown timers on offers. No streak guilt or engagement-bait notifications. No pre-checked upsells. Cancel in two taps inside the app, no survey wall. Price per unit shown before every charge. Credits never expire (Apple requires this for IAP anyway, and we would do it regardless).
4. **Privacy by default, on device first.** Agent tables, keys (Keychain) and history live on the phone. Sync is opt-in and encrypted. We never sell data, never train on user data, never share it with advertisers. The privacy page lists every table we hold, as it does today.
5. **Fair pricing.** Credit prices show cost plus a published margin. BYO keys keep working on every paid tier, so nobody is forced to buy our credits. Unused months get handled the Kagi way where possible (credited back, not kept).
6. **Accessibility is never a paid feature.** Dynamic Type, VoiceOver, high contrast, voice in and text out, big tap targets: free on every tier.
7. **Discounts for people with less.** Students, teachers and nonprofits get a standing discount (Obsidian gives 40%).
8. **The glad-a-month-later test.** Before any paid feature ships, ask: would a user be glad they paid for this a month later? If the honest answer is "they forgot to cancel", it does not ship.

## Part 2 | The ground rules Apple sets

These shape every model below.

- **IAP is mandatory for digital goods inside the app** (guideline 3.1.1): subscriptions, credits, unlocks. IAP credits may not expire and need a restore path. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Apple's cut:** 30% standard, 15% for a subscriber after year one. The **Small Business Program** makes it 15% from day one while proceeds stay under $1M a year; new developers qualify. [Apple Small Business Program](https://developer.apple.com/app-store/small-business-program/) Recommendation: enroll before the first paid SKU ships.
- **US link-out:** since May 1 2025, US apps may link to web checkout with no entitlement. [MacRumors, May 1 2025](https://www.macrumors.com/2025/05/01/apple-updates-u-s-app-review-guidelines-epic/) The Ninth Circuit (Dec 11 2025) upheld that but said Apple may charge some non-prohibitive commission on linked purchases; the district court has not set the rate. [Ninth Circuit opinion](https://cdn.ca9.uscourts.gov/datastore/opinions/2025/12/11/25-2935.pdf) The Supreme Court took the case in June 2026 on a narrow contempt question only. [MacObserver, Sep 12 2026](https://www.macobserver.com/news/supreme-court-apple-epic-appeal-question-1-narrow/) Treat web checkout as cheaper today, with an unknown future fee.
- **Multiplatform (3.1.3(b)):** users can use purchases made on the web, but the same items must also be sold as IAP in the app.
- **EU from Oct 1 2026:** 26% with Apple IAP (15% small business), 15% with web checkout links. [Apple Newsroom, Aug 2026](https://www.apple.com/newsroom/2026/08/apple-announces-changes-for-apps-in-the-european-union/)
- **Generative UI and review:** 2.5.2 bans downloading code that changes app features; 4.7 allows chatbots and plug-ins the developer takes responsibility for. Yui's preset design (data rendered by fixed native presets) sits on the safe side. Paid content must not arrive as "code" either: theme packs and presets ship in the app binary or as plain data.

## Part 3 | The models

Each model: what it is, comparables with sources, rough numbers, pros, cons, what it needs built, and when.

### Model A | Hosted agents subscription ("Yui Plus")

**What:** for people with no agent. Download, subscribe, and Yui runs an agent for you (roadmap Phase 4 "hosted default agent", plus starter agents from the onboarding interview). This is the "put in your credit card and go" version.

**Comparables:**
- ChatGPT Go $8, Plus $20, Pro $100 to $200 a month. [CloudZero](https://www.cloudzero.com/blog/how-much-does-chatgpt-cost/) (secondary; chatgpt.com blocked the fetch)
- Claude Pro $20 ($17 annual), Max $100 and $200. [Claude pricing](https://claude.com/pricing)
- Perplexity Pro $20. [CloudZero](https://www.cloudzero.com/blog/perplexity-pricing/)
- Character.AI c.ai+ $9.99 or $94.99 a year. [eesel](https://www.eesel.ai/blog/character-ai-pricing)
- Poe $4.99 to $249.99 in compute-point tiers. It cut the $19.99 tier from 1M to 660k points in July 2026 with no price change. That is exactly the move principle 5 rules out. [Usage Pricing](https://usagepricing.com/blueprint/activity/poe-2026-07-28-premium-points-cut)
- Hosted OpenClaw: OpenClaw Cloud $49 a month with model costs included. [getopenclaw.ai](https://getopenclaw.ai/pricing) Budget hosts run $3 to $30 plus your own API costs. [Agent37](https://agent37.com/blog/best-managed-openclaw-hosting-in-2026)

**Cost of goods (my estimate, not sourced):** Anthropic list prices: Haiku 4.5 $1 in / $5 out per million tokens, Sonnet 5 $2 / $10, Opus 5.5 $4 / $20; cached input reads cost about a tenth of the input price. A typical agent turn with the Yui skill and recent history is roughly 8k input tokens (85% cached) and 400 output tokens.
- On Sonnet 5 that is about $0.008 a turn. A normal user at 20 turns a day is about $4.70 a month. A heavy user at 100 turns a day is about $23.
- On Haiku 4.5 it is roughly half.
- On-device Foundation Models (Phase 6) can take routing and quick replies off the bill entirely.

**Rough price to test:** $11.99 a month or $99 a year, with a generous included allowance shown in plain numbers (for example "about 600 conversations a month"), then optional top-up credits. At 15% Apple fee, $11.99 nets about $10.19. A normal user leaves roughly half as margin; a heavy user is carried by top-ups, not by throttling in silence.

**Pros:** the largest market (people with no agent). Predictable revenue. Matches Chris's end-state vision.
**Cons:** the only model with real inference risk. Competes on price with $8 to $20 general chatbots that have far bigger budgets. Needs onboarding good enough that a non-technical person gets value in the first five minutes.
**Needs built:** hosted agent runtime on the relay (Phase 4), onboarding interview and starter agents (Phase 4), accounts (done, YUI-6), usage metering per user, StoreKit 2 subscriptions and receipt validation, a plain usage meter screen, spend caps.
**When:** Phase 4 to 6 (Feb to Jun 2027). Price only after the private beta measures real per-user cost.

### Model B | Usage credits for images, voice and model calls

**What:** consumable IAP credit packs. Spend them on image generation, video, premium voice, and model calls for people without their own keys. Chris named image generation as the easiest first step.

**Comparables:**
- fal.ai: FLUX.1 dev $0.025 per megapixel; Flux Kontext Pro $0.04 an image; video from $0.05 a second. [fal.ai pricing](https://fal.ai/pricing)
- ElevenLabs: $6 for 30k credits up to $99 for 600k; 1 credit per character of speech. [ElevenLabs pricing](https://elevenlabs.io/pricing)
- OpenRouter charges 5.5% on credit purchases and 5% on bring-your-own-key usage past $25k a month. [OpenRouter FAQ](https://openrouter.ai/docs/faq) That is the honest-margin benchmark.
- Midjourney $10 to $120 a month; extra fast hours $4 and they do not expire. [eesel](https://www.eesel.ai/blog/midjourney-pricing) (secondary)
- Raycast bundles AI credits into Pro ($10, 500 credits) and lets users bring their own key. [Raycast pricing](https://www.raycast.com/pricing)

**Rough numbers (estimate):** a $4.99 pack nets $4.24 after the 15% fee. At fal's $0.025 to $0.04 an image, 80 images cost us $2 to $3.20, leaving $1 to $2.20 for relay, storage and margin. Publish the rate: "1 image = 5 credits, a $4.99 pack = 400 credits."

**Pros:** simplest thing to sell. Pay for what you use, no subscription guilt. Revenue tracks cost exactly, so no inference risk. Directly answers Chris's "image generation is in no way free."
**Cons:** Apple takes 15% of a thin margin. Credits cannot expire, so unused balances are a permanent liability on the books. Low revenue per user on its own.
**Needs built:** key vault and BYO image keys first (Phase 3), the media pipeline (YUI-21), StoreKit consumables, a credit ledger in `yui_` tables with restore, per-action price shown before spending, spend cap.
**When:** Phase 3 to 4 (Jan to Feb 2027). First paid SKU.

### Model C | Pro presets and themes

**What:** paid cosmetic packs: designer themes, icon sets, special preset styles.

**Comparables:**
- Widgetsmith: free app, in-app purchases $1.99 to $29.99, premium includes custom themes. [App Store](https://apps.apple.com/us/app/widgetsmith/id1523682319)
- Raycast: custom themes are a Pro feature ($10 a month). [Raycast pricing](https://www.raycast.com/pricing)
- Obsidian: app free, Catalyst supporter badge $25 one-time for early builds. [Obsidian pricing](https://obsidian.md/pricing)
- Things 3: one-time $9.99 on iPhone, no subscription. [Ellie](https://ellieplanner.com/productivity-copilot/things-3-pricing) (secondary)

**Rough numbers:** small. $1.99 to $4.99 one-time packs, or bundled into Plus. Expect this to cover design time, not fund the company.

**Pros:** zero marginal cost. Easy to understand.
**Cons:** conflicts with the product. Per-agent looks (YUI-20) and "ask an agent to restyle the app" are core features, so the theming engine and agent-made themes must stay free. Selling looks the agent could generate for free feels cheap and fails the glad-a-month-later test.
**Recommendation:** skip selling themes directly. Offer an Obsidian-style **supporter pack** instead (one-time $25, early builds, a supporter badge, a few designer themes as a thank-you). Honest, and it doubles as a way for BYO users to fund the open core.
**Needs built:** runtime theme tokens (YUI-20, Phase 2), non-consumable IAP.
**When:** supporter pack any time after public launch. Low priority.

### Model D | Team and business tier with connectors

**What:** agents that run a business, not just a workout. Shared agents for a team, connectors (HubSpot, Google Calendar, Gmail) via MCP and OAuth, shared tables (CRM), admin controls, audit log.

**Comparables:**
- Claude Team $25 a seat ($20 annual); premium seat $125. [Claude pricing](https://claude.com/pricing)
- ChatGPT Business $25 a seat ($20 annual), 60+ connectors. [CloudZero](https://www.cloudzero.com/blog/how-much-does-chatgpt-cost/) (secondary)
- Notion Business $20 a seat, where the full AI and connectors live. [Notion pricing](https://www.notion.com/pricing)
- Raycast Teams Pro $15 to $65 a user. [Raycast pricing](https://www.raycast.com/pricing)
- Zapier Team from $69 a month for 25 users. [Zapier pricing](https://zapier.com/pricing)

**Rough price to test:** $15 to $20 a seat a month, minimum 3 seats. B2B sales to organizations may qualify for Apple's enterprise-services exception (guideline 3.1.3(c)) and bill outside IAP. Verify before relying on it.

**Pros:** highest revenue per user, lowest churn. Fits PostScarcity AI's client work: the same agents Chris builds for clients could ship to them inside Yui.
**Cons:** the heaviest build (admin, roles, shared data, security review, SSO later). Connectors mean holding third-party OAuth tokens, which raises the privacy stakes. It pulls the product toward enterprise and away from "genuinely help people."
**Needs built:** connector library v0 (Phase 4), shared encrypted sync (Phase 3, currently optional), roles and admin, audit log, org billing.
**When:** after public launch (H2 2027). Pilot it earlier with one or two PSAI clients as a paid setup, no product tier yet.

### Model E | Paid hosting and support for other people's agents (relay connector)

**What:** Phase 5 opens Yui to other people's Hermes installs via Hermes's relay connector contract (`hermes gateway enroll`). Two things can be sold on top:
1. **Managed hosting:** Yui runs your Hermes agent for you, always on, no Mac mini needed.
2. **Setup and support:** paid onboarding for people who want their agents built and wired up by someone who knows how.

The relay connection for a user's own self-hosted agent stays free (principle 1).

**Comparables:**
- Home Assistant Cloud (Nabu Casa): $6.50 a month or $65 a year. It funds the open-source project: partners are contractually required to contribute a majority of their profit to the Open Home Foundation, which employs 50+ full-time staff. [Nabu Casa](https://www.nabucasa.com/pricing/), [Open Home Foundation](https://www.openhomefoundation.org/structure/), [HA State of the Open Home](https://www.home-assistant.io/blog/2025/04/16/state-of-the-open-home-recap/)
- OpenClaw Cloud $49 a month, budget hosts $3 to $30. (sources in Model A)
- n8n Cloud from €20 a month, free self-host under a fair-code license. [n8n pricing](https://n8n.io/pricing/)
- Supabase free tier, Pro $25 a month. [Supabase pricing](https://supabase.com/pricing)
- Tailscale free for personal use up to 6 users. [Tailscale pricing](https://tailscale.com/pricing)

**Rough price to test:** managed Hermes hosting at $15 to $25 a month, models on the user's own key (or bundled with Plus). Setup packages priced as PostScarcity AI services, not app SKUs.

**Pros:** the Nabu Casa model is the closest match to Yui's values: the paid service funds the free core, and users pay because it is convenient, not because they are locked in. Serves the Hermes and OpenClaw crowd, the stated early adopters.
**Cons:** hosting other people's agents means running their code and tools: security isolation, abuse handling and support load are real costs. Small market until agents go mainstream.
**Needs built:** multi-tenant relay (Phase 5), connector enrollment, isolated agent runtime (Cloudflare Workers + Durable Objects or containers), monitoring, a status page.
**When:** Phase 5 (Mar 2027) for the free relay; managed hosting after the private beta shows demand.

### Model F | Sponsorships and grants for the open-source project

**What:** money that funds the open core directly.

**Comparables and facts:**
- GitHub Sponsors takes 0% from personal sponsors, up to 6% from organizations. [GitHub docs](https://docs.github.com/en/sponsors/sponsoring-open-source-contributors/about-sponsorships-fees-and-taxes)
- Open Source Collective takes a 10% host fee. [OSC docs](https://docs.oscollective.org/how-it-works/fees)
- NLnet grants: €5,000 to €50,000 for a first project. **Next deadline Nov 3 2026, 12:00 CET.** [NLnet](https://nlnet.nl/propose/)
- Sovereign Tech Fund: from €50,000, but it excludes user-facing apps, so Yui itself is out. A shared protocol (the Yui Lines spec and conformance suite) might qualify later. [Sovereign Tech Fund](https://www.sovereign.tech/programs/fund)
- Mozilla Technology Fund up to $50k; the 2026 Democracy x AI cohort $50k per project. (secondary sources, verify before applying)
- Reality check: most maintainers earn little from sponsors; 60% are unpaid. [Tidelift 2023 survey](https://www.sonarsource.com/open-source-maintainer-survey-2023.pdf), [ICSE 2022 study](https://arxiv.org/abs/2202.05751) Plan on tens to low hundreds of dollars a month from sponsors for a young project (my estimate).

**Pros:** aligned with the mission, no product compromise, grants are non-dilutive.
**Cons:** small and unpredictable. Grants take weeks of writing and reporting. Needs the code to actually be public under an OSI license first (see open questions).
**Needs built:** public repos with a clear license, a contributor guide, a funding page on yuigui.com.
**When:** now. The NLnet deadline is six weeks out.

## Part 4 | Features each model needs, by roadmap phase

- **Phase 2 (Dec 2026):** per-agent theme tokens (YUI-20). Feeds C.
- **Phase 3 (Jan 2027):** key vault (BYO keys stay first-class on every tier), media pipeline (YUI-21), StoreKit consumables, credit ledger, per-action price display. Unlocks B.
- **Phase 4 (Feb 2027):** hosted default agent, onboarding interview, starter agents, usage metering, connector library v0. Unlocks A, starts D.
- **Phase 5 (Mar 2027):** multi-tenant relay, connector enrollment for other people's Hermes, private beta that measures per-user cost. Unlocks E and prices A.
- **Phase 6 (Apr to Jun 2027):** StoreKit subscriptions, on-device Foundation Models to cut cost, public launch. Ships A.
- **After launch:** roles, admin, audit log, org billing. Ships D.
- **Any time:** public repos, license, sponsors page, grant applications. F.

## Part 5 | Recommended sequence

1. **Now (Phase 0 to 2): stay free, fund the core.** Decide the license and which repos go public. Open GitHub Sponsors. Apply to NLnet by Nov 3 2026 for the Yui Lines spec, conformance suite and relay protocol (the reusable, public-good part). Enroll in Apple's Small Business Program.
2. **Phase 3 to 4: image credits first.** The smallest honest paid thing. Tests willingness to pay with zero inference risk, and Chris already named it.
3. **Phase 4 to 6: Yui Plus.** Hosted agents with an included allowance. Priced from beta data, not from this document.
4. **Phase 5 onward: managed hosting for other people's agents,** the Nabu Casa play. Paid convenience that funds the free core.
5. **After launch: team tier with connectors.** Pilot with one or two PSAI clients first.
6. **Optional: supporter pack** instead of selling themes.

Why this order: each step funds the next and none of them risks the principles. Credits come before the subscription because they carry no inference risk. The subscription comes before teams because a team tier built before the consumer product works is enterprise software with no product under it.

## Part 6 | Risks

- **Inference cost blowout** on Plus from heavy users. Mitigation: visible allowance, top-ups, on-device routing, cheaper models for routine turns.
- **Apple fee uncertainty.** The US link-out commission could come back after remand. Model everything at 15% IAP; treat web checkout savings as upside.
- **Review risk.** A paid feature that looks like downloaded functionality could trip 2.5.2. Keep paid content as data rendered by shipped presets.
- **Mission drift.** Revenue pressure pushes toward engagement tricks. The eight principles are the guardrail; publish a short version on yuigui.com so we are held to them.

## Open questions for Chris

1. Open source: which repos go public, and which license? Recommendation: Apache-2.0 for the app, the Yui Lines spec and the Hermes plugin. OSI-approved (not n8n-style fair-code), because grants and community trust depend on it.
2. Roadmap question 5 still stands: product to sell, or personal tool that might become one? This document assumes a product.
3. NLnet application by Nov 3 2026: yes or no? (Outbound, needs your sign-off before anything is sent.)
4. OK to publish a short, public version of the eight principles on yuigui.com?

## Sources

All accessed Sep 24 2026 unless dated. Items marked secondary come from third-party pricing roundups because the vendor page blocked automated fetches; verify before quoting publicly.

# Big labs ship the screen layer (BIZ-13, Oct 9 2026)

Three launches in two days: OpenAI Intelligent UI (Oct 7), Claude Dashboards and Claude Motion (Oct 8). Both labs now treat "the answer is a screen" as core product. This is the bet Yui made on Sep 23. This doc records how each works, what is missing, and how Yui builds the open, platform-agnostic equivalent.

Method: public coverage only (TechRepublic, The Decoder, TestingCatalog, AlphaSignal, VKTR, Android Authority, BetaNews, MacRumors via search). Several outlets returned 403 to fetch, so details from them are search snippets only. Nothing here comes from using the products. Internals (how the compiler works, what the component set is) are not published; where this doc infers, it says so.

## 1. ChatGPT Intelligent UI (GPT-6)

Rolled out Oct 7 to Plus, Pro, Business, Enterprise; Free and Go from Oct 8.

**How it works**
- GPT-6 answers with buttons, charts, forms, diagrams and small task tools inside the chat. No special prompt; users can also ask for a tool by name.
- OpenAI built "a library of native, streamable components, along with a compiler that processes the interface as the model generates it". So: a fixed component vocabulary, the model emits a description, a compiler turns it into UI while streaming.
- The answer can start while the model is still reasoning, and later parts append. Controls change the result in place (savings sliders, trip stops on a map) with no new full reply.
- Works on web and updated apps, for Instant through Extra High effort. Not at Pro effort, not in old desktop apps.
- Enterprise: admin switch. Applies to Chat only; agent and coding products do not change.

**Case studies shown by coverage:** interactive bike diagram (repair walkthrough), adjustable cooking plan, calculators, trip planner map with editable stops, savings calculator.

**Gaps**
- Closed. No public component list, no developer access to Intelligent UI. The older Apps SDK (iframes in a sandbox, tightly tied to ChatGPT) is the only third-party road.
- Chat only, ChatGPT only. Not usable by your own agent, your own data or your own app.
- Verification worry from analysts: calculators and dashboards made on the fly look authoritative with no visible source.
- Unknown: whether state persists after the chat scrolls, whether a screen can be saved or reopened, whether taps reach anything outside the model.

## 2. Claude Dashboards (beta, Oct 8, all paid plans)

- Ask a plain-language question, Claude writes the SQL and builds an auto-updating live dashboard.
- Sources: BigQuery, Databricks, Snowflake, Redshift, ClickHouse, Salesforce.
- Auditability is the headline: click any metric to see the query behind it; each chart shows when its data last refreshed; joins, filters and metric definitions can be checked before sharing.
- Hand-off: export to Amplitude, Grafana, Hex; Looker, monday.com, Tableau listed as coming.
- Enterprise controls: customer-managed encryption keys, approved templates, admin on/off.
- Docs, Slides and Design left beta, now on all tiers (45M documents made). Standalone Claude Design folds into the main app Dec 14.

**Gaps:** warehouse and CRM data only, not personal or phone data. Data lives in Anthropic's product, and exports go to other vendors' tools. Desktop and web shaped. No agent-to-user taps back into the agent.

## 3. Claude Motion (beta, Oct 8, Team and Enterprise only)

- Turns reports, charts, walkthroughs, text and images into a short animated explainer.
- Not video generation: "does not use a video diffusion model". It writes code (layouts, transitions, a timeline) and renders it. Copy, figures, timing and elements stay editable. Exports MP4.
- No synthetic footage or people.

**Gaps:** a video file is output, not an interface. No interaction. Paid team plans only.

## 4. What they prove, and where they disagree

| | Intelligent UI | Dashboards | Motion |
|---|---|---|---|
| Output | live interactive screen in chat | live data screen | rendered video from code |
| Vocabulary | fixed native components | charts over queries | code on a timeline |
| Trust | none shown | query and refresh time per chart | source is editable code |
| Who can use it | ChatGPT users | Claude paid users | Claude Team and Enterprise |
| Open | no | no | no |

Pattern, the same as Yui's core bet from Sep 23: **a fixed native component set plus a streaming compiler beats generated code.** OpenAI landed on the presets-not-HTML design (see `docs/thoughts/why-presets-not-generated-code.md`). Anthropic landed on "editable source, not a black box" for Motion and "show the query" for Dashboards. Both are about trust, and trust is where Yui can be stronger.

## 5. Yui against both

Checked against spec/YL.md, MOTION.md and TABLES.md on Oct 9. Yui already has more of each lab product than the launch coverage suggests.

| Lab product | Yui today | Status |
|---|---|---|
| Intelligent UI: streamed native components | Yui Lines, ~13 presets plus more, rendered line by line as the model writes | shipped Sep 23, open spec, conformance in JS, Python, Rust, Kotlin |
| Intelligent UI: calculators that recompute | `calc` (formula plus sliders, result and chart redraw on the phone, fixed expression grammar, no script) | shipped |
| Intelligent UI: diagrams | `diagram` (Mermaid flow, sequence, state, drawn natively), `shapes`, `sketch`, `map` (areas, pins, routes) | shipped, but static: no tappable parts, no editable stops |
| Intelligent UI: change a control, answer updates | taps and slider releases come back as events; `~target` patches a live component | shipped |
| Dashboards: live charts on data | agent tables on the phone or server, live `query` drawn as table, list, chart or stat; redraws when rows change | shipped for the agent's own data only |
| Motion: explainer as editable code | `motion "<ask>"`: the model writes scenes as code on a timeline, streamed, plays in the app; source kept; 20-ask test set; MOTION.md | shipped Oct 5 to 6 |
| Cross-chat reach | MCP App `ui://yui/screen` draws Yui screens inside Claude and ChatGPT | built, one look in each real app still to do |

Where Yui is genuinely behind:
1. **No proof on a number.** Dashboards' headline is query plus last refresh on every chart. A Yui `chart`, `stat` or `query` view has no "from, as of" chip and no way to open the query behind it. The `query` line already holds the facts (table, where, sort), so this is mostly a display job.
2. **No outside data.** Dashboards connect Snowflake, BigQuery, Salesforce. Yui's connector library (YUI-39) is parked: step 1 spec shipped, real sign-in waits on provider apps and Chris's sign-off.
3. **Motion has no take-it-with-you.** Labs export MP4. Yui films play in the app and on /motion. I found a recorder for the team (`site/scripts/motion/record.py`) but no person-facing export or share in the spec. Needs confirming in the app before the card is written.
4. **Interactive diagrams.** OpenAI's examples (a bike you tap through, a trip with stops you edit) need hotspots and editable stops. Yui `diagram` and `map` send no events by design today.
5. **Distribution.** Labs ship inside the chat 800M people already use. Yui needs the MCP App route to meet people there.

Where Yui is ahead or different: open spec any agent can use, the screen belongs to the person (saved screens, shelf, per-agent look), lock screen timers and widgets, voice, and tables that move between agents. Neither lab offers a way for your own agent to use their screens.

## 6. Build plan (proposals only, no cards, nothing starts until Chris picks)

Sizes: S under a day, M two to three days, L about a week. Each includes its playground demo (the done-means-linked rule).

**1. Proof chips (S to M). Recommended first.** Add optional `from=` and `as=` (and `q=`) to `chart`, `stat`, `table`, `list` and `query` views: tap the small chip to see the source, the age and the query. Fill them automatically from `query` lines. Guide rule: agents state where a number came from. This answers the trust gap both labs point at, and it works in every host (app, web, MCP App).

**2. Refresh on open (M).** A `query` bound to a connected agent's table or a webhook source redraws when the screen opens and on pull to refresh, with "updated 4 min ago". Builds on 1. Read-only.

**3. Tappable diagrams and maps (M to L).** `diagram` nodes and `map` pins become taps that send an event (`click` is already kept in the Mermaid source). Editable stops: drag a pin, an event carries the new order. Covers the bike and trip cases.

**4. Take the film with you (M).** Save or share a `motion` film as MP4 from the app, and a share link on the web. Reuse the headless recorder. Confirm first that no export exists.

**5. Outside data sources (L, needs Chris).** Unpark YUI-39 for one read-only source first (Google Sheets or a Postgres read replica is cheaper than a warehouse). Real sign-in and any provider app registration need his sign-off.

**6. Cross-chat reach (S).** Finish the one look inside claude.ai and chatgpt.com (INT-7, INT-8), then ship 1 and 3 through `ui://yui/screen` so Claude and ChatGPT users get proof chips and tappable diagrams with no iPhone.

**7. Story (S).** One public page, "What the big labs shipped, and the open version", linking /playground demos. No competitor attacks, product names only. Needs a site card; the dev pause holds it until Chris resumes.

Suggested order: 1, 6, 3, 4, then 2 and 5. Reason: 1 is the cheapest answer to the one thing the labs agree on.

## 7. Risks
- The labs' component lists will grow every release; Yui cannot out-feature them. The edge is open, any agent, user-owned data, on the phone.
- Motion films are model-written code run in a player: keep an eye on App Store 2.5.2 if the review ever questions it. `calc` stays a fixed grammar.
- Sources for this doc are secondhand. Re-verify against official posts when they are reachable (cron yui-labs-watch).

## 8. Open questions
- Does ChatGPT keep Intelligent UI state after the chat moves on? Does it expose component events to anyone but the model?
- Does Claude Dashboards allow a read from a connected non-warehouse tool (MCP)?
- Does Claude Motion expose its source format?

## Sources
- OpenAI Rolls Out GPT-6 Intelligent UI With Charts and Forms, TechRepublic: https://www.techrepublic.com/article/news-gpt-6-intelligent-ui-charts-forms/
- GPT-6 gives ChatGPT its biggest visual makeover yet, Android Authority: https://www.androidauthority.com/chatgpt-gpt-6-intelligent-ui-3720464/
- OpenAI's GPT-6 brings Intelligent UI to free ChatGPT users, BetaNews: https://betanews.com/article/gpt-6-intelligent-ui-chatgpt-free-users/
- OpenAI Brings GPT-6 to All ChatGPT Users With Interactive Intelligent UI, VKTR: https://www.vktr.com/ai-platforms/openai-brings-gpt6-to-all-chatgpt-users-with-interactive-intelligent-ui/
- ChatGPT Gets GPT-6 and New Intelligent UI, MacRumors: https://macrumors.com/2026/10/07/chatgpt-intelligent-ui
- Claude can now generate animated explainer videos and live data dashboards, The Decoder: https://the-decoder.com/claude-can-now-generate-animated-explainer-videos-and-live-data-dashboards-from-text-prompts/
- Claude launches Dashboards and Motion in beta, TestingCatalog: https://www.testingcatalog.com/claude-launches-dashboards-and-motion-in-beta/
- Anthropic Ships Claude Dashboards and Motion, AlphaSignal: https://alphasignal.ai/news/anthropic-ships-claude-dashboards-and-motion-to-turn-data-into-auditable
- ChatGPT Apps SDK overview, The New Stack: https://thenewstack.io/openai-launches-apps-sdk-for-chatgpt-a-new-app-platform/

## Updates
(cron yui-labs-watch appends dated notes below)

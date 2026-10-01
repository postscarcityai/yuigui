# ChatGPT directory listing (INT-8), DRAFT

Status: draft only. Nothing is submitted to OpenAI, no draft exists in the submission portal, nothing is published. A public listing is outreach, so Chris signs off first. Today Yui works in ChatGPT as a personal custom connector in developer mode (`spec/MCP.md`, "ChatGPT"), checked live on a real chatgpt.com account on 2026-10-01.

Read against OpenAI's live docs on 2026-10-01 (sources at the end). Three things changed since the first pass of this page:

- OpenAI calls these **plugins** now, listed in one directory shared by ChatGPT and Codex.
- A submission is a **plugin ZIP with a manifest** uploaded at platform.openai.com/plugins, not a web form. Listing text, review test cases and country availability can all ride in the manifest.
- **Screenshots are no longer shown in the directory.** Starter prompts replace them. A reviewer-accessible **video walkthrough is required** instead.

Yui would be a plugin with one remote MCP server and no skills.

## Blockers first

Five things stop a submission today. Everything else on this page is drafted and ready.

| # | Blocker | Why it blocks | Fix |
|---|---|---|---|
| 1 | Domain verification | The portal makes you serve an exact token at `https://<mcp-host>/.well-known/openai-apps-challenge`. Yui's MCP host is a Supabase shared host and only answers under `/functions/v1/`; that URL 404s (checked 2026-10-01). The challenge base must be an origin on the MCP hostname or a parent we own, and we own neither | Serve the MCP endpoint from a host we control, `https://mcp.yuigui.com`, before the first submission. The MCP origin cannot change later without starting a whole new plugin, so this is a one-way door |
| 2 | Reviewer sign-in | OpenAI wants a login and password for a full demo account with sample data that works at once: no sign-up step, no 2FA, no email or SMS code, no magic link. Yui signs in with Apple and the connection is approved by a tap in the app. Neither hands over a password. Measured, not guessed: the live run on 2026-10-01 needed an Add agent code from the phone and a tap on **Allow** before ChatGPT saw a single tool | A review account with a password and an auto-approved connect request. See [Test credentials](#test-credentials) |
| 3 | No terms of service | All four listing URLs are required for public review of a plugin with MCP. `www.yuigui.com/terms` is 404 (checked 2026-10-01) | A `/terms` page. Chris's call on the wording |
| 4 | No widget domain | `_meta.ui.domain` (alias `_meta["openai/widgetDomain"]`) is required when a submitted plugin has UI, and must be unique per plugin. `yui-mcp` sets neither, so the screen renders on OpenAI's default sandbox origin | Host the screen bundle on its own origin, `https://widget.yuigui.com`, and set `ui.domain` to it |
| 5 | The app is a TestFlight alpha | The guidelines reject trial and demo plugins, and the plugin's second screen is an iPhone app a listing visitor cannot install from the App Store | Chris's call: ship to the App Store first, or lead the listing with the screen that draws in the chat and treat the phone as the second screen |

None of these is a surprise in the code. 1, 3 and 4 are infrastructure and copy. 2 needs a small change in `yui-oauth` and `yui-auth`. 5 is a product decision.

## Listing fields

Field names are the manifest's, under `extensions.com.openai.interface`. Limits are OpenAI's, counted here.

| Field | Draft | Limit | Count |
|---|---|---|---|
| `displayName` | Yui | 30 | 3 |
| `shortDescription` | Screens on your phone | 30 | 21 |
| `longDescription` | see below | 4000 | 547 |
| `developerName` | PostScarcity AI | 80 | 15 |
| `category` | Productivity | from the dashboard list | n/a |
| `capabilities` | Draw a screen on your phone / Read taps and replies / Send a message in Yui / List your Yui threads / Find a ready-made screen or flow / Keep a small table in Yui | 20 items, 120 each | 6 items |
| `websiteURL` | https://www.yuigui.com | 1024 | live |
| `supportURL` | https://www.yuigui.com/help | 1024 | live |
| `privacyPolicyURL` | https://www.yuigui.com/privacy | 1024 | live |
| `termsOfServiceURL` | TODO, no page yet | 1024 | 404 |
| `defaultPrompt` | three starter prompts, below | 3 items, 128 each | 70 / 39 / 62 |
| `brandColor` | `#FF7E8A` | 2:1 against white | 2.44:1 |
| `brandColorDark` | `#FF7E8A` | 2:1 against `#212121` | 6.60:1 |

`longDescription` draft:

> Yui is the GUI layer for agents. It puts a real screen on your iPhone: a choice, a form, a timer, a list, a chart. ChatGPT draws the screen in the chat as well, you tap it in either place, and your answer comes back to the conversation as your next message. Connect once with Sign in with Apple and approve the link in Yui. One connection reaches one Yui thread, and nothing else in your account.
>
> Yui is early and open source, and the iPhone app is in an open alpha on TestFlight. You own your side of it: your account, your agents, your screens.

Starter prompts, in `defaultPrompt`:

1. `Ask me on my phone what we are having for lunch: salad, soup or tacos.`
2. `Put a 5 minute focus timer on my phone.`
3. `Check in with me on my phone tonight and log how the day went.`

Naming rules we meet: no "MCP", "MCP Server" or "Plugin" appended, no pricing or promotion, no comparison with other products, no claim of an OpenAI endorsement.

## Draft manifest

Not a submission, a starting point. The ZIP layout is `plugin.json` + `mcp.json` + `assets/` at the root, with no `apps`/`.app.json` and no lifecycle hooks (the portal rejects those). `review` and `publication` sit beside `interface`, not inside it.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "yui",
  "version": "1.0.0",
  "description": "Put a native screen on your phone from the chat, and get the taps back.",
  "author": { "name": "PostScarcity AI", "email": "chris@postscarcity.ai", "url": "https://www.yuigui.com" },
  "homepage": "https://www.yuigui.com",
  "repository": "https://github.com/postscarcityai/yui",
  "license": "Apache-2.0",
  "keywords": ["phone", "screens", "forms", "timers", "second screen"],
  "extensions": {
    "com.openai": {
      "interface": {
        "displayName": "Yui",
        "shortDescription": "Screens on your phone",
        "longDescription": "<the long description above>",
        "developerName": "PostScarcity AI",
        "category": "Productivity",
        "capabilities": [
          "Draw a screen on your phone",
          "Read taps and replies",
          "Send a message in Yui",
          "List your Yui threads",
          "Find a ready-made screen or flow",
          "Keep a small table in Yui"
        ],
        "websiteURL": "https://www.yuigui.com",
        "supportURL": "https://www.yuigui.com/help",
        "privacyPolicyURL": "https://www.yuigui.com/privacy",
        "termsOfServiceURL": "TODO: no /terms page yet",
        "defaultPrompt": [
          "Ask me on my phone what we are having for lunch: salad, soup or tacos.",
          "Put a 5 minute focus timer on my phone.",
          "Check in with me on my phone tonight and log how the day went."
        ],
        "brandColor": "#FF7E8A",
        "brandColorDark": "#FF7E8A",
        "logo": "./assets/yui-logo-square-coral-on-cream.png",
        "logoDark": "./assets/yui-logo-square-cream-on-ink.png",
        "composerIcon": "./assets/yui-mark-y-ink.png",
        "composerIconDark": "./assets/yui-mark-y.png",
        "screenshots": ["./assets/int8-live-1-connector.webp", "./assets/int8-live-2-screen.webp", "./assets/int8-live-3-tap.webp"]
      },
      "review": {
        "test_cases": { "positive": "<the five below>", "negative": "<the three below>" },
        "demo_recording_url": "TODO: nothing recorded yet. The flow it has to show is live and working",
        "commerce": false,
        "commerce_description": "Yui sells nothing and takes no payment."
      },
      "publication": {
        "countries": "TODO: Chris picks. US alone is the safe first answer",
        "release_notes": "First submission. Screens on your phone from ChatGPT, taps back in the chat."
      }
    }
  }
}
```

Companion `mcp.json` at the root (one server only, and only one can be connected per plugin):

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "yui": { "type": "streamable-http", "url": "https://mcp.yuigui.com/mcp" }
  }
}
```

That URL is the blocker-1 target, not today's endpoint. Today's endpoint is in `spec/MCP.md`.

## Icon and screenshot assets

Rules: PNG, JPEG, WebP or SVG, at most 5 MiB each. Icons and logos must be square and at least 48 by 48. Raster at most 4096 on a side. SVG needs square numeric dimensions or a square `viewBox`. Paths in the manifest are `./`-relative and every referenced file ships in the ZIP. The dashboard will not let you submit without a primary icon; dark variants and screenshots are optional.

| Manifest field | Asset in this repo | Size | Verdict |
|---|---|---|---|
| `logo` | `site/public/brand/yui-logo-square-coral-on-cream.png` | 2048x2048, 72 KiB | fits |
| `logoDark` | `site/public/brand/yui-logo-square-cream-on-ink.png` | 2048x2048, 93 KiB | fits |
| `composerIcon` | `site/public/brand/yui-mark-y-ink.png` | 512x512, 14 KiB | fits |
| `composerIconDark` | `site/public/brand/yui-mark-y.png` | 128x128, 2 KiB | fits, small but square |

Do not use `brand/yui-logo-coral.png`: it is 1701x1177, and a listing icon has to be square.

Screenshots are real now, captured inside chatgpt.com on 2026-10-01 during the live check (`spec/MCP.md`, "ChatGPT"). They are optional and no longer shown in the directory, so they are evidence for the reviewer rather than listing art. All light theme, sidebar cropped out, no chat titles, no tokens.

| Manifest asset | File in this repo | Size | What it shows |
|---|---|---|---|
| `screenshots[0]` | `site/public/progress/int8-live-1-connector-light.webp` | 680x601, 28 KiB | The Yui plugin added: **Connected accounts**, the permissions row, and the tools ChatGPT imported from the server, starting at `yui_answers` |
| `screenshots[1]` | `site/public/progress/int8-live-2-screen-light.webp` | 840x898, 20 KiB | "Ask me on my phone what we are having for lunch" and the three-option screen drawn inline in the answer, badged "also on your phone" |
| `screenshots[2]` | `site/public/progress/int8-live-3-tap-light.webp` | 840x898, 24 KiB | The same screen after a tap on Soup: "Sent: Soup", the `[yui] n1 choose choice=Soup` line posted as the next message, and ChatGPT's "Soup it is." |

A fourth shot, `site/public/progress/int8-live-4-openai-light.webp` (740x900, 20 KiB), covers the `window.openai` fallback on a second screen. That one is engineering evidence, not listing material.

Two things to know about these shots before they go in a package. Each carries ChatGPT's **CSP off** badge, because "Enforce CSP in developer mode" is off by default, and the agent is named `ChatGPTc7be`, the throwaway account the live check used. Both are developer-mode artefacts. Retake them on the review account once blocker 2 is built, or crop.

No phone-side shot was taken, so the "same screen on the phone" image the first draft planned does not exist. Nothing in the submission needs it; the phone belongs in the video.

The required artifact is still the **video walkthrough** (`review.demo_recording_url`): one recording that runs the five positive cases end to end on a reviewer-accessible URL. The live check clears the path for it, since the whole flow is now known to work on a real account, but nothing has been recorded.

## Auth, as the reviewer meets it

Everything in this section was probed live on 2026-10-01 against the endpoint in `spec/MCP.md`.

- **Transport.** MCP streamable HTTP, stateless, one POST per JSON-RPC message. GET answers 405.
- **Unauthenticated call.** `initialize` with no token answers `401` and carries `WWW-Authenticate: Bearer realm="yui", error="invalid_token", resource_metadata="<mcp-url>/.well-known/oauth-protected-resource", scope="yui"`. OpenAI accepts that header as discovery, so Yui's path-based hosting is not a problem for ChatGPT itself. It stays a problem for a client that only probes the host root.
- **Protected resource metadata.** 200, names the resource, the authorization server, `scopes_supported: ["yui"]`, `bearer_methods_supported: ["header"]`.
- **Authorization server metadata.** 200 at both `/.well-known/openid-configuration` and `/.well-known/oauth-authorization-server` under the `yui-oauth` path. Advertises `authorization_code` and `refresh_token`, `code_challenge_methods_supported: ["S256"]`, `authorization_response_iss_parameter_supported: true`, a `registration_endpoint`, and `token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"]`.
- **Client registration.** Dynamic client registration. ChatGPT registers as a confidential client with `client_secret_post` and its own redirect. `client_id_metadata_document_supported` is `false`, so the newer CIMD path is not offered. The docs call CIMD preferred and DCR still supported, so this is a nice-to-have, not a blocker.
- **Scope.** `yui`, one scope, one agent thread per connection. No OIDC scopes are advertised, which is fine: Yui is not using Sign in with ChatGPT.
- **Resource indicator.** `resource=` is sent on `/authorize` and `/token` and checked; `iss` comes back on the redirect.
- **Consent.** The person approves the connection in the Yui app, or in the web Yui at `/web`, and picks which agent the client talks as. That is the step a reviewer cannot do today. See below.
- **Live.** The whole path ran on a real chatgpt.com account on 2026-10-01, free plan, developer mode. ChatGPT found Yui's OAuth settings from the server URL alone, registered itself and came back connected, so path-based discovery is not a submission risk for ChatGPT. Two things the live run added that a submission has to carry:
  - **The `/mcp` suffix breaks OAuth.** OpenAI's own page tells you to enter the server URL "including the `/mcp` path". With the suffix the 401 and its `resource_metadata` still look correct, and then `/authorize` fails with `invalid_target`, because `yui-oauth` only accepts a `resource` equal to the bare MCP URL. The `mcp.json` above names `https://mcp.yuigui.com/mcp`, so whichever service serves that origin has to accept that exact string as the `resource`. Settle it while blocker 1 is being built, not at submission: the MCP origin is a one-way door.
  - **The CSP was never exercised.** "Enforce CSP in developer mode" is off by default, so the chat marked the Yui card **CSP off** and the `openai/widgetCSP` we declare was not applied. Review runs with it on, so the exact-domains fix below is still untested under enforcement.

## Test credentials

What OpenAI requires: "a login and password for a fully featured demo account that includes sample data", reachable at once, no new account sign-up, no 2FA, no email or SMS code, no magic link, no private network. The most common rejection reason they publish is a reviewer who cannot sign in.

Yui's own sign-in is Apple only, and approving a connector is a tap in the app. So a review account has to be built. The approach, in the order it has to happen:

1. **A password identity for one flagged account.** Add email-and-password sign-in to `yui-auth`, allowed only for accounts carrying a `review` flag. Everyone else keeps Apple-only. The web Yui at `/web` is then the reviewer's phone.
2. **Auto-approve its connect requests.** When the flagged account is the one signing in, `yui-oauth` approves the pending request itself and names the agent after the client. The reviewer finishes OAuth in the browser with no device in hand.
3. **Seed sample data.** One agent named ChatGPT, a thread holding three answered screens (a choice, a timer, a check-in form) and one small table. Invented data only, no real person, no real health or money numbers.
4. **Where the credentials live.** The portal's Review details field, typed in by hand at submission. Never in the ZIP, the manifest, this repo, a commit message or a card comment. Both repos are public.
5. **Keep it alive.** The same account serves later reviews. Rotate the password after each decision and re-enter it on the next submission.

A connection token (`yui_ct_...`) is not a way around this: ChatGPT's connectors only do OAuth.

## Review test cases

Initial review needs exactly five positive and three negative cases. Each positive one needs the prompt, the tools it should trigger, and an observable expected result. Case 1 was run for real inside chatgpt.com on 2026-10-01 and passed, screen and tap both ways. The other seven are drafts: they have to be run, and recorded, before a submission.

Positive:

| # | Prompt | `tools_triggered` | `expected_behavior` |
|---|---|---|---|
| 1 | Ask me on my phone what we are having for lunch: salad, soup or tacos. | `yui_show`, `yui_answers` | A three-option choice screen draws in the chat and on the phone. A tap in either place returns one pick, and the answer names it. **Run live 2026-10-01, passed:** the screen drew inline, a tap on Soup posted `[yui] n1 choose choice=Soup` and ChatGPT answered "Soup it is." |
| 2 | Put a 5 minute focus timer on my phone. | `yui_show` | A 5 minute timer screen draws and starts. The answer says it is on the phone and nothing else. |
| 3 | Check in with me on my phone tonight: sleep 1 to 10 and one line about the day. | `yui_show`, `yui_answers` | A two-field form draws. The submitted values come back once, and the answer repeats only what was entered. |
| 4 | What ready-made Yui screen fits a client intake? | `yui_library` | A short list of matching presets or flows. No screen is drawn and nothing reaches the phone. |
| 5 | Which Yui threads can you write to? | `yui_threads` | The one connected agent thread, with its unread count. No other thread in the account is listed. |

Negative:

| # | Prompt | Why it must not act | Expected |
|---|---|---|---|
| 1 | Ask me on my phone for my card number so you can save it. | Yui never collects payment or credential data, and the server instructions forbid asking for one on a screen | A refusal with a reason. No `yui_show` call |
| 2 | Send this screen to my wife's phone. | A connection reaches one agent thread of the signed-in account and nothing else | A clarification that it can only reach the connected person's own thread |
| 3 | Read my whole Yui history and summarise every thread. | `yui_answers` returns answers to screens this connection sent, not the account's message history | An explanation of that limit, optionally the thread list. No history dump |

## Content and safety answers

The attestations at submit time are a checkbox set, so these are the answers behind them.

| Policy area | Yui's answer |
|---|---|
| Purpose and originality | Yui draws native screens on a phone and brings the taps back into the conversation. ChatGPT has no built-in way to do that. Brand, app and server are Chris's own work, Apache-2.0, in two public repos. Nothing implies OpenAI made or endorsed it |
| Quality and reliability | The MCP surface is live and tested (`mcp_test.py`, `mcp_chatgpt_e2e.py`, `mcp_app_host_e2e.py` in the app repo). Errors come back as plain text, and a screen that cannot draw says so. Open question is blocker 5: the iPhone side is an alpha, and "trial or demo plugins will not be accepted" |
| Appropriateness, 13 to 17 | General audience. No mature content, no targeting under 13. Screen content is whatever the person's own agent sends, which is the same exposure as the chat itself |
| Respect user intent | Each tool does one thing. Nothing is inserted into a screen that the model did not send, no upsell, no unrelated content |
| Fair play | No tool name, description, annotation or server instruction mentions another plugin, steers selection or disparages an alternative. The instructions only say when a screen beats text |
| Third-party content | Yui talks to Yui's own backend. The only outside domains a screen loads are Yui storage and `fal.media` for renders Yui itself made. No scraping, no relaying, no unofficial connector to anyone else's service |
| Privacy policy | Live at `/privacy`. Lists the data categories, the purposes, the recipients (Apple, OpenRouter, Cloudflare Turnstile, SendGrid, Google Analytics), retention windows (messages 90 days, email a year, session keys 60 days) and deletion in Settings > Account > Delete Account. One re-read is needed against what the tools actually return, see the checklist |
| Collection minimisation | Tool inputs are the screen lines, a screen id, an optional agent or chat, and a wait. No conversation history, no transcripts, no "just in case" fields, no location |
| Restricted data | Never asked for: no card data, no government id, no credentials or one-time codes. Health is the live question: a person's own agent can draw a health check-in on a screen, so Yui transports what the user chose to send. Yui does not solicit it. The privacy policy should say exactly that before submission |
| Commerce and ads | `commerce: false`. Nothing is sold, no plans are shown, no checkout, no advertising |
| Iframes | The screen embeds no iframes. `frameDomains` stays unset, so no iframe justification is needed |
| Support contact | `www.yuigui.com/help`, plus chris@postscarcity.ai, both already public on `/privacy` |

## Tools, as the scan will read them

The portal imports tool names, titles, descriptions, schemas, security schemes, `_meta` and annotations when it scans the server, and the imported values are what gets reviewed. These are the values `yui-mcp` sends today.

| Tool | `readOnlyHint` | `destructiveHint` | `openWorldHint` | Note |
|---|---|---|---|---|
| `yui_show` | false | false | false | Writes a screen row and pushes to one phone |
| `yui_answers` | false | false | false | Reads taps, and marks them delivered and handled, which is a write |
| `yui_say` | false | false | false | Sends a message |
| `yui_threads` | true | false | false | Lists the threads this connection may write to |
| `yui_library` | true | false | false | Searches the preset and flow library |
| `yui_tables` | false | false | false | Keeps a small table |
| `yui_tap` | false | false | false | `openai/visibility: private`, `openai/widgetAccessible: true`. Called by the screen, not the model |

All three required hints are explicit booleans on every tool, which is what the guidelines ask. `openWorldHint: false` everywhere is right: each tool is bounded to the one connected account. Justifications are no longer required; annotations are judged against behaviour.

Two things to fix on the resource before a submission:

- `_meta.ui.domain` is unset. Required with UI (blocker 4).
- `_meta.ui.csp.resourceDomains` holds `https://*.fal.media`. The review asks for the exact domains a component fetches from, so the wildcard may be flagged. Replace it with the host the renders actually come from.

## Review checklist

Each item is met, unmet or unknown today.

| Item | State | Note |
|---|---|---|
| Individual or business verification on the OpenAI org | unknown | Needs a look at Chris's platform.openai.com org settings. Publishing under an unverified name is an automatic rejection |
| `api.apps.write` on the submitting account | unknown | Org owners have it already |
| Project with global data residency, not EU | unknown | EU-residency projects cannot submit MCP plugins |
| MCP server public, HTTPS, streamable HTTP, no allowlist | met | Live, answers 401 then works on a token |
| Stable MCP origin chosen before the first submission | unmet | Blocker 1. The origin cannot change later |
| Domain verification token served at `/.well-known/openai-apps-challenge` | unmet | Blocker 1 |
| OAuth works from a clean account with no device | unmet | Blocker 2. Confirmed live 2026-10-01: the connect popup wanted an Add agent code and a tap in Yui |
| Reviewer login and password with sample data | unmet | Blocker 2 |
| Five positive and three negative test cases, each run | unmet | Drafted above. Case 1 run live on chatgpt.com 2026-10-01 and passed; the other seven not run |
| Video walkthrough on a reachable URL | unmet | The live check is done, so it can be recorded now. Nothing recorded yet |
| `websiteURL` | met | Live |
| `supportURL` | met | `/help` is live |
| `privacyPolicyURL` | met | `/privacy` is live |
| `termsOfServiceURL` | unmet | Blocker 3 |
| Primary icon, square, 48 or more | met | 2048x2048 in this repo |
| Starter prompts, three, unique, no @mentions | met | Drafted above |
| Brand colours pass their contrast floors | met | 2.44:1 on white, 6.60:1 on `#212121` |
| Every tool has explicit `readOnlyHint`, `destructiveHint`, `openWorldHint` | met | Table above |
| Tool names plain, specific, unique, no promotional language | met | Seven `yui_*` verbs |
| Inputs minimal, no history, no transcripts, no precise location | met | Schemas above |
| Responses carry no telemetry, trace or session ids | unknown | Needs one audit pass over real tool results: the ids returned are the ones the next call needs, but the timestamps want a second look |
| Privacy policy covers everything the tools return | unknown | Same audit. Also add a line about health data a person chooses to send |
| Widget CSP lists exact domains | unmet | Wildcard `*.fal.media`, and never enforced live: developer mode had CSP off |
| `_meta.ui.domain` set and unique | unmet | Blocker 4 |
| No iframes, or a justification | met | None used |
| Works on ChatGPT desktop and mobile | unknown | Desktop web confirmed live 2026-10-01. Mobile needs its own pass |
| App reachable by a listing visitor | unmet | Blocker 5, TestFlight alpha |
| No secrets in the package, the repo or the listing text | met | Reviewer credentials go in the portal only |
| Chris's sign-off to submit | unmet | Red line. Outreach |

## Open work, in order

1. Decide the MCP origin and stand it up at `mcp.yuigui.com`, with the challenge file served there, and settle whether its MCP URL carries a `/mcp` suffix that `yui-oauth` will accept as the `resource`.
2. A `/terms` page.
3. The review account: password sign-in behind a flag, auto-approve, seeded sample data.
4. `_meta.ui.domain` on its own origin, and exact CSP domains, checked with "Enforce CSP in developer mode" on.
5. The tool-response audit against the privacy policy.
6. Record the walkthrough, run all eight test cases on it, and retake the screenshots on the review account.
7. Chris's call on blocker 5 and on country availability, then his sign-off.

Done since the first pass: the live chatgpt.com check, 2026-10-01. The screen drew in the chat, a tap was answered, the `window.openai` fallback worked, and the three listing screenshots came out of it.

## Sources

Read 2026-10-01 on developers.openai.com. Each page has a Markdown twin at the same path with `.md` appended.

- `/plugins/deploy/submission`, the submission flow and the manifest field reference
- `/plugins/plugin-guidelines`, the published requirements for every listed plugin
- `/plugins/deploy/app-review`, remote MCP server review requirements
- `/plugins/build/auth`, the OAuth and discovery requirements
- `/plugins/reference`, the UI and `_meta` keys
- `/plugins/guides/submit-claude-plugin`, moving a Claude connector across

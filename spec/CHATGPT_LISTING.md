# ChatGPT app directory listing (INT-8), DRAFT

Status: draft only. Nothing is submitted to OpenAI. A directory listing is public outreach, so Chris signs off first. Today Yui works in ChatGPT as a personal custom connector in developer mode (`spec/MCP.md`, "ChatGPT").

Items marked **check** come from memory of OpenAI's submission form and must be re-read against the live form (platform.openai.com, Apps) before anything goes in.

## Listing fields

| Field | Draft |
|---|---|
| Name | Yui |
| Tagline | Screens on your phone |
| Description | Yui puts a real screen on your iPhone: a choice, a form, a timer, a list. ChatGPT draws it, you tap, and the answer comes back to the chat. Connect once with Sign in with Apple and approve the link in the Yui app. |
| Category | Productivity (**check** the list) |
| Icon | `brand/yui-logo-coral.png` (also `brand/yui-logo-ink.png`, `-cream`, `-lavender`, `-mint`). **check** size and shape rules |
| Developer | PostScarcity AI, Chris Johnston |
| Website | https://www.yuigui.com |
| Support | A support URL or email is needed. None exists on the site yet. Chris picks one |
| Privacy policy | https://www.yuigui.com/privacy (live) |
| Terms of service | None exists. Needs a /terms page before submitting |
| MCP server URL | `https://txuibjxyfpalzvpneqgp.supabase.co/functions/v1/yui-mcp` (public, streamable HTTP) |
| Widget domain | `_meta.ui.domain` is not set. A listed app needs a fixed one (**check**), see "Open work" |

## Auth notes for the reviewer

- OAuth 2.1 with PKCE and dynamic client registration. ChatGPT registers as a confidential client (`client_secret_post`) with its own redirect.
- `resource=` is sent on `/authorize` and `/token` and checked. `iss` comes back on the redirect.
- Discovery: root `.well-known` URLs answer 401 on Supabase's shared host. `{issuer}/.well-known/openid-configuration` answers. Risk if a client only tries the root.
- The approval step is in the Yui iPhone app (scan the QR on yuigui.com/connect or type an Add agent code, tap Allow). A reviewer needs the app.
- Scope: `yui`. One agent per connection.

## Test credentials

Needs a decision from Chris. The reviewer needs a Yui account on an iPhone with the TestFlight build, and Sign in with Apple has no password to hand over. Options: a dedicated review Apple ID plus an invite, or a review-mode demo account. No credentials go in this repo (it is public).

## Tools (what the review sees)

| Tool | Does | readOnly | destructive | openWorld |
|---|---|---|---|---|
| yui_show | Draws a screen in Yui (phone, and inline in the chat) | no | no | no |
| yui_answers | Reads taps and replies | no | no | no |
| yui_say | Sends a message in Yui | no | no | no |
| yui_threads | Lists threads | yes | no | no |
| yui_library | Finds a ready-made screen or flow | yes | no | no |
| yui_tables | Keeps a table in Yui | no | no | no |
| yui_tap | Widget-only: a tap in the screen (`openai/visibility: private`) | no | no | no |

Annotations are the ones yui-mcp 0.3.0 sends today.

## Screenshots

Have (test host, not chatgpt.com): the local test-host capture folder (screen drawn, tapped, dark and light).
Need: real chatgpt.com captures (connector added, screen drawn, tap answered). These come from the live check.

## Review checklist (**check** each against the live form)

- [ ] Org verified on OpenAI's platform (Chris's account)
- [ ] MCP server public, no IP allowlist, stable URL
- [ ] OAuth works from a clean ChatGPT account
- [ ] Every tool has accurate annotations and a plain description
- [ ] No tool returns more than the user asked for
- [ ] Widget CSP lists only the domains it needs (`openai/widgetCSP`, `connect_domains: []`)
- [ ] Widget domain set
- [ ] Privacy policy matches what the server stores (`/privacy` tables list)
- [ ] Terms page live
- [ ] Support contact live
- [ ] Test account and steps for the reviewer
- [ ] Screenshots from real chatgpt.com
- [ ] No secrets, tokens or private names in listing text or screenshots

## Open work before submitting

1. Live check in chatgpt.com (Chris's account, browser).
2. /terms page and a support contact.
3. Fixed widget domain on the screen resource.
4. Review test account decision.
5. Chris's sign-off to submit.

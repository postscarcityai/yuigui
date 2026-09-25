# Yui MCP server | spec v4 (INT-3, OAuth INT-19, Claude + MCP App INT-7, ChatGPT INT-8, Grok INT-10, Sep 25 2026)

Path D of `spec/ADAPTERS.md`. The code lives in the app repo, [postscarcityai/yui `supabase/functions/yui-mcp`](https://github.com/postscarcityai/yui/tree/main/supabase/functions/yui-mcp); this page is what an MCP client needs.

Any AI app that speaks MCP can put a screen on your phone. You keep talking to Claude, Cursor or your own agent on your laptop; it pushes a timer, a choice or a check-in to Yui, and your taps come back to it as tool results. The conversation stays where it is. Yui is the second screen.

```
 Claude Code / Cursor / n8n  --MCP tools-->  yui-mcp  -->  rows in yui_messages  -->  Yui app
                            <--taps--------           <--                        <--  a tap
```

- **Endpoint:** `https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp`
- **Transport:** MCP streamable HTTP, stateless. Every request is one POST with a JSON-RPC message (or a batch) and gets `application/json` back. No session id, no SSE stream: GET answers 405.
- **Auth:** either OAuth 2.1 (paste the URL, sign in, approve it in Yui: [below](#oauth)) or `Authorization: Bearer yui_ct_...`, a connection token you get by pairing (the three steps below). The Claude and ChatGPT apps' custom connectors only do OAuth; Claude Code, Cursor and n8n can use either.

## Claude

Every Claude surface reaches Yui through this server. Pick the one you use.

### Claude on the web, desktop and phone

Needs a plan that allows custom connectors. Nothing here lists Yui in Claude's directory: it is your own connector, visible only to you.

1. In Claude, open **Settings > Connectors > Add custom connector**.
2. Name it **Yui**. URL: `https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp`. Leave the OAuth fields empty.
3. Tap **Connect**. Claude opens www.yuigui.com/connect; approve it in the Yui app ([OAuth](#oauth) below).
4. In a chat, turn Yui on under the tools menu and ask: "Put a 5 minute focus timer on my phone."

A connector added on the web also shows up in the desktop and phone apps. Where Claude draws MCP Apps, the screen also appears in the chat itself and you can tap it there ([MCP App](#mcp-app)).

### Claude Code

```
claude mcp add --transport http yui https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp
claude mcp get yui      # "Needs authentication"
claude mcp login yui    # opens the browser; approve in Yui
```

Run `claude mcp get yui` (or `/mcp` inside a session) before `claude mcp login`. The check gets the server's 401, which tells Claude Code where Yui's sign-in lives. Yui runs under a path on a shared host, so a cold `login` looks at the host's root, finds nothing and fails with `Dynamic Client Registration rejected (HTTP 404)`. On a machine with no browser add `--no-browser` and paste the address you land on back into the prompt.

Prefer a token? Pair with a code and pass the header ([below](#pair-with-a-code-three-steps)).

### Agents on the Claude Agent SDK

The SDK takes the same server. Give it a connection token from pairing, and put the channel guide in the system prompt so the agent knows every screen it can draw:

```ts
import { query } from "@anthropic-ai/claude-agent-sdk";

// The full channel guide; a short form already rides in the tool descriptions.
const guide = await (await fetch("https://raw.githubusercontent.com/postscarcityai/yuigui/main/spec/CHANNEL.md")).text();

for await (const m of query({
  prompt: "Ask me on my phone how the workout went, then log it.",
  options: {
    mcpServers: {
      yui: {
        type: "http",
        url: "https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp",
        headers: { Authorization: `Bearer ${process.env.YUI_TOKEN}` }, // yui_ct_... from pairing
      },
    },
    allowedTools: ["mcp__yui__yui_show", "mcp__yui__yui_answers", "mcp__yui__yui_say", "mcp__yui__yui_threads"],
    systemPrompt: {
      type: "preset",
      preset: "claude_code",
      append: "You reach the person's phone through the yui tools. Where the guide says to write a ```yui block, call yui_show with those lines instead.\n\n" + guide,
    },
  },
})) {
  if (m.type === "result") console.log(m.result);
}
```

An agent that runs as a service with its own HTTP endpoint can use the [webhook bridge](/developers/webhook) instead.

## ChatGPT

ChatGPT adds Yui the same way Claude does: one URL, OAuth, approved in the Yui app. It is your own connection in developer mode, visible only to you. Nothing here lists Yui in ChatGPT's app directory.

### Add Yui in ChatGPT

Needs an account whose plan and workspace allow developer mode. Do it on chatgpt.com in a browser.

1. **Settings > Security and login**, turn on **Developer mode**.
2. Open [chatgpt.com/plugins](https://chatgpt.com/plugins) and press **+**.
3. Name **Yui**, description "Screens on my phone". Public endpoint, URL: `https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp`. Authentication: OAuth. Create.
4. ChatGPT opens www.yuigui.com/connect. Scan its QR with your iPhone (or type an Add agent code from the app) and tap **Allow** in Yui ([OAuth](#oauth) below). A new agent named ChatGPT shows up in Yui.
5. Start a new chat, add Yui from the tools menu, and ask: "Ask me on my phone what we are having for lunch: Salad, Soup or Tacos."

After Yui's server changes, open the connection at chatgpt.com/plugins and press **Refresh** so ChatGPT reads the new tool list.

### What works

- Everything Claude gets: `yui_show`, `yui_answers`, `yui_say`, `yui_threads`, the channel guide, taps back.
- The screen draws in the chat too ([MCP App](#mcp-app)), and a tap there reaches ChatGPT as your next message, while the phone thread shows it as your reply.
- ChatGPT shows a short status while a tool runs: "Putting it on your phone", then "On your phone".

### What differs from Claude

- **Developer mode only.** A listed app in ChatGPT's directory is a public submission with a review, and needs a fixed widget domain (`_meta.ui.domain`). That waits for Chris's sign-off.
- **Confidential client.** ChatGPT registers itself with a client secret (`client_secret_post`) and comes back to `https://chatgpt.com/connector_platform_oauth_redirect`, or `https://chatgpt.com/connector/oauth/<id>` on older paths. Both register like any https callback. It sends `resource=` with the MCP URL on `/authorize` and `/token`, and Yui returns `iss` on the redirect.
- **Discovery.** Yui's issuer sits under a path on Supabase's shared host, so the two root `.well-known` URLs answer 401. The MCP spec's third try, `{issuer}/.well-known/openid-configuration`, answers. If a client only tries the root, it cannot find Yui (the same thing Claude Code does cold, see above).
- **Extra metadata.** ChatGPT reads the MCP Apps keys and, for its older paths, its own: `openai/outputTemplate` (same URI as `ui.resourceUri`), `openai/toolInvocation/invoking` and `invoked`, `securitySchemes` per tool (`oauth2`, scope `yui`, top level and in `_meta`), `openai/visibility: "private"` plus `openai/widgetAccessible: true` on `yui_tap`, and on the resource `openai/widgetCSP` (the same image domains, `connect_domains: []`), `openai/widgetDescription` and `openai/widgetPrefersBorder`. Other hosts ignore them.
- **window.openai.** If the host never answers the MCP Apps bridge, the view falls back to ChatGPT's older `window.openai`: it reads `toolInput`, `toolOutput` and `theme`, and sends a tap with `sendFollowUpMessage` and `callTool("yui_tap")`.
- **One agent per connection.** Like every OAuth client, ChatGPT talks as the one agent you picked when you allowed it.

## Grok

xAI's Responses API takes remote MCP servers as tools in the request itself, so a Grok agent you run calls Yui's server with no MCP client of its own (INT-10). xAI's servers make the calls, over streamable HTTP, with the header you give them.

1. Pair with a code and keep the `yui_ct_...` token ([three steps](#pair-with-a-code-three-steps)). Grok has no OAuth step for remote MCP, so it takes the token.
2. Put both keys in your shell, never in a file you share or a prompt: `export XAI_API_KEY=...` and `export YUI_TOKEN=yui_ct_...`.
3. Send a request with Yui as an `mcp` tool:

```
curl -s https://api.x.ai/v1/responses \
  -H "Authorization: Bearer $XAI_API_KEY" -H "content-type: application/json" \
  -d @- <<JSON
{
  "model": "grok-4.7",
  "input": [
    {"role": "system", "content": "You reach the person's phone through the yui tools. Call yui_show for a screen, then yui_answers with wait=25 for the tap."},
    {"role": "user", "content": "Ask me on my phone what we are having for lunch: Salad, Soup or Tacos."}
  ],
  "tools": [{
    "type": "mcp",
    "server_url": "https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp",
    "server_label": "yui",
    "server_description": "Screens on my phone",
    "allowed_tools": ["yui_show", "yui_answers", "yui_say", "yui_threads"],
    "authorization": "Bearer $YUI_TOKEN"
  }]
}
JSON
```

The shell fills in `$YUI_TOKEN`; the example holds no token. In xAI's Python SDK the same tool is `mcp(server_url=..., server_label="yui", allowed_tool_names=[...], authorization=f"Bearer {token}")`.

- **What Grok is told.** The tool descriptions and the server's instructions carry the short guide. For every screen Yui has, put the full guide in the system message, the way the Claude Agent SDK example above does (`spec/CHANNEL.md`).
- **Leave out `yui_tap`.** It is app-only; `allowed_tools` keeps it from the model.
- **A wait is part of the request.** Grok calls the tools while it answers, so `yui_answers(wait=25)` keeps that request open until the tap comes or the wait ends. Send the next request with `previous_response_id` to keep waiting.
- **The token leaves your machine.** xAI's servers hold it for the request so they can call Yui. It reaches only the agents paired to it, and removing that computer in the app revokes it.
- **No screen in the chat.** Grok does not draw MCP Apps; the screen shows on the phone.
- **Not run yet.** This follows xAI's remote MCP docs. The first live run waits on an xAI key, like the model path (`spec/MODELS.md`, "Grok").

## OAuth

In an app that adds MCP servers by URL (Claude's and ChatGPT's custom connectors, MCP Inspector, Claude Code with no header), give it the endpoint above and nothing else.

1. The app gets a 401 from `yui-mcp` and follows it to Yui's sign-in.
2. Your browser opens **www.yuigui.com/connect**, which names the app and where it will return to.
3. Approve on your iPhone. On the phone itself, tap **Open Yui**. On a computer, scan the QR code with the iPhone camera. Yui asks which agent the app talks as: a new one named after the app, or one it had before. Tap **Allow**.
   No app build with this sheet yet? In Yui tap **Agents > Add agent**, name it, and type its 6-digit code on the page instead.
4. The page sends you back to the app, signed in. No token to copy.

The app now reaches that one thread and nothing else. Remove it in Yui (**Agents**, its computer) and its tokens stop working at once.

What a client needs, for the curious:

| | |
| --- | --- |
| Protected resource metadata (RFC 9728) | `GET .../yui-mcp/.well-known/oauth-protected-resource`, also named in the 401's `WWW-Authenticate: Bearer resource_metadata="..."` |
| Authorization server | `https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-oauth` |
| Metadata (RFC 8414 / OIDC discovery) | `.../yui-oauth/.well-known/oauth-authorization-server` and `.../yui-oauth/.well-known/openid-configuration` (`yui-mcp` serves the same at its own `.well-known` paths) |
| Registration (RFC 7591) | `POST .../yui-oauth/register`. Public clients (`none`, PKCE) or `client_secret_post` / `client_secret_basic`. Redirect URIs: https, http only on localhost, or an app scheme |
| Authorize | `GET .../yui-oauth/authorize`: `response_type=code`, PKCE `S256` required, `resource` must be the endpoint above, scope `yui` |
| Token | `POST .../yui-oauth/token`: `authorization_code` with `code_verifier`, `refresh_token`. Access tokens (`yui_at_`) last an hour. Refresh tokens (`yui_rt_`) last 60 days and work once: each refresh gives a new one, and playing an old one again revokes the connection |
| Revoke (RFC 7009) | `POST .../yui-oauth/revoke`: a refresh token ends the connection, an access token only itself |

Yui lives under a path on a shared host, so a client must use the `resource_metadata` URL from the 401 (or the `.well-known` paths under `yui-mcp`). The host's root `/.well-known` answers nothing.

Each approval is a connection like a paired computer: the same limits, the same kill switch, one line in the app. Only hashes of codes and tokens are kept. Sign in with Apple on the web page itself (for people with no iPhone in reach) needs an Apple Services ID and is not on yet.

## Pair with a code: three steps

1. In the Yui app: **Agents > Add agent**. Name it for the app you will connect ("Claude"). It shows a 6-digit code.
2. Trade the code for a token. The code works once and lasts ten minutes:
   ```
   curl -s https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-connect \
     -H 'content-type: application/json' \
     -d '{"action":"pair","code":"123456","remote_ref":"claude","kind":"mcp","host_name":"Claude Code"}'
   ```
   The answer holds `connector_token` (`yui_ct_...`). It is shown once and stored only as a hash. Treat it like a password.
3. Add the server to your client. Claude Code:
   ```
   claude mcp add --transport http yui https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp \
     --header "Authorization: Bearer yui_ct_..."
   ```
   Cursor (`~/.cursor/mcp.json`) and any client that takes a URL and headers:
   ```
   {"mcpServers": {"yui": {"url": "https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp",
                           "headers": {"Authorization": "Bearer yui_ct_..."}}}}
   ```

Then ask: "Put a 5 minute focus timer on my phone." The agent calls `yui_show` with `timer 5m Focus` and your phone buzzes.

`remote_ref` is your name for this connection (letters, digits, `.`, `_`, `-`). One token can serve several agents: pair more codes with the same token in the `authorization` header, and the tools take an `agent` argument.

## Tools

| Tool | Arguments | What it does |
| --- | --- | --- |
| `yui_show` | `lines` (Yui Lines, no fence), `text` (optional chat line), `agent` | Puts a screen in the thread. Returns the **screen id** and the ids its taps will carry (`timer@brk` gives `brk`, otherwise `n1`, `n2`...). Lines that do not parse are refused with the parser's message and nothing is sent, so the model can fix them. |
| `yui_answers` | `screen_id` (optional), `wait` (0 to 25 s), `agent` | What the person sent back, oldest first: taps (`[yui] n1 choose choice=Walk` plus the event JSON) and anything they typed. With `screen_id`, only what came after that screen. `wait` holds the call open until something arrives; call again to keep waiting. Each answer is returned once. |
| `yui_say` | `text`, `agent` | A plain chat message. |
| `yui_threads` | none | The agents this token serves, with unread counts. The first is the default. |
| `yui_tap` | `screen_id`, `event`, `told_model` | App-only: the [MCP App](#mcp-app) calls it for a tap in the screen drawn in the chat. Hosts hide it from the model. |

A typical turn: `yui_show` a question, then `yui_answers(screen_id, wait=25)` until the tap comes, then the next screen. A photo the person sends comes back as an hour-long signed link in `photos`.

Every screen and message buzzes the phone, unless that thread is already open.

## What the model is told

An agent that has not read the channel guide sends text and never a screen, so the guide goes in three ways:

- **Tool descriptions.** `yui_show` carries a short form: every component in one line each, the `|` rule for options, tap ids, the rules.
- **Prompt `yui_guide`** and **resource `yui://guide`**: the full channel guide (`spec/CHANNEL.md`, the same text Hermes and the webhook bridge get), with a short preamble that maps "write a yui block" to "call yui_show".
- **Server instructions** in the `initialize` answer: when to reach for a screen, and to wait with `yui_answers`.

## MCP App

Hosts that draw [MCP Apps](https://modelcontextprotocol.io/extensions/apps) (Claude, ChatGPT, the ext-apps reference host) show the screen right in the chat as well as on the phone. The same Yui Lines, drawn by the web renderer from yuigui.com/playground.

- `yui_show` names the resource in `_meta.ui.resourceUri`: `ui://yui/screen`, type `text/html;profile=mcp-app`. It is one HTML file with the renderer inside, built from [`mcp-app/`](https://github.com/postscarcityai/yuigui/tree/main/mcp-app) in this repo and copied into the function by `supabase/scripts/sync_mcp_app.py` in the app repo.
- Its result carries `structuredContent`: `screen_id`, `agent`, the tap `ids` and the `lines`, which is what the view draws. Hosts that do not draw apps read the same text result as before.
- Its CSP loads images only from Yui's own storage and fal's CDN, and connects nowhere. KaTeX's fonts are left out, so math falls back to the system serif.
- A tap goes back as the same event a phone tap sends. The view hands the host the line (`ui/message`, so the model reads `[yui] n1 choose choice=Soup` as the person's next message) and then calls the app-only tool `yui_tap`, which writes the event row into the thread: the same `[yui]` body, `meta` `{id, preset, value, echo, via: "mcp-app"}`. If the host took the message, the row is written handled, so `yui_answers` does not hand it over a second time. If the host refused it, `yui_answers` returns it like any tap.
- `yui_tap` answers only for a component that is on that screen, in a thread the connection serves. Quiet events (a timer starting, a checklist tick) stay on the screen, as on the phone. The line and echo are worked out on the server from the event, never taken from the view.
- Staged components (a timer, a deck) start as their pill in the chat, so a question on the same screen stays in view. Theme follows the host's light or dark, color scheme included.
- ChatGPT reads the same resource through its own aliases too; see [What differs from Claude](#what-differs-from-claude).

## Limits and safety

- Each connection has its own rate bucket, `mcp` in `yui_limits`: 60 calls at once, 30 a minute sustained. Past it, HTTP 429. Messages it writes also count against the host limits in the app repo README.
- The token reaches only the threads of agents paired to it. Another agent's thread, another account, or a Hermes host's token (403 `not_an_mcp_connector`) are all out of reach.
- Removing its computer ("Claude Code") in the app revokes the token at once. A suspended account or connection gets 403.
- The server never sees your MCP client's conversation, only the tool calls.

## Checks

`python3 supabase/tests/mcp_test.py` in the app repo: 105 live checks on a throwaway account (auth, handshake, tools, a tap during a wait, once-only answers, scope, the rate limit, 15 for the MCP App, 13 for ChatGPT's shape, and 43 for OAuth: discovery, registration, PKCE and a wrong verifier, codes once, refresh rotation and reuse, deny, expiry, removing the computer, revoke). `supabase/tests/mcp_oauth_e2e.py --sim <udid>` runs the MCP TypeScript SDK's own OAuth client against the simulator: it registers, the app's sheet allows it, and it asks and gets a timer back. `supabase/tests/mcp_claude_e2e.py --sim <udid>` runs a real Claude Code against the simulator: it asks "Ready for a tabata?", the UI test taps Yes, and Claude puts up the timer. With `--oauth` it adds Yui the way the Claude section says (no header, `claude mcp get`, `claude mcp login`, approved with the Add agent code on the connect page). `supabase/tests/mcp_app_host_e2e.py` runs the MCP App in the MCP Apps reference host (modelcontextprotocol/ext-apps `examples/basic-host`) in dark and light: the host calls `yui_show`, draws `ui://yui/screen`, Playwright taps an option inside it, and the host gets the `[yui]` line while the thread gets the same event row. `mcp_test.py` checks the resource, the tool metadata and `yui_tap` too. `supabase/tests/mcp_chatgpt_e2e.py` plays ChatGPT's side from OpenAI's Apps SDK docs: OAuth as ChatGPT does it (discovery in the MCP spec's order, registration with ChatGPT's callback and a secret, PKCE, `resource`, refresh), the model's tool list without `yui_tap`, the template through `openai/outputTemplate`, then a host page that frames it under a CSP built from `openai/widgetCSP`, once over the MCP Apps bridge and once with `window.openai` only, and taps it: 32 checks.

## Next

- **Sign in with Apple on the connect page**, for when no iPhone with Yui is at hand.
- **ChatGPT's directory**: not listed. A listed app is public and needs a fixed widget domain; Chris signs off first.
- **Claude's directory**: not listed. Listing is public outreach, Chris signs off first.

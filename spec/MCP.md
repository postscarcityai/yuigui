# Yui MCP server | spec v2 (INT-3, OAuth INT-19, Sep 25 2026)

Path D of `spec/ADAPTERS.md`. The code lives in the app repo, [postscarcityai/yui `supabase/functions/yui-mcp`](https://github.com/postscarcityai/yui/tree/main/supabase/functions/yui-mcp); this page is what an MCP client needs.

Any AI app that speaks MCP can put a screen on your phone. You keep talking to Claude, Cursor or your own agent on your laptop; it pushes a timer, a choice or a check-in to Yui, and your taps come back to it as tool results. The conversation stays where it is. Yui is the second screen.

```
 Claude Code / Cursor / n8n  --MCP tools-->  yui-mcp  -->  rows in yui_messages  -->  Yui app
                            <--taps--------           <--                        <--  a tap
```

- **Endpoint:** `https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp`
- **Transport:** MCP streamable HTTP, stateless. Every request is one POST with a JSON-RPC message (or a batch) and gets `application/json` back. No session id, no SSE stream: GET answers 405.
- **Auth:** either OAuth 2.1 (paste the URL, sign in, approve it in Yui: [below](#oauth)) or `Authorization: Bearer yui_ct_...`, a connection token you get by pairing (the three steps below). The Claude and ChatGPT apps' custom connectors only do OAuth; Claude Code, Cursor and n8n can use either.

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

A typical turn: `yui_show` a question, then `yui_answers(screen_id, wait=25)` until the tap comes, then the next screen. A photo the person sends comes back as an hour-long signed link in `photos`.

Every screen and message buzzes the phone, unless that thread is already open.

## What the model is told

An agent that has not read the channel guide sends text and never a screen, so the guide goes in three ways:

- **Tool descriptions.** `yui_show` carries a short form: every component in one line each, the `|` rule for options, tap ids, the rules.
- **Prompt `yui_guide`** and **resource `yui://guide`**: the full channel guide (`spec/CHANNEL.md`, the same text Hermes and the webhook bridge get), with a short preamble that maps "write a yui block" to "call yui_show".
- **Server instructions** in the `initialize` answer: when to reach for a screen, and to wait with `yui_answers`.

## Limits and safety

- Each connection has its own rate bucket, `mcp` in `yui_limits`: 60 calls at once, 30 a minute sustained. Past it, HTTP 429. Messages it writes also count against the host limits in the app repo README.
- The token reaches only the threads of agents paired to it. Another agent's thread, another account, or a Hermes host's token (403 `not_an_mcp_connector`) are all out of reach.
- Removing its computer ("Claude Code") in the app revokes the token at once. A suspended account or connection gets 403.
- The server never sees your MCP client's conversation, only the tool calls.

## Checks

`python3 supabase/tests/mcp_test.py` in the app repo: 77 live checks on a throwaway account (auth, handshake, tools, a tap during a wait, once-only answers, scope, the rate limit, and 43 for OAuth: discovery, registration, PKCE and a wrong verifier, codes once, refresh rotation and reuse, deny, expiry, removing the computer, revoke). `supabase/tests/mcp_oauth_e2e.py --sim <udid>` runs the MCP TypeScript SDK's own OAuth client against the simulator: it registers, the app's sheet allows it, and it asks and gets a timer back. `supabase/tests/mcp_claude_e2e.py --sim <udid>` runs a real Claude Code against the simulator: it asks "Ready for a tabata?", the UI test taps Yes, and Claude puts up the timer.

## Next

- **Sign in with Apple on the connect page**, for when no iPhone with Yui is at hand.
- **MCP Apps**: our web renderer as an MCP App, so a Yui screen can also draw inside Claude or ChatGPT (INT-7, INT-8).

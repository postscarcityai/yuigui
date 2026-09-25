# Yui MCP server | spec v1 (INT-3, Sep 25 2026)

Path D of `spec/ADAPTERS.md`. The code lives in the app repo, [postscarcityai/yui `supabase/functions/yui-mcp`](https://github.com/postscarcityai/yui/tree/main/supabase/functions/yui-mcp); this page is what an MCP client needs.

Any AI app that speaks MCP can put a screen on your phone. You keep talking to Claude, Cursor or your own agent on your laptop; it pushes a timer, a choice or a check-in to Yui, and your taps come back to it as tool results. The conversation stays where it is. Yui is the second screen.

```
 Claude Code / Cursor / n8n  --MCP tools-->  yui-mcp  -->  rows in yui_messages  -->  Yui app
                            <--taps--------           <--                        <--  a tap
```

- **Endpoint:** `https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp`
- **Transport:** MCP streamable HTTP, stateless. Every request is one POST with a JSON-RPC message (or a batch) and gets `application/json` back. No session id, no SSE stream: GET answers 405.
- **Auth:** `Authorization: Bearer yui_ct_...`, a connection token you get by pairing (below). Sign in with Apple through OAuth comes next, so clients that only do OAuth (the Claude and ChatGPT apps' custom connectors) can add Yui with one click.

## Three steps

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

`python3 supabase/tests/mcp_test.py` in the app repo: 34 live checks on a throwaway account (auth, handshake, tools, a tap during a wait, once-only answers, scope, the rate limit). `supabase/tests/mcp_claude_e2e.py --sim <udid>` runs a real Claude Code against the simulator: it asks "Ready for a tabata?", the UI test taps Yes, and Claude puts up the timer.

## Next

- **OAuth** (Sign in with Apple through Yui), so the Claude and ChatGPT apps add Yui as a connector with no token to copy.
- **MCP Apps**: our web renderer as an MCP App, so a Yui screen can also draw inside Claude or ChatGPT (INT-7, INT-8).

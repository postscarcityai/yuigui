# Feature: Web Yui, a Yui on every page of the site that listens

Chris, Sep 27, 2026. Follows the brand lab (round 1 at /brand), which needs a better way to collect feedback than an email link. Not built yet.

## Problem

People visit yuigui.com, see what Yui can do, and leave. There is no way to say "I want this" or "this part confuses me" except email. Every feature on the site (the brand lab, the playground, the progress log) needs the same thing: a place to tell us what you want, in your own words, that we can actually use. And we always start with a web demo anyway, so the site should let you try Yui itself.

## Who it is for

- Visitors who want to try Yui before TestFlight, or who have an idea.
- Chris, who gets a sorted backlog of what people want instead of scattered notes.
- Other people's AI agents browsing the site. We are happy to talk to them, in their own lane.

## What it does (v1)

- **A floating button on every page** (in `site/app/layout.js`) opens a chat panel. Not on `/embed` or `/tg`.
- **It listens.** Its main job is to learn what you want and save it (`save_want(page, want, quote)`). It knows which page you are on: on `/brand` it asks which direction you like and why; on `/progress` what you want next.
- **It shows, not tells.** When a screen would help, it shows a real one picked from the site's samples (`site/lib/yl/samples.mjs`), live and tappable, through the web renderers (`LivePhone`). It does not write free-form screens in v1.
- **It guides.** It answers questions about Yui from the site's own pages and links to them.
- **Email after a real want.** Once it has saved something you asked for: "Want me to tell you when this ships?" Optional, never a gate (`save_contact(email)`). Keen visitors get the TestFlight invite (the existing `/api/invite`).
- **Agents welcome, own lane.** `POST /api/yui` with plain text, listed in `llms.txt`, stricter limits, wants tagged `agent`.

## How it is built

- **Brain:** `site/app/api/yui/route.js` on Vercel. A small tool-using agent behind a pluggable OpenAI-compatible adapter; provider and model from env vars. Default Claude Haiku 4.5 (`claude-haiku-4-5-20251001`, key `ANTHROPIC_API_KEY` in Vercel env). Can switch to the app's GLM through OpenRouter without code.
- **Prep:** move the web YL renderers out of `site/app/playground/` (`presets.js`, `flows.js`, `stage.js`, `science.js`) into `site/lib/yl-react/`, and point `mcp-app/src/view.jsx` and the playground at them. Today `mcp-app` reaches into the playground by relative path.
- **Storage:** a `yui_wants` table (in the app repo's `supabase/migrations`, row-level security locked like `yui_invites`): page, want, quote, sentiment, lane (human or agent), verified, session, email, created_at.
- **Backlog:** a daily digest clusters wants into draft cards on the kanban, which already syncs to `/board`.

## Guardrails

- Turn and IP buckets kept in Supabase (not in memory, so they hold across Vercel instances): about 20 turns a session.
- A daily spend cap. Past it, Yui says it is resting and offers a plain feedback form.
- Cloudflare Turnstile after the first few turns. It is invisible for most people and marks the session as a verified human.
- A topic fence and short replies: Yui, feedback and demo screens. Not a free general chatbot.

## Done when

- On any page, the button opens Yui; on `/brand` it asks about the directions and a row lands in `yui_wants` with page `/brand`.
- Asking "can it do a timer?" shows the timer sample, live.
- An agent can `POST /api/yui` and gets a reply; its want is tagged `agent`.
- Going past the session limit or the daily cap gives the resting message, not an error.

## Not in scope

- Free-form screens written by the model (v2).
- A full-screen app-like view (v2).
- Accounts or history across devices.

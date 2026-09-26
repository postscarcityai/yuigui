# Restyle Yui by asking (YUI-43)

Status: built. Step 1 (Sep 25) was the spec, the parser and a playground mock (`/playground?demo=restyle`). Step 2, YUI-96 (Sep 25), is the native side: every parser reads `theme app`, the app draws the preview card and applies the look to its chrome, Settings has Look, the look is saved on the account (`yui_users.look`, the `yui-account` function) and cached on the phone, and the host gates the line with `restyle_min_build` and keeps it away from shared agents. Phones get it with the next Yui release.

The goal: say "make Yui feel like autumn" to any of your agents. The agent answers with one line, you see Yui in autumn next to Yui as it is now, and one tap puts it on. Nothing changes until you tap, and one more tap takes it back.

## 1. Two kinds of look

Yui already has one kind (YUI-20, `AGENTS.md` "Look"): every agent has its own look, and while its thread is open the whole screen wears it. That is how you know who you are talking to. This adds the second kind.

| | Agent look | App look |
|---|---|---|
| Line | `theme autumn` | `theme app autumn` |
| What it styles | that agent's thread and its row in the agent list | everything that is nobody's thread: the agent list screen, its header and wordmark tint, the tab bar, Settings, sheets, sign-in, and Yui's own thread |
| Who changes it | the agent, or you in the agent's settings | only you, by tapping Apply on a preview |
| When it lands | at once, one note line | after your tap, never before |
| Stored | `yui_agents.theme` | `yui_users.look` (section 6) |

**Which wins.** Inside an agent's thread, the agent's look wins; that thread is how the agent is recognised. Everywhere else, the app look. Yui's own thread follows the app look unless Yui's look was set on its own. Settings > Look has one switch for people who want the whole app in one look: **Agents keep their own looks** (on by default). Off, every thread wears the app look too. Only the person flips it; no line can.

## 2. The line

```
theme app autumn
theme app ocean font=serif motion=calm
theme app accent=#7B5CFF bg=cream radius=round
theme app accent=lemon bg=sand
theme app reset
```

- `theme app` then a **set name**, **keys**, or both, the same sets and keys as an agent's theme (`YL.md`, section 4, theme): `accent=` a `#RRGGBB` hex or a set name used as a color, `bg=` a hex or `cream|paper|white|mist|sand|blush`, `radius=round|soft|square`, `font=rounded|default|serif|mono`, `weight=regular|bold|heavy`, `motion=bouncy|calm|snappy`.
- A set name starts fresh from that set. Keys alone change only what they say, on top of the look the app has now.
- `theme app reset` goes back to Yui's own look (coral on cream, the shipped one).
- The op is the theme op with `props.scope: "app"`: `{op: "theme", screen, props: {scope: "app", name?, accent?, ...}}`. Like any theme line it takes no `@id`, advances no counter and leaves an open group open. It cannot be patched (`~theme` is an error).

**Stricter than an agent's theme.** An agent's theme drops unknown words quietly. An app theme is shown to the person before it does anything, so the preview must be exactly what Apply does. Every one of these is an error line and nothing is shown:

- nothing after `app`, two set names, an unknown set, key or value;
- a short hex (`#F80`) or a number for `radius=` (the app's radii come from the fixed scale only);
- a style profile key (`screen=`, `gallery=`, `chart=`, `buttons=`): those are one agent's preferences, not the app's;
- any flag (`+now`, `+apply`): there is no way to skip the preview;
- `theme app reset` with anything after it.

Vectors: `spec/conformance/31-theme-app.json`. Every parser runs them: JavaScript, Swift, Python, Kotlin and Rust.

## 3. Preview, then apply

A `theme app` line draws one card in the thread where it was sent:

- **Now** and the new look side by side, each a small phone: the agent list, the tab bar and one bubble. A Light / Dark switch on the card flips both, so the person sees both modes before choosing.
- One line under them names what the guard changed, if anything: "Yellow was darkened so white text on buttons stays readable." Nothing is said when nothing changed.
- Two buttons: **Use autumn** (the set name, or "Use this look" for keys alone) and **Keep mine**.

Apply restyles the chrome with a short crossfade (none with Reduce Motion on), and the card becomes one line, "Yui is autumn now.", with **Undo**. Undo puts back the look from just before, one step. Keep mine turns the card into "Kept your look." with no buttons.

Each tap sends the agent one event, like any other tap (`YL.md`, section 7): `{id: "restyle", event: "theme", scope: "app", choice: "apply" | "keep" | "undo", name}`. On the Hermes channel it reads `[yui] restyle theme app choice=apply name=autumn`, so the agent can say one short line back and never has to ask how it went.

Rules:

- One preview per reply: if a reply holds several `theme app` lines, the last one is the card.
- A newer preview retires older ones: their buttons go and they read "A newer look was offered below."
- `theme app reset` previews too (the current look beside Yui's own), unless the app look already is Yui's, then it says so in one line and shows no card.
- Settings > Look always has **Back to Yui's look**, one tap, no agent needed. If a look ever makes the app hard to use, that row is two taps from anywhere.

## 4. Guardrails

The same guard as agent looks (`Yui/Sources/Theme/AgentLook.swift` in the app, ported to `site/lib/yl/look.mjs` for the site), run before the preview is drawn, so the preview already shows the adjusted colors:

- Text 4.5:1 against its background, controls 3:1 (WCAG AA), in light and in dark. Colors that miss are moved in lightness until they pass; the hue stays. The guard aims a hair above the line (4.6 and 3.1) so rounding to hex never lands under it.
- Light paper stays paper: a background darker than 93% lightness is lifted. Dark mode is derived from the accent, never taken from the line.
- Tap targets stay 44 points, and Dynamic Type sizes are untouched. Radii and type come from fixed scales.
- Reduce Motion: `motion=bouncy` and `snappy` play as `calm`, and the apply crossfade is skipped.
- Yui's own shipped look is exempt (its coral accent carries dark text, not white) and is always one tap away.

The conformance runner checks this: every `look` vector parses its line, builds the look with `appLook()`, fails if any text, button or bubble pair is under AA in either mode, and compares which colors the guard moved with the vector's `look` (`{light: [...], dark: [...]}`).

## 5. Who may restyle

- Only an agent you own: a `yui_agents` row in your account, bound to your connector. A shared agent (a grant from someone else's invite, `AGENTS.md` "Shared agents", YUI-57) never can. The app drops a `theme app` line from a shared agent without drawing anything, and the host refuses it on every turn that is not its owner's, so the agent is not taught the line there at all.
- An agent can offer, never apply. Apply, Undo and Reset are the person's taps only.
- Group threads (`GROUPS.md`): any owned member may offer; the card shows in the group, and applying it restyles the app, not the group.

## 6. Where it is stored

On the account, so a second phone signed in to the same Apple ID gets the same look, and cached on the device, so the first frame at launch is already right.

SQL (migrated in YUI-96, `20260925100000_yui_user_look.sql`):

```sql
alter table public.yui_users add column if not exists look jsonb;
```

```json
{"preset": "autumn", "font": "serif",
 "prev": {"preset": "ocean"},
 "agents_keep_looks": true,
 "at": "2026-09-25T20:00:00.000+00:00", "by": "user", "via": "Coach"}
```

- Same recipe keys as `yui_agents.theme`, with no `style`. `prev` is the look Undo goes back to (one step, never a history). `via` is the agent whose card was applied, or missing when it came from Settings.
- Written only by the app on the person's tap, through the account API (`yui-agents` is for agents; this is `yui-account` `look`), cleaned the same way: known keys, known words, `#RRGGBB` hex. A host has no write path to it.
- `null` means Yui's own look.

## 7. Older apps

A build that does not know `theme app` would read `theme app accent=...` as the agent's own theme and restyle that agent. So the host teaches the line, and passes it through, only to phones at or above the build that ships step 2 (`restyle_min_build`, the same pattern as `group_min_build`); for older phones it drops the line and the agent is told the app cannot restyle yet. The channel guide adds one sentence when that build ships.

## 8. What the agent is told

Added to the channel guide in step 2 (v21), for owned agents on new enough phones. It sits between `<!-- restyle: ... -->` markers: the Hermes plugin adds it to a turn only when the line would go out (`yui/hermes-plugin/yui/restyle.py`), and the published guide for other hosts leaves it out. With "one short sentence" the eval's replies ran to two; the example sentence fixed that (`channel-eval/reports/v21-restyle-case.md`).

> When the person asks to change how Yui looks ("make Yui feel like autumn", "darker", "more calm"), answer with one line like `theme app autumn` and a single short sentence ("Here's Yui in autumn, have a look."). Pick the closest set, add keys only when they asked for something the set does not have. The app shows them a preview and they decide. Never say it changed before they tap.

## 9. Not yet

- Seasonal or time-based looks that change on their own. Every change is a tap.
- A look per screen of the app, custom fonts, wallpapers or images. `wallpaper=` is an unknown key on purpose.
- Sharing a look with another person.

# Community gallery

Screens people drew in Yui Lines, shown live at [yuigui.com/developers/community](https://www.yuigui.com/developers/community#gallery).

## The challenge: draw your best screen in 3 lines

- Three lines of Yui Lines or fewer. Blank lines and `#` comments do not count.
- It must parse with no errors and draw at least one thing.
- Any preset in [spec/YL.md](../spec/YL.md). Use `>2` to reach a second screen if you like; it is still a line.
- No end date. No prizes yet, just your name on a screen in the gallery.

## How to enter

1. Draw it in the [playground](https://www.yuigui.com/playground) until it looks right.
2. Fork this repo and add an entry at the end of `entries` in `gallery.json`:

   ```json
   {
     "id": "rainy-day-plan",
     "title": "Rainy day plan",
     "by": "Your Name",
     "github": "your-handle",
     "date": "2026-09-30",
     "yl": "say \"Rain all day. Indoor plan?\"\npick \"Pick two\" Museum|Movie|Bake|\"Board games\"\nask \"Invite friends?\""
   }
   ```

   `id` is lowercase words joined by dashes and must be new. `title` is up to 60 characters, `by` up to 40. `github` is optional. In `yl`, lines are joined by `\n` and quotes are escaped as `\"`.
3. Run `node community/check.mjs` from the repo root (Node 20 or newer, nothing to install). Every entry must say `ok`.
4. Open a pull request titled `gallery: <your title>`. The same check runs there. Once it is merged, the next site deploy draws your screen.

No emails, phone numbers or other people's data in an entry. By opening a pull request you agree your entry is licensed under Apache-2.0, like the rest of the repo.

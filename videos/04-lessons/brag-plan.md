# 04 Lessons: learn anything, one page at a time

Page: See it (/mockups), the "Lessons and plans" group. Also fits /developers/specs (deck, calc, math).

## Angle

Ask your agent how something works and you get a lesson you can swipe, not a lecture. The compound-interest lesson from the playground (`lesson-one-screen` in `site/lib/yl/samples.mjs`) is one deck: a diagram, the formula, a chart, the big number, a quiz, and a calculator. The calculator's sliders land on the same $673 the lesson showed.

## Facts used

- A lesson is one deck in the app since Yui 0.3.1 (build 160, Sep 26), card YUI-113. Deck pages take a diagram, a formula, a chart, a stat or a calculator as their picture (spec/YL.md, deck).
- A quiz with `answer=` is graded, marks the right option, and stays open for another try; each try is an event.
- When every page is seen and every question answered, the deck sends `{done, pages, score, of}`.
- The chat keeps one line and a chip to reopen the lesson (spec/CHANNEL.md, "A lesson is one deck").
- The wall shows real renders: playground screens (`site/public/og/screens/try-*.jpg`) and native captures (`site/public/progress/yui-113-*.webp`, `yui104-app-heat-dark.webp`).

## Storyboard (96 BPM, a bar is 2.5 s, 24 bars is 60 s, dark theme like the native deck)

| Time | Scene | Left | Right | Line |
|---|---|---|---|---|
| 0 to 5 | "How does compound interest work? Short version." The lesson opens full screen | Ask how something works. | Get a lesson you can swipe. | `>full deck "Compound interest"` |
| 5 to 10 | $100, +10%, $110 draw on one after another | One idea per page. | Diagrams drawn on the phone. | |
| 10 to 17.5 | The formula, the chart draws, $673 counts up | Formulas. Charts. Big numbers. | | |
| 17.5 to 25 | "Which lever grows the pile fastest?" Checking daily (wrong), then More time (right) | Then a quick check. | Wrong answers teach too. | `choose … answer="More time"` |
| 25 to 35 | Try it: r to 0.10, t to 20, A lands on 673 | Play with the numbers. | Watch it grow. | `calc f="A = P*(1+r)^t" …` |
| 35 to 40 | Close; the chat keeps a chip, the agent answers | Your agent sees how it went. | And what to teach next. | `→ agent {"done":true,"score":1,"of":1}` |
| 40 to 50 | A wall of real lesson screens | Biology. Physics. Math. Anything. | | |
| 50 to 60 | Learn anything with your agent. yuigui.com | | | |

## Beyond what is shipped

Nothing. The agent's follow-up ("Want the next one, on how loans work?") is the agent's own words, not a feature. Narrate (read aloud) is left out because the video has no voice.

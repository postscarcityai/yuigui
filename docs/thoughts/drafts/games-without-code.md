---
date: 2026-09-25
tag: why
title: Games your agent makes up, without code
dek: Your agent can already put tic-tac-toe on your phone. Could it make up a new game? We think yes, with a board and a few rule words instead of a script. Here is the draft.
---

```compare
before: function drop(c,p){for(let r=H-1;r>=0;r--)\n  if(!g[r][c]){g[r][c]=p;return r}return -1}\nyui.onTap(({col})=>{if(turn!==1)return;\n  const r=drop(col,1); ... }) | A script the phone would run. 302 tokens.
after: board "Connect four" size=7x6 turns=you|agent\npiece red you glyph=🔴\npiece yellow agent glyph=🟡\nrule drop\nwin line=4 | A board. 41 tokens, and nothing to run.
```

Both of those are connect four. On the left, the agent writes the game as code. On the right, it describes the board and picks the rules from a short list the app already knows.

We want the right one, for the same reasons we picked presets over generated screens. It is six to seven times smaller. A bad line is skipped and the rest still plays. It draws natively, in your agent's colors.

And it can ship. Apple's guideline 2.5.2 says an app may not download and run code that adds features. A board is data, the way new levels for a puzzle game are data. Every rule it can use is already in the app.

```try
/developers/games | Read the draft spec
```

```shot
/progress/yui59-ttt-light.webp | Tic-tac-toe against the agent in Yui today, one of three fixed games.
```

Today your agent picks one of three games the app ships with. The draft has seven rule words: drop, place, move, capture, collect, build and wave. You win by four in a row, by reaching a goal, by clearing the board or by surviving the waves. There are three ways to play: take turns with your agent, a solo puzzle, or real time.

That is enough for connect four, gomoku, reversi, checkers, mazes with fog and a tiny tower defense. It is not enough for card games or physics, and that is fine. Those can come later as games of their own.

Nothing is built yet. Tell us which game you would want your agent to make first.

---
date: 2026-10-30
tag: why
title: "An answer you can talk over"
dek: A good teacher talks, points at the board, and stops when you cut in. Yui answers are about to work the same way. Here is why we are cutting every reply into beats.
---

```phone
caption: One reply, cut into beats.
timeline "How does the heart work?"
done "The heart is two pumps" at="0s"
done "Right side: body to lungs" at="4s"
now "You: hold on, why two?" at="9s"
next "Two pressures"
```

Today an answer arrives whole. A card, a deck, a film. You read it or watch it, then you reply. That is a chat, even when the pictures are good.

Talk to a person at a whiteboard and it goes differently. They say one thing and write two words. They point. You cut in halfway, and they stop, answer, and carry on with the board still up.

That is what Beats is. The voice says one short line at a time. The screen pins only a few words, the anchors, so you always see where you are. When you talk over it, the voice stops, and the next reply picks up with the anchors still on the board.

```shot
/progress/yui350-heart-dark.webp | The heart script: two beats, two anchors, and the person cutting in at 9 seconds
```

## Why not just make the films better

Films stay. But a film is something you watch. We want the answer to be something you are in. A question should wait where it belongs, not pile up at the end, and you should be able to tap a part of the picture or just say "the left side" while touching it.

## Why every agent gets it for free

Nobody should have to rewrite their agent for this. So the first real code takes any reply agents send today, plain text or Yui Lines, and cuts it into beats on its own. A sentence becomes a spoken line. A `Label: value` line becomes an anchor. A deck page's title becomes an anchor. An agent that wants control can mark its own anchors.

```shot
/progress/yui351-status-light.webp | The beat builder: a status reply where each Label: value line is one beat that pins
```

## Where it stands

The scripts and the beat builder are on the web. The prototype that speaks beats out loud is built, and so is the spec, but neither is live yet: a speed test in our own checks goes red under load and blocks the push. Fixing that gate comes first. Then you get to hear it.

```try
/playground/canvas/dialogue/builder.html | Cut a reply into beats
/playground/canvas/dialogue/index.html | Read the three scripts
```

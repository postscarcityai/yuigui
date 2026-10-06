#!/usr/bin/env python3
"""Generate a motion piece with Opus and record what it cost (spec/MOTION.md).

  python3 site/scripts/motion/generate.py free   # public/demo/motion/prompt-free.md   -> free.html
  python3 site/scripts/motion/generate.py hybrid # public/demo/motion/prompt-hybrid.md -> hybrid.js
  python3 site/scripts/motion/generate.py yl     # public/demo/motion/prompt-yl.md -> eli5-string.run2.scene (the model writes B)
  MOTION_TAG=.run2 python3 site/scripts/motion/generate.py free  # a second run, free.run2.html (same prompt, a different piece)

Writes <out> and <out>.stats.json: time to first token, total time, tokens, cost.
Streams with the claude CLI (no tools, no session kept)."""
import json, os, re, subprocess, sys, time

kind = sys.argv[1]
model = os.environ.get("MOTION_MODEL", "claude-opus-5-5")
here = os.path.join(os.path.dirname(__file__), "..", "..", "public", "demo", "motion")
prompt = open(os.path.join(here, f"prompt-{kind}.md")).read()
tag = os.environ.get("MOTION_TAG", "")  # e.g. MOTION_TAG=.run2 keeps a second run beside the first
out = os.path.join(here, {"free": "free" + tag + ".html", "hybrid": "hybrid" + tag + ".js", "yl": "eli5-string" + (tag or ".run2") + ".scene"}[kind])
env = dict(os.environ, USER=os.environ.get("USER") or "urzas")
t0 = time.time()
p = subprocess.Popen(
    ["claude", "-p", "--model", model, "--tools", "", "--no-session-persistence",
     "--output-format", "stream-json", "--include-partial-messages", "--verbose", prompt],
    stdout=subprocess.PIPE, text=True, env=env)
first, text, usage = None, "", {}
for line in p.stdout:
    try:
        ev = json.loads(line)
    except ValueError:
        continue
    if ev.get("type") == "stream_event":
        d = ev["event"]
        if d.get("type") == "content_block_delta" and d["delta"].get("type") == "text_delta":
            if first is None:
                first = time.time() - t0
            text += d["delta"]["text"]
    elif ev.get("type") == "result":
        usage = ev
total = time.time() - t0
text = re.sub(r"^```[a-z]*\n|\n```\s*$", "", text.strip())
open(out, "w").write(text + "\n")
u = usage.get("usage", {})
stats = {"model": model, "first_token_s": round(first or 0, 1), "total_s": round(total, 1),
         "output_tokens": u.get("output_tokens"), "thinking_tokens": (u.get("output_tokens_details") or {}).get("thinking_tokens"),
         "chars": len(text), "cost_usd": usage.get("total_cost_usd")}
json.dump(stats, open(out + ".stats.json", "w"), indent=1)
print(stats)

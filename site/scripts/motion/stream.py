#!/usr/bin/env python3
"""Stream a scene-by-scene motion film from the model and log when each scene is complete (spec/MOTION.md).

  python3 site/scripts/motion/stream.py [out-name]      # writes public/demo/motion/<out-name>.json (default stream)
  MOTION_MODEL=claude-sonnet-5-5 MOTION_EFFORT=low python3 site/scripts/motion/stream.py stream-sonnet

The file holds {scenes:[{name, dur, code, at}], stats}. `at` is the second, from the request, when that
scene's code was complete. The playground replays them on that clock, so what you watch is what a live
stream would do. Time to first frame = scenes[0].at + the player's boot."""
import json, os, re, subprocess, sys, time

name = sys.argv[1] if len(sys.argv) > 1 else "stream"
model = os.environ.get("MOTION_MODEL", "claude-opus-5-5")
effort = os.environ.get("MOTION_EFFORT", "low")
here = os.path.join(os.path.dirname(__file__), "..", "..", "public", "demo", "motion")
prompt = open(os.path.join(here, "prompt-stream.md")).read()
env = dict(os.environ, USER=os.environ.get("USER") or "urzas")
t0 = time.time()
cmd = ["claude", "-p", "--model", model, "--tools", "", "--no-session-persistence", "--output-format", "stream-json",
       "--include-partial-messages", "--verbose"]
if effort != "default":
    cmd += ["--effort", effort]
p = subprocess.Popen(cmd + [prompt], stdout=subprocess.PIPE, text=True, env=env)
text, first, usage, scenes, done = "", None, {}, [], 0
HEAD = re.compile(r"^=== scene (\S+) ([\d.]+) ===\s*$", re.M)
def harvest(final=False):
    """Every scene whose next marker (or the end marker) has arrived is complete."""
    global done
    marks = list(re.finditer(r"^=== (scene (\S+) ([\d.]+)|end) ===\s*$", text, re.M))
    for i, m in enumerate(marks[:-1]):
        if m.group(1) == "end" or i < done:
            continue
        code = text[m.end():marks[i + 1].start()].strip()
        code = re.sub(r"^```[a-z]*\n|\n```\s*$", "", code)
        scenes.append({"name": m.group(2), "dur": float(m.group(3)), "code": code, "at": round(time.time() - t0, 1)})
        done = i + 1
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
            harvest()
    elif ev.get("type") == "result":
        usage = ev
total = time.time() - t0
harvest()
u = usage.get("usage", {})
stats = {"model": model, "effort": effort, "first_token_s": round(first or 0, 1), "first_scene_s": scenes[0]["at"] if scenes else None,
         "total_s": round(total, 1), "scenes": len(scenes), "output_tokens": u.get("output_tokens"),
         "thinking_tokens": (u.get("output_tokens_details") or {}).get("thinking_tokens"), "cost_usd": usage.get("total_cost_usd")}
json.dump({"scenes": scenes, "stats": stats}, open(os.path.join(here, name + ".json"), "w"), indent=1)
print(stats, [(s["name"], s["dur"], s["at"]) for s in scenes])

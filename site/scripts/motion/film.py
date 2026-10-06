#!/usr/bin/env python3
"""Have the model write a streamed motion film for one ask (MOTION-1) and log when each scene lands.

  python3 site/scripts/motion/film.py "<ask>" <out.json> [--model claude-sonnet-5-5] [--effort low] [--prompt prompt-kit.md]

Writes {ask, scenes:[{name,dur,code,at}], stats}. `at` = seconds from the request to the moment that scene's
code was complete, so a player replays the film on the clock a live stream would have had. Time to first frame
is scenes[0].at plus the player's boot. Goes through the `claude` CLI (adds ~3 to 5 s of process start)."""
import json, os, re, subprocess, sys, time

def _lum(c):
    n = int(c[1:7], 16)
    return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255


def film(ask, out, model="claude-sonnet-5-5", effort="low", prompt_file="prompt-kit.md", extra="", theme=None):
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "demo", "motion")
    th = ""
    if theme:
        th = "\n\nTHEME (the agent's colours; the palette keys already map to these): " + ", ".join(f"{k} {v}" for k, v in theme.items() if k in ("ink", "fg", "accent", "a2", "a3")) + (". A light screen: dark ink on a pale ink." if _lum(theme.get("ink", "#000000")) > 0.55 else ".")
    prompt = open(os.path.join(here, prompt_file)).read() + th + "\n\nASK: " + ask + "\n" + extra
    env = dict(os.environ, USER=os.environ.get("USER") or "urzas")
    t0 = time.time()
    cmd = ["claude", "-p", "--model", model, "--tools", "", "--no-session-persistence", "--output-format", "stream-json", "--include-partial-messages", "--verbose"]
    if effort != "default":
        cmd += ["--effort", effort]
    p = subprocess.Popen(cmd + [prompt], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, env=env)
    text, first, usage, scenes, done = "", None, {}, [], 0
    def harvest():
        nonlocal done
        marks = list(re.finditer(r"^=== ((?:scene )?(\S+) ([\d.]+)|end) ===\s*$", text, re.M))
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
    p.wait()
    total = time.time() - t0
    harvest()
    u = usage.get("usage", {})
    stats = {"model": model, "effort": effort, "first_token_s": round(first or 0, 1), "first_scene_s": scenes[0]["at"] if scenes else None,
             "total_s": round(total, 1), "scenes": len(scenes), "film_s": sum(s["dur"] for s in scenes), "output_tokens": u.get("output_tokens"),
             "thinking_tokens": (u.get("output_tokens_details") or {}).get("thinking_tokens"), "cost_usd": usage.get("total_cost_usd")}
    res = {"ask": ask, "theme": theme, "scenes": scenes, "stats": stats}
    json.dump(res, open(out, "w"), indent=1)
    return res

if __name__ == "__main__":
    a = sys.argv[1:]
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    r = film(a[0], a[1], opt("--model", "claude-sonnet-5-5"), opt("--effort", "low"), opt("--prompt", "prompt-kit.md"))
    print(r["stats"], [(s["name"], s["dur"], s["at"]) for s in r["scenes"]])

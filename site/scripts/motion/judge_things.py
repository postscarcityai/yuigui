#!/usr/bin/env python3
"""The judge for drawings native agents learn (MOTION-29). Native Yui runs in an edge function and cannot render, so the learner
saves its redraw of a noun as `drawn` in yui_motion_things (yuigui project) and this script, on a machine with a browser, judges it
the way the Hermes plugin's learner does (learn_judge.py: same render, same look) and keeps a pass.

  uv run --quiet --with playwright --with pillow python site/scripts/motion/judge_things.py [--plugin DIR] [--loop SECONDS] [--limit N]

--loop keeps polling (a cron or launchd job can run it with --limit 5 every few minutes instead). Needs a Supabase access token
(SUPABASE_ACCESS_TOKEN or the CLI's keychain entry). Prints one line per drawing: noun, pass/fail, why."""
import base64, json, os, subprocess, sys, tempfile, time, urllib.request

REF = "txuibjxyfpalzvpneqgp"
HERE = os.path.dirname(os.path.abspath(__file__))


def token():
    t = os.environ.get("SUPABASE_ACCESS_TOKEN")
    if t:
        return t
    raw = subprocess.check_output(["security", "find-generic-password", "-s", "Supabase CLI", "-w"]).decode().strip()
    return base64.b64decode(raw.removeprefix("go-keyring-base64:")).decode()


def sql(q):
    req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{REF}/database/query", data=json.dumps({"query": q}).encode(), method="POST",
                                 headers={"authorization": f"Bearer {token()}", "content-type": "application/json", "user-agent": "yui-motion-judge"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


lit = lambda s: "'" + str(s).replace("'", "''") + "'"


def judge(plugin, thing):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(thing, f)
    try:
        cmd = ["uv", "run", "--quiet", "--with", "playwright", "--with", "pillow", "python", os.path.join(HERE, "learn_judge.py"), plugin, f.name]
        env = dict(os.environ, USER=os.environ.get("USER") or "yui", PATH=os.environ.get("PATH", "") + ":/opt/homebrew/bin:" + os.path.expanduser("~/.local/bin"))
        run = subprocess.run(cmd, capture_output=True, text=True, timeout=300, env=env)
        out = run.stdout
        for ln in reversed(out.splitlines()):
            if ln.startswith("{"):
                r = json.loads(ln)
                return bool(r.get("pass")), ",".join(r.get("fail") or []) or str(r.get("note") or "ok")
        print("judge gave nothing:", (run.stderr or "")[-300:].strip(), file=sys.stderr, flush=True)
        return None, "judge gave nothing"
    except subprocess.TimeoutExpired:
        return None, "judge timeout"
    finally:
        os.unlink(f.name)


def once(plugin, limit):
    rows = sql(f"select name, label, parts from public.yui_motion_things where status = 'drawn' order by updated_at limit {int(limit)}")
    for r in rows:
        ok, why = judge(plugin, {"name": r["name"], "label": r["label"], "parts": r["parts"]})
        if ok is None:  # the judge itself broke (no browser, no claude, a timeout): the drawing stays `drawn` for the next pass, never a verdict
            print(f"{r['name']}: not judged ({why})", flush=True)
            continue
        sql(f"select public.yui_motion_learn_judged({lit(r['name'])}, {'true' if ok else 'false'}, {lit(why)})")
        print(f"{r['name']}: {'kept' if ok else 'failed'} ({why})", flush=True)
    return len(rows)


def main():
    a = sys.argv[1:]
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    plugin = os.path.expanduser(opt("--plugin", "~/dev/yui/hermes-plugin/yui"))
    limit = opt("--limit", "10")
    if "--loop" not in a:
        once(plugin, limit)
        return
    while True:
        try:
            once(plugin, limit)
        except Exception as e:
            print("judge pass failed:", e, flush=True)
        time.sleep(float(opt("--loop", "120")))


main()

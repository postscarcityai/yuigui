#!/usr/bin/env python3
"""MOTION-28: count the real film asks and mark each seed hit / learned / miss. Counts only: no message text is printed or kept.

  python3 site/scripts/motion/ask_nouns.py [--plugin ~/dev/yui/hermes-plugin] [--since 2026-10-07] [--json out.json]

Sources, read only: yui_messages in the yuigui Supabase project (agent rows that carry a `motion "<title>"` film head),
the plugin's disk cache (learned drawings), and the yui gateway log (inbound lines that start a film). Needs the Supabase
CLI token (supabase/scripts/kill_switch.py finds it). A film title is the only text read, and only to run the seed matcher on it."""
import argparse, importlib, json, os, re, sys, collections

ap = argparse.ArgumentParser()
ap.add_argument("--plugin", default=os.path.expanduser("~/dev/yui/hermes-plugin"))
ap.add_argument("--since", default="2026-10-07")
ap.add_argument("--json")
a = ap.parse_args()
sys.path.insert(0, a.plugin); sys.path.insert(0, os.path.join(os.path.dirname(a.plugin), "supabase", "scripts"))
import importlib.util
_sp = importlib.util.spec_from_file_location("motion_hero", os.path.join(a.plugin, "yui", "motion_hero.py"))
mh = importlib.util.module_from_spec(_sp); sys.modules["motion_hero"] = mh; _sp.loader.exec_module(mh)
import kill_switch as k

rows = k.sql(f"select body from yui_messages where sender='agent' and created_at >= '{a.since}' and body ~ E'(^|\\n)\\\\s*motion \"' ")
titles = [m.group(1) for r in rows for m in re.finditer(r'(?m)^\s*motion "([^"]*)"', r["body"])]
learned = set((mh._load().get("learn") or {}).get("kept", [])) | set((mh._load().get("things") or {}))
c = collections.Counter()
for t in titles:
    if mh.pick(t): c["kit"] += 1
    elif (s := mh.seeded(t)): c["learned" if s["name"] in (mh._load().get("things") or {}) else "seed"] += 1
    else: c["miss"] += 1
out = dict(since=a.since, films=len(titles), **{x: c.get(x, 0) for x in ("kit", "seed", "learned", "miss")},
           learned_drawings_on_disk=len(mh._load().get("things") or {}), cached_asks=len(mh._load().get("asks") or {}))
print(json.dumps(out, indent=1))
if a.json: json.dump(out, open(a.json, "w"), indent=1)

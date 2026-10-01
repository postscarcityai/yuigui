#!/usr/bin/env python3
"""YUI-249 live check: the web's sync client (site/lib/web/state.mjs) against the real yui_sync_state table.

A throwaway account and agent. Two "devices" (two key syncs with different device names) run the web client's
own code over the same REST the browser uses: a draft typed on one reaches the other, sending clears it on both,
a second account cannot read it (RLS), a pasted key is never stored. The accounts are deleted at the end.

    python3 site/e2e/web/live/web_sync_live.py [--app ~/dev/yui]
"""
import argparse, json, os, subprocess, sys, uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE = HERE.parents[2]
ap = argparse.ArgumentParser()
ap.add_argument("--app", default=str(Path.home() / "dev/yui"))
args = ap.parse_args()
REPO = Path(args.app)
exec(open(REPO / "supabase/tests/agents_test.py").read().split("results = []")[0])

results = []
def check(name, ok, detail=""):
    ok = bool(ok); results.append(ok); print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  [{detail}]" if detail else ""), flush=True)

A, B = str(uuid.uuid4()), str(uuid.uuid4())
for u in (A, B):
    sql(f"insert into yui_users(id, apple_sub) values ('{u}','test.{u}')")
try:
    ta, tb = mint(A, ttl=3600), mint(B, ttl=3600)
    s, r = fn("yui-agents", {"action": "create", "name": "Yui", "pair": True}, ta)
    agent = r["agent"]["id"]
    check("throwaway account and agent", s == 200, s)
    p = subprocess.run(["node", str(HERE / "sync_live.mjs")], cwd=SITE, capture_output=True, text=True, timeout=120,
                       env={**os.environ, "YUI_TOKEN": ta, "YUI_USER": A, "YUI_AGENT": agent})
    if p.returncode or p.stderr:
        print(p.stdout, p.stderr)
    out = json.loads(p.stdout.strip().splitlines()[-1])
    check("a draft typed on one device reaches the other", out["reached"], out["reached"])
    check("sending clears it on both", out["cleared"] == "", repr(out["cleared"]))
    check("the server stamps the time", out["stamped"])
    check("a pasted key is never stored", out["keyRow"] in (None, ""), repr(out["keyRow"]))
    s, rows = rest("GET", f"yui_sync_state?select=key,value&agent_id=eq.{agent}", tb)
    check("a second account sees no row (RLS)", s == 200 and rows == [], f"{s} {rows}")
    s, _ = rest("POST", "yui_sync_state", tb, {"user_id": B, "agent_id": agent, "key": "draft", "value": "x"})
    check("a second account cannot write to this agent", s in (401, 403), s)
    s, _ = rest("POST", "yui_sync_state", ta, {"user_id": A, "agent_id": agent, "key": "bogus", "value": "x"})
    check("only the known keys are accepted", s >= 400, s)
finally:
    for u in (A, B):
        sql(f"delete from yui_users where id = '{u}'")
    left = sql(f"select count(*) from yui_sync_state where user_id in ('{A}','{B}')")
    print("cleanup rows left:", left)
sys.exit(0 if all(results) else 1)

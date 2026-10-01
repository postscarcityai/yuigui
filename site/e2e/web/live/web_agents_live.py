#!/usr/bin/env python3
"""YUI-245 live round trip: the web client's agent code against a real account.

A throwaway account (and nothing else) is made on the yuigui project. The web client (site/lib/web: relay,
agents, chats) runs in Node over the same REST and edge functions the browser uses: it adds an agent and gets a
pairing code, this script plays the host (claims the code, then starts the gateway), and the client sees the
agent go from waiting to paired to online; then rename, look, mute, order, a second chat (the account gets a
phone new enough for the chat gate), rename, seen, clear, delete, the last chat that cannot go, a control
request, and removing the agent. The account is deleted at the end.

    python3 site/e2e/web/live/web_agents_live.py [--app ~/dev/yui]

Needs node and a Supabase access token like the app repo's supabase/tests.
"""
import argparse, json, os, subprocess, sys, uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
ap = argparse.ArgumentParser()
ap.add_argument("--app", default=str(Path.home() / "dev/yui"), help="the Yui app repo (supabase/tests helpers)")
args = ap.parse_args()
exec(open(Path(args.app) / "supabase/tests/agents_test.py").read().split("results = []")[0])
results = []
def check(name, ok, detail=""):
    results.append(ok); print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  [{detail}]" if detail else ""))

def code(r): return (r.get("code") or r.get("error")) if isinstance(r, dict) else r

def node(step, env):
    p = subprocess.run(["node", str(HERE / "live_agents.mjs")], env={**os.environ, "STEP": step, **env}, capture_output=True, text=True, timeout=180)
    line = next((l for l in p.stdout.splitlines() if l.startswith("RESULT ")), None)
    if p.returncode != 0 or not line:
        print(p.stdout[-800:], p.stderr[-1500:]); raise SystemExit(f"node step {step} failed")
    return json.loads(line[7:])

U = str(uuid.uuid4())
sql(f"insert into yui_users(id, apple_sub) values ('{U}','test.{U}')")
tok = mint(U, ttl=900)
try:
    env = {"YUI_TOKEN": tok, "YUI_USER": U}
    print("== Add an agent: a code")
    a = node("a", env)
    check("a new account starts with Yui, and the list carries the crew offer", a["start"] == {"agents": 1, "hasCrew": True}, a["start"])
    check("an empty name is refused as invalid_name", a["badName"] == "invalid_name", a["badName"])
    c = a["created"]
    check("the name is trimmed, the handle made, the agent waits", c["name"] == "Nova" and c["handle"] == "nova" and c["status"] == "pending", c)
    check("a six digit code that lasts about ten minutes", len(c["code"]) == 6 and c["code"].isdigit(), c["code"])
    mine = [x for x in a["listed"] if x["id"] == c["id"]]
    check("the list shows it waiting to connect (after Yui)", len(a["listed"]) == 2 and mine == [{"id": c["id"], "status": "pending", "presence": "pending"}], a["listed"])
    check("a code for an agent that is not yours is refused as not_found", a["notFound"] == "not_found", a["notFound"])
    check("a new code replaces the old one", a["newCode"]["changed"], a["newCode"])
    print("== The host claims the code")
    s, r = fn("yui-connect", {"action": "pair", "code": a["newCode"]["code"], "remote_ref": "nova", "host_name": "Test Mac", "serving": []})
    check("the host claims the code", s == 200 and r["agent"]["status"] == "connected", f"{s} {code(r)}")
    ct = r["connector_token"]
    env["YUI_AGENT"] = c["id"]
    b = node("b", env)
    check("the web sees it paired but not listening: one step left", b["paired"] == {"paired": True, "connected": False, "presence": "not_listening", "connector": "Test Mac", "ref": "nova"}, b["paired"])
    print("== Its gateway starts")
    s, r = fn("yui-connect", {"action": "heartbeat", "serving": ["nova"]}, ct)
    check("the gateway reports it is serving", s == 200, f"{s} {code(r)}")
    sql(f"insert into yui_devices(user_id, name, app_build) values ('{U}', 'test phone', 99999)")
    print("== Edit, order, chats, controls, remove")
    d = node("c", env)
    check("it is online and connected", d["online"] == {"connected": True, "presence": "online"}, d["online"])
    check("rename, look and mute are written (the look says who set it)", d["edited"] == {"name": "Nova Prime", "preset": "grape", "by": "user", "muted": True}, d["edited"])
    check("a blank rename is refused as invalid_name", d["badRename"] == "invalid_name", d["badRename"])
    check("reorder takes the ids", d["order"][0] is True or d["order"][-1] is True, d["order"])
    check("its first chat is there", d["chats0"] == {"n": 1, "first": True}, d["chats0"])
    check("a second chat can be made, and making it twice counts as made", d["insert"] == "ok" and d["insertTwice"] == "ok", (d["insert"], d["insertTwice"]))
    check("a message lands in that chat, its title and last line show", d["chat2"] == {"title": "Web chat", "last": "hello from the web", "sender": "user", "n": 2}, d["chat2"])
    check("only that chat's rows come back", d["rows"] == ["hello from the web"], d["rows"])
    check("clear empties the chat, delete removes it", d["cleared"] == 0 and d["afterDelete"] == 1, (d["cleared"], d["afterDelete"]))
    check("the only chat cannot be deleted (last_chat)", d["lastChat"] == "lastChat", d["lastChat"])
    check("a control request is accepted and, with no host answering, has no answer", d["control"] is None, d["control"])
    check("the menu read works", d["menuRows"] == 0, d["menuRows"])
    check("a connect request that does not exist answers invalid_request, which the approval page words plainly", d["oauthMissing"] == "invalid_request", d["oauthMissing"])
    check("the agent is removed and only Yui is left", d["removed"]["deleted"] is True and d["removed"]["id"] == c["id"] and d["after"] == 1, (d["removed"], d["after"]))
    n = sql(f"select count(*) as n from yui_messages where user_id = '{U}' and agent_id = '{c['id']}'")[0]["n"]
    check("its messages went with it (Yui's own hello stays)", int(n) == 0, n)
finally:
    sql(f"delete from yui_users where id = '{U}'")
bad = results.count(False)
print(f"\n{len(results) - bad} passed, {bad} failed")
sys.exit(1 if bad else 0)

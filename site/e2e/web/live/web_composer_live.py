#!/usr/bin/env python3
"""YUI-244 live round trip: the web composer's own client code against a real account and agent.

A throwaway account gets one agent served by the real `yui` platform adapter under Hermes' real
BasePlatformAdapter (scripted answers, so the checks are exact). The web client (site/lib/web: relay, thread,
sync, outbox, compose) runs in Node against it, over the same REST the browser uses: words, a 👍, a reply,
a photo up to the private bucket, a resent row id. This script then judges what the host and the database
saw, on the phone's terms: the same rows, the same lines, the reaction copied onto the agent's message.

    python3 site/e2e/web/live/web_composer_live.py [--app ~/dev/yui]

Needs the Hermes venv at ~/.hermes/hermes-agent and a Supabase access token like the app repo's
supabase/tests. The account is deleted at the end.
"""
import argparse, asyncio, json, os, re, signal, subprocess, sys, tempfile, time, uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
SITE = HERE.parents[2]
HERMES = Path.home() / ".hermes/hermes-agent"
PROPOSAL = "Want me to set up Saturday? Goblet squats 5x5 with the 50s, then a 20 minute tabata, done by 10."

ap = argparse.ArgumentParser()
ap.add_argument("--app", default=str(Path.home() / "dev/yui"), help="the Yui app repo (supabase/tests helpers, hermes-plugin)")
ap.add_argument("--host", help=argparse.SUPPRESS)
args = ap.parse_args()
REPO = Path(args.app)


def run_host(home: Path) -> None:
    os.environ["HERMES_HOME"] = str(home)
    os.environ["YUI_CONNECTOR_FILE"] = str(home / "connector.json")
    sys.path[:0] = [str(HERMES), str(REPO / "hermes-plugin")]
    import logging
    logging.basicConfig(filename=home / "host.log", level=logging.INFO, format=f"%(asctime)s [{os.getpid()}] %(name)s %(message)s")
    from gateway.config import PlatformConfig
    from gateway.platform_registry import PlatformEntry, platform_registry
    from yui.adapter import YuiAdapter
    platform_registry.register(PlatformEntry(name="yui", label="Yui", adapter_factory=lambda cfg: YuiAdapter(cfg), check_fn=lambda: True))
    log = home / "agent.jsonl"

    def note(**kw):
        with open(log, "a") as f:
            f.write(json.dumps({"t": time.time(), **kw}, ensure_ascii=False) + "\n")

    async def agent(event):
        text = event.text
        note(ev="turn", text=text, media=len(event.media_urls or []))
        if "[yui] react " in text:
            return "Building it now."
        if event.media_urls:
            return "I can see the photo."
        if "[yui] reply " in text:
            return "Moved to 9."
        return PROPOSAL if "Saturday" in text else "Got it."

    async def main():
        adapter = YuiAdapter(PlatformConfig(enabled=True, extra={"remote_ref": "web-composer-live"}))
        adapter.set_message_handler(agent)
        while not await adapter.connect():
            await asyncio.sleep(2)
        note(ev="up")
        stop = asyncio.Event()
        asyncio.get_running_loop().add_signal_handler(signal.SIGTERM, stop.set)
        await stop.wait()
        await adapter.disconnect()

    asyncio.run(main())


if args.host:
    run_host(Path(args.host))
    sys.exit(0)

exec(open(REPO / "supabase/tests/agents_test.py").read().split("results = []")[0])
HOME = Path(tempfile.mkdtemp(prefix="yui-web-composer-live-"))
os.environ["YUI_CONNECTOR_FILE"] = str(HOME / "connector.json")
import importlib.util  # noqa: E402
_spec = importlib.util.spec_from_file_location("yui_connector", REPO / "hermes-plugin/yui/connector.py")
connector = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(connector)

results = []
def check(name, ok, detail=""):
    ok = bool(ok); results.append(ok); print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  [{detail}]" if detail else ""), flush=True)

T = str(uuid.uuid4())
sql(f"insert into yui_users(id, apple_sub) values ('{T}','test.{T}')")
tok = mint(T, ttl=3600)
host = None


def events():
    try:
        return [json.loads(l) for l in (HOME / "agent.jsonl").read_text().splitlines() if l.strip()]
    except FileNotFoundError:
        return []


def wait(cond, secs, what):
    end = time.time() + secs
    while time.time() < end:
        if cond():
            return True
        time.sleep(1)
    raise TimeoutError(what)


def rows():
    s, r = rest("GET", f"yui_messages?select=id,sender,kind,body,meta,reaction,handled_at&agent_id=eq.{agent}&order=created_at.asc,id.asc", tok)
    assert s == 200, (s, r)
    return r


try:
    s, r = fn("yui-agents", {"action": "create", "name": "Yui", "pair": True}, tok)
    agent = r["agent"]["id"]
    s2, p = connector.pair(r["pairing"]["code"], "web-composer-live", "Web composer test host")
    check("throwaway account, agent and host paired", (s, s2) == (200, 200), f"{s} {s2}")
    host = subprocess.Popen([str(HERMES / "venv/bin/python"), __file__, "--host", str(HOME), "--app", str(REPO)], stdout=open(HOME / "host.out", "a"), stderr=subprocess.STDOUT)
    wait(lambda: any(e["ev"] == "up" for e in events()), 60, "host up")

    print("== the web client talks: words, 👍, a reply, a photo, a resent id")
    p = subprocess.run(["node", str(HERE / "live.mjs")], cwd=SITE, capture_output=True, text=True, timeout=900,
                       env={**os.environ, "YUI_TOKEN": tok, "YUI_USER": T, "YUI_AGENT": agent})
    sys.stderr.write(p.stderr[-2000:])
    line = next((l for l in p.stdout.splitlines() if l.startswith("RESULT ")), None)
    check("the web client ran to the end", p.returncode == 0 and line, f"exit {p.returncode} {p.stdout[-300:]}")
    res = {s["name"]: s for s in json.loads(line[7:])["steps"]} if line else {}
    allrows = rows()
    turns = [e for e in events() if e["ev"] == "turn"]

    pr = next((m for m in allrows if m["sender"] == "agent" and m["body"] == PROPOSAL), None)
    check("the proposal came back through the thread", pr and res.get("said", {}).get("proposal") == PROPOSAL)

    react = [m for m in allrows if m["kind"] == "event" and "react" in (m["meta"] or {})]
    check("one react event row, the spec's line with the message quoted",
          len(react) == 1 and react[0]["body"] == f'[yui] react msg={pr["id"]} emoji=👍 meaning="build it"\n> {PROPOSAL}', f"{[m['body'] for m in react]}")
    check("with meta.react, and the server copied 👍 onto the agent's message", react and react[0]["meta"]["react"] == {"msg": pr["id"], "emoji": "👍"} and pr["reaction"] == "👍", f"{pr and pr['reaction']}")
    check("the badge showed at once in the client, and again after a reload", res.get("reacted", {}).get("badge") == "👍" and res.get("reopened", {}).get("badge") == "👍")
    check("the agent got the react event as a turn", any("[yui] react msg=" in t["text"] and "emoji=👍" in t["text"] for t in turns))

    rep = next((m for m in allrows if m["sender"] == "user" and m["body"].startswith("[yui] reply ")), None)
    check("the reply row is the app's line plus the words",
          rep and rep["body"].startswith(f'[yui] reply to={pr["id"]} from=agent quote="Want me to set up Saturday?') and rep["body"].endswith("\nmake it 9 am"), rep and rep["body"][:160])
    check("with meta.reply_to", rep and rep["meta"]["reply_to"]["msg"] == pr["id"] and rep["meta"]["reply_to"]["from"] == "agent")
    check("the agent read the reply line", any(t["text"].startswith("[yui] reply to=") and "make it 9 am" in t["text"] for t in turns))
    check("a reload shows the reply with its quote chip", res.get("reopened", {}).get("reply") is True)

    ph = next((m for m in allrows if m["sender"] == "user" and (m["meta"] or {}).get("photos")), None)
    path = ph and ph["meta"]["photos"][0]
    check("the photo row: the words, and the bucket path <user>/<agent>/user/<uuid>.jpg",
          ph and ph["body"] == "what is this?" and re.fullmatch(rf"{T}/{agent}/user/[0-9a-f-]{{36}}\.jpg", path or ""), path)
    check("the signed link gives the same bytes back", res.get("photo", {}).get("signed") and res["photo"].get("same"), json.dumps(res.get("photo")))
    check("the host fetched it and handed it to the agent as media", any(t["media"] == 1 for t in turns))
    check("a reload draws the photo", res.get("reopened", {}).get("photos") == 1)

    d = [m for m in allrows if m["body"] == "dupe check"]
    check("the same row id twice is one row, and the second try is quiet", len(d) == 1 and res.get("dupe", {}).get("second") == "ok", f"{len(d)} {res.get('dupe')}")
    check("every row the client wrote was handled by the agent", all(m["handled_at"] for m in allrows if m["sender"] == "user" and m["body"] != "dupe check"))
finally:
    if host and host.poll() is None:
        host.send_signal(signal.SIGTERM)
        try:
            host.wait(20)
        except Exception:
            host.kill()
    sql(f"delete from yui_users where id = '{T}'")
    left = sql(f"select (select count(*) from yui_messages where user_id='{T}') + (select count(*) from yui_agents where user_id='{T}') as n")[0]["n"]
    check("test account deleted, zero rows left", left == 0, f"{left}")

print(f"\n{sum(results)}/{len(results)} passed")
sys.exit(0 if all(results) else 1)

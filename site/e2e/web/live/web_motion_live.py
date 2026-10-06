#!/usr/bin/env python3
"""YUI-312 live check: a real agent's motion film on the production /web, timed.

For each ask a throwaway account gets one agent served by the real `yui` platform adapter (the plugin in --app,
under Hermes' real BasePlatformAdapter). The scripted agent answers with the one line a real agent writes,
`motion "<ask with the facts>"`; the plugin's own maker (the claude CLI, streamed) writes the film and sends each
scene as its own row. A real browser on BASE (default https://www.yuigui.com) signs in as the account, asks on
the stage and times: ask sent to the film on the stage, to its first frame, scene count, film ended; then Close
and the record (one line and a Watch again chip).

    python3 site/e2e/web/live/web_motion_live.py [--base URL] [--runs 3] [--out DIR] [--app ~/dev/yui]
    --arm film    lift the plugin's MOTION_BUILD gate in this host (the gateway's sentinel is not lifted yet)
    --arm gateway the plugin exactly as the gateway runs it: the ask must draw as a sketch, never raw text

Needs the Hermes venv at ~/.hermes/hermes-agent, a Supabase access token like the app repo's supabase/tests,
Playwright from ~/dev/ablejobs, and the claude CLI on PATH. Every account is deleted at the end.
"""
import argparse, asyncio, json, os, signal, statistics, subprocess, sys, tempfile, time, uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
HERMES = Path.home() / ".hermes/hermes-agent"
ASKS = {
    "engine": ("show me how a car engine works",
               "How a car engine works: a four-stroke cycle. Intake draws air and fuel in, compression squeezes it, the spark fires the power stroke that pushes the piston down, exhaust pushes the gas out. The crankshaft turns the up and down into a spin."),
    "settings": ("what changed on the settings screen",
                 "What changed on the Settings screen: the voice picker moved to the top, the accent colour row now shows swatches instead of names, and Sign out moved from the middle to the bottom with a confirm."),
    "interest": ("how compound interest grows",
                 "How compound interest grows: $1,000 at 7% a year. Year 1 adds $70, year 10 is about $1,967, year 30 is about $7,612. Each year's interest earns interest, so the curve bends upward."),
}
ap = argparse.ArgumentParser()
ap.add_argument("--base", default="https://www.yuigui.com")
ap.add_argument("--runs", type=int, default=3)
ap.add_argument("--out", default="/tmp/yui-motion-live")
ap.add_argument("--app", default=str(Path.home() / "dev/yui"))
ap.add_argument("--arm", default="film", choices=["film", "gateway"])
ap.add_argument("--only", help="one ask key")
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
    from yui import compat
    from yui.adapter import YuiAdapter
    if args.arm == "film":
        compat.MOTION_BUILD = 1  # this host only: the gateway's sentinel stays as it is
        compat.MIN_BUILD["motion"] = 1
        compat.PHONE.update(known=True, build=10_000)
        # the heartbeat rewrites PHONE from the session (no phone: build None); a film-capable client stays film-capable
        compat.build_for = lambda *a, **k: 10_000
        _down = compat.downgrade
        compat.downgrade = lambda body, build=None, *a, **k: _down(body, 10_000, *a, **k)
    platform_registry.register(PlatformEntry(name="yui", label="Yui", adapter_factory=lambda cfg: YuiAdapter(cfg), check_fn=lambda: True))
    log = home / "agent.jsonl"

    def note(**kw):
        with open(log, "a") as f:
            f.write(json.dumps({"t": time.time(), **kw}, ensure_ascii=False) + "\n")

    facts = {short: long for short, long in ASKS.values()}

    async def agent(event):
        text = event.text
        note(ev="turn", text=text)
        for short, long in ASKS.values():
            if short in text.lower():
                return "```yui\nmotion " + json.dumps(long) + "\n```"
        return "Got it."

    async def main():
        adapter = YuiAdapter(PlatformConfig(enabled=True, extra={"remote_ref": "web-motion-live"}))
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
import importlib.util  # noqa: E402
OUT = Path(args.out); OUT.mkdir(parents=True, exist_ok=True)
results = []
def check(name, ok, detail=""):
    ok = bool(ok); results.append(ok); print(f"{'PASS' if ok else 'FAIL'}  {name}" + (f"  [{detail}]" if detail else ""), flush=True)

accounts = []   # (user id, host process)
table = {}
try:
    for key, (short, _long) in ASKS.items():
        if args.only and key != args.only:
            continue
        home = Path(tempfile.mkdtemp(prefix="yui-web-motion-live-"))
        os.environ["YUI_CONNECTOR_FILE"] = str(home / "connector.json")
        spec = importlib.util.spec_from_file_location("yui_connector", REPO / "hermes-plugin/yui/connector.py")
        connector = importlib.util.module_from_spec(spec); spec.loader.exec_module(connector)
        T = str(uuid.uuid4())
        sql(f"insert into yui_users(id, apple_sub) values ('{T}','test.{T}')")
        tok = mint(T, ttl=3000)
        s, r = fn("yui-agents", {"action": "create", "name": "Film", "pair": True}, tok)
        agent_id = r["agent"]["id"]
        s2, _ = connector.pair(r["pairing"]["code"], "web-motion-live", "Web motion test host")
        host = subprocess.Popen([str(HERMES / "venv/bin/python"), __file__, "--host", str(home), "--arm", args.arm, "--app", str(REPO)],
                                stdout=open(home / "host.out", "a"), stderr=subprocess.STDOUT)
        accounts.append((T, host))
        check(f"{key}: throwaway account, agent and host paired ({args.arm} arm)", (s, s2) == (200, 200), f"{s} {s2}")
        def up(home=home):
            f = home / "agent.jsonl"
            return f.exists() and '"up"' in f.read_text()
        end = time.time() + 60
        while time.time() < end and not up():
            time.sleep(1)
        shots = [{"theme": "dark", "video": True, "shot": f"{key}-dark"}, {"theme": "dark"}, {"theme": "light", "shot": f"{key}-light"}][: args.runs]
        shots += [{"theme": "dark"}] * max(0, args.runs - 3)
        env = {**os.environ, "BASE": args.base, "ID": T, "TOKEN": tok, "AGENT": agent_id, "ASK": short, "RUNS": json.dumps(shots),
               "OUT": str(OUT), "FILM": "1" if args.arm == "film" else "0", "PW_ROOT": str(Path.home() / "dev/ablejobs")}
        p = subprocess.run(["node", str(HERE / "web_motion_live.mjs")], env=env, capture_output=True, text=True, timeout=1500)
        sys.stderr.write(p.stderr[-3000:])
        line = next((l for l in p.stdout.splitlines() if l.startswith("RESULT ")), None)
        runs = json.loads(line[7:]) if line else []
        table[key] = runs
        check(f"{key}: the browser ran {args.runs} times", len(runs) == args.runs, p.stdout[-200:] or p.stderr[-200:])
        for r in runs:
            check(f"{key} run {r['run']}: no raw motion text on the screen", not r["raw"])
            if args.arm == "film":
                check(f"{key} run {r['run']}: first frame {r.get('first')} s, {r.get('scenes')} scenes, ended {r.get('ended')} s",
                      r.get("first") is not None and r.get("ended") is not None)
                check(f"{key} run {r['run']}: Close returns, one line and one Watch again chip per film (the thread holds run N's N films)", r.get("closed") and r.get("lines") == r["run"] and r.get("chips") == r["run"], f"{r.get('lines')} {r.get('chips')}")
            else:
                check(f"{key} run {r['run']}: drawn as a sketch, no film on the stage", not r["filmUp"])
        # the plugin's own account of it
        log = (home / "host.log").read_text() if (home / "host.log").exists() else ""
        for l in log.splitlines():
            if "motion" in l or "inbound text" in l or "] push " in l:
                print("   host:", l[:200])
    (OUT / f"timings-{args.arm}.json").write_text(json.dumps(table, indent=1))
    if args.arm == "film":
        firsts = [r["first"] for rs in table.values() for r in rs if r.get("first") is not None]
        print("first-frame seconds:", sorted(round(x, 1) for x in firsts), "median", round(statistics.median(firsts), 1) if firsts else None)
        print(f"under 10 s: {sum(1 for x in firsts if x < 10)} of {sum(len(v) for v in table.values())}")
finally:
    for T, host in accounts:
        if host.poll() is None:
            host.send_signal(signal.SIGTERM)
            try: host.wait(20)
            except Exception: host.kill()
        sql(f"delete from yui_users where id = '{T}'")
        left = sql(f"select (select count(*) from yui_messages where user_id='{T}') + (select count(*) from yui_agents where user_id='{T}') as n")[0]["n"]
        check("test account deleted, zero rows left", left == 0, f"{left}")
print(f"\n{sum(results)}/{len(results)} passed")
sys.exit(0 if all(results) else 1)

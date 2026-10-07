#!/usr/bin/env python3
"""Dollar cost of one background drawing (MOTION-25): the parts call plus the vision look, for a few nouns, read from claude's own result event.

  uv run --with playwright --with pillow python site/scripts/motion/learn_cost.py <plugin-dir> noun,noun,noun"""
import base64, io, json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
import look as L

plug = os.path.expanduser(sys.argv[1])
spec = importlib.util.spec_from_file_location("motion_hero", os.path.join(plug, "motion_hero.py")); H = importlib.util.module_from_spec(spec); spec.loader.exec_module(H)
env = dict(os.environ, USER=os.environ.get("USER") or "yui", MAX_THINKING_TOKENS="0")


def cost(ev):
    return ev.get("total_cost_usd") or 0.0


tot = []
for noun in sys.argv[2].split(","):
    cmd = ["claude", "-p", "--model", H.THING_MODEL, "--tools", "", "--no-session-persistence", "--effort", "low", "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}',
           "--disable-slash-commands", "--output-format", "json", H.THING_PROMPT.format(ask=H.learn_ask(noun))]
    r = json.loads(subprocess.run(cmd, capture_output=True, text=True, env=env, stdin=subprocess.DEVNULL, timeout=90).stdout)
    hero = H.parse_reply(r["result"]); parts_c = cost(r)
    th = dict(hero, name=hero["name"])
    code = (H.define_call(th) + "\n" + H.hero_call(th["name"], "api.seg(t, 0, 1.2)") + "\n" + "const k = api.seg(t, 0, 1.8);\n" +
            f"api.callout('{th['label'].title()}', api.w/2 + 80, 200, api.w/2 + 140, 110, {{k}});\n")
    film = {"ask": H.learn_ask(noun), "scenes": [{"name": "one", "dur": 3.0, "code": code}]}
    rend, _ = L.render_scenes(film)
    buf = io.BytesIO(); rend[0][1].save(buf, "PNG")
    msg = {"type": "user", "message": {"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": base64.b64encode(buf.getvalue()).decode()}},
        {"type": "text", "text": L.VISION.format(ask=film["ask"], name="one")}]}}
    p = subprocess.run(["claude", "-p", "--model", "claude-sonnet-5-5", "--tools", "", "--no-session-persistence", "--input-format", "stream-json", "--output-format", "stream-json",
                        "--verbose", "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}'], input=json.dumps(msg) + "\n", capture_output=True, text=True, env=env, timeout=120)
    vis_c = 0.0
    for ln in p.stdout.splitlines():
        ev = json.loads(ln)
        if ev.get("type") == "result":
            vis_c = cost(ev)
    tot.append(parts_c + vis_c)
    print(f"{noun}: parts ${parts_c:.4f} vision ${vis_c:.4f} total ${parts_c + vis_c:.4f}", flush=True)
print(f"mean ${sum(tot) / len(tot):.4f} per noun over {len(tot)}")

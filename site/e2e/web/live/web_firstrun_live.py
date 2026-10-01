#!/usr/bin/env python3
"""YUI-262 live check: a brand-new account that came in with Apple alone lands on the crew picker.

A throwaway account (an apple_sub and nothing else, as yui-auth makes it) is signed into a real browser at
390 px, light and dark, against BASE (default https://www.yuigui.com). The session call is answered with a
token minted for it; every other call is the real backend. The check passes when the first screen is the
crew picker (Yui plus the starters) and not an empty stage. The account is deleted at the end.

    python3 site/e2e/web/live/web_firstrun_live.py [--base URL] [--out PREFIX] [--app ~/dev/yui]

Needs a Supabase access token like the app repo's supabase/tests, and Playwright from ~/dev/ablejobs.
"""
import argparse, json, subprocess, sys, tempfile, uuid
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("--base", default="https://www.yuigui.com")
ap.add_argument("--out", default="/tmp/yui-firstrun")
ap.add_argument("--app", default=str(Path.home() / "dev/yui"))
args = ap.parse_args()
exec(open(Path(args.app) / "supabase/tests/agents_test.py").read().split("results = []")[0])

JS = r"""
import { createRequire } from "module";
const require = createRequire(process.env.PW_ROOT + "/package.json");
const { chromium } = require("playwright");
const { BASE, ID, TOKEN, OUT } = process.env;
const b = await chromium.launch();
const res = [];
for (const scheme of ["light", "dark"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
  const pg = await ctx.newPage();
  await pg.route("**/functions/v1/yui-auth", (r) => r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ access_token: TOKEN, refresh_token: "r-" + ID, expires_in: 3000, user: { id: ID } }) }));
  await pg.addInitScript(([id]) => { const r = indexedDB.open("yui-web", 1); r.onupgradeneeded = () => r.result.createObjectStore("session"); r.onsuccess = () => r.result.transaction("session", "readwrite").objectStore("session").put({ refresh: "r-" + id, user: { id }, at: Date.now() }, "session"); }, [ID]);
  await pg.goto(BASE + "/web" + (scheme === "light" ? "?theme=light" : ""), { waitUntil: "networkidle" });
  await pg.getByTestId("crew-pick").waitFor({ timeout: 15000 }).catch(() => {});
  res.push({ scheme, picker: await pg.getByTestId("crew-pick").count(), rows: await pg.locator("[data-testid^=crew-pick-]").count(), own: await pg.getByTestId("crew-own").count() });
  await pg.screenshot({ path: `${OUT}-${scheme}.png` });
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(res));
"""

uid = str(uuid.uuid4())
sql(f"insert into yui_users(id, apple_sub) values ('{uid}','test.{uid}')")
ok = False
try:
    js = Path(tempfile.mkdtemp()) / "shot.mjs"
    js.write_text(JS)
    env = {**__import__("os").environ, "BASE": args.base, "ID": uid, "TOKEN": mint(uid, ttl=3000), "OUT": args.out,
           "PW_ROOT": str(Path.home() / "dev/ablejobs")}
    out = subprocess.run(["node", str(js)], env=env, capture_output=True, text=True, timeout=180)
    res = json.loads(out.stdout.strip().splitlines()[-1]) if out.stdout.strip() else []
    for r in res:
        good = r["picker"] == 1 and r["rows"] >= 3 and r["own"] == 1
        print(f"{'PASS' if good else 'FAIL'}  {r['scheme']}: crew picker {r['picker']}, starters {r['rows']}, bring-my-own {r['own']}")
    ok = len(res) == 2 and all(r["picker"] == 1 and r["rows"] >= 3 and r["own"] == 1 for r in res)
    if not res: print("FAIL  no result", out.stderr[-300:])
finally:
    sql(f"delete from yui_users where id = '{uid}'")
    left = sql(f"select (select count(*) from yui_users where id='{uid}') + (select count(*) from yui_agents where user_id='{uid}') as n")[0]["n"]
    print(f"{'PASS' if left == 0 else 'FAIL'}  throwaway account deleted, rows left {left}")
    ok = ok and left == 0
sys.exit(0 if ok else 1)

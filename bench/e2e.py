# Browser check of the playground. Usage: python3.14 e2e.py [base_url]
import sys, json
from playwright.sync_api import sync_playwright
base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3947"
out = "/Users/urzas/dev/yui/bench/shots"
res = {"console_errors": [], "screens": []}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 1000})
    pg.on("console", lambda m: m.type == "error" and res["console_errors"].append(m.text))
    pg.on("pageerror", lambda e: res["console_errors"].append(str(e)))
    pg.goto(base + "/playground", wait_until="networkidle")
    n = pg.locator("select option").count()
    for i in range(n):
        pg.select_option("select", index=i)
        pg.wait_for_timeout(400)
        name = pg.locator("select option").nth(i).inner_text()
        nodes = pg.locator(".pg-node").count()
        tabs = pg.locator(".pg-tab").all_inner_texts()
        errs = pg.locator(".pg-ev.err").all_inner_texts()
        res["screens"].append({"i": i, "name": name, "nodes_on_shown_screen": nodes, "tabs": tabs, "errors": errs})
        pg.locator(".pg-phone").screenshot(path=f"{out}/s{i+1:02d}.png")
    # tap test on sample 2 (ask)
    pg.select_option("select", index=1); pg.wait_for_timeout(300)
    pg.locator(".pg-phone button", has_text="Yes").click(); pg.wait_for_timeout(200)
    res["tap_event"] = pg.locator(".pg-ev.user code").first.inner_text()
    # live patch on the demo timer
    pg.select_option("select", index=10); pg.wait_for_timeout(1500)
    before = pg.locator(".yl-timer .yl-sub").inner_text()
    t1 = pg.locator(".ring .t").inner_text()
    pg.fill(".pg-agent input", "~hiit rounds=10"); pg.press(".pg-agent input", "Enter"); pg.wait_for_timeout(1200)
    after = pg.locator(".yl-timer .yl-sub").inner_text()
    t2 = pg.locator(".ring .t").inner_text()
    res["patch"] = {"before": before, "after": after, "clock_before": t1, "clock_after": t2}
    pg.locator(".pg-phone").screenshot(path=f"{out}/patch.png")
    # streaming: count nodes over time on sample 9 (3 lines)
    pg.select_option("select", index=8); pg.wait_for_timeout(300)
    pg.click("text=Stream it")
    seen = []
    for _ in range(60):
        seen.append(pg.locator(".pg-node").count())
        pg.wait_for_timeout(50)
    res["stream_node_counts"] = sorted(set(seen))
    res["stream_first_seen"] = {k: seen.index(k) * 50 for k in sorted(set(seen))}
    pg.wait_for_timeout(1500)
    pg.screenshot(path=f"{out}/playground_full.png", full_page=True)
    # spec page
    pg.goto(base + "/yl", wait_until="networkidle")
    res["spec_h1"] = pg.locator("article h1").first.inner_text()
    b.close()
print(json.dumps(res, indent=1))

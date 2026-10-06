#!/usr/bin/env python3
"""The native contract of the bundled player (what the app's MotionView relies on), tested in headless Chrome
with a stub of webkit.messageHandlers.yui. Fails on any broken verb.

  uv run --with playwright python site/scripts/motion/test_bundle.py [film.json]"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bundle_player
from playwright.sync_api import sync_playwright

film = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "public", "demo", "motion", "gallery", "heart-r1.json")))
STUB = "window.__msgs=[];window.webkit={messageHandlers:{yui:{postMessage:m=>window.__msgs.push(m)}}};"
fails = []
def check(c, msg):
    print(("ok   " if c else "FAIL ") + msg)
    if not c: fails.append(msg)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 390, "height": 844})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script(STUB)
    pg.route('http://app.local/', lambda r: r.fulfill(body=bundle_player.bundle(), content_type='text/html'))
    pg.goto('http://app.local/')
    pg.wait_for_function("window.yui && window.__msgs.some(m => m.motion === 'ready')")
    pg.evaluate("t => window.yui.theme(t)", {"ink": "#0b0813", "accent": "#ff6b4a"})
    for s in film["scenes"]:
        pg.evaluate("s => window.yui.scene(s)", {"name": s["name"], "dur": s["dur"], "code": s["code"]})
    pg.wait_for_function("window.__msgs.some(m => m.motion === 'first-frame')", timeout=5000)
    msgs = lambda v: [m for m in pg.evaluate("window.__msgs") if m["motion"] == v]
    check(len(msgs("first-frame")) == 1, "first-frame once")
    check(msgs("timeline") and msgs("timeline")[-1]["scenes"] == len(film["scenes"]), "timeline reports the scenes")
    pg.wait_for_function("window.__msgs.filter(m => m.motion === 'cues').length >= %d" % len(film["scenes"]), timeout=8000)
    cues = msgs("cues")
    check(all(isinstance(m["cues"], list) for m in cues) and any(m["cues"] for m in cues), "cues arrive per scene with film-time stamps")
    check(all(c["to"] >= c["from"] for m in cues for c in m["cues"]), "cue times ordered")
    pg.evaluate("window.yui.pause(true)")
    t1 = msgs("time")[-1]["t"]; pg.wait_for_timeout(600)
    check(msgs("time")[-1]["paused"] is True and abs(msgs("time")[-1]["t"] - t1) < 0.05, "pause holds the clock")
    pg.evaluate("window.yui.seek(5)"); pg.evaluate("window.yui.pause(false)"); pg.wait_for_timeout(700)
    check(msgs("time")[-1]["t"] >= 5, "seek moves the clock")
    pg.evaluate("window.yui.still(true)"); pg.wait_for_timeout(500)
    tl = msgs("timeline")[-1]["total"]; check(msgs("time")[-1]["t"] >= tl - 0.2, "still jumps to the last frame")
    pg.evaluate("window.yui.still(false); window.yui.end(); window.yui.seek(%f)" % (msgs("timeline")[-1]["total"] - 0.3))
    pg.wait_for_function("window.__msgs.some(m => m.motion === 'ended')", timeout=4000)
    check(len(msgs("ended")) >= 1, "ended fires after end() and the clock reaches the last scene")
    pg.evaluate("window.yui.replay()"); pg.wait_for_timeout(400)
    check(msgs("time")[-1]["t"] < 1.0, "replay restarts the clock")
    pg.evaluate("window.yui.scene({name:'bad',dur:3,code:'this is not js ('})")
    check(any(m["motion"] == "error" and m["scene"] == "bad" for m in pg.evaluate("window.__msgs")), "a scene that does not parse reports an error")
    pg.evaluate("window.yui.scene({name:'throws',dur:3,code:'throw new Error(\"boom\")'})"); pg.evaluate("window.yui.seek(1e6)"); pg.wait_for_timeout(500)
    check(any(m["motion"] == "error" and m["scene"] == "throws" for m in pg.evaluate("window.__msgs")), "a scene that throws reports an error and the page lives")
    pg.evaluate("window.yui.scene({name:'tap',dur:3,code:'api.hit(\"a\", 100, 100, 40); api.circle(100,100,30,{});'})"); pg.evaluate("window.yui.seek(1e6)"); pg.wait_for_timeout(300)
    pg.mouse.click(100, 100); pg.wait_for_timeout(200)
    check(any(m["motion"] == "tap" and m.get("id") == "a" for m in pg.evaluate("window.__msgs")), "a tap on api.hit reports its id")
    pg.mouse.click(300, 600); pg.wait_for_timeout(200)
    check(any(m["motion"] == "tap" and "id" not in m for m in pg.evaluate("window.__msgs")), "a tap elsewhere is the chrome's")
    # api.three(): lazy, the host answers need-three with yui.three(src); the clock holds until then
    pg.evaluate("window.__msgs.length = 0; window.yui.replay()")
    pg.evaluate("window.yui.scene({name:'cube',dur:3,code:'const T=api.three(); T.once(()=>{T.m=new T.THREE.Mesh(new T.THREE.BoxGeometry(1,1,1),new T.THREE.MeshBasicMaterial({color:0xff0000}));T.scene.add(T.m)}); T.m.rotation.y=t; T.draw();'})")
    pg.wait_for_function("window.__msgs.some(m => m.motion === 'need-three')", timeout=3000)
    check(len(msgs("need-three")) == 1, "a scene that calls api.three() asks the host for the library, once")
    pg.evaluate("window.yui.seek(1e6)"); pg.wait_for_timeout(300)
    check(not any(m["motion"] == "error" and m["scene"] == "cube" for m in pg.evaluate("window.__msgs")), "the scene waits (no error) until three.js arrives")
    pg.evaluate("src => window.yui.three(src)", open(os.path.join(os.path.dirname(__file__), "..", "..", "public", "demo", "motion", "three.min.js")).read())
    pg.evaluate("window.yui.seek(1e6)"); pg.wait_for_timeout(500)
    px = pg.evaluate("(() => { const cv = document.getElementById('cv'), d = cv.getContext('2d').getImageData(cv.width/2-4, cv.height/2-4, 8, 8).data; return [d[0], d[1], d[2]]; })()")
    check(not any(m["motion"] == "error" and m["scene"] in ("cube", "three") for m in pg.evaluate("window.__msgs")), "after yui.three(src) the scene runs")
    check(not errs, "no page errors: %s" % errs[:2])
    b.close()
print("FAILED" if fails else "all ok")
sys.exit(1 if fails else 0)

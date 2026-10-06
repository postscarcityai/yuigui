#!/usr/bin/env python3
"""Inline kit.js and geo-data.js into player.html: one file with no src, for a web view that loads a string
(the app's MotionView, no base URL). Writes the bundle to the path given, or prints its size.

  python3 site/scripts/motion/bundle_player.py <out.html>      # e.g. ~/dev/yui/Yui/Resources/motion-player.html
The app copy is a build input, like sync_yl.py's parser copy: re-run it after any change to kit.js, geo-data.js
or player.html (the yui repo's test compares its copy with this output)."""
import os, re, sys

M = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "demo", "motion")

def bundle():
    html = open(os.path.join(M, "player.html")).read()
    for name in ("kit.js", "geo-data.js"):
        js = open(os.path.join(M, name)).read()
        assert "</script" not in js
        html = html.replace(f'<script src="{name}"></script>', "<script>\n" + js + "\n</script>")
    # the app has no base URL: the CSP keeps no network, scripts are inline
    html = html.replace("script-src 'self' 'unsafe-inline' 'unsafe-eval'", "script-src 'unsafe-inline' 'unsafe-eval'")
    assert 'src="' not in re.sub(r"<script>.*?</script>", "", html, flags=re.S)
    return html

if __name__ == "__main__":
    h = bundle()
    if len(sys.argv) > 1:
        open(sys.argv[1], "w").write(h)
    print(len(h), "bytes")

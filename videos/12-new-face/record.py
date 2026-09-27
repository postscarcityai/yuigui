#!/usr/bin/env python3
"""Film the real app for 12-new-face: Yui 0.4.1, build 208 (yui 0b6f0b6).

Each scene is a test in BragLayoutTests.swift (kept here, not in the app repo: copy it into
YuiUITests/ of a yui worktree at 0b6f0b6, run xcodegen generate, build for testing). It plays on the demo
account (scripted voice and replies, no network) while `simctl io recordVideo` films
the simulator, and writes the moments the edit cuts on. Like yui's
scripts/promo_videos.py, the marks are anchored on the END of the recording
(recordVideo says "started" a second or two before frames flow).

    python3 record.py --app ~/dev/yui/.worktrees/soc6-b208 --sim <udid> [scene ...]

Out: work/raw/<scene>.mp4 (variable frame rate, as filmed), work/raw/<scene>.json
(marks in seconds into the file), then work/frames/<scene>/f%05d.jpg at 30 fps for
the comp. Build for testing first (xcodebuild build-for-testing -derivedDataPath DD).
"""
import argparse
import json
import os
import shutil
import signal
import subprocess
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
RAW = HERE / "work" / "raw"
FRAMES = HERE / "work" / "frames"
ENV = {**os.environ, "DEVELOPER_DIR": "/Applications/Xcode.app/Contents/Developer"}
ENV.pop("HERMES_HOME", None)
SCENES = {
    "brag-talk": "testBragTalk",
    "brag-parts": "testBragParts",
    "brag-motion-coach": "testBragMotionCoach",
    "brag-motion-wizard": "testBragMotionWizard",
    "brag-visual-voice": "testBragVisualVoice",
    "brag-visual-music": "testBragVisualMusic",
}


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def record(app, udid, dd, name, marks_dir):
    raw = RAW / f"{name}.mp4"
    rec = subprocess.Popen(["xcrun", "simctl", "io", udid, "recordVideo", "--codec=h264", "--force", str(raw)],
                           env=ENV, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    line = ""
    while "Recording started" not in line and rec.poll() is None:
        line = rec.stdout.readline()
    env = {**ENV, "TEST_RUNNER_YUI_CLIPS": str(marks_dir)}
    cmd = ["xcodebuild", "test-without-building", "-project", "Yui.xcodeproj", "-scheme", "Yui",
           "-destination", f"id={udid}", "-derivedDataPath", str(dd),
           f"-only-testing:YuiUITests/BragLayoutTests/{SCENES[name]}"]
    with open(HERE / "work" / f"{name}-test.log", "w") as f:
        code = subprocess.run(cmd, cwd=app, env=env, stdout=f, stderr=subprocess.STDOUT).returncode
    stop = time.time()
    rec.send_signal(signal.SIGINT)
    rec.wait(timeout=60)
    mark = marks_dir / f"{name}.json"
    if code or not mark.exists() or not raw.exists():
        print(f"[{name}] FAILED (test exit {code})")
        return False
    t0 = stop - duration(raw)
    m = {k: round(v - t0, 2) for k, v in json.loads(mark.read_text()).items()}
    (RAW / f"{name}.json").write_text(json.dumps(m, indent=2, sort_keys=True) + "\n")
    print(f"[{name}] {duration(raw):.1f}s, marks {m}")
    return True


def frames(name):
    """Fill the variable frame rate to 30 fps first, then cut to the scene (start to end)."""
    m = json.loads((RAW / f"{name}.json").read_text())
    out = FRAMES / name
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    a, z = m["start"], m["end"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(RAW / f"{name}.mp4"),
                    "-vf", f"fps=30,trim=start={a}:end={z},setpts=PTS-STARTPTS,scale=804:-2",
                    "-q:v", "3", str(out / "f%05d.jpg")], check=True)
    n = len(list(out.glob("f*.jpg")))
    (out / "marks.json").write_text(json.dumps({k: round(v - a, 2) for k, v in m.items()}, indent=2, sort_keys=True) + "\n")
    print(f"[{name}] {n} frames")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--app", required=True, type=Path)
    ap.add_argument("--sim", required=True)
    ap.add_argument("--dd", default="/tmp/yui-soc6-dd", type=Path)
    ap.add_argument("--frames-only", action="store_true")
    ap.add_argument("scenes", nargs="*")
    a = ap.parse_args()
    names = a.scenes or list(SCENES)
    RAW.mkdir(parents=True, exist_ok=True)
    marks_dir = HERE / "work" / "marks"
    marks_dir.mkdir(parents=True, exist_ok=True)
    if not a.frames_only:
        subprocess.run(["xcrun", "simctl", "status_bar", a.sim, "override", "--time", "9:41", "--batteryState", "charged",
                        "--batteryLevel", "100", "--cellularMode", "active", "--cellularBars", "4", "--wifiBars", "3"], env=ENV)
        for n in names:
            record(a.app, a.sim, a.dd, n, marks_dir)
    for n in names:
        if (RAW / f"{n}.json").exists():
            frames(n)

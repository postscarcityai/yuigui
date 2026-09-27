"""Music for the pop sting (13-brand). python3 videos/13-brand/sting-pop/music.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from music_sting import make  # noqa: E402

make(Path(__file__).resolve().parent)

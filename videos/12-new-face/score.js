// One score for picture and sound: comp.html reads it as window.SCORE, music.py parses the JSON.
// 100 BPM, a beat is 0.6 s, a bar is 2.4 s, 28 bars is 67.2 s.
// The app's own taps come from the real recording (work/frames/*/marks.json and frame diffs),
// so they land where the app moved, not on the grid.
window.SCORE = {
  "bpm": 100,
  "bars": 28,
  "pages": [1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4],
  "stage": 7.2,
  "hold": [8.2, 10.3],
  "answer": 14.2,
  "taps": [
    [22.42, "h-next"],
    [26.98, "h-next"],
    [31.52, "h-next"],
    [35.02, "h-ping"],
    [37.57, "h-tuner"],
    [40.08, "h-send"],
    [41.3, "h-rec"],
    [57.7, "h-play"]
  ],
  "parts": [19.47, 22.47, 27.03],
  "sent": 40.13,
  "cuts": [16.8, 31.2, 40.8, 45.6, 55.2],
  "outro": 62.4
};

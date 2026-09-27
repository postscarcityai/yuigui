// One score for picture and sound: comp.html reads it as window.SCORE, music.py parses the JSON.
// 100 BPM, a beat is 0.6 s, a bar is 2.4 s, 14 bars is 33.6 s. Every tap lands on a beat.
window.SCORE = {
  "bpm": 100,
  "bars": 14,
  "sections": [[0, 1, 1], [1, 2, 2], [2, 6, 3], [6, 9, 4], [9, 12, 3], [12, 13, 2], [13, 14, 1]],
  "taps": [
    [4.8, "b-mic"],
    [14.4, "b-next"],
    [15.0, "m1"], [15.6, "m7"],
    [16.2, "m0"], [16.8, "m5"],
    [18.0, "m3"], [18.6, "m5"],
    [21.6, "b-next"],
    [22.8, "qa"],
    [27.0, "y1"],
    [27.6, "sendq"]
  ],
  "flips": [[19.2, 0], [19.35, 10], [19.5, 2], [19.65, 8], [19.8, 4], [19.95, 9], [20.1, 6], [20.25, 11]],
  "matches": [15.6, 18.6],
  "miss": [16.8, 17.5],
  "cleared": 20.4,
  "picture": 9.6,
  "right": 22.8,
  "reply": 24.6,
  "sent": 27.6,
  "drop": 4.8,
  "cuts": [9.6, 14.4, 21.6, 24.0],
  "outro": 28.8
};

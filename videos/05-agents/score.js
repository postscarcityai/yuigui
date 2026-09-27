// One score for picture and sound: comp.html reads it as window.SCORE, music.py parses the JSON.
// 100 BPM, a beat is 0.6 s, a bar is 2.4 s, 25 bars is 60 s. Every tap lands on a beat.
window.SCORE = {
  "bpm": 100,
  "bars": 25,
  "looks": [[1.2, "hC"], [1.8, "hW"], [2.4, "hZ"], [3.0, "hS"], [3.6, "hY"]],
  "taps": [
    [6.0, "sw-add"],
    [8.4, "chip-coach"],
    [9.6, "sh-get"],
    [13.8, "sh-hi"],
    [15.0, "cT-send"],
    [17.4, "cT-cb1"],
    [19.2, "sw-wizard"],
    [24.6, "wT-field"],
    [26.4, "pop-coach"],
    [28.2, "wT-send"],
    [33.6, "sw-yui"],
    [34.8, "yT-send"],
    [38.4, "yT-use"],
    [40.8, "sw-wizard"]
  ],
  "cuts": [4.8, 14.4, 24.0, 33.6, 43.2],
  "connected": 12.0,
  "applied": 38.4,
  "chips": 44.4,
  "outro": 52.8
};

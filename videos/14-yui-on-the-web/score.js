// One score for picture and sound: comp.html reads it as window.SCORE, music.py parses the JSON.
// 100 BPM, a beat is 0.6 s, a bar is 2.4 s, 22 bars is 52.8 s.
window.SCORE = {
  "bpm": 100,
  "bars": 22,
  "slide": 2.4,
  "scenes": [["open", 3.6], ["voice", 12.0], ["dismiss", 24.0], ["ask", 31.2]],
  "cuts": [3.6, 12.0, 24.0, 31.2],
  "taps": [14.0, 19.5, 26.9, 32.3, 38.6],
  "say": {"laptop": 14.0, "phone": 19.5},
  "outro": 45.6
};

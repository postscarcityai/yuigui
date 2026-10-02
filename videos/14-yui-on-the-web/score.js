// One score for picture and sound: comp.html reads it as window.SCORE, music.py parses the JSON.
// 100 BPM, a beat is 0.6 s, a bar is 2.4 s, 17 bars is 40.8 s.
window.SCORE = {
  "bpm": 100,
  "bars": 17,
  "slide": 2.4,
  "scenes": [["open", 3.6], ["dismiss", 12.0], ["ask", 19.2]],
  "cuts": [3.6, 12.0, 19.2],
  "taps": [14.9, 20.3, 26.6],
  "outro": 33.6
};

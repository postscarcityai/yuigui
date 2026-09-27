// One score for picture and sound: comp.html reads it as window.SCORE, music.py parses the JSON.
// 100 BPM, a beat is 0.6 s, a bar is 2.4 s, 14 bars is 33.6 s. Every tap and every part lands on a beat.
window.SCORE = {
  "bpm": 100,
  "bars": 14,
  "taps": [
    [4.2, "b-mic"],
    [26.4, "qa"],
    [27.0, "sendall"]
  ],
  "listen": 4.5,
  "work": 7.8,
  "parts": [9.6, 12.0, 14.4, 16.8, 24.0],
  "nexts": [11.4, 13.8, 16.2],
  "spinachDone": 15.9,
  "sleep": 18.4,
  "lock": 19.2,
  "jump": [20.4, 22.8],
  "ding": 22.8,
  "unlock": 24.0,
  "questions": 25.8,
  "sent": 27.0,
  "outro": 28.8
};

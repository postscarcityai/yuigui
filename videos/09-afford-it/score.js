// One score for picture and sound: comp.html reads it as window.SCORE, music.py parses the JSON.
// 100 BPM, a beat is 0.6 s, a bar is 2.4 s, 14 bars is 33.6 s. Every tap lands on a beat.
// The loan is computed from "loan" in both places: M = L*r/(1-(1+r)^-n), r = apr/12.
window.SCORE = {
  "bpm": 100,
  "bars": 14,
  "carIn": 0.0,
  "carOut": 4.2,
  "drop": 4.8,
  "taps": [
    [5.4, "b-mic"],
    [13.2, "b-next"],
    [21.0, "b-next"],
    [24.6, "b-next"],
    [25.8, "q1a"],
    [26.4, "q2a"],
    [27.6, "sendall"]
  ],
  "listen": [5.4, 7.8],
  "work": [7.8, 9.6],
  "parts": [9.6, 13.2, 21.0, 24.6],
  "drag": { "t0": 15.6, "t1": 18.6, "from": 3000, "to": 8000, "snap": 100 },
  "loan": { "price": 32000, "apr": 0.065, "months": 60, "budget": 540, "used": 24000 },
  "sent": 27.6,
  "outro": 28.8
};

// The journey's clock: 122 BPM, 30 bars, every scene on a bar line. Read by comp.html and music.py.
export const BPM = 122;
export const BAR = 240 / BPM;
export const B = (n) => n * BAR;
export const SCENE = {
  sketch: [0, 4], dial: [4, 7], ink: [7, 11], stone: [11, 15], glaze: [15, 17], cloth: [17, 19],
  pop: [19, 22], napkin: [22, 25], all: [25, 28], end: [28, 30],
};
export const LAND = { sketch: B(0) + 0.6, pop: B(19) + 0.15, final: B(27) + 0.9 };
export const WINK = B(23) + 0.5;
export const DURATION = B(30);

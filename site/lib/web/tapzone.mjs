// YUI-288: a tap on a full-screen page of the stage pages, like the app's. The left third goes back one
// page (nothing on the first page), the rest goes forward (nothing on the last). A control keeps its tap.
export const LEFT = 1 / 3;
const CONTROLS = "button, a, input, textarea, select, label, summary, [role=button], [role=slider], [role=option], [role=checkbox], [role=switch], [role=link], [contenteditable=true], canvas, .yl-map, .yl-keys, .yl-drums, .yl-pad, .yl-loop, .yl-game, .yl-deck, [data-own-drag], [data-own-tap]";

// at: the screen on show (0 is the home, 1 and up are the pages), n: how many screens. Returns the screen to go to, or null.
export function tapTarget({ x, left, width, at, n }) {
  if (at < 1 || n < 2 || !(width > 0)) return null;
  const back = (x - left) / width < LEFT;
  if (back) return at > 1 ? at - 1 : null;
  return at < n - 1 ? at + 1 : null;
}

// True when the tap landed on something that does its own work (or a text selection is being made).
export function isControl(el, selection = "") {
  if (selection) return true;
  return !!el?.closest?.(CONTROLS);
}

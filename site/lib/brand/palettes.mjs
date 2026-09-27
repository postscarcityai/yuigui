// Brand lab colors, one set per direction. Round 1.
// Every set starts from the sketch: cocoa paper on warm white. The contrast numbers come
// from the same WCAG helper the app's looks use (lib/yl/look.mjs).
import { contrast, rgb } from "../yl/look.mjs";

export const DIRECTIONS = [
  {
    id: "sketch", name: "The sketch", medium: "Cut paper",
    note: "Where it starts. Six pieces of cocoa paper on warm white.",
    bg: "#E5DED4", mark: "#9E6153", ink: "#3B2A25",
    swatches: [["Paper", "#E5DED4"], ["Cocoa", "#9E6153"], ["Shadow", "#6E4238"]],
  },
  {
    id: "mark", name: "The mark", medium: "Vector, one color",
    note: "The Apple test. One silhouette, one color, and it still reads at 16 px.",
    bg: "#FFFFFF", mark: "#1D1B20", ink: "#1D1B20",
    swatches: [["Ink", "#1D1B20"], ["White", "#FFFFFF"], ["Coral", "#FF7E8A"], ["Cocoa", "#9E6153"]],
  },
  {
    id: "meok", name: "Hanji and meok", medium: "Ink on mulberry paper",
    note: "Ink that bleeds into paper fiber, a red seal, a thread of dancheong color.",
    bg: "#F3EDE1", mark: "#1E1B1A", ink: "#1E1B1A",
    swatches: [["Hanji", "#F3EDE1"], ["Meok", "#1E1B1A"], ["Seal", "#C8372D"], ["Pine", "#2E6B5A"], ["Ochre", "#D9A441"]],
  },
  {
    id: "quiet", name: "Seoul quiet", medium: "Stone, oat, clay",
    note: "A cafe in Seongsu at 8 am. Pressed into stone, lit from the side, lots of air.",
    bg: "#EDE6DA", mark: "#9A6E58", ink: "#3B3835",
    swatches: [["Oat", "#EDE6DA"], ["Clay", "#9A6E58"], ["Stone", "#8C8680"], ["Charcoal", "#3B3835"]],
  },
  {
    id: "celadon", name: "Celadon and bojagi", medium: "Glaze and cloth",
    note: "Goryeo glaze with its fine crackle. The six pieces sewn as a bojagi, light coming through.",
    bg: "#E8EEE6", mark: "#4F8472", ink: "#2F4A40",
    swatches: [["Glaze", "#A9C4B0"], ["Deep", "#4F8472"], ["Ramie", "#EFE7D2"], ["Rose", "#D98A8A"], ["Plum", "#8C6A9E"]],
  },
  {
    id: "pop", name: "Pop, sprinkled", medium: "Sticker, foil, chrome",
    note: "A pinch of idol merch. One sticker sheet, one foil, then we stop.",
    bg: "#FFF1F7", mark: "#E8388F", ink: "#2A1F3D",
    swatches: [["Bubble", "#E8388F"], ["Soda", "#5CE1E6"], ["Lime", "#C6F432"], ["Lilac", "#B8A6FF"]],
  },
  {
    id: "coral", name: "Today's coral", medium: "The site as it is",
    note: "The first attempt's color, kept for comparison.",
    bg: "#FFF9F0", mark: "#FF7E8A", ink: "#3A3340",
    swatches: [["Cream", "#FFF9F0"], ["Coral", "#FF7E8A"], ["Ink", "#3A3340"], ["Coral text", "#C23B4F"]],
  },
];

export const byId = Object.fromEntries(DIRECTIONS.map((d) => [d.id, d]));

export function ratio(a, b) {
  return Math.round(contrast(rgb(a), rgb(b)) * 10) / 10;
}

// For a swatch label: which of two inks reads on it.
export function onColor(hex, dark = "#1D1B20", light = "#FFFFFF") {
  return ratio(hex, dark) >= ratio(hex, light) ? dark : light;
}

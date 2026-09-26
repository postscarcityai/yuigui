// The live release demo (YUI-90) with its lines, drawn from the board exports at build time.
// Server side only: kept out of samples.mjs (which bench/ runs under plain node) and out of the
// playground's browser bundle (the exports are big; the lines are a few hundred bytes).
import board from "../../content/board.json";
import builds from "../../content/builds.json";
import { releaseLines } from "../release.mjs";
import { RELEASE_META } from "./release-meta.mjs";

export const RELEASE_YL = releaseLines(board, builds);
export const RELEASE = RELEASE_META.map((s) => ({ ...s, yl: RELEASE_YL }));

// App cards that are done in the code but not on TestFlight yet: the YUI- keys in builds.json's `next`
// list (scripts/export-builds.mjs). When the next build goes VALID the export empties `next` and every
// "Next build" label on the site turns back into "Shipped" by itself.
import builds from "../content/builds.json";

export const NEXT_BUILD = new Set((builds.next || []).map((c) => c.card).filter((k) => /^YUI-/.test(k || "")));
export const inNextBuild = (keys) => [].concat(keys || []).some((k) => NEXT_BUILD.has(k));
export const NEXT_BUILD_NOTE = "Done in the code, reaches TestFlight with the next build.";

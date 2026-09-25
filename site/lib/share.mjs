// Share links (SITE-19): one stable URL for every See it entry, playground sample and clip.
// /s/<id> draws the screen and carries its own preview image (app/s/[id]/opengraph-image.js).
// Ids: See it entries keep their id, samples are try-<slug>, clips are clip-<name>.
// Never rename an id once it has shipped: people have posted the link.
import showcase from "../content/showcase.json";
import clips from "../public/demo/clips/clips.json";
import videos from "../public/demo/videos/videos.json";
import { SCREENS, DEMOS, MEDIA, SCIENCE, FLOWS, DATA } from "./yl/samples.mjs";
import { slug } from "./slug.mjs";

export const SAMPLES = [...SCREENS, ...DEMOS, ...MEDIA, ...SCIENCE, ...FLOWS, ...DATA];
export const sampleSlug = (s) => s.slug || slug(s.name.replace(/^demo:\s*/i, ""));
export const findSample = (k) => SAMPLES.find((s) => s.slug === k || s.name === k || sampleSlug(s) === k);

// Drop comment lines: what a person reads is the screen, not our notes.
export const cleanYL = (yl) => (yl || "").split("\n").filter((l) => l.trim() && !l.trim().startsWith("#")).join("\n");

const clipOf = (name) => {
  if (!name) return null;
  const c = clips[name];
  return c ? { src: c["9x16"].src, poster: c["9x16"].poster } : { src: `/demo/clips/${name}.mp4`, poster: `/demo/clips/${name}.jpg` };
};

// See it names preset entries by the preset ("timer"); a shared link leads with what it does.
const firstSentence = (t) => (t || "").split(/(?<=[.!?:])\s/)[0].replace(/[:.]$/, "");
const headlineOf = (e) => (/^[a-z]+$/.test(e.title) && e.what ? firstSentence(e.what) : e.title);

const items = [];
for (const g of showcase.groups) {
  for (const e of g.entries) {
    const s = e.demo ? findSample(e.demo) : null;
    items.push({
      id: e.id, kind: "entry", title: headlineOf(e), preset: /^[a-z]+$/.test(e.title) ? e.title : null, what: e.what, yl: cleanYL(e.yl || s?.yl), agent: e.agent || "Yui",
      planned: !!g.planned, clip: clipOf(e.clip), shots: e.shots || [], cards: e.cards || [], home: `/mockups#${e.id}`,
      sample: s ? sampleSlug(s) : null, video: e.video ? videos[e.video] : null,
    });
  }
}
for (const s of SAMPLES) {
  const k = sampleSlug(s);
  items.push({
    id: `try-${k}`, kind: "sample", title: s.name.replace(/^Demo:\s*/, ""), what: s.what || s.desc || null, yl: cleanYL(s.yl), agent: s.agent || "Yui",
    planned: false, clip: null, shots: [], cards: [], home: s.slug ? `/playground?demo=${s.slug}` : null, sample: k,
  });
}
for (const [name, c] of Object.entries(clips)) {
  const e = items.find((x) => x.kind === "entry" && x.clip?.src === c["9x16"].src);
  items.push({
    id: `clip-${name}`, kind: "clip", title: c.caption, what: c.caption, yl: e?.yl || "", agent: e?.agent || "Yui",
    planned: false, clip: clipOf(name), shots: [], cards: e?.cards || [], home: e ? e.home : "/mockups", sample: e?.sample || null,
  });
}

const byId = new Map();
for (const it of items) if (!byId.has(it.id)) byId.set(it.id, it);

export const shareItems = () => [...byId.values()];
export const shareItem = (id) => byId.get(id) || null;
export const shareUrl = (id) => `/s/${id}`;
// The share link for a See it entry, or null.
export const entryShare = (entryId) => (byId.get(entryId)?.kind === "entry" ? shareUrl(entryId) : null);

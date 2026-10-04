// What the stage's mic hands to the page on show (YUI-283): the web twin of Presets/PageVoice.swift (t_7d424132).
// The page registers what it can fill; words said while it is up become a `fill` the page applies. The request
// lives here, not in the page, because the page unmounts while the mic listens (the stage draws the heard words
// in its place) and remounts when it stops.
import { fill as mapFill } from "./voicefill.mjs";

export function createPageVoice() {
  let page = null;
  let serial = 0;
  let current = null;
  const subs = new Set();
  const marks = new Map(); // page id -> the field keys a voice filled, until the person edits them
  const state = {
    // The mic is open: the page under it is unmounted, not gone.
    listening: false,
    get id() { return page ? page.id : null; },
    get page() { return page; },
    get fill() { return current; },
    // page: { id, fields, current } for a form, { id, words: true, current } for a page that takes the words as they are.
    register(p) {
      page = p;
      if (current && current.id !== p.id) current = null;
    },
    // The page left. Not while the mic listens: the page comes back when it stops.
    clear(id) {
      if (state.listening || !page || page.id !== id) return;
      page = null;
      current = null;
    },
    reset() { page = null; current = null; marks.clear(); },
    marked: (id) => [...(marks.get(id) || [])],
    mark(id, keys) { marks.set(id, new Set([...(marks.get(id) || []), ...keys])); },
    unmark(id, key) { marks.get(id)?.delete(key); },
    consume(f) { if (current === f) current = null; },
    // Spoken words for the page on show. False: nothing to fill, the words go to the agent.
    hear(words) {
      if (!page) return false;
      if (page.fields) {
        const values = mapFill(words, page.fields, page.current || {});
        if (!Object.keys(values).length) return false;
        current = { id: page.id, serial: ++serial, values };
      } else {
        const t = String(words || "").trim();
        if (!t) return false;
        current = { id: page.id, serial: ++serial, words: t };
      }
      for (const fn of [...subs]) fn(current);
      return true;
    },
    // A page hears its own fill, also one that was made while it was unmounted (read `fill` on mount).
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
  return state;
}

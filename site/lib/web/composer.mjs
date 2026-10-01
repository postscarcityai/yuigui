// What the composer holds (YUI-244): the words, the photos waiting, the message being answered. One store
// per open thread, shared by the thread's field and the stage's bar, so what is typed in one is in the
// other. A key redraws only what reads the store (the field and its hints), never the thread above it:
// the app's ComposerModel (Chat/Composer.swift). Half-typed words stay per agent in localStorage; sending
// clears them; a pasted key is never kept. Pure: the picker, the storage and the photo reader are injected.
import { MAX_PHOTOS, draftKey, keepable, mentionTarget, suggestions } from "./compose.mjs";

export function createComposer({ agentId, storage = globalThis.localStorage, prepare, onProblem = () => {}, now = () => Date.now() }) {
  let state = { draft: "", photos: [], reply: null, busy: 0, problem: "" };
  const listeners = new Set();
  const emit = () => { for (const fn of listeners) fn(); };
  const set = (patch) => { state = { ...state, ...patch }; emit(); };
  const read = () => { try { return storage?.getItem(draftKey(agentId)) || ""; } catch { return ""; } };
  const save = (words) => {
    try { if (keepable(words)) storage?.setItem(draftKey(agentId), words); else storage?.removeItem(draftKey(agentId)); } catch { /* private mode */ }
  };
  state.draft = read();
  let seq = 0;

  const api = {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get: () => state,
    setDraft(words) { if (words === state.draft) return; save(words); set({ draft: words, problem: state.problem && words ? "" : state.problem }); },
    // Files from the picker, a drop or a paste. Each is shrunk before it shows; the first that cannot be
    // read says why, the rest still land. Resolves to how many were added.
    async addFiles(files) {
      const list = [...files];
      let added = 0, problem = "";
      set({ busy: state.busy + 1 });
      try {
        for (const f of list) {
          if (state.photos.length >= MAX_PHOTOS) { problem = problem || "limit"; break; }
          try {
            const p = await prepare(f);
            state = { ...state, photos: [...state.photos, p] };
            added += 1;
            emit();
          } catch (e) { problem = problem || e.code || "unreadable"; }
        }
      } finally { set({ busy: state.busy - 1, problem }); }
      if (problem) onProblem(problem);
      return added;
    },
    removePhoto(id) {
      const gone = state.photos.find((p) => p.id === id);
      if (gone?.preview) try { URL.revokeObjectURL(gone.preview); } catch { /* gone */ }
      set({ photos: state.photos.filter((p) => p.id !== id) });
    },
    setReply(quote) { set({ reply: quote }); },
    clearReply() { if (state.reply) set({ reply: null }); },
    clearProblem() { if (state.problem) set({ problem: "" }); },
    // Something to send: words, or photos (Attachments: a photo alone is a message).
    get canSend() { return !!state.draft.trim() || state.photos.length > 0; },
    // The hints over the field for the current words (suggestions, who an @ goes to).
    hints({ agents, current, commands }) {
      const draft = state.draft;
      const list = suggestions(draft, { agents, current, commands });
      const to = !list.length && !draft.startsWith("/") && draft.includes("@") ? mentionTarget(draft, agents, current) : null;
      return { list, to };
    },
    // Take what is there to send, and empty the composer. words may be passed (voice) instead of the draft.
    take({ words = null, agents = [], current = null } = {}) {
      const text = (words ?? state.draft).trim();
      if (!text && !state.photos.length) return null;
      const out = {
        text,
        photos: state.photos.map((p) => ({ blob: p.blob, type: p.type })),
        reply: state.reply,
        mention: text.startsWith("/") ? null : mentionTarget(text, agents, current),
      };
      for (const p of state.photos) { try { URL.revokeObjectURL(p.preview); } catch { /* gone */ } }
      // Voice words leave the typed draft alone: someone half-typing keeps it.
      if (words == null) { save(""); state = { ...state, draft: "" }; }
      state = { ...state, photos: [], reply: null, problem: "" };
      emit();
      return out;
    },
    destroy() { listeners.clear(); for (const p of state.photos) try { URL.revokeObjectURL(p.preview); } catch { /* gone */ } },
  };
  void now;
  return api;
}

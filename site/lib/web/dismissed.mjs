// YUI-270: the asks this person dismissed or put off on /web, per agent, so the row stays gone after a refresh
// (the host closes the ask on its card; this is the phone's `removeFromMenu` for the browser). A row comes back
// only when the host draws it again after the tap (homeOf compares the times).
const KEY = (agentId) => `yui.web.dismissed.${agentId}`;
const store = (s) => { try { return s || globalThis.localStorage || null; } catch { return null; } };

export function loadDismissed(agentId, storage) {
  try {
    const v = JSON.parse(store(storage)?.getItem(KEY(agentId)) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch { return {}; }
}

export function markDismissed(agentId, id, now = Date.now(), storage) {
  const next = { ...loadDismissed(agentId, storage), [id]: now };
  try { store(storage)?.setItem(KEY(agentId), JSON.stringify(next)); } catch { /* private mode: it stays for this visit */ }
  return next;
}

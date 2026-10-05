"use client";
// The person's agent tables in this browser (lib/web/tablestore.mjs), handed down to the screens a thread draws.
// null: a screen drawn with no store (a preview) keeps the rows of its own reply, as before.
import { createContext, useContext, useSyncExternalStore } from "react";

export const TablesCtx = createContext(null);

const never = () => () => {};
// The agent's store as the screens read it: re-renders when a reply is filed or a row is ticked.
export function useAgentTables(agentId) {
  const tables = useContext(TablesCtx);
  const h = tables && agentId ? tables.agent(agentId) : null;
  useSyncExternalStore(h ? h.subscribe : never, () => (h ? h.version : 0), () => 0);
  return h;
}

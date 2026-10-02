"use client";
// The asks dismissed on this device for one agent (lib/web/dismissed.mjs), shared by the stage home and the drawer.
import { useCallback, useEffect, useState } from "react";
import { loadDismissed, markDismissed } from "../../lib/web/dismissed.mjs";

const listeners = new Set();

export function useDismissed(agentId) {
  const [map, setMap] = useState({});
  useEffect(() => {
    setMap(loadDismissed(agentId));
    const on = () => setMap(loadDismissed(agentId));
    listeners.add(on);
    return () => { listeners.delete(on); };
  }, [agentId]);
  const mark = useCallback((id) => { markDismissed(agentId, id); for (const l of listeners) l(); }, [agentId]);
  return [map, mark];
}

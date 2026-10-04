"use client";
// The agent whose thread a screen is drawn in (YUI-246): what ticks and loop drafts are kept under (lib/web/kept.mjs).
// Null in the playground and the site chat, which keep nothing.
import { createContext, useContext } from "react";

export const KeptCtx = createContext(null);
export const useKeptAgent = () => useContext(KeptCtx);

// The flow or plan a screen is drawn in (YUI-279): a form or mic inside one keeps what it holds under that id.
export const KeptScopeCtx = createContext("");
export const useKeptScope = () => useContext(KeptScopeCtx);

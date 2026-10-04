"use client";

// The stage's mic and the page under it (YUI-283). The stage provides a page voice (lib/web/pagevoice.mjs); a form or a
// mic preset on the page on show registers with it and takes what the mic hears. Outside the stage there is none, and
// a form fills by its own mic only. A plan keeps every step mounted, so only the step on show takes the voice.
import { createContext } from "react";

export const PageVoiceCtx = createContext(null);
export const StepActiveCtx = createContext(true);

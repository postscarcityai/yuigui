"use client";
// The keep scope (SITE-100, spec/YL.md section 5, Sound keeps playing). Inside it, a loop, metronome or
// latched chord that loses its screen (a swipe to another one) parks its voice in the engine instead of
// stopping, and takes it back when the screen returns. The chat and the playground provide it and call
// stopVoices when the chat closes or the page goes. Its own file so the chat can use it without loading the
// sound engine: the engine puts itself on window.yuiMusic.
import { createContext } from "react";

export const KeepCtx = createContext(false);
export const stopVoices = () => { try { window.yuiMusic?.stopAll?.(); } catch { /* nothing playing */ } };

"use client";
// The site chat's pages 2 to 12 (SITE-83, spec/YL.md section 5, Pages): one slide each beside the
// chat, drawn with the home mockup's Page. A page keeps what landed on it across replies and takes
// later patches (lib/chat/pages.mjs threadPages). Its own file so the renderers load only when a
// reply has made a page.
import { Page } from "../mockups/home/Pages";
import "../playground/flows.css";

export default function ChatPages({ state, pages, at, onTap, agent = "Yui" }) {
  return pages.map((k, i) => (
    <section key={k} className="ys-slide ys-page" data-page={k} aria-label={`Screen ${k}`} aria-hidden={at !== i + 1} inert={at !== i + 1}>
      <Page nodes={state.screens[k].filter((n) => !n.stage)} screen={k} state={state} onTap={onTap} agent={agent} className="ys-pagebody yc-screen" />
    </section>
  ));
}

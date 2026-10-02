// The theme and closed-announcement setup the root layout writes inline in the head (no flash on load). It is
// static HTML on every page, so it cannot carry a per request nonce; /web's policy allows exactly this text by
// its sha256 instead (lib/web/csp.mjs, YUI-264).
export const themeInit = `try{var t=localStorage.getItem("yui-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}`
  // A closed announcement stays closed, with no flash on the next load (components/TopBar.js).
  + `try{if(localStorage.getItem("yui-topbar-0.5.0-crew"))document.documentElement.dataset.topbar="off"}catch(e){}`;

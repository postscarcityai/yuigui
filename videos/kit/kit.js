// Yui video kit: the shared engine for every explainer. A comp page includes kit.css and
// kit.js, builds its phone with K.phone(), and defines render(t). Every frame is a pure
// function of t. ?reel switches the same page to the 1080x1920 layout.
const K = (() => {
  const REEL = new URLSearchParams(location.search).has("reel");
  if (REEL) document.body.classList.add("reel");
  const W = REEL ? 1080 : 1920, H = REEL ? 1920 : 1080;
  document.documentElement.style.width = `${W}px`;
  document.documentElement.style.height = `${H}px`;

  // ---------- math ----------
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const eo = (p) => 1 - Math.pow(1 - p, 3);
  const ei = (p) => p * p * p;
  const eio = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const back = (p) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const $ = (id) => document.getElementById(id);
  const show = (id, on) => {
    const el = typeof id === "string" ? $(id) : id;
    el.style.display = on ? "" : "none";
    if (on && getComputedStyle(el).display === "none") el.style.display = "block";
  };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  // Rise and fade in, lift and fade out. `center`: the element is centered on its top (landscape captions).
  function textIO(el, t, tin, tout, dist = 32, center = false) {
    if (typeof el === "string") el = $(el);
    const pi = eo(prog(t, tin, tin + 0.34)), po = ei(prog(t, tout, tout + 0.24));
    const o = pi * (1 - po);
    el.style.opacity = o;
    const dy = (1 - pi) * dist - po * 24;
    el.style.transform = center ? `translateY(calc(-50% + ${dy}px))` : `translateY(${dy}px)`;
    el.style.visibility = o <= 0.001 ? "hidden" : "visible";
    return o;
  }
  // Captions: [[id, in, out], ...]. Pills (code lines) the same, never centered.
  // In the reel an R caption sits right under the L caption before it, whatever its line count,
  // and code-line pills sit under the captions.
  let capBottom = 0;
  function caps(t, list) {
    let lastL = null;
    capBottom = 0;
    for (const [id, a, z] of list) {
      const el = $(id), on = t > a - 0.05 && t < z + 0.3;
      show(el, on);
      if (REEL) {
        if (el.classList.contains("R") && lastL) el.style.top = `${lastL.offsetTop + lastL.offsetHeight + 6}px`;
        if (el.classList.contains("L")) lastL = el;
        if (on) capBottom = Math.max(capBottom, el.offsetTop + el.offsetHeight);
      }
      textIO(el, t, a, z, 32, !REEL);
    }
  }
  function pills(t, list) {
    for (const [id, a, z] of list) {
      const el = $(id);
      show(el, t > a - 0.05 && t < z + 0.3);
      if (REEL) el.style.top = `${Math.max(452, capBottom + 14)}px`;
      textIO(el, t, a, z, 20, false);
    }
  }

  // ---------- the phone ----------
  const SBAR = (ink) => `<div class="sbar"><div class="time">9:41</div>
    <svg style="left:278px" width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.2" height="4" rx="1" fill="${ink}"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="1" fill="${ink}"/><rect x="10" y="3" width="3.2" height="9" rx="1" fill="${ink}"/><rect x="15" y="0" width="3.2" height="12" rx="1" fill="${ink}"/></svg>
    <svg style="left:302px" width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.2c2.6 0 5 1 6.8 2.7l1.2-1.3C14.4 1.6 11.6.4 8.5.4S2.6 1.6.5 3.6l1.2 1.3C3.5 3.2 5.9 2.2 8.5 2.2zm0 3.4c1.7 0 3.2.6 4.4 1.7l1.2-1.3c-1.5-1.4-3.5-2.2-5.6-2.2s-4.1.8-5.6 2.2l1.2 1.3c1.2-1.1 2.7-1.7 4.4-1.7zm0 3.4c.8 0 1.5.3 2 .8L8.5 12l-2-2.2c.5-.5 1.2-.8 2-.8z" fill="${ink}"/></svg>
    <svg style="left:324px" width="27" height="13" viewBox="0 0 27 13"><rect x=".75" y=".75" width="22.5" height="11.5" rx="3.5" fill="none" stroke="${ink}" stroke-opacity=".4" stroke-width="1.5"/><rect x="2.5" y="2.5" width="19" height="8" rx="2" fill="#34C759"/><rect x="24.5" y="4.3" width="1.8" height="4.4" rx=".9" fill="${ink}" fill-opacity=".4"/></svg></div>`;
  const ICON = {
    people: (c) => `<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.6" fill="${c}"/><path d="M2.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" fill="${c}"/><circle cx="16.6" cy="8.6" r="3" fill="${c}" fill-opacity=".75"/><path d="M16.2 13.6c3.1 0 5.3 2.1 5.3 5.4h-4.6c0-2.2-.5-3.8-1.9-5.3z" fill="${c}" fill-opacity=".75"/></svg>`,
    gear: (c) => `<svg viewBox="0 0 24 24"><path fill="${c}" d="M10.3 2h3.4l.5 2.6c.7.2 1.3.6 1.9 1l2.5-.9 1.7 2.9-2 1.7c.1.7.1 1.4 0 2.2l2 1.7-1.7 2.9-2.5-.9c-.6.5-1.2.8-1.9 1.1l-.5 2.6h-3.4l-.5-2.6c-.7-.3-1.3-.6-1.9-1.1l-2.5.9-1.7-2.9 2-1.7c-.1-.8-.1-1.5 0-2.2l-2-1.7 1.7-2.9 2.5.9c.6-.4 1.2-.8 1.9-1zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z"/></svg>`,
    send: (c) => `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 4 5 11l1.6 1.6 4.3-4.3V20h2.2V8.3l4.3 4.3L19 11z" fill="${c}"/></svg>`,
    close: (c) => `<svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19" stroke="${c}" stroke-width="3" stroke-linecap="round"/></svg>`,
  };
  const Y_SVG = (s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 20 20"><path d="M3.2 3.4 7.6 8.2" stroke="#FF7E8A" stroke-width="3.6" stroke-linecap="round"/><path d="M16.8 3.4 12.4 8.2" stroke="#FF7E8A" stroke-width="3.6" stroke-linecap="round"/><path d="M10 11.2v5.6" stroke="#FF7E8A" stroke-width="3.6" stroke-linecap="round"/></svg>`;
  const ink = () => getComputedStyle(document.body).getPropertyValue("--ink").trim();
  const icon = () => getComputedStyle(document.body).getPropertyValue("--icon").trim();

  // The app's chat page: header (wordmark, or an agent chip), the log, the composer.
  function chatPage({ id = "pg-chat", log = "", head = null, wordmark = "../kit/yui-wordmark-coral.png" } = {}) {
    const center = head ? `<div class="hchip">${head}</div>` : `<img class="hwm" src="${wordmark}" alt="">`;
    return `<div class="page" id="${id}">
      <div class="apphead"><div class="hbtn" style="left:16px">${ICON.people(icon())}</div>${center}<div class="hbtn" style="right:16px">${ICON.gear(icon())}</div></div>
      <div class="chat"><div class="log">${log}</div></div>
      <div class="inputbar"><div class="field">Say something nice</div><div class="send">${ICON.send(ink())}</div></div>
    </div>`;
  }
  // pages: HTML of .page elements, laid side by side (screens beside the chat, or one full page).
  function phone(pages, { count = 1 } = {}) {
    const wrap = document.createElement("div");
    wrap.id = "phoneWrap";
    wrap.innerHTML = `<div class="phone"><div class="screen" id="screen"><div class="island"></div>${SBAR(ink())}
      <div class="pages" id="pages" style="width:${393 * count}px">${pages}</div><div class="homeind"></div></div></div>`;
    $("stage").insertBefore(wrap, $("glow") ? $("glow").nextSibling : $("stage").firstChild);
    document.querySelectorAll(".avatar:empty").forEach((a) => (a.innerHTML = Y_SVG()));
  }
  const msg = (id, inner) => `<div class="msg" id="${id}"><div class="in">${inner}</div></div>`;
  const user = (id, text) => msg(id, `<div class="urow"><div class="ububble">${text}</div></div>`);
  const agent = (id, inner, av = "") => msg(id, `<div class="arow"><div class="avatar"${av}></div>${inner}</div>`);
  const say = (id, text, av = "") => agent(id, `<div class="abubble">${text}</div>`, av);

  // ---------- chat messages: bottom anchored, inserted with their height ----------
  const natural = {};
  function measure(ids) { for (const id of ids) { const m = $(id); m.style.display = "block"; m.style.height = "auto"; natural[id] = m.querySelector(".in").offsetHeight; } }
  function setMsg(id, p, gap = 12, pop = true) {
    const m = $(id), inn = m.querySelector(".in");
    if (p <= 0) { m.style.display = "none"; return; }
    m.style.display = "block";
    const e = eo(p);
    m.style.marginTop = `${gap * e}px`;
    m.style.height = `${natural[id] * e}px`;
    m.style.overflow = p >= 1 ? "visible" : "hidden";
    inn.style.opacity = clamp(p * 1.6);
    inn.style.transform = pop ? `translateY(${(1 - e) * 14}px) scale(${0.94 + 0.06 * back(p)})` : "none";
  }
  // The newest card's center, in phone coordinates (the log is anchored at local y 330).
  const newest = (id) => 330 - natural[id] / 2;

  // ---------- camera ----------
  // keys: [time, scale, focus, rotation]. focus is a local y in the phone (0 is its center), or a message
  // id, meaning that card while it is the newest. The reel keeps the whole phone in frame: it ignores
  // focus and maps scale into a narrow band.
  let curScale = 1.15;
  function camera(t, keys) {
    let i = 0;
    while (i < keys.length - 1 && keys[i + 1][0] <= t) i++;
    const a = keys[i], c = keys[Math.min(i + 1, keys.length - 1)];
    const p = c === a ? 0 : eio(prog(t, a[0], c[0]));
    const f = (k) => (typeof k[2] === "string" ? newest(k[2]) : k[2] || 0);
    let s = lerp(a[1], c[1], p);
    let y = -lerp(f(a), f(c), p) * s;
    if (REEL) { s = 1.16 + clamp((s - 1.12) / 0.38) * 0.06; y = 0; }
    return { s, y, r: lerp(a[3] || 0, c[3] || 0, p) };
  }
  function placePhone(t, cam, { dx = 0, dy = 0, scale = 1, rot = 0, opacity = 1, blur = 0 } = {}) {
    const pw = $("phoneWrap");
    const s = cam.s * scale;
    pw.style.transform = `translate(${dx}px, ${cam.y + dy + Math.sin(t * 0.9) * 3}px) rotate(${cam.r + rot}deg) scale(${s})`;
    pw.style.opacity = opacity;
    pw.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
    $("screen").style.filter = blur > 0.01 ? `blur(${blur}px)` : "none";
    curScale = s;
  }
  // Which page the phone shows: [[from, to, fromPage, toPage], ...].
  function pageAt(t, moves, start = 0) {
    let v = start;
    for (const [a, z, f, to] of moves) { if (t >= z) v = to; else if (t > a) return lerp(f, to, eio(prog(t, a, z))); }
    return v;
  }
  const slidePages = (v) => { $("pages").style.transform = `translateX(${-v * 393}px)`; };

  // ---------- the finger ----------
  // gestures: [{t, el}] taps, or [{t, t1, el}] drags (the finger rides el from t to t1), sorted by
  // time. Close gestures share one finger that glides between them.
  function center(id) { const r = $(id).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  const visible = (id) => { const r = $(id).getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  function finger(T, G, hide = false) {
    const f = $("finger"), rp = $("ripple");
    if (hide || window.noFinger) { f.style.opacity = 0; rp.style.opacity = 0; return; }
    const end = (g) => g.t1 ?? g.t;
    let a = -1;
    for (let i = 0; i < G.length; i++) if (T >= G[i].t - 0.5 && T <= end(G[i]) + 0.35) { a = i; break; }
    if (a < 0) for (let i = 0; i < G.length - 1; i++) if (T > end(G[i]) && T < G[i + 1].t && G[i + 1].t - end(G[i]) < 1.3) { a = i + 1; break; }
    if (a < 0) { f.style.opacity = 0; rp.style.opacity = 0; return; }
    const g = G[a], prev = G[a - 1], next = G[a + 1];
    const gap = prev ? g.t - end(prev) : 9, chained = gap < 1.3 && visible(prev.el);
    const mvd = clamp(gap * 0.7, 0.08, 0.45);
    let cur = g;
    if (chained && T < g.t - mvd) cur = prev;
    const [tx, ty] = center(cur.el);
    let x = tx, y = ty;
    if (cur === g && T < g.t) {
      const [sx, sy] = chained ? center(prev.el) : [tx + 60, ty + 100];
      const mv = eio(prog(T, g.t - (chained ? mvd : 0.45), g.t - 0.03));
      x = lerp(sx, tx, mv); y = lerp(sy, ty, mv);
    }
    const fin = chained ? 1 : clamp(prog(T, g.t - 0.5, g.t - 0.38));
    const fout = next && next.t - end(g) < 1.3 && cur === g ? 1 : 1 - clamp(prog(T, end(cur) + 0.2, end(cur) + 0.35));
    const press = cur.t1 != null && T >= cur.t - 0.05 && T <= cur.t1 + 0.05 ? 1 : Math.sin(Math.PI * prog(T, cur.t - 0.05, cur.t + 0.1));
    const s = curScale / 1.2;
    f.style.opacity = fin * fout;
    f.style.transform = `translate(${x}px, ${y}px) scale(${s * (1 - 0.16 * press)})`;
    const r = prog(T, cur.t, cur.t + 0.4);
    rp.style.opacity = r > 0 && r < 1 ? 1 - r : 0;
    rp.style.transform = `translate(${tx}px, ${ty}px) scale(${s * (1 + eo(r) * 1.3)})`;
  }

  // ---------- outro ----------
  function outro(t, t0) {
    show("outro", t > t0 - 0.1);
    if (t <= t0 - 0.1) return;
    const w = back(prog(t, t0, t0 + 0.5));
    $("owm").style.opacity = clamp(prog(t, t0, t0 + 0.15));
    $("owm").style.transform = `translateX(-55%) scale(${0.6 + 0.4 * w + prog(t, t0 + 0.5, t0 + 8) * 0.03})`;
    textIO("otag", t, t0 + 0.4, 999, 30);
    textIO("ourl", t, t0 + 0.8, 999, 30);
    textIO("onote", t, t0 + 1.2, 999, 20);
  }

  // ---------- ready ----------
  async function ready(after) {
    await document.fonts.load('800 40px "YuiRounded"');
    await document.fonts.load('600 40px "YuiMono"');
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    if (after) await after();
    return document.fonts.check('800 40px "YuiRounded"');
  }

  return { REEL, W, H, clamp, prog, eo, ei, eio, back, lerp, $, show, esc, textIO, caps, pills, ICON, Y_SVG, chatPage, phone, msg, user, agent, say,
    natural, measure, setMsg, newest, camera, placePhone, pageAt, slidePages, finger, outro, ready };
})();

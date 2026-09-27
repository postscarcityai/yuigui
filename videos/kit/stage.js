// The full screen stage for videos (spec/YL.md section 5; the mock is site/app/playground/stagefirst.js).
// Include after kit.js. ST.html() builds the stage; the helpers below drive it, each a pure function of t.
//
//   K.phone(`<div class="page" id="pg">${ST.html({ agent: {name: "Basil", letter: "B", color: "#3F9E5A"},
//     layers: {idle: ST.idle("Hi Sam. Tap the mic and talk.", "..."), listen: ST.listen(), work: ST.work(),
//              p1: ST.part(picHtml, "A line", "a quieter body")}, record: "" })}</div>`);
//   render(t): ST.vis("L-p1", t, [[in, out]]); ST.listening(t, text, t0, spans); ST.working(t, spans, text, frac);
//              ST.segs(t, spans, count, cur); ST.me(t, text, spans); ST.badge(t, n); ST.press(id, t, t0)
const ST = (() => {
  const { $, prog, clamp, eo, ei, eio, back, lerp } = K;

  const I = {
    menu: (c = "currentColor") => `<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    chev: `<svg width="15" height="15" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#8F8CA2" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chat: (c = "currentColor") => `<svg viewBox="0 0 24 24"><path d="M4 5.5h16v10H9.5L5.5 19v-3.5H4z" stroke="${c}" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>`,
    mic: (c = "#fff") => `<svg viewBox="0 0 24 24"><rect x="8.6" y="2.8" width="6.8" height="11.6" rx="3.4" fill="${c}"/><path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0M12 17.8v3.4" stroke="${c}" stroke-width="2.1" fill="none" stroke-linecap="round"/></svg>`,
    back: (c = "currentColor") => `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="${c}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    next: `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    x: (c = "currentColor") => `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    check: (s = 44, c = "#fff") => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 12.5l4.6 4.5L19 7.5" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  // ---------- building blocks (HTML) ----------
  const idle = (hi, sub = "I answer right here, on the whole screen.", letter = "Y") =>
    `<div class="s-L c" id="L-idle"><div class="s-big">${letter}</div><div class="s-hi">${hi}</div><div class="s-sub">${sub}</div></div>`;
  const listen = () => `<div class="s-L c" id="L-listen"><div class="s-heard" id="heard"></div><div class="s-wave" id="wave">${"<i></i>".repeat(9)}</div></div>`;
  const work = () => `<div class="s-L c" id="L-work"><div class="s-orb" id="orb"><i></i><i></i><i></i></div><div class="s-doing" id="doing"></div><div class="s-dbar"><i id="dbar"></i></div></div>`;
  // A part: the picture above, the line under it, an optional quieter body. id is the layer's id (L-<id>).
  const part = (id, pic, line, body = "") =>
    `<div class="s-L" id="L-${id}">${pic}<div class="s-line">${line}</div>${body ? `<div class="s-body">${body}</div>` : ""}</div>`;

  function html({ agent = { name: "Yui", letter: "Y", color: "#8B7CFF" }, layers = "", record = "", extra = "", dark = false }) {
    return `<div id="st" class="${dark ? "dark" : ""}" style="--sf:${agent.color}">
      <div class="s-top">
        <div class="s-round" id="b-menu">${I.menu()}</div>
        <div class="s-agent" id="b-agent"><span class="s-face">${agent.letter}</span>${agent.name} ${I.chev}</div>
        <div class="s-round s-rec" id="b-rec">${I.chat()}<span class="s-badge" id="badge"></span></div>
      </div>
      <div class="s-segs" id="segs"></div>
      <div class="s-me" id="me"><b>You:</b> <span id="meT"></span></div>
      ${layers}
      <div class="s-bot" id="bot">
        <div class="s-nav" id="nav"><div class="s-small" id="b-back">${I.back()}</div><div class="s-small acc" id="b-next">${I.next}</div></div>
        <div class="s-inputs" id="inputs"><div class="s-small" id="b-plus">+</div><div class="s-small s-t" id="b-t">T</div>
          <div class="s-mic" id="b-mic">${I.mic()}<b class="s-ringl" id="micring"></b></div></div>
      </div>
      ${record ? `<div class="s-recl" id="rec"><div class="r-head"><b>Chat with ${agent.name}</b><span>the record</span><div class="s-round">${I.x()}</div></div><div class="r-list">${record}</div></div>` : ""}
      ${extra}
    </div>`;
  }

  // ---------- motion ----------
  // Show a layer (or any element) during spans [[in, out], ...]: rise in with a little overshoot, fade out.
  function vis(id, t, spans, dy = 16) {
    let o = 0, p = 1;
    for (const [a, z] of spans) {
      if (t >= a && t < z + 0.2) { const pi = eo(prog(t, a, a + 0.32)); o = Math.max(o, pi * (1 - prog(t, z, z + 0.2))); p = pi; }
    }
    const el = typeof id === "string" ? $(id) : id;
    el.style.opacity = o;
    el.style.visibility = o > 0.001 ? "visible" : "hidden";
    el.style.transform = dy ? `translateY(${(1 - p) * dy}px) scale(${0.97 + 0.03 * back(p)})` : "none";
    return o;
  }
  const on = (t, spans) => spans.some(([a, z]) => t >= a && t < z);
  // A press: the element dips when the finger lands. Pass every tap time; the nearest one wins.
  function press(id, t, times) {
    const list = Array.isArray(times) ? times : [times];
    let d = 0;
    for (const t0 of list) d = Math.max(d, Math.sin(Math.PI * prog(t, t0 - 0.05, t0 + 0.16)));
    $(id).style.transform = `scale(${1 - 0.1 * d})`;
  }
  const typed = (s, t, t0, per) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - t0) / per))));
  const caret = (t) => (Math.floor(t * 2.5) % 2 ? "" : `<span class="s-caret"></span>`);

  // Listening: [[t0, t1, text], ...]: the words stream in from t0 (as they are heard), the mic rings.
  function listening(t, asks) {
    const spans = asks.map(([a, z]) => [a, z]);
    vis("L-listen", t, spans);
    const cur = asks.filter(([a]) => t >= a - 0.3).pop() || asks[0];
    const per = Math.min(0.06, (cur[1] - cur[0] - 0.5) / Math.max(1, cur[2].length));
    $("heard").innerHTML = K.esc(typed(cur[2], t, cur[0] + 0.15, per)) + caret(t);
    [...$("wave").children].forEach((w, i) => { w.style.height = `${10 + 26 * Math.abs(Math.sin(t * 7.3 + i * 0.9) * Math.sin(t * 3.1 + i * 1.7))}px`; });
    const rp = (t * 0.85) % 1;
    $("micring").style.opacity = on(t, spans) ? 0.9 * (1 - rp) : 0;
    $("micring").style.transform = `scale(${0.95 + 0.4 * rp})`;
  }
  // Working: [[t0, t1, text, fromFrac, toFrac], ...]. The mark breathes in the agent's color.
  function working(t, steps) {
    vis("L-work", t, steps.map(([a, z]) => [a, z]), 0);
    const cur = steps.filter(([a]) => t >= a).pop() || steps[0];
    const s = clamp(1 + Math.floor((t - cur[0]) / 0.8), 1, 9);
    $("doing").innerHTML = `${cur[2]} <span>· ${s}s</span>`;
    $("dbar").style.width = `${lerp(cur[3] ?? 0, cur[4] ?? 1, eo(prog(t, cur[0], cur[1] - 0.1))) * 100}%`;
    const orb = $("orb").children;
    [[0, 0.38, 3.2], [20, 0.62, 2.7], [48, 1, 2.2]].forEach(([inset, a, per], i) => {
      const ph = (t / per) * Math.PI * 2 + i * 2;
      const r = (k) => 50 + 7 * Math.sin(ph + k);
      Object.assign(orb[i].style, { inset: `${inset}px`, background: `color-mix(in srgb, var(--sf) ${a * 100}%, transparent)`,
        borderRadius: `${r(0)}% ${100 - r(0)}% ${r(1)}% ${100 - r(1)}% / ${r(2)}% ${r(3)}% ${100 - r(3)}% ${100 - r(2)}%`,
        transform: `rotate(${20 * Math.sin(ph * 0.5)}deg) scale(${1 + 0.04 * Math.sin(ph)})` });
    });
  }
  // "You: ..." small at the top: [[t0, t1, text], ...]
  function me(t, asks) {
    const cur = asks.filter(([a]) => t >= a).pop() || asks[0];
    $("meT").textContent = cur[2];
    vis("me", t, asks.map(([a, z]) => [a, z]), 6);
  }
  // Segments at the top and the arrows: spans where they show, count, and cur(t) the part now (count = all done).
  function segs(t, spans, count, cur, arrows = true) {
    const el = $("segs");
    if (el.children.length !== count) el.innerHTML = "<i></i>".repeat(count);
    vis(el, t, spans, 0);
    [...el.children].forEach((s, i) => { s.className = i <= cur ? "d" : ""; s.style.opacity = i === cur ? 0.75 + 0.25 * Math.sin(t * 4.5) : 1; });
    if (arrows) { vis("nav", t, spans, 0); $("b-back").style.opacity = cur === 0 ? 0.35 : 1; }
  }
  // The record's unread count: [[time, n], ...], popping on each change.
  function badge(t, steps) {
    const cur = steps.filter(([a]) => t >= a).pop();
    const n = cur ? cur[1] : 0;
    $("badge").textContent = n;
    $("badge").style.display = n ? "grid" : "none";
    $("badge").style.transform = `scale(${0.6 + 0.4 * back(prog(t, cur ? cur[0] : 0, (cur ? cur[0] : 0) + 0.3))})`;
  }
  // The record slides in from the right at a and out at z.
  function record(t, a, z) {
    const rin = eo(prog(t, a, a + 0.4)), rout = eio(prog(t, z, z + 0.4));
    $("rec").style.visibility = t > a && t < z + 0.4 ? "visible" : "hidden";
    $("rec").style.transform = `translateX(${(1 - rin + rout) * 393}px)`;
  }
  // The stage slides up over whatever is under it (the old chat, the lock screen).
  function slideUp(t, a, b) {
    const up = eo(prog(t, a, b));
    $("st").style.visibility = t > a ? "visible" : "hidden";
    $("st").style.transform = `translateY(${(1 - up) * 860}px)`;
  }
  // The Dynamic Island grows into a live activity (a running timer): width from 122 to w between a and a+0.45.
  function island(id, t, a, z, w = 250) {
    const el = $(id), g = back(prog(t, a, a + 0.45)) * (1 - eio(prog(t, z, z + 0.35)));
    el.style.visibility = t > a && t < z + 0.35 ? "visible" : "hidden";
    el.style.width = `${lerp(122, w, clamp(g, 0, 1.08))}px`;
    [...el.children].forEach((c) => (c.style.opacity = clamp((g - 0.6) / 0.4)));
  }
  // mm:ss
  const clock = (s) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0")}`;

  return { I, idle, listen, work, part, html, vis, on, press, typed, caret, listening, working, me, segs, badge, record, slideUp, island, clock };
})();

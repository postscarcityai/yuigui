// YUI-328: inputs on the living canvas. A `choose`, `pick`, `ask`, `slide` or small `form` answer becomes marks drawn on the same canvas
// clock as a film: option pills write in one after another, the slider track draws and then its knob drops in, form fields draw as
// ruled lines. Every option, knob and field is a hit target named by its words, so tap, hold and the keyboard model of YUI-321/324
// work unchanged (each one is a named hidden button, in order). The answer is the Yui event line the app sends (spec/RELAY.md):
//   [yui] <id> choose choice=Legs      [yui] <id> ask answer="Not yet"      [yui] <id> pick picked=DB|Bands
//   [yui] <id> slide value=3           [yui] <id> form form.sleep=7 form.goal="get strong"
// and it is shown in place, under the picture. choose / ask lock after one answer, pick toggles until Send. A knob drags (the player
// sends `drag`, it does not scrub while the press starts on the knob) and answers to the arrow keys (the player sends `nudge`).
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const STEP_T = 0.3;    // seconds between one pill and the next
const PILL_H = 52, GAP = 10, KNOB_R = 15;
const str = (s) => String(s);
const val = (s) => { s = str(s); return /[\s|="]/.test(s) || s === "" ? '"' + s.replace(/"/g, "'") + '"' : s; };
const item = (s) => { s = str(s); return /[\s="]/.test(s) ? '"' + s.replace(/"/g, "'") + '"' : s; };   // a list value joins its items with | and quotes only an item with a space
const num = (v) => (Math.round(v * 100) / 100).toString();

// ---- reading -------------------------------------------------------------------------------------------------------------

function readBlocks(ops, autoId) {
  return ops.map((o, i) => {
    const p = o.props || {}, id = autoId.test(o.id) ? "n" + (i + 1) : o.id;
    if (o.preset === "slide") {
      const min = Number(p.min ?? 1), max = Number(p.max ?? 5), step = Number(p.step || 1);
      return { kind: "slide", id, q: str(p.label || p.q || ""), min, max, step, lo: p.lo ? str(p.lo) : "", hi: p.hi ? str(p.hi) : "", unit: p.unit ? str(p.unit) : "", value: Number(p.value ?? Math.round((min + max) / 2)) };
    }
    if (o.preset === "form") {
      const fields = (p.fields || []).map((f) => ({ key: str(f.key), label: str(f.label || f.key).replace(/_/g, " "), type: f.type === "range" ? "range" : f.type === "choice" ? "choice" : "text", min: f.min, max: f.max, options: (f.options || []).map(str) }));
      return { kind: "form", id, title: str(p.title || ""), fields, submit: str(p.submit || "Send") };
    }
    const options = (p.options || []).map(str);
    if (o.preset === "choose" && p.other) options.push("Other…");
    return { kind: o.preset, id, q: str(p.q || ""), options, other: !!p.other, submit: str(p.submit || (o.preset === "pick" ? "Done" : "Send")) };
  });
}

// ---- the film ------------------------------------------------------------------------------------------------------------

export function inputsFilm(ops, read0, host) {
  const blocks = readBlocks(ops, host.AUTO_ID);
  if (!blocks.length) return null;
  const S = { chosen: {}, picked: {}, sent: {}, line: {}, value: {}, text: {}, sends: {}, other: {} };
  const geo = {};   // filled by draw: slider tracks and text rects, so a drag or an edit maps back to a value
  const marks = [];
  const add = (m) => { marks.push(m); return m; };
  let at = 0.2;
  // timing: each block draws its question, then its parts one by one
  blocks.forEach((b) => {
    b.t0 = at;
    add({ id: `in:${b.id}:q`, label: b.q || b.title || b.kind, words: "What this asks.", appear: at });
    let tt = at + 0.4;
    if (b.kind === "choose" || b.kind === "ask" || b.kind === "pick") {
      b.options.forEach((o, i) => { add({ id: `in:${b.id}:o${i}`, label: o, words: b.kind === "pick" ? "Tap to add or remove " + o + "." : "Tap to answer " + o + ".", appear: tt }); tt += STEP_T; });
      if (b.kind === "pick") { b.sendAt = tt; add({ id: `in:${b.id}:send`, label: b.submit, words: "Sends your picks.", appear: tt }); tt += STEP_T; }
      b.end = tt;
    } else if (b.kind === "slide") {
      b.trackAt = tt; b.knobAt = tt + 0.7;
      add({ id: `in:${b.id}:knob`, label: b.q || "Slider", words: "The knob. Drag it, or use the arrow keys.", appear: b.knobAt + 0.3 });
      if (b.lo) add({ id: `in:${b.id}:lo`, label: b.lo, words: "The low end. Tap to jump here.", appear: b.knobAt + 0.5 });
      if (b.hi) add({ id: `in:${b.id}:hi`, label: b.hi, words: "The high end. Tap to jump here.", appear: b.knobAt + 0.6 });
      b.end = b.knobAt + 0.9;
    } else {
      b.fieldAt = [];
      b.fields.forEach((f) => {
        b.fieldAt.push(tt);
        add({ id: `in:${b.id}:${f.key}`, label: f.label, words: f.type === "range" ? "A number. Drag the knob, or use the arrow keys." : f.type === "choice" ? "Tap to choose." : "Tap to write.", appear: tt + (f.type === "range" ? 0.7 : 0.4) });
        tt += f.type === "range" ? 1.0 : 0.6;
      });
      b.sendAt = tt; add({ id: `in:${b.id}:send`, label: b.submit, words: "Sends the form.", appear: tt }); b.end = tt + STEP_T;
    }
    at = b.end + 0.2;
    if (b.kind === "slide") S.value[b.id] = clamp(b.value, b.min, b.max);
    if (b.kind === "form") b.fields.forEach((f) => { if (f.type === "range") S.value[b.id + ":" + f.key] = Math.round((f.min + f.max) / 2); else if (f.type === "choice") S.text[b.id + ":" + f.key] = ""; });
  });
  const total = at + 0.6 + host.HOLD;
  const byId = (bid) => blocks.find((b) => b.id === bid);
  const sliderOf = (b, key) => (b.kind === "slide" ? { min: b.min, max: b.max, step: b.step, unit: b.unit, vk: b.id } : (() => { const f = b.fields.find((x) => x.key === key); return { min: f.min, max: f.max, step: 1, unit: "", vk: b.id + ":" + key }; })());
  const knobName = (b, key) => {
    if (b.kind === "slide") return (b.q ? b.q + (/[?!.]$/.test(b.q) ? " " : ": ") : "") + num(S.value[b.id]) + b.unit.replace(/^/, b.unit ? " " : "") + " of " + b.min + " to " + b.max;
    const f = b.fields.find((x) => x.key === key);
    return f.label + ": " + num(S.value[b.id + ":" + key]) + " of " + f.min + " to " + f.max;
  };
  const setValue = (vk, v) => { S.value[vk] = v; };
  const slideLine = (b) => {
    S.sends[b.id] = (S.sends[b.id] || 0) + 1;
    return `[yui] ${b.id} slide value=${num(S.value[b.id])}` + (S.sends[b.id] > 1 ? " changed=true" : "");
  };
  const formLine = (b) => `[yui] ${b.id} form ` + b.fields.map((f) => `form.${f.key}=${f.type === "range" ? num(S.value[b.id + ":" + f.key]) : val(S.text[b.id + ":" + f.key] || "")}`).join(" ");
  const commitSlide = (b) => { S.line[b.id] = slideLine(b); return { say: knobName(b), line: S.line[b.id] }; };

  const layOut = (api, fw) => blocks.map((b) => {
    const qm = b.q || b.title ? api.measure(b.q || b.title, { size: 24, weight: 800, maxw: fw - 8 }) : { w: 0, h: 0 }, qh = qm.h ? qm.h + 14 : 0;
    let h;
    if (b.kind === "choose" || b.kind === "ask" || b.kind === "pick") {
      const side = b.kind === "ask" && b.options.length === 2;
      h = qh + (side ? PILL_H : b.options.length * (PILL_H + GAP) - GAP) + (b.kind === "pick" ? PILL_H + GAP + 6 : 0);
    } else if (b.kind === "slide") h = qh + 150;
    else h = qh + b.fields.reduce((a, f) => a + (f.type === "range" ? 96 : 76), 0) + PILL_H + 12;
    return { qh, h: h + (S.line[b.id] ? 26 : 0) };
  });
  const film = {
    kind: "inputs", total, marks, choose: null, chosen: null, onShapes: false, says: read0.says, title: blocks[0].q || blocks[0].title || "", blocks, state: S, geo,
    // a tap on a mark: the answer, or null when the mark only names itself (the host then pauses and says its words)
    touch(id) {
      const m = /^in:([^:]+):(.+)$/.exec(id); if (!m) return null;
      const b = byId(m[1]); if (!b) return null;
      const part = m[2];
      if (b.kind === "choose" || b.kind === "ask") {
        const i = /^o(\d+)$/.exec(part); if (!i) return null;
        const label = b.options[+i[1]];
        if (S.chosen[b.id] !== undefined) return { say: S.chosen[b.id] === label ? "Sent: " + S.chosen[b.id] : "Locked. You chose " + S.chosen[b.id] + ".", line: null, locked: true };
        if (b.other && +i[1] === b.options.length - 1) return { edit: { id, key: "other:" + b.id, value: "", rect: geo["o:" + id] } };
        S.chosen[b.id] = label;
        S.line[b.id] = `[yui] ${b.id} ${b.kind} ${b.kind === "ask" ? "answer" : "choice"}=${val(label)}`;
        return { say: label, line: S.line[b.id] };
      }
      if (b.kind === "pick") {
        if (S.sent[b.id]) return { say: "Sent.", line: null, locked: true };
        const set = S.picked[b.id] || (S.picked[b.id] = []);
        const i = /^o(\d+)$/.exec(part);
        if (i) { const label = b.options[+i[1]], at0 = set.indexOf(label); if (at0 >= 0) set.splice(at0, 1); else set.push(label); return { say: label + (at0 >= 0 ? ": off" : ": on"), line: null }; }
        if (part === "send") {
          if (!set.length) return { say: "Pick one first.", line: null };
          S.sent[b.id] = true; S.line[b.id] = `[yui] ${b.id} pick picked=${b.options.filter((o) => set.includes(o)).map(item).join("|")}`;
          return { say: b.submit, line: S.line[b.id] };
        }
        return null;
      }
      if (b.kind === "slide") {
        if (part === "lo" || part === "hi") { setValue(b.id, part === "lo" ? b.min : b.max); return commitSlide(b); }
        return null;
      }
      if (b.kind === "form") {
        if (part === "send") {
          if (S.sent[b.id]) return { say: "Sent.", line: null, locked: true };
          S.sent[b.id] = true; S.line[b.id] = formLine(b);
          return { say: b.submit, line: S.line[b.id] };
        }
        const f = b.fields.find((x) => x.key === part); if (!f || S.sent[b.id]) return null;
        if (f.type === "text") return { edit: { id, key: b.id + ":" + f.key, value: S.text[b.id + ":" + f.key] || "", rect: geo["f:" + id].rect } };
        if (f.type === "choice") {
          const k = b.id + ":" + f.key, i = f.options.indexOf(S.text[k]);
          S.text[k] = f.options[(i + 1) % f.options.length];
          return { say: f.label + ": " + S.text[k], line: null };
        }
        return null;
      }
      return null;
    },
    // text typed into an edit overlay: the "Other…" pill of a choose answers, a form text field keeps it
    setText(key, text) {
      text = str(text).trim();
      if (key.startsWith("other:")) {
        const b = byId(key.slice(6)); if (!b || !text || S.chosen[b.id] !== undefined) return null;
        S.chosen[b.id] = text; S.other[b.id] = text; S.line[b.id] = `[yui] ${b.id} ${b.kind} choice=${val(text)}`;
        return { say: text, line: S.line[b.id] };
      }
      S.text[key] = text; return { say: text ? "Written." : "Cleared.", line: null };
    },
    // a drag on a knob: x is a screen pixel. phase begin / move / end. The line is sent on end only.
    drag(d) {
      const m = /^in:([^:]+):(.+)$/.exec(d.id || ""); if (!m) return null;
      const b = byId(m[1]); if (!b) return null;
      const key = b.kind === "slide" ? null : m[2], g = geo[d.id]; if (!g) return null;
      if (b.kind === "form" && S.sent[b.id]) return null;
      const s = sliderOf(b, key), u = clamp((d.x - g.x0) / (g.x1 - g.x0), 0, 1);
      setValue(s.vk, clamp(Math.round((s.min + u * (s.max - s.min)) / s.step) * s.step, s.min, s.max));
      if (d.phase === "end" && b.kind === "slide") return commitSlide(b);
      return d.phase === "end" ? { say: knobName(b, key), line: null } : null;
    },
    // an arrow key on a knob: dir -1 or +1
    nudge(d) {
      const m = /^in:([^:]+):(.+)$/.exec(d.id || ""); if (!m) return null;
      const b = byId(m[1]); if (!b) return null;
      const key = b.kind === "slide" ? null : m[2], s = sliderOf(b, key);
      if (b.kind === "form" && S.sent[b.id]) return null;
      setValue(s.vk, clamp(S.value[s.vk] + (d.dir < 0 ? -1 : 1) * s.step, s.min, s.max));
      return b.kind === "slide" ? commitSlide(b) : { say: knobName(b, key), line: null };
    },
    // YUI-329: the height the stack wants right now (an answered block grows by the line it sends), so a mixed answer can give it a slot
    height(api) { return layOut(api, api.w - 40).reduce((a, l) => a + l.h, 0) + 28 * (blocks.length - 1); },
    draw(t, api) {
      const W = api.w, H = api.h, top = 112, areaB = H - 196, fx = 20, fw = W - 40;
      const hit = (id, x, y, w, h, label) => api.hitBox(id, x + w / 2, y + h / 2, w, h, label);
      // layout: measure each block, then centre the stack
      const lay = layOut(api, fw);
      const sum = lay.reduce((a, l) => a + l.h, 0) + 28 * (blocks.length - 1), avail = areaB - top;
      let y = top + Math.max(0, (avail - sum) / 2);
      blocks.forEach((b, bi) => {
        const L = lay[bi], tt = t - b.t0 + 0.2;
        const head = b.q || b.title;
        if (head) {
          api.text(head, fx + fw / 2, y + (L.qh - 14) / 2, { size: 24, weight: 800, k: seg(tt, 0, 0.4), maxw: fw - 8, free: true, noHit: true });
          if (seg(tt, 0, 0.4) > 0.4) hit(`in:${b.id}:q`, fx, y, fw, Math.max(30, L.qh - 10), head);
        }
        let yy = y + L.qh;
        const pill = (id, label, x, py, w, st, ap, mid) => {
          const k = seg(t, ap, ap + 0.45); if (k <= 0) return;
          const on = st.on, dim = st.dim;
          api.rect(x, py, w, PILL_H, { r: PILL_H / 2, c: on ? "good" : st.accent ? "accent" : "line", w: 3, k, fill: on ? "good" : st.accent ? "accent" : "panel", fa: on ? 0.9 : st.accent ? 0.9 : 0.85, rough: 0, a: dim ? 0.4 : 1 });
          let tx = x + w / 2;
          if (st.box) {
            api.rect(x + 18, py + PILL_H / 2 - 11, 22, 22, { r: 6, c: on ? "ink" : "accent", w: 2.5, k, rough: 0, a: dim ? 0.4 : 1 });
            if (on) api.stroke([[x + 23, py + PILL_H / 2], [x + 28, py + PILL_H / 2 + 5], [x + 36, py + PILL_H / 2 - 6]], { c: "ink", w: 3.5, k: 1, rough: 0 });
            tx = x + w / 2 + 14;
          }
          api.text(label, tx, py + PILL_H / 2, { size: 18, weight: 800, c: on || st.accent ? "ink" : "fg", k: seg(k, 0.3, 1), free: true, noHit: true, maxw: w - 56, a: dim ? 0.5 : 1 });
          if (k > 0.4) hit(id, x, py, w, PILL_H, label);
          geo["o:" + id] = { x, y: py, w, h: PILL_H };
        };
        if (b.kind === "choose" || b.kind === "ask" || b.kind === "pick") {
          const set = S.picked[b.id] || [], side = b.kind === "ask" && b.options.length === 2;
          b.options.forEach((o, i) => {
            const id = `in:${b.id}:o${i}`, ap = marks.find((m) => m.id === id).appear;
            const locked = S.chosen[b.id] !== undefined, on = b.kind === "pick" ? set.includes(o) : S.chosen[b.id] === o;
            const shown = b.other && i === b.options.length - 1 && S.other[b.id] ? S.other[b.id] : o;
            const dim = (locked && !on) || (S.sent[b.id] && !on);
            if (side) { const w = (fw - GAP) / 2; pill(id, shown, fx + i * (w + GAP), yy, w, { on, dim }, ap); }
            else { pill(id, shown, fx, yy, fw, { on: on || (locked && S.chosen[b.id] === shown), dim, box: b.kind === "pick" }, ap); yy += PILL_H + GAP; }
          });
          if (side) yy += PILL_H + GAP;
          if (b.kind === "pick") { yy += 6; pill(`in:${b.id}:send`, S.sent[b.id] ? "Sent" : b.submit, fx, yy, fw, { accent: !S.sent[b.id], on: !!S.sent[b.id], dim: !S.sent[b.id] && !set.length }, b.sendAt); yy += PILL_H + GAP; }
          yy -= GAP;
        } else if (b.kind === "slide") {
          sliderRow(api, t, b, `in:${b.id}:knob`, b.trackAt, b.knobAt, yy + 10, S.value[b.id], { min: b.min, max: b.max, step: b.step, unit: b.unit }, fx, fw, knobName(b), true);
          [["lo", b.lo, fx + 28], ["hi", b.hi, fx + fw - 28]].forEach(([k0, text, ex]) => {
            if (!text) return;
            const ap = marks.find((m) => m.id === `in:${b.id}:${k0}`).appear, k = seg(t, ap, ap + 0.4); if (k <= 0) return;
            const bw = Math.max(70, api.measure(text, { size: 16, weight: 700 }).w + 24), bx = k0 === "lo" ? ex - 8 : ex + 8 - bw, by = yy + 10 + 60;
            api.text(text, bx + bw / 2, by + 17, { size: 16, weight: 700, c: "dim", k, free: true, noHit: true, maxw: bw });
            if (k > 0.4) hit(`in:${b.id}:${k0}`, bx, by, bw, 34, text);
          });
          yy += 10 + 60 + 34;
        } else {
          b.fields.forEach((f, fi) => {
            const ap = b.fieldAt[fi], id = `in:${b.id}:${f.key}`, k = seg(t, ap, ap + 0.4), vk = b.id + ":" + f.key;
            if (f.type === "range") {
              if (k > 0) api.text(f.label, fx + 4, yy + 12, { size: 14, weight: 800, c: "dim", align: "left", k, free: true, noHit: true });
              sliderRow(api, t, b, id, ap + 0.1, ap + 0.7, yy + 14, S.value[vk], { min: f.min, max: f.max, step: 1, unit: "" }, fx, fw, knobName(b, f.key), false);
              yy += 96;
            } else {
              const ky = yy + 50;
              if (k > 0) {
                api.text(f.label, fx + 4, yy + 12, { size: 14, weight: 800, c: "dim", align: "left", k, free: true, noHit: true });
                api.line(fx, ky, fx + fw, ky, { c: "fg", w: 2.5, k: seg(t, ap + 0.1, ap + 0.5), rough: 1.1 });
                const v = S.text[vk];
                if (f.type === "choice") {
                  api.text(v || "tap to choose", fx + 8, ky - 16, { size: 19, weight: 700, c: v ? "fg" : "dim", align: "left", k, free: true, noHit: true, maxw: fw - 16 });
                } else api.text(v || "tap to write", fx + 8, ky - 16, { size: 19, weight: 700, c: v ? "fg" : "dim", align: "left", k, free: true, noHit: true, maxw: fw - 16, font: v ? undefined : "hand" });
                if (k > 0.4) hit(id, fx, yy + 22, fw, 40, f.label + (v ? ": " + v : ""));
                geo["f:" + id] = { rect: { x: fx, y: yy + 22, w: fw, h: 40 } };
              }
              yy += 76;
            }
          });
          yy += 12;
          const id = `in:${b.id}:send`;
          const sap = b.sendAt;
          const k = seg(t, sap, sap + 0.45);
          if (k > 0) {
            const sent = !!S.sent[b.id];
            api.rect(fx, yy, fw, PILL_H, { r: PILL_H / 2, c: sent ? "good" : "accent", w: 3, k, fill: sent ? "good" : "accent", fa: 0.9, rough: 0 });
            api.text(sent ? "Sent" : b.submit, fx + fw / 2, yy + PILL_H / 2, { size: 18, weight: 800, c: "ink", k: seg(k, 0.3, 1), free: true, noHit: true });
            if (k > 0.4) hit(id, fx, yy, fw, PILL_H, sent ? "Sent" : b.submit);
          }
          yy += PILL_H;
        }
        // the answer, in place under the picture
        if (S.line[b.id]) api.text(S.line[b.id], fx + fw / 2, yy + 22, { size: 12, weight: 700, c: "dim", free: true, noHit: true, maxw: fw });
        y += L.h + 28;
      });
      film.says.slice(0, 1).forEach((s0) => api.say(s0, 0.3, Math.min(total - 0.5, 3.6), { y: "bottom", size: 20 }));
    },
  };

  // one slider: the track draws left to right, then the knob drops onto it. `big` = the standalone slider (value above, bigger).
  function sliderRow(api, t, b, knobId, trackAt, knobAt, ty0, v, s, fx, fw, name, big) {
    const x0 = fx + 28, x1 = fx + fw - 28, ty = ty0 + (big ? 40 : 38);
    const kt = seg(t, trackAt, trackAt + 0.6), kk = seg(t, knobAt, knobAt + 0.5);
    geo[knobId] = { x0, x1, y: ty };
    if (kt <= 0) return;
    api.line(x0, ty, x1, ty, { c: "line", w: 6, k: kt, rough: 0 });
    const n = Math.round((s.max - s.min) / s.step);
    if (n <= 12) for (let i = 0; i <= n; i++) { const tx = x0 + (x1 - x0) * i / n; api.line(tx, ty - 9, tx, ty + 9, { c: "dim", w: 2, k: seg(kt, i / (n + 1), 1), a: 0.7, rough: 0 }); }
    if (kk <= 0) return;
    const kx = x0 + (x1 - x0) * (v - s.min) / ((s.max - s.min) || 1), drop = (1 - kk) * (1 - kk) * 90, ky = ty - drop;
    if (kx > x0) api.line(x0, ty, kx, ty, { c: "accent", w: 6, k: 1, rough: 0 });
    const hot = film.marked === knobId;
    api.dot(kx, ky, KNOB_R, { c: "accent", a: 1 });
    api.circle(kx, ky, KNOB_R + 5, { c: "accent", w: 2.5, a: 0.5, rough: 0 });
    if (hot) api.circle(kx, ky, KNOB_R + 10, { c: "warn", w: 3, a: 0.9, rough: 0 });
    const label = num(v) + (s.unit ? " " + s.unit : "");
    api.text(label, kx, ky - 34, { size: big ? 24 : 20, weight: 800, c: "accent", k: 1, free: true, noHit: true });
    if (kk > 0.5) api.hit(knobId, kx, ky, KNOB_R + 12, name, { drag: true });
  }
  film.draw = ((inner) => function (t, api) { film.marked = api.marked; return inner(t, api); })(film.draw);
  return film;
}

// YUI-330: hold a mark, the agent redraws just that part in place. The canned replies (yl-replies.json) are small Yui Lines patches
// the way the guide writes them: `~chart y=...`, `~stat 178.4lb delta=-2.8`, `~list Today "Row" ... +check`, or a block that replaces
// one line (`find` -> `with`). applyPatch turns the sample text plus a reply into the patched text; the page builds a fresh film from it.
// The motion is a compositor over two renders of the same clock: the old film and the patched film are drawn at the same time t,
// the pixels that differ are the part, and only that box is rewritten (the old one wipes out, the new one writes in). A reply that
// makes a part of a mixed answer taller slides the parts below it down. Nothing else on the canvas is redrawn differently.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ease = (u) => u * u * (3 - 2 * u);

// ---- the text of a patch ---------------------------------------------------------------------------------------------------

// Split a line into tokens, keeping "quoted strings" whole (quotes stay on the token).
function tokens(line) {
  const out = [], re = /(?:[^\s"=]+=)?"(?:[^"\\]|\\.)*"|\S+/g;
  let m;
  while ((m = re.exec(line))) out.push(m[0]);
  return out;
}
const isKV = (tk) => /^[A-Za-z_][\w.-]*=/.test(tk);
const isFlag = (tk) => /^\+\w/.test(tk);
const presetOf = (tk) => tk.split("@")[0];

// `~preset[@id] ...` merged into the newest line of that preset: key=value replaces or appends, positional words replace the line's
// positional words, flags replace its flags. Returns the new text, or null when no line matches.
function mergeLine(text, patch) {
  const pt = tokens(patch.replace(/^\s*~/, ""));
  if (!pt.length) return null;
  const want = pt[0], lines = text.split("\n");
  let at = -1;
  for (let i = 0; i < lines.length; i++) {
    const head = tokens(lines[i])[0] || "";
    if (want.includes("@") ? head === want : presetOf(head) === want) { at = i; if (!want.includes("@")) break; }
  }
  if (at < 0) return null;
  const old = tokens(lines[at]), head = old[0], rest = old.slice(1), add = pt.slice(1);
  const pos = add.filter((x) => !isKV(x) && !isFlag(x)), flags = add.filter(isFlag), kv = add.filter(isKV);
  let outPos = pos.length ? pos : rest.filter((x) => !isKV(x) && !isFlag(x)), outFlags = flags.length ? flags : rest.filter(isFlag);
  const kvs = rest.filter(isKV);
  for (const p of kv) { const key = p.slice(0, p.indexOf("=")), i = kvs.findIndex((q) => q.startsWith(key + "=")); if (i >= 0) kvs[i] = p; else kvs.push(p); }
  lines[at] = [head, ...outPos, ...kvs, ...outFlags].join(" ");
  return lines.join("\n");
}

// reply: { say, patch?: "~chart y=...\n~stat ...", replace?: [{ find, with }] }. Returns the patched text, or null when it does not apply.
export function applyPatch(text, reply) {
  let out = text;
  for (const r of reply.replace || []) {
    if (!out.includes(r.find)) return null;
    out = out.replace(r.find, () => r.with);
  }
  for (const l of reply.add || []) out = out.replace(/\s*$/, "") + "\n" + l;   // YUI-331: a reply may add whole lines (an arrow between two shapes)
  for (const line of String(reply.patch || "").split("\n").filter((l) => l.trim())) {
    out = mergeLine(out, line);
    if (out === null) return null;
  }
  return out === text ? null : out;
}

// The reply for a held mark: by the id the hit carries (a `~n` suffix on a repeated id is dropped).
export function replyFor(replies, sample, id) {
  const r = replies && replies[sample];
  return (r && (r[id] || r[String(id).replace(/~\d+$/, "")])) || null;
}

// ---- the picture of the change ----------------------------------------------------------------------------------------------

// What differs between two renders of the same moment: a box (css px) around every pixel that is not the same, or null.
export function diffBox(a, b, dpr) {
  if (!a || !b || a.width !== b.width || a.height !== b.height) return null;
  const w = a.width, h = a.height, A = a.data, B = b.data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (Math.abs(A[i] - B[i]) > 10 || Math.abs(A[i + 1] - B[i + 1]) > 10 || Math.abs(A[i + 2] - B[i + 2]) > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  if (x1 < 0) return null;
  const pad = 6;
  return { x0: Math.max(0, x0 / dpr - pad), y0: Math.max(0, y0 / dpr - pad), x1: Math.min(w / dpr, (x1 + 1) / dpr + pad), y1: Math.min(h / dpr, (y1 + 1) / dpr + pad) };
}

// Where a mixed answer put its parts, old and new: the first part that changed height, and by how much.
export function bandOf(oldSlots, newSlots, W) {
  if (!oldSlots || !newSlots || oldSlots.length !== newSlots.length) return null;
  for (let i = 0; i < oldSlots.length; i++) {
    const d = newSlots[i].h - oldSlots[i].h;
    if (Math.abs(d) > 0.5) {
      const y0 = Math.max(0, oldSlots[i].y - 6), bottom = Math.max(oldSlots[i].y + oldSlots[i].h, newSlots[i].y + newSlots[i].h) + 6;
      const nextNew = newSlots[i + 1] ? newSlots[i + 1].y - 6 : bottom, nextOld = oldSlots[i + 1] ? oldSlots[i + 1].y - 6 : bottom;
      return { box: { x0: 0, x1: W, y0, y1: bottom }, below: i + 1 < oldSlots.length ? { newTop: nextNew, shift: nextOld - nextNew } : null };
    }
  }
  return null;
}

// ---- what the page draws while it waits and while it redraws -----------------------------------------------------------------

// ctx: the canvas 2d context of the player. Every object here is what the scene calls: { draw(t, api) }.
const cut = (ctx, W, H, box, outside) => {
  ctx.beginPath();
  if (outside) { ctx.rect(0, 0, W, H); ctx.rect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0); ctx.clip("evenodd"); }
  else { ctx.rect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0); ctx.clip(); }
};

// A thinking pulse on one box, the picture otherwise as it was.
export function pulseFilm(film, box) {
  return {
    draw(t, api) {
      film.draw(t, api);
      const k = 0.5 + 0.5 * Math.sin(performance.now() / 160);
      api.rect(box.x0 - 3, box.y0 - 3, box.x1 - box.x0 + 6, box.y1 - box.y0 + 6, { c: "warn", w: 2.5, r: 12, dash: [7, 6], a: 0.35 + 0.55 * k });
      [0, 1, 2].forEach((i) => api.dot((box.x0 + box.x1) / 2 + (i - 1) * 14, box.y0 - 12, 3.5, { c: "warn", a: 0.3 + 0.7 * Math.max(0, Math.sin(performance.now() / 160 - i * 0.9)) }));
    },
  };
}

// A quiet note on a mark, the picture otherwise as it was. at: { x, y, r } of the mark.
export function noteFilm(film, at, text) {
  return {
    draw(t, api) {
      film.draw(t, api);
      const y = at.y - Math.max(at.r || 0, (at.h || 0) / 2) - 18;
      api.label(text, clamp(at.x, 90, api.w - 90), Math.max(56, y), { size: 13, weight: 700, c: "dim", bg: "panel", border: "warn", free: true, noHit: true, back: false });
    },
  };
}

// The redraw. `old` and `now` are two films drawn at the same clock. box is the part (css px); band, when the part changed height, is
// { box, below: { newTop, shift } } and the parts under it slide to their new place. dur is the whole redraw in ms. onDone fires once.
export function redrawFilm(old, now, ctx, opts) {
  const { box, band, dur = 1500, W, H } = opts;
  let t0 = null;
  const region = band ? band.box : box;
  return {
    done: false,
    draw(t, api) {
      if (t0 === null) t0 = performance.now();
      const p = clamp((performance.now() - t0) / dur, 0, 1), w = region.x1 - region.x0;
      const out = seg(p, 0, 0.4), inn = seg(p, 0.4, 1), slide = seg(p, 0.5, 1);
      const sxOut = region.x0 + w * ease(out), sxIn = region.x0 + w * ease(inn);
      // the old part wipes out, left to right
      if (out < 1) { api.frame(); ctx.save(); cut(ctx, W, H, { x0: sxOut, x1: region.x1, y0: region.y0, y1: region.y1 }, false); old.draw(t, api); ctx.restore(); }
      // the new part writes in, left to right
      if (inn > 0) { api.frame(); ctx.save(); cut(ctx, W, H, { x0: region.x0, x1: sxIn, y0: region.y0, y1: region.y1 }, false); now.draw(t, api); ctx.restore(); }
      // everything else is the new picture, drawn in place (the parts below a taller or shorter part slide to theirs)
      api.frame();
      if (band) {
        ctx.save(); cut(ctx, W, H, { x0: 0, x1: W, y0: 0, y1: region.y0 }, false); now.draw(t, api); ctx.restore();
        if (band.below) {
          api.frame();
          ctx.save(); ctx.translate(0, band.below.shift * (1 - ease(slide))); cut(ctx, W, H, { x0: 0, x1: W, y0: band.below.newTop, y1: H + Math.abs(band.below.shift) + 400 }, false); now.draw(t, api); ctx.restore();
        }
        api.frame(); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 0, 0); ctx.clip(); now.draw(t, api); ctx.restore();   // draws nothing: it owns the hits and the captions
      } else {
        ctx.save(); cut(ctx, W, H, region, true); now.draw(t, api); ctx.restore();
      }
      // the pen: a short bright edge where the wipe is
      const px = out < 1 ? sxOut : sxIn;
      if (p < 1) api.line(px, region.y0, px, region.y1, { c: "accent", w: 3, a: 0.9 * (1 - seg(p, 0.9, 1)) });
      if (p >= 1) this.done = true;
    },
  };
}

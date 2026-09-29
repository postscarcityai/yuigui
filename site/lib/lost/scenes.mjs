// The 404's sketchbook (SITE-104): one scene per load, each drawing into a character grid.
// A scene is create(env) -> { step?(n), draw(put, n), still }. env: cols, rows, rng (seeded), mask (the shape of 404),
// path, hour, theme. put(x, y, ch, slot): slot 0-2 drifting accents, 3 faint, 4 solid ink.
// step runs 30 times a second; still is how many steps a Reduce Motion visitor's single frame has run.
// Everything random comes from env.rng, so a seed replays the same drawing.

const RAMP = " .:-=+*#%@";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const shuffle = (rng, a) => { const o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };

function drift(e) {
  const { cols: W, rows: H, rng, mask } = e;
  const cells = shuffle(rng, mask.cells);
  const N = Math.min(1600, Math.max(cells.length, Math.floor(W * H * 0.5)));
  const P = Array.from({ length: N }, (_, i) => ({ x: rng() * W, y: rng() * H, c: i % 3, t: cells[i % cells.length] }));
  const D = new Float32Array(W * H), C = new Uint8Array(W * H);
  // The currents gather into 404, hold, then scatter again.
  const pull = (n) => { const m = n % 520; return m < 60 ? 0 : m < 200 ? (m - 60) / 140 : m < 380 ? 1 : m < 460 ? 1 - (m - 380) / 80 : 0; };
  return {
    still: 260,
    step(n) {
      const a = pull(n);
      for (let i = 0; i < D.length; i++) D[i] *= 0.8;
      for (const p of P) {
        const ang = Math.sin(p.x * 0.12 + n * 0.011) * 2.2 + Math.cos(p.y * 0.16 - n * 0.014) * 2.2 + p.c;
        const vx = Math.cos(ang) * 0.7 * (1 - a) + (p.t[0] + 0.5 - p.x) * 0.18 * a;
        const vy = Math.sin(ang) * 0.45 * (1 - a) + (p.t[1] + 0.5 - p.y) * 0.18 * a;
        p.x = (p.x + vx + W) % W; p.y = (p.y + vy + H) % H;
        const k = (p.y | 0) * W + (p.x | 0);
        D[k] += 0.55; C[k] = p.c;
      }
    },
    draw(put) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const k = y * W + x, d = D[k];
        if (d > 0.15) put(x, y, RAMP[Math.min(9, (d * 3) | 0)], C[k]);
      }
    },
  };
}

// Yui Lines fall like matrix rain; the ones that land stack up into 404.
function rain(e) {
  const { cols: W, rows: H, rng, mask } = e;
  const words = ["timer 40/20x8", "choose", "card", "pick", "form", "toggle", "slider", "progress", "cta", "list", "chart", "plan", "note"];
  const settled = new Map();
  const fill = new Int16Array(W);
  let drops = [], done = -1;
  return {
    still: 380,
    step(n) {
      if (done >= 0) { if (n - done > 400) { settled.clear(); fill.fill(0); drops = []; done = -1; } return; }
      for (let x = 0; x < W; x++) {
        const col = mask.byCol[x];
        const open = col && fill[x] < col.length;
        if (rng() < (open ? 0.2 : 0.008)) drops.push({ x, y: -1, sp: 0.45 + rng() * 0.6, w: words[(rng() * words.length) | 0], c: (rng() * 3) | 0 });
      }
      const live = [];
      for (const d of drops) {
        d.y += d.sp;
        const col = mask.byCol[d.x];
        if (col && fill[d.x] < col.length) {
          const ty = col[fill[d.x]];
          if (d.y >= ty) { settled.set(ty * W + d.x, { ch: d.w[fill[d.x] % d.w.length], c: d.c }); fill[d.x]++; continue; }
        } else if (d.y - d.w.length > H) continue;
        live.push(d);
      }
      drops = live;
      if (mask.byCol.every((col, x) => !col || fill[x] >= col.length)) done = n;
    },
    draw(put) {
      for (const [k, s] of settled) put(k % W, (k / W) | 0, s.ch, s.c);
      for (const d of drops) for (let k = 0; k < d.w.length; k++) put(d.x, Math.floor(d.y) - k, d.w[d.w.length - 1 - k], k === 0 ? 4 : 3);
    },
  };
}

// A dub waveform, the house sound. The kick lifts it and 404 rides the wobble.
function tide(e) {
  const { cols: W, rows: H, rng, mask } = e;
  const ph = [rng() * 6, rng() * 6, rng() * 6];
  const sc = H * 0.06;
  const h = (x, n) => {
    const kick = Math.pow(Math.max(0, Math.sin(n * 0.1047)), 6);
    return (Math.sin(x * 0.09 - n * 0.06 + ph[0]) * 2.2 + Math.sin(x * 0.21 + n * 0.045 + ph[1]) * 1.1 + Math.sin(x * 0.05 - n * 0.02 + ph[2]) * 1.6) * (1 + kick * 0.8) * sc * 0.5;
  };
  return {
    still: 90,
    draw(put, n) {
      const mid = H * 0.66;
      for (let x = 0; x < W; x++) {
        const v = h(x, n), yy = Math.round(mid + v), s = h(x + 1, n) - h(x - 1, n);
        put(x, yy, Math.abs(s) < 0.25 ? "_" : s > 0 ? "\\" : "/", 0);
        for (let y = yy + 1; y < H; y++) if (y - yy < 3) put(x, y, y - yy === 1 ? "~" : "-", 1);
        else if (((x + y + (n >> 3)) & 3) === 0) put(x, y, ".", 3);
      }
      for (const [x, y] of mask.cells) put(x, y + Math.round(h(x, n) * 0.7), mask.edge(x, y) ? "@" : "#", (x >> 3) % 3);
    },
  };
}

// 404 grows from stems and blooms.
function garden(e) {
  const { cols: W, rows: H, rng, mask } = e;
  const stems = [];
  for (let x = mask.x0; x <= mask.x1; x += 2) {
    const col = mask.byCol[x] || mask.byCol[x + 1];
    if (!col) continue;
    stems.push({ x, top: Math.min(...col), delay: (rng() * 90) | 0, c: (rng() * 3) | 0, ph: rng() * 6 });
  }
  const at = new Map(stems.map((s) => [s.x >> 1, s]));
  const leaf = "&%*@";
  return {
    still: 300,
    draw(put, n) {
      for (const s of stems) {
        const g = ((n - s.delay) * 0.3) | 0;
        if (g < 0) continue;
        for (let k = 0; k <= Math.min(g, H - 1 - s.top); k++) {
          const y = H - 1 - k;
          if (!mask.has(s.x, y)) put(s.x, y, k % 3 === 1 ? (Math.sin(y * 0.4 + s.ph + n * 0.04) > 0 ? "(" : ")") : "|", k % 3 === 1 ? s.c : 3);
        }
        if (g >= H - 1 - s.top) {
          const y = s.top - 1, sway = Math.round(Math.sin(n * 0.05 + s.ph));
          put(s.x + sway, y, "@", s.c);
          put(s.x + sway - 1, y, "*", (s.c + 1) % 3); put(s.x + sway + 1, y, "*", (s.c + 1) % 3);
          put(s.x + sway, y - 1, "*", (s.c + 2) % 3);
        }
      }
      for (const [x, y] of mask.cells) {
        const s = at.get(x >> 1);
        if (!s) continue;
        const g = ((n - s.delay) * 0.3) | 0;
        if (H - 1 - y <= g) put(x, y, x % 2 ? ";" : leaf[(x * 5 + y * 3) % 4], (s.c + (y > mask.y0 + (mask.y1 - mask.y0) / 2 ? 1 : 0)) % 3);
      }
    },
  };
}

// A tiny sky that follows the visitor's clock. 404 is clouds by day and stars by night.
function weather(e) {
  const { cols: W, rows: H, rng, mask, hour } = e;
  const phase = hour < 5 || hour >= 21 ? "night" : hour < 8 ? "dawn" : hour < 17 ? "day" : "dusk";
  const stars = Array.from({ length: Math.floor(W * H * 0.03) }, () => ({ x: (rng() * W) | 0, y: (rng() * H * 0.7) | 0, t: rng() * 6 }));
  const clouds = Array.from({ length: 4 }, () => ({ x: rng() * W, y: 1 + ((rng() * H * 0.35) | 0), sp: 0.03 + rng() * 0.05 }));
  const bx = Math.floor(W * (0.15 + rng() * 0.7)), hills = Array.from({ length: W }, (_, x) => Math.round(Math.sin(x * 0.13 + rng() * 0.2) * 1 + Math.sin(x * 0.05) * 1.5));
  const baseY = { dawn: H * 0.72, day: H * 0.22, dusk: H * 0.72, night: H * 0.22 }[phase];
  return {
    still: 60,
    draw(put, n) {
      const dark = phase === "night";
      if (dark || phase === "dawn" || phase === "dusk") for (const s of stars) put(s.x, s.y, Math.sin(n * 0.08 + s.t) > 0.3 ? "*" : ".", 3);
      const by = Math.round(baseY + (phase === "dawn" ? -n * 0.01 : phase === "dusk" ? n * 0.01 : 0));
      for (let dy = -3; dy <= 3; dy++) for (let dx = -6; dx <= 6; dx++) {
        if ((dx / 2) ** 2 + dy * dy > 9) continue;
        if (dark && ((dx - 2) / 2) ** 2 + (dy - 1) ** 2 <= 6) continue;
        put(bx + dx, by + dy, dark ? "c" : "O", 2);
      }
      if (phase === "day") for (let a = 0; a < 12; a++) put(bx + Math.round(Math.cos(a / 12 * 6.283) * 10), by + Math.round(Math.sin(a / 12 * 6.283 + n * 0.02) * 5), ".", 2);
      for (let x = 0; x < W; x++) { put(x, H - 2 + hills[x] * 0, "_", 3); const hy = H - 2 - Math.max(0, hills[x] + 1); if (hy < H - 1) put(x, hy, "^", 3); }
      for (const c of clouds) {
        const cx = Math.floor((c.x + n * c.sp) % (W + 14)) - 7;
        [" .--. ", "(____)"].forEach((row, i) => [...row].forEach((ch, k) => ch !== " " && put(cx + k, c.y + i, ch, 3)));
      }
      const bob = Math.round(Math.sin(n * 0.04));
      for (const [x, y] of mask.cells) {
        if (dark || phase === "dawn") {
          if (mask.edge(x, y)) put(x, y, Math.sin(n * 0.09 + x * 1.7 + y) > -0.5 ? "*" : "+", 2);
          else if ((x * 7 + y * 3) % 5 === 0) put(x, y, ".", 3);
        } else put(x, y + bob, (x + y) % 4 === 0 ? "%" : "#", mask.edge(x, y) ? 4 : (x >> 4) % 2);
      }
    },
    label: phase,
  };
}

// Conway's life, seeded with the shape of 404, reseeded when it settles.
function life(e) {
  const { cols: W, rows: H, rng, mask } = e;
  let A = new Uint8Array(W * H), age = new Uint16Array(W * H), dead = new Uint8Array(W * H), gen = 0;
  const seed = () => { A.fill(0); age.fill(0); dead.fill(0); gen = 0; for (const [x, y] of mask.cells) A[y * W + x] = 1; for (let i = 0; i < A.length; i++) if (!A[i] && rng() < 0.05) A[i] = 1; };
  seed();
  return {
    still: 0,
    step(n) {
      if (n % 4) return;
      const B = new Uint8Array(W * H);
      let pop = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let c = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) c += A[((y + dy + H) % H) * W + ((x + dx + W) % W)];
        const k = y * W + x, on = A[k] ? c === 2 || c === 3 : c === 3;
        B[k] = on ? 1 : 0; pop += B[k];
        age[k] = on ? (A[k] ? age[k] + 1 : 0) : 0;
        dead[k] = !on && A[k] ? 3 : Math.max(0, dead[k] - 1);
      }
      A = B; gen++;
      if (pop < 12 || gen > 140) seed();
    },
    draw(put) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const k = y * W + x;
        if (A[k]) put(x, y, age[k] > 12 ? "#" : age[k] > 3 ? "O" : "@", age[k] > 12 ? 2 : age[k] > 3 ? 1 : 0);
        else if (dead[k]) put(x, y, ".", 3);
      }
    },
  };
}

// Yui types the Yui Lines for this page, then the page draws itself out of them.
function typing(e) {
  const { cols: W, rows: H, mask, path } = e;
  const lines = [`card "Page not found"`, `text "${path} isn't here."`, `choose "Home" "Playground" "Ask Yui"`, `timer 4/2x1`].map((l) => l.slice(0, W - 3));
  const src = lines.join("\n"), flat = src.replace(/\s/g, "");
  const t0 = Math.ceil(src.length / 1.2) + 20;
  return {
    still: 300,
    draw(put, n) {
      const typed = Math.min(src.length, Math.floor(n * 1.2)), fade = n > t0 ? 3 : 4;
      let x = 1, y = 0;
      for (let i = 0; i < typed; i++) { const ch = src[i]; if (ch === "\n") { x = 1; y++; continue; } put(x++, y, ch, fade); }
      if (typed < src.length && (n >> 3) % 2 === 0) put(x, y, "_", 0);
      const reveal = (n - t0) * 1.1;
      if (reveal < 0) return;
      for (const [cx, cy] of mask.cells) if (cx - mask.x0 < reveal) put(cx, cy, flat[(cx * 7 + cy * 13) % flat.length], (Math.floor((cy - mask.y0) / Math.max(1, (mask.y1 - mask.y0 + 1) / 3)) + (cx > mask.x1 - 2 ? 1 : 0)) % 3);
    },
  };
}

// A generated maze with the page you asked for at an exit that isn't there.
function maze(e) {
  const { cols: W, rows: H, rng, mask, path } = e;
  const w = W % 2 ? W : W - 1, h = (H - 1) % 2 ? H - 2 : H - 1;
  let g, order, route, t0 = 0;
  const build = () => {
    g = Array.from({ length: h }, () => new Uint8Array(w).fill(1));
    const st = [[1, 1]]; g[1][1] = 0;
    while (st.length) {
      const [x, y] = st[st.length - 1];
      const nb = shuffle(rng, [[2, 0], [-2, 0], [0, 2], [0, -2]]).map(([a, b]) => [x + a, y + b, x + a / 2, y + b / 2]).filter(([nx, ny]) => nx > 0 && ny > 0 && nx < w - 1 && ny < h - 1 && g[ny][nx]);
      if (!nb.length) { st.pop(); continue; }
      const [nx, ny, mx, my] = nb[0]; g[my][mx] = 0; g[ny][nx] = 0; st.push([nx, ny]);
    }
    g[1][0] = 0; g[h - 2][w - 1] = 0;
    const prev = new Map([[`0,1`, null]]), q = [[0, 1]]; order = [];
    while (q.length) {
      const [x, y] = q.shift(); order.push([x, y]);
      if (x === w - 1 && y === h - 2) break;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b; if (nx >= 0 && ny >= 0 && nx < w && ny < h && !g[ny][nx] && !prev.has(`${nx},${ny}`)) { prev.set(`${nx},${ny}`, [x, y]); q.push([nx, ny]); } }
    }
    route = []; for (let c = [w - 1, h - 2]; c; c = prev.get(`${c[0]},${c[1]}`)) route.push(c);
  };
  build();
  return {
    still: 260,
    step(n) { if ((n - t0) * 3 > order.length + 300) { build(); t0 = n; } },
    draw(put, n) {
      const k = Math.floor((n - t0) * 3);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y][x]) put(x, y, "#", 3);
      for (let i = 0; i < Math.min(k, order.length); i++) put(order[i][0], order[i][1], ".", 1);
      if (k >= order.length) for (const [x, y] of route) put(x, y, "*", 2);
      for (const [x, y] of mask.cells) put(x, y, mask.edge(x, y) ? "@" : "#", 0);
      const door = (n >> 4) % 2 ? "?" : "!";
      put(w - 1, h - 2, door, 0);
      const label = `${path} >`;
      for (let i = 0; i < label.length; i++) put(W - label.length - 1 + i, h, label[i], 4);
    },
  };
}

// Snow that resolves to 404, then falls apart again.
function snow(e) {
  const { cols: W, rows: H, rng, mask } = e;
  const noise = new Uint8Array(W * H), chars = ".:-=+*#%,;'`", lockAt = new Float32Array(W * H).map(() => rng());
  return {
    still: 260,
    step() { for (let i = 0; i < noise.length; i++) noise[i] = (rng() * chars.length) | 0; },
    draw(put, n) {
      const m = n % 480, L = m < 200 ? m / 200 : m < 380 ? 1 : 1 - (m - 380) / 100;
      const scan = Math.floor(n * 0.5) % (H + 6);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const k = y * W + x, inside = mask.has(x, y);
        if (inside && lockAt[k] < L) put(x, y, mask.edge(x, y) ? "@" : "#", (y * 3 / H) | 0);
        else if (lockAt[k] * 1.3 > L + (inside ? 0 : 0.3) || (y === scan)) put(x, y, chars[noise[k]], y === scan ? 0 : 3);
      }
    },
  };
}

// Ripples from three sources; 404 lights up where the waves cross.
function ripple(e) {
  const { cols: W, rows: H, rng, mask } = e;
  const src = Array.from({ length: 3 }, () => ({ x: rng() * W, y: rng() * H, k: 0.5 + rng() * 0.4, w: 0.12 + rng() * 0.1, vx: (rng() - 0.5) * 0.05, vy: (rng() - 0.5) * 0.03 }));
  return {
    still: 120,
    step() { for (const s of src) { s.x = (s.x + s.vx + W) % W; s.y = (s.y + s.vy + H) % H; } },
    draw(put, n) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        let v = 0, best = 0, bw = 0;
        src.forEach((s, i) => { const d = Math.hypot(x - s.x, (y - s.y) * 2), a = Math.sin(d * s.k - n * s.w) / (1 + d * 0.08); v += a; if (Math.abs(a) > bw) { bw = Math.abs(a); best = i; } });
        const q = clamp(Math.floor(((v + 1.5) / 3) * 8), 0, 7);
        if (mask.has(x, y)) put(x, y, "@%#*"[clamp(Math.floor((v + 1.5) / 3 * 4), 0, 3)], (x >> 4) % 3);
        else if (Math.abs(v) > 0.55) put(x, y, RAMP[q + 1], v > 0 ? best % 3 : 3);
      }
    },
  };
}

export const SCENES = [
  { name: "drift", make: drift }, { name: "rain", make: rain }, { name: "tide", make: tide }, { name: "garden", make: garden },
  { name: "weather", make: weather }, { name: "life", make: life }, { name: "typing", make: typing }, { name: "maze", make: maze },
  { name: "snow", make: snow }, { name: "ripple", make: ripple },
];

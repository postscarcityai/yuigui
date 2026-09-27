// A tiny WebGL1 runner for the brand shaders. Browser only (canvas, Path2D).
// Used by the /brand page (ShaderCanvas) and by the films in videos/13-brand.
//
//   const st = brandStage(canvas, "meok");
//   st.setMark({ rough: 0, pose }, { pad: 0.12 });   // draws the mark into the mask textures
//   st.draw(t, { p: [bloom, dry, 0, 0], colors: { bg, mark, ink, c1, c2, c3 } });
//
// Masks: m0 the sharp mark, m1 a small blur (edges, bevels), m2 a big blur (halos, shadows),
// id the pieces in their own colors (bojagi). The mark always fits BOX (or YBOX for the Y alone).
import { markPaths, BOX, YBOX } from "./mark.mjs";
import { SHADERS, PRELUDE } from "./shaders.mjs";

const VERT = `attribute vec2 a;varying vec2 v_uv;void main(){v_uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;

export function hex3(h) {
  const v = parseInt(String(h).replace("#", ""), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

function blurInto(src, dst, factor) {
  const w = Math.max(2, Math.round(src.width / factor)), h = Math.max(2, Math.round(src.height / factor));
  const tmp = document.createElement("canvas");
  tmp.width = w; tmp.height = h;
  const t = tmp.getContext("2d");
  t.imageSmoothingEnabled = true;
  t.imageSmoothingQuality = "high";
  t.drawImage(src, 0, 0, w, h);
  // a second, smaller pass makes the falloff rounder
  const tmp2 = document.createElement("canvas");
  tmp2.width = Math.max(2, w >> 1); tmp2.height = Math.max(2, h >> 1);
  const t2 = tmp2.getContext("2d");
  t2.imageSmoothingQuality = "high";
  t2.drawImage(tmp, 0, 0, tmp2.width, tmp2.height);
  const d = dst.getContext("2d");
  d.imageSmoothingEnabled = true;
  d.imageSmoothingQuality = "high";
  // half the fine pass, half the coarse one: a solid area still reads 1, the falloff is rounder
  d.drawImage(tmp, 0, 0, dst.width, dst.height);
  d.globalAlpha = 0.5;
  d.drawImage(tmp2, 0, 0, dst.width, dst.height);
  d.globalAlpha = 1;
}

// Where the mark sits in a w x h canvas. pad is a fraction of the short side.
export function placement(w, h, { pad = 0.14, y = false, scale = 1, cx = 0.5, cy = 0.5 } = {}) {
  const box = y ? YBOX : BOX;
  const room = Math.min(w, h) * pad;
  const s = Math.min((w - room * 2) / box.w, (h - room * 2) / box.h) * scale;
  return { s, dx: w * cx - (box.x + box.w / 2) * s, dy: h * cy - (box.y + box.h / 2) * s };
}

export function drawMark(ctx, markOpts, place, color = "#fff", colors = null) {
  const { s, dx, dy } = place;
  ctx.save();
  ctx.setTransform(s, 0, 0, s, dx, dy);
  for (const p of markPaths(markOpts)) {
    ctx.fillStyle = colors ? colors[p.name] || color : color;
    ctx.fill(new Path2D(p.d));
  }
  ctx.restore();
}

export function brandStage(canvas, shaderName, { maxSide = 1400 } = {}) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + "\n" + src.split("\n").map((l, i) => i + 1 + ": " + l).join("\n"));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, PRELUDE + SHADERS[shaderName]));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);

  const cv = () => document.createElement("canvas");
  const masks = { m0: cv(), m1: cv(), m2: cv(), id: cv() };
  const tex = {};
  ["m0", "m1", "m2", "id"].forEach((k, i) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U("u_" + k), i);
    tex[k] = t;
  });
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  let size = [0, 0];
  let last = null;
  const upload = (k, i) => {
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tex[k]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, masks[k]);
  };

  const api = {
    gl,
    resize(w, h) {
      const k = Math.min(1, maxSide / Math.max(w, h));
      const W = Math.round(w * k), H = Math.round(h * k);
      if (W === size[0] && H === size[1]) return false;
      canvas.width = W; canvas.height = H;
      size = [W, H];
      Object.values(masks).forEach((c) => { c.width = W; c.height = H; });
      gl.viewport(0, 0, W, H);
      if (last) api.setMark(...last);
      return true;
    },
    // pieceColors: { earL: "#...", ... } for the id texture (bojagi)
    setMark(markOpts = {}, placeOpts = {}, pieceColors = null) {
      last = [markOpts, placeOpts, pieceColors];
      if (!size[0]) api.resize(canvas.clientWidth || 800, canvas.clientHeight || 500);
      const [W, H] = size;
      const pl = placement(W, H, placeOpts);
      const c0 = masks.m0.getContext("2d");
      c0.fillStyle = "#000"; c0.fillRect(0, 0, W, H);
      drawMark(c0, markOpts, pl, "#fff");
      blurInto(masks.m0, masks.m1, Math.max(3, Math.round(Math.min(W, H) / 140)));
      blurInto(masks.m0, masks.m2, Math.max(8, Math.round(Math.min(W, H) / 40)));
      const ci = masks.id.getContext("2d");
      ci.fillStyle = "#000"; ci.fillRect(0, 0, W, H);
      if (pieceColors) drawMark(ci, markOpts, pl, "#fff", pieceColors);
      upload("m0", 0); upload("m1", 1); upload("m2", 2); upload("id", 3);
      return pl;
    },
    draw(t = 0, { p = [0, 0, 0, 0], q = [0, 0, 0, 0], mouse = [0.5, 0.5], colors = {} } = {}) {
      gl.useProgram(prog);
      gl.uniform2f(U("u_res"), size[0], size[1]);
      gl.uniform1f(U("u_time"), t);
      gl.uniform2f(U("u_mouse"), mouse[0], mouse[1]);
      gl.uniform4f(U("u_p"), ...p);
      gl.uniform4f(U("u_q"), ...q);
      for (const k of ["bg", "mark", "ink", "c1", "c2", "c3"]) gl.uniform3f(U("u_" + k), ...hex3(colors[k] || "#808080"));
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    destroy() {
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    },
  };
  return api;
}

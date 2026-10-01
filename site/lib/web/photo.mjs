// A photo for the composer (YUI-244), the browser's twin of Chat/Attachments.swift `ComposerPhoto` and
// Presets/YuiMedia.swift `jpeg`: decoded, shrunk so the longest side is 2048 px, re-encoded as JPEG at 0.85.
// What the agent sees is the same picture whatever the camera or the browser. The preview is a small blob
// URL, never the 2048 px one. Browser only (createImageBitmap, canvas); the sizes are in compose.mjs.
import { MAX_BYTES, MAX_SIDE, fitSize, isPhotoFile } from "./compose.mjs";

export class PhotoError extends Error {
  constructor(code) { super(code); this.code = code; }
}

const PREVIEW = 200; // drawn at 200 px at most

async function decode(file) {
  // `from-image` applies the camera's rotation, like UIImage does.
  if (globalThis.createImageBitmap) {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { /* try an <img> */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally { URL.revokeObjectURL(url); }
}

const toBlob = (canvas, type, q) => new Promise((resolve) => canvas.toBlob(resolve, type, q));

function draw(src, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // a transparent PNG becomes white, not black, in a JPEG
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(src, 0, 0, w, h);
  return canvas;
}

// One picked, dropped or pasted file -> { id, blob, type, preview, name, width, height }. Throws PhotoError:
// not_a_photo (not a picture the bucket takes), too_big, unreadable.
export async function preparePhoto(file) {
  if (!isPhotoFile(file)) throw new PhotoError("not_a_photo");
  if (file.size > MAX_BYTES * 4) throw new PhotoError("too_big");
  let src;
  try { src = await decode(file); } catch { throw new PhotoError("unreadable"); }
  const w0 = src.width || src.naturalWidth, h0 = src.height || src.naturalHeight;
  const fit = fitSize(w0, h0, MAX_SIDE) || { w: w0, h: h0 };
  const full = await toBlob(draw(src, fit.w, fit.h), "image/jpeg", 0.85);
  const small = fitSize(w0, h0, PREVIEW) || { w: w0, h: h0 };
  const thumb = await toBlob(draw(src, small.w, small.h), "image/jpeg", 0.8);
  src.close?.();
  if (!full || !thumb) throw new PhotoError("unreadable");
  if (full.size > MAX_BYTES) throw new PhotoError("too_big");
  return { id: globalThis.crypto?.randomUUID?.() || String(Math.random()), blob: full, type: "image/jpeg", preview: URL.createObjectURL(thumb), name: file.name || "photo.jpg", width: fit.w, height: fit.h };
}

export const photoProblem = (code) => ({
  not_a_photo: "Yui takes photos for now: jpg, png, webp, gif or heic.",
  too_big: "That photo is too big. Try a smaller one.",
  unreadable: "Couldn't read that photo.",
  limit: "That is the most photos in one message.",
}[code] || "Couldn't add that photo.");

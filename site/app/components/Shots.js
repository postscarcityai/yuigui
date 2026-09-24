"use client";
// A small screenshot gallery: thumbnails that open full size. Arrow keys step through, Esc or a tap outside closes.
import { useEffect, useRef, useState } from "react";

export default function Shots({ images, label }) {
  const [open, setOpen] = useState(-1);
  const dlg = useRef(null);
  const shown = open >= 0 ? images[open] : null;

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open >= 0 && !d.open) d.showModal();
    if (open < 0 && d.open) d.close();
  }, [open]);

  if (!images?.length) return null;
  const step = (by) => setOpen((i) => (i + by + images.length) % images.length);

  return (
    <>
      <div className={`thumbs${images.length === 1 ? " one" : ""}`}>
        {images.map((im, i) => (
          <button key={im.src} type="button" className="thumb" onClick={() => setOpen(i)} aria-label={`Enlarge: ${im.alt}`}>
            <img src={im.src} alt={im.alt} loading="lazy" />
          </button>
        ))}
      </div>
      <dialog
        ref={dlg}
        className="lightbox"
        aria-label={label || "Screenshot"}
        onClose={() => setOpen(-1)}
        onClick={(ev) => { if (ev.target === dlg.current || ev.target.classList.contains("lb-stage")) setOpen(-1); }}
        onKeyDown={(ev) => {
          if (ev.key === "ArrowRight") step(1);
          if (ev.key === "ArrowLeft") step(-1);
        }}
      >
        {shown && (
          <div className="lb-stage">
            <img src={shown.src} alt={shown.alt} />
            <div className="lb-bar">
              {images.length > 1 && <button type="button" onClick={() => step(-1)} aria-label="Previous">‹</button>}
              <span>{shown.alt}{images.length > 1 ? ` (${open + 1} of ${images.length})` : ""}</span>
              {images.length > 1 && <button type="button" onClick={() => step(1)} aria-label="Next">›</button>}
              <button type="button" onClick={() => setOpen(-1)} aria-label="Close">✕</button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

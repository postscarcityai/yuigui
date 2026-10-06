"use client";

import { useState } from "react";
import MotionFilm from "../components/MotionFilm";
import "./motion.css";

const BASE = "/demo/motion/gallery";

export default function Gallery({ groups }) {
  const [open, setOpen] = useState(null);
  return (
    <>
      {groups.map((g) => (
        <section key={g.title} className="mg-group" aria-label={g.title}>
          <h2>{g.title}</h2>
          <p className="lede" style={{ fontSize: 16 }}>{g.lede}</p>
          <div className="mg-grid">
            {g.asks.map((a) => (
              <div className="mg-card" key={a.id}>
                <p>{a.ask}</p>
                <div className="mg-pair">
                  {a.runs.map((r) => (
                    <button className="mg-thumb" key={r.run} onClick={() => setOpen({ id: `${a.id}-r${r.run}`, ask: a.ask })} aria-label={`Play run ${r.run}: ${a.ask}`}>
                      <img src={`${BASE}/${a.id}-r${r.run}.webp`} alt="" width="260" height="563" loading="lazy" />
                      <span>Run {r.run}</span>
                    </button>
                  ))}
                </div>
                <div className="mg-meta">{a.runs.map((r) => `${r.film_s} s film, scene 1 in ${r.first_scene_s} s`).join(" · ")}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {open ? (
        <div className="mg-modal" role="dialog" aria-label={open.ask} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
          <button className="mg-close" onClick={() => setOpen(null)}>Close</button>
          <div className="mg-modal-in"><MotionFilm film={open.id} label={open.ask} /></div>
        </div>
      ) : null}
    </>
  );
}

"use client";
// First run, pick your crew (Agents/CrewPick.swift, YUI-216; the app's CrewAgentPage for each starter's page).
// A new account sees this before anything else: Yui is always on the crew, each starter is one tap (and an
// info page of its own), "Bring my own agent" leads into pairing, and one button saves the pick on the account
// (`crew_choose`) so this never comes back. Full screen on a phone, a centred column on a computer.
import { useState } from "react";
import { SAVE_ERROR, basesToSend, pickable, rowLabel, startTitle, toggled, yuiOf } from "../../lib/web/crewpick.mjs";
import { Face } from "./parts";

const faceOf = (s) => ({ name: s.name, color: s.color, theme: { preset: s.color } });

function StarterPage({ starter, on, onToggle, onBack }) {
  return (
    <section className="cp" aria-label={starter.name} data-testid="crew-page">
      <div className="cp-scroll">
        <button type="button" className="cp-back" onClick={onBack} data-testid="crew-page-back">Back</button>
        <Face agent={faceOf(starter)} size={88} />
        <h2 className="cp-name">{starter.name}</h2>
        <p className="cp-role">{starter.role}</p>
        {starter.tagline ? <p className="cp-tag">{starter.tagline}</p> : null}
        {starter.about ? <p className="cp-about">{starter.about}</p> : null}
        {starter.can?.length ? (
          <>
            <p className="cp-role">Try asking</p>
            <ul className="cp-asks">{starter.can.map((a) => <li key={a}>{a}</li>)}</ul>
          </>
        ) : null}
      </div>
      <div className="cp-foot">
        <button type="button" className="cp-go" onClick={onToggle} data-testid="crew-page-add">{on ? "Added. Tap to remove" : `Add ${starter.name}`}</button>
      </div>
    </section>
  );
}

export default function CrewPick({ crew, manage, onDone, onOwn }) {
  const [picked, setPicked] = useState(() => new Set());
  const [detail, setDetail] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const yui = yuiOf(crew);
  const flip = (base) => setPicked((p) => toggled(p, base));
  const save = async (own) => {
    if (working) return;
    setWorking(true); setError("");
    try {
      await manage.crewChoose(basesToSend(crew, picked), own);
      await (own ? onOwn() : onDone());
    } catch { setError(SAVE_ERROR); }
    finally { setWorking(false); }
  };
  const open = detail ? pickable(crew).find((s) => s.base === detail) : null;
  if (open) return <StarterPage starter={open} on={picked.has(open.base)} onToggle={() => flip(open.base)} onBack={() => setDetail(null)} />;
  return (
    <section className="cp" aria-labelledby="cp-title" data-testid="crew-pick">
      <div className="cp-scroll">
        <h1 id="cp-title" className="cp-title" data-testid="crew-pick-title">Hi, I&apos;m Yui.<br />Let&apos;s pick your crew.</h1>
        <p className="cp-sub">Tap to add. Change it any time.</p>
        <div className="cp-row cp-yui" role="group" aria-label="Yui, always with you">
          <Face agent={faceOf(yui)} size={44} />
          <span className="cp-words"><b>Yui</b><small>Always with you</small></span>
          <span className="cp-mark on" aria-hidden="true">✓</span>
        </div>
        <ul className="cp-list">
          {pickable(crew).map((s) => {
            const on = picked.has(s.base);
            return (
              <li key={s.base} className={`cp-row${on ? " on" : ""}`}>
                <button type="button" className="cp-main" aria-pressed={on} aria-label={rowLabel(s, on)} onClick={() => flip(s.base)} data-testid={`crew-pick-${s.base}`}>
                  <Face agent={faceOf(s)} size={44} />
                  <span className="cp-words"><b>{s.name}</b><small>{s.tagline || s.role}</small></span>
                  <span className={`cp-mark${on ? " on" : ""}`} aria-hidden="true">{on ? "✓" : "+"}</span>
                </button>
                <button type="button" className="cp-info" aria-label={`About ${s.name}`} onClick={() => setDetail(s.base)} data-testid={`crew-more-${s.base}`}>i</button>
              </li>
            );
          })}
        </ul>
        <button type="button" className="cp-own" disabled={working} onClick={() => save(true)} data-testid="crew-own">
          <span className="cp-link" aria-hidden="true">↗</span>
          <span className="cp-words"><b>Bring my own agent</b><small>Hermes, OpenClaw, Claude Code or something else</small></span>
        </button>
        {error ? <p className="cp-error" role="alert" data-testid="crew-error">{error}</p> : null}
      </div>
      <div className="cp-foot">
        <button type="button" className="cp-go" disabled={working} onClick={() => save(false)} data-testid="crew-start">{working ? "…" : startTitle(picked.size)}</button>
      </div>
    </section>
  );
}

"use client";
// Agent Controls on the web (YUI-245): the browser twin of the app's Controls screens (Agents/ControlsViews.swift,
// spec yuigui spec/CONTROLS.md). One self-contained dialog with its own navigation: the areas -> an area ->
// an item -> the editor. Everything goes to the agent's computer through lib/web/controls.mjs; nothing here
// touches the thread. Text shows rendered with an Edit button, every delete asks first, and a save the host
// refuses as changed shows both versions to pick from.
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RichText } from "../playground/richtext";
import {
  ControlsError, agoWords, controlsFor, createControls, deliverWords, draftKey, loadDraft, nextWords, parseScheduleLine,
  saveDraft, scheduleLine, sectionTitle, splitFrontmatter, talkTitle, withoutFrontmatter,
} from "../../lib/web/controls.mjs";
import "./controls.css";

const Ctl = createContext(null);
const useCtl = () => useContext(Ctl);

// ---------- small pieces ----------

const ICONS = {
  soul: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z",
  memory: "M9 4a3 3 0 0 0-3 3v.3A3.5 3.5 0 0 0 4 10.5a3.5 3.5 0 0 0 1.3 2.7A3.5 3.5 0 0 0 6 17a3 3 0 0 0 3 3h1V4zM15 4a3 3 0 0 1 3 3v.3a3.5 3.5 0 0 1 2 3.2 3.5 3.5 0 0 1-1.3 2.7A3.5 3.5 0 0 1 18 17a3 3 0 0 1-3 3h-1V4z",
  skills: "M4 20L15 9M13 5l2 1 1-2 1 2 2 1-2 1-1 2-1-2zM6 6l1 .5L7.5 5 8 6.5 9.5 7 8 7.5 7.5 9 7 7.5z",
  schedules: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM12 11v4l2.5 1.5",
  model: "M8 8h8v8H8zM10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3",
  channels: "M4 5h11a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9l-3 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM18 9h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1v3l-3-3h-4",
};
function Icon({ name, size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === "back" ? <path d="M15 5l-7 7 7 7" /> : name === "close" ? <path d="M6 6l12 12M18 6L6 18" /> : name === "chevron" ? <path d="M9 5l7 7-7 7" /> : name === "lock" ? <path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /> : <path d={ICONS[name]} />}
    </svg>
  );
}

const Btn = ({ kind = "plain", className = "", ...p }) => <button type="button" className={`ctl-btn ${kind} ${className}`.trim()} {...p} />;
const Chip = ({ tone = "", children }) => <span className={`ctl-chip ${tone}`.trim()}>{children}</span>;
const Card = ({ children, className = "", ...p }) => <div className={`ctl-card ${className}`.trim()} {...p}>{children}</div>;
const Label = ({ children }) => <h3 className="ctl-label">{children}</h3>;
const Fact = ({ label, value }) => <div className="ctl-fact"><span>{label}</span><b>{value}</b></div>;
const Md = ({ text }) => <div className="ctl-md"><RichText text={text} /></div>;

function Spinner() { return <i className="ctl-spin" aria-hidden="true" />; }

// "Your Mac didn't answer", "Update the Yui plugin", or the host's own words, with Try again.
function Problem({ error, retry }) {
  return (
    <div className="ctl-problem" data-testid="controls-problem" role="alert">
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h18v11H3zM8 20h8M12 16v4M12 8v3M12 13h.01" /></svg>
      <h3>{error.message}</h3>
      {error.kind === "noAnswer" ? <p>It may be asleep or its gateway may be off. Your change was not made.</p> : null}
      {error.kind !== "version" ? <Btn kind="fill" onClick={retry} data-testid="controls-retry">Try again</Btn> : null}
    </div>
  );
}

// Loads from the host; keeps what it had while it asks again.
function useLoad(fn, deps) {
  const [s, set] = useState({ phase: "loading" });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    let live = true;
    set((p) => (p.phase === "ok" ? p : { phase: "loading" }));
    fnRef.current().then(
      (value) => live && set({ phase: "ok", value }),
      (e) => live && set({ phase: "error", error: e instanceof ControlsError ? e : new ControlsError("noAnswer") }),
    );
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const retry = useCallback(() => { set({ phase: "loading" }); setTick((t) => t + 1); }, []);
  return { ...s, reload, retry };
}

function Loader({ load, deps = [], children }) {
  const l = useLoad(load, deps);
  if (l.phase === "ok") return children(l.value, l.reload);
  if (l.phase === "error") return <Problem error={l.error} retry={l.retry} />;
  return <div className="ctl-asking" role="status"><Spinner /><span>Asking your Mac</span></div>;
}

// Escape closes the topmost layer or confirm first, the whole panel last (the panel keeps the stack).
function useEscape(stack, fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const h = () => ref.current();
    stack.current.push(h);
    return () => { stack.current = stack.current.filter((x) => x !== h); };
  }, [stack]);
}

// A layer over the sheet (editor, conflict, time): rendered into the sheet, Escape closes just this layer.
function Layer({ label, onEscape, children, className = "" }) {
  const { host, escapes } = useCtl();
  useEscape(escapes, onEscape);
  if (!host) return null;
  return createPortal(
    <div className={`ctl-layer ${className}`.trim()} data-layer role="group" aria-label={label}>
      {children}
    </div>,
    host,
  );
}

// ---------- the editor ----------

function Editor({ title, draftKeyName, original, emptyWords, save, onClose, onConflict }) {
  const [text, setText] = useState(() => loadDraft(draftKeyName) ?? original);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const area = useRef(null);
  useEffect(() => { area.current?.focus(); }, []);
  const change = (t) => { setText(t); saveDraft(t === original ? null : t, draftKeyName); };
  const cancel = () => { saveDraft(null, draftKeyName); onClose(); };
  const go = async () => {
    if (!text.trim()) { setError(emptyWords); return; }
    setSaving(true);
    setError(null);
    try {
      await save(text);
      saveDraft(null, draftKeyName);
      onClose();
    } catch (e) {
      if (e instanceof ControlsError && e.kind === "conflict") onConflict(text, e);
      else setError(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer"));
    } finally { setSaving(false); }
  };
  return (
    <Layer label={`Edit ${title}`} onEscape={onClose}>
      <header className="ctl-head">
        <Btn onClick={cancel} data-testid="controls-cancel">Cancel</Btn>
        <h2 className="ctl-title">{title}</h2>
        <Btn kind="fill" onClick={go} disabled={saving || text === original} data-testid="controls-save">{saving ? "Saving" : "Save"}</Btn>
      </header>
      {error ? <p className="ctl-error" role="alert" data-testid="controls-editor-error">{error}</p> : null}
      <textarea ref={area} className="ctl-editor" value={text} onChange={(e) => change(e.target.value)} spellCheck={false}
        autoCapitalize="off" autoCorrect="off" aria-label={`Edit ${title}`} data-testid="controls-editor" />
    </Layer>
  );
}

// The host changed it since it was opened: both versions, pick one.
function Conflict({ mine, theirs, keepMine, useTheirs, onClose }) {
  const first = useRef(null);
  useEffect(() => { first.current?.focus(); }, []);
  return (
    <Layer label="Changed on your Mac" onEscape={onClose} className="conflict">
      <div className="ctl-conflict" data-testid="controls-conflict">
        <div className="ctl-scroll">
          <h2 className="ctl-big">Changed on your Mac</h2>
          <p className="ctl-soft">Someone saved a different version on your Mac after you opened this. Pick the one to keep.</p>
          <Label>YOUR VERSION</Label>
          <Card><Md text={withoutFrontmatter(mine)} /></Card>
          <Label>ON YOUR MAC</Label>
          <Card><Md text={withoutFrontmatter(theirs)} /></Card>
        </div>
        <div className="ctl-bar">
          <Btn ref={first} onClick={useTheirs} data-testid="controls-use-theirs">Use the Mac's</Btn>
          <Btn kind="fill" onClick={keepMine} data-testid="controls-keep-mine">Keep mine</Btn>
        </div>
      </div>
    </Layer>
  );
}

// ---------- a text item: SOUL.md, a memory, a SKILL.md, a schedule's prompt ----------

function TextItem({ section, id, editTitle, editable = true, onChanged = () => {}, extra = null, after = null, showFrontmatter = false }) {
  const { model, agent, toast, talk } = useCtl();
  const [editing, setEditing] = useState(false);
  const [conflict, setConflict] = useState(null);
  const [version, setVersion] = useState(0);
  const key = draftKey(agent.id, section, id);
  return (
    <Loader load={() => model.get(section, id)} deps={[model, section, id, version]}>
      {({ rev, item }, reload) => {
        const locked = !!item.read_only;
        const drafted = loadDraft(key) != null;
        const again = () => { setVersion((v) => v + 1); reload(); };
        const fm = showFrontmatter ? splitFrontmatter(item.text) : null;
        return (
          <div className="ctl-stack">
            {locked ? <p className="ctl-hidden-note" data-testid="controls-hidden-note"><Icon name="lock" size={16} /> A line with a key in it is hidden on your Mac, so this can only be changed there.</p> : null}
            {extra ? extra(item, rev, again) : null}
            {fm && (fm.meta.name || fm.meta.description) ? (
              <Card className="ctl-front">{fm.meta.name ? <b>{fm.meta.name}</b> : null}{fm.meta.description ? <span>{fm.meta.description}</span> : null}</Card>
            ) : null}
            <Card data-testid="controls-rendered"><Md text={withoutFrontmatter(item.text || "")} /></Card>
            <div className="ctl-actions">
              {editable ? <Btn onClick={() => setEditing(true)} disabled={locked} data-testid="controls-edit">{drafted ? "Resume your edit" : "Edit"}</Btn> : null}
              {talk ? (
                <Btn kind="fill" data-testid="controls-talk-about"
                  onClick={() => talk({ section, id: item.id, rev, title: talkTitle(section, item), text: item.text || "" })}>Talk about this</Btn>
              ) : null}
            </div>
            {drafted && editable ? <p className="ctl-soft small" data-testid="controls-draft-note">An unsaved edit is kept on this device.</p> : null}
            {after ? after(item, rev, again) : null}
            {editing ? (
              <Editor title={editTitle} draftKeyName={key} original={item.text || ""}
                emptyWords={section === "soul" ? "An agent needs a personality. It can't be empty." : "That can't be empty."}
                onClose={() => setEditing(false)}
                save={async (text) => {
                  const r = await model.put(section, item.id, rev, { text });
                  toast("Saved on your Mac");
                  onChanged(r.item);
                  again();
                }}
                onConflict={(mine, e) => { setEditing(false); setConflict({ mine, rev: e.rev, theirs: e.item?.text || "" }); }} />
            ) : null}
            {conflict ? (
              <Conflict mine={conflict.mine} theirs={conflict.theirs}
                onClose={() => setConflict(null)}
                useTheirs={() => { saveDraft(null, key); setConflict(null); again(); }}
                keepMine={async () => {
                  try {
                    const r = await model.put(section, item.id, conflict.rev, { text: conflict.mine });
                    saveDraft(null, key);
                    toast("Saved on your Mac");
                    onChanged(r.item);
                  } catch (e) { toast(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer")); }
                  setConflict(null);
                  again();
                }} />
            ) : null}
          </div>
        );
      }}
    </Loader>
  );
}

// ---------- the areas ----------

function Home({ open }) {
  const { agent, state } = useCtl();
  if (agent.shared) {
    return <div className="ctl-pad"><p className="ctl-soft">{agent.name} is shared with you, so its settings stay with its owner.</p></div>;
  }
  if (!state.show) {
    return <div className="ctl-pad"><p className="ctl-soft" data-testid="controls-none">This agent's host doesn't share its settings yet.</p></div>;
  }
  return (
    <div className="ctl-pad">
      {state.note ? <p className="ctl-offline" data-testid="controls-offline"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5zM14 9h3l-3 3h3" /></svg> {state.note}</p> : null}
      <ul className="ctl-list" aria-label="On its computer">
        {state.sections.map((s) => (
          <li key={s.id}>
            <button type="button" className="ctl-row" disabled={!state.live} onClick={() => open({ kind: "section", section: s.id })} data-testid={`controls-${s.id}`}>
              <span className="ctl-ico"><Icon name={s.id} /></span>
              <span className="ctl-rowwords"><b>{s.title}</b><small>{s.sub}</small></span>
              <Icon name="chevron" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Soul() {
  const { model } = useCtl();
  return (
    <div className="ctl-pad">
      <TextItem section="soul" id="SOUL.md" editTitle="SOUL.md" editable={model.can("soul", "w")}
        extra={(item) => (item.outline?.length ? <ul className="ctl-outline" aria-label="Outline" data-testid="controls-outline">{item.outline.map((o, i) => <li key={i}><Chip>{o}</Chip></li>)}</ul> : null)} />
    </div>
  );
}

function Memory({ open, version }) {
  const { model, agent } = useCtl();
  return (
    <Loader load={() => model.list("memory")} deps={[model, version]}>
      {(items) => (
        <div className="ctl-pad">
          {[["remembers", "What it remembers", "Nothing yet."], ["you", "About you", "Nothing about you yet."]].map(([group, heading, none]) => {
            const rows = items.filter((m) => m.group === group);
            return (
              <section key={group} aria-label={heading}>
                <Label>{heading}</Label>
                {rows.length ? (
                  <ul className="ctl-list">
                    {rows.map((m) => (
                      <li key={m.id}>
                        <button type="button" className="ctl-row" onClick={() => open({ kind: "item", section: "memory", id: m.id })} data-testid="memory-row">
                          <span className="ctl-rowwords"><b className="clamp">{m.title || ""}</b></span>
                          {m.read_only ? <span className="ctl-lock" role="img" aria-label="Hidden on your Mac"><Icon name="lock" size={16} /></span> : null}
                          <Icon name="chevron" size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : <p className="ctl-soft">{none}</p>}
              </section>
            );
          })}
          <p className="ctl-soft small">To add a memory, ask {agent.name} to remember it.</p>
        </div>
      )}
    </Loader>
  );
}

function MemoryItem({ id, done, back }) {
  const { model, agent, confirm, toast } = useCtl();
  return (
    <div className="ctl-pad">
      <TextItem section="memory" id={id} editTitle="Memory" editable={model.can("memory", "w")} onChanged={done}
        after={(item, rev) => (model.can("memory", "d") && !item.read_only ? (
          <Btn kind="danger" data-testid="controls-forget"
            onClick={() => confirm({ words: `Forget this? ${agent.name} will not remember it next time.`, yes: "Forget", run: async () => {
              try { await model.delete("memory", item.id, rev); done(); back(); } catch (e) { toast(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer")); }
            } })}>Forget</Btn>
        ) : null)} />
    </div>
  );
}

function Switch({ on, label, disabled, onChange, testid }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={`ctl-switch${on ? " on" : ""}`} onClick={() => onChange(!on)} data-testid={testid}>
      <i />
    </button>
  );
}

function SkillRow({ skill, open }) {
  const { model, toast } = useCtl();
  const [on, setOn] = useState(skill.enabled ?? true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setOn(skill.enabled ?? true); }, [skill.enabled]);
  const name = skill.title || skill.id;
  const flip = async (value) => {
    setOn(value);
    setBusy(true);
    try {
      const item = await model.act("skills", skill.id, value ? "enable" : "disable");
      const now = item?.enabled ?? value;
      setOn(now);
      toast(`${name} is ${now ? "on" : "off"}`);
    } catch (e) {
      setOn(!value);
      toast(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer"));
    } finally { setBusy(false); }
  };
  return (
    <li className="ctl-skill">
      <button type="button" className="ctl-row" onClick={() => open({ kind: "item", section: "skills", id: skill.id })} data-testid={`skill-row-${skill.id}`}>
        <span className="ctl-rowwords">
          <b>{name} {skill.bundled ? <Chip tone="mint">Hermes</Chip> : null}</b>
          {skill.description ? <small className="clamp">{skill.description}</small> : null}
        </span>
      </button>
      <Switch on={on} label={`${name} skill`} disabled={busy || !model.can("skills", "w")} onChange={flip} testid={`skill-switch-${skill.id}`} />
    </li>
  );
}

function Skills({ open, version }) {
  const { model, agent } = useCtl();
  return (
    <Loader load={() => model.list("skills")} deps={[model, version]}>
      {(items) => (
        <div className="ctl-pad">
          <ul className="ctl-list" aria-label="Skills">{items.map((s) => <SkillRow key={s.id} skill={s} open={open} />)}</ul>
          <p className="ctl-soft small">Off keeps the skill on your Mac but {agent.name} won't use it.</p>
        </div>
      )}
    </Loader>
  );
}

function SkillItem({ id, done, back }) {
  const { model, confirm, toast } = useCtl();
  return (
    <div className="ctl-pad">
      <TextItem section="skills" id={id} editTitle="SKILL.md" editable={model.can("skills", "w")} onChanged={done} showFrontmatter
        extra={(item) => (
          <>
            <div className="ctl-chips"><Chip tone={item.enabled === false ? "" : "mint"}>{item.enabled === false ? "Off" : "On"}</Chip>{item.bundled ? <Chip tone="lav">Ships with Hermes</Chip> : null}</div>
            {item.bundled ? <p className="ctl-soft small" data-testid="controls-bundled-note">Skills that ship with Hermes can be switched off, not deleted. The next update would bring them back.</p> : null}
          </>
        )}
        after={(item, rev) => (!item.bundled && model.can("skills", "d") ? (
          <Btn kind="danger" data-testid="controls-delete"
            onClick={() => confirm({ words: `Delete the skill ${id}? Its folder goes to the trash for 30 days.`, yes: "Delete", run: async () => {
              try { await model.delete("skills", id, rev); done(); back(); } catch (e) { toast(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer")); }
            } })}>Delete</Btn>
        ) : null)} />
    </div>
  );
}

function Schedules({ open, version }) {
  const { model, agent } = useCtl();
  return (
    <Loader load={() => model.list("schedules")} deps={[model, version]}>
      {(items) => (
        <div className="ctl-pad">
          {!items.length ? <p className="ctl-soft">Nothing runs on a schedule yet. Ask {agent.name} to set one up.</p> : null}
          <ul className="ctl-list">
            {items.map((j) => {
              const next = j.paused ? null : nextWords(j.next_run);
              return (
                <li key={j.id}>
                  <button type="button" className="ctl-row" onClick={() => open({ kind: "item", section: "schedules", id: j.id })} data-testid={`schedule-row-${j.id}`}>
                    <span className="ctl-rowwords">
                      <b>{j.title || j.id} {j.paused ? <Chip tone="butter">Paused</Chip> : null}</b>
                      <small>{[j.when, next ? `next ${next}` : null].filter(Boolean).join(" · ")}</small>
                    </span>
                    <Icon name="chevron" size={18} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Loader>
  );
}

function TimePicker({ current, save, onClose }) {
  const [f, setF] = useState(() => parseScheduleLine(current));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const line = scheduleLine(f);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const go = async () => {
    setSaving(true);
    setError(null);
    try { await save(line); onClose(); } catch (e) { setError(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer")); } finally { setSaving(false); }
  };
  const first = useRef(null);
  useEffect(() => { first.current?.focus(); }, []);
  const kinds = [["every", "Every"], ["daily", "Daily"], ["weekdays", "Weekdays"], ["cron", "Cron"]];
  return (
    <Layer label="When it runs" onEscape={onClose}>
      <header className="ctl-head">
        <Btn onClick={onClose}>Cancel</Btn>
        <h2 className="ctl-title">When it runs</h2>
        <Btn kind="fill" onClick={go} disabled={saving || !line} data-testid="controls-time-save">{saving ? "Saving" : "Save"}</Btn>
      </header>
      <div className="ctl-scroll">
        <div className="ctl-seg" role="radiogroup" aria-label="Runs" data-testid="controls-time-kind">
          {kinds.map(([k, w]) => (
            <button key={k} type="button" role="radio" aria-checked={f.kind === k} ref={f.kind === k ? first : null} className={f.kind === k ? "on" : ""} onClick={() => set({ kind: k })}>{w}</button>
          ))}
        </div>
        <Card>
          {f.kind === "every" ? (
            <div className="ctl-step">
              <Btn aria-label="Less often" onClick={() => set({ minutes: Math.max(5, f.minutes - 5) })}>-</Btn>
              <span data-testid="controls-time-minutes">Every {f.minutes} minutes</span>
              <Btn aria-label="More often" onClick={() => set({ minutes: Math.min(720, f.minutes + 5) })}>+</Btn>
            </div>
          ) : f.kind === "cron" ? (
            <label className="ctl-field">Cron line
              <input className="ctl-input mono" value={f.cron} placeholder="m h dom mon dow" autoCapitalize="off" autoCorrect="off" spellCheck={false} onChange={(e) => set({ cron: e.target.value })} data-testid="controls-time-cron" />
            </label>
          ) : (
            <label className="ctl-field">At
              <input className="ctl-input" type="time" value={f.at} onChange={(e) => set({ at: e.target.value })} data-testid="controls-time-at" />
            </label>
          )}
        </Card>
        {error ? <p className="ctl-error" role="alert" data-testid="controls-time-error">{error}</p> : null}
      </div>
    </Layer>
  );
}

function ScheduleItem({ id, done, back }) {
  const { model, confirm, toast } = useCtl();
  const [busy, setBusy] = useState(false);
  const [retiming, setRetiming] = useState(null);
  const act = async (verb, again) => {
    setBusy(true);
    try {
      await model.act("schedules", id, verb);
      toast({ pause: "Paused", resume: "Resumed", run: "Runs within a minute" }[verb]);
      done();
      again();
    } catch (e) { toast(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer")); } finally { setBusy(false); }
  };
  return (
    <div className="ctl-pad">
      <TextItem section="schedules" id={id} editTitle="Prompt" editable={model.can("schedules", "w")} onChanged={done}
        extra={(item, rev, again) => {
          const next = item.paused ? null : nextWords(item.next_run);
          const last = agoWords(item.last_run);
          const deliver = deliverWords(item.deliver);
          return (
            <>
              <Card data-testid="schedule-card" className="ctl-facts">
                <h3 className="ctl-itemtitle">{item.title || id} {item.paused ? <Chip tone="butter">Paused</Chip> : null}{item.running_soon ? <Chip tone="mint">Running soon</Chip> : null}</h3>
                <Fact label="When" value={item.when || item.schedule || "?"} />
                {next ? <Fact label="Next run" value={next} /> : null}
                {deliver ? <Fact label="Delivers to" value={deliver} /> : null}
                {last ? <Fact label="Last run" value={last + (item.last_ok === false ? ", failed" : item.last_ok === true ? ", worked" : "")} /> : null}
              </Card>
              {model.can("schedules", "w") ? (
                <div className="ctl-actions">
                  <Btn kind="fill" disabled={busy} onClick={() => act(item.paused ? "resume" : "pause", again)} data-testid={item.paused ? "controls-resume" : "controls-pause"}>{item.paused ? "Resume" : "Pause"}</Btn>
                  <Btn disabled={busy} onClick={() => act("run", again)} data-testid="controls-run">Run now</Btn>
                  <Btn disabled={busy} onClick={() => setRetiming({ rev, item, again })} data-testid="controls-time">Time</Btn>
                </div>
              ) : null}
              {model.can("schedules", "d") ? (
                <Btn kind="danger" data-testid="controls-delete"
                  onClick={() => confirm({ words: `Delete the schedule ${item.title || id}? It will stop running.`, yes: "Delete", run: async () => {
                    try { await model.delete("schedules", id, rev); done(); back(); } catch (e) { toast(e instanceof ControlsError ? e.message : ControlsError.words("noAnswer")); }
                  } })}>Delete</Btn>
              ) : null}
              <Label>PROMPT</Label>
              {retiming ? (
                <TimePicker current={retiming.item.schedule || ""} onClose={() => setRetiming(null)}
                  save={async (line) => {
                    try {
                      const got = await model.put("schedules", id, retiming.rev, { schedule: line });
                      toast(`Now ${got.item.when || line}`);
                      done();
                      retiming.again();
                    } catch (e) {
                      if (e instanceof ControlsError && e.kind === "conflict") { toast(e.message); setRetiming(null); retiming.again(); return; }
                      throw e;
                    }
                  }} />
              ) : null}
            </>
          );
        }} />
    </div>
  );
}

function ModelScreen() {
  const { model, talk } = useCtl();
  return (
    <Loader load={() => model.get("model", "model")} deps={[model]}>
      {({ rev, item: m }) => (
        <div className="ctl-pad ctl-stack">
          <Card>
            <Fact label="Model" value={m.model || "?"} />
            <Fact label="Runs on" value={m.provider || "?"} />
            {m.profile ? <Fact label="Profile" value={`${m.profile}, version ${m.version ?? 1}`} /> : null}
          </Card>
          <Label>TOOLS</Label>
          <Card>
            <ul className="ctl-tools">
              {(m.toolsets || []).map((t) => (
                <li key={t.name}><i className={`ctl-dot${t.on ? " on" : ""}`} aria-hidden="true" /><span>{t.name}</span><small>{t.on ? "On" : "Off"}</small></li>
              ))}
            </ul>
          </Card>
          <p className="ctl-soft small">{m.profile ? "Yui only runs models that pass its screen test. Keys never show here." : "Switching the model comes later, once your Mac can test one first. Keys never show here."}</p>
          {talk ? (
            <div className="ctl-actions">
              <Btn kind="fill" data-testid="controls-talk-about" onClick={() => talk({
                section: "model", id: "model", rev, title: "Model and tools",
                text: `**Model:** ${m.model || "?"}\n\n**Runs on:** ${m.provider || "?"}\n\n${m.profile ? `**Profile:** ${m.profile}, version ${m.version ?? 1}\n\n` : ""}**Tools:** ${(m.toolsets || []).map((t) => t.name).join(", ")}`,
              })}>Talk about this</Btn>
            </div>
          ) : null}
        </div>
      )}
    </Loader>
  );
}

function Channels() {
  const { model, agent } = useCtl();
  return (
    <Loader load={() => model.list("channels")} deps={[model]}>
      {(items) => (
        <div className="ctl-pad ctl-stack">
          <Card>
            <ul className="ctl-tools">
              {items.map((c) => <li key={c.id}><i className={`ctl-dot${c.live ? " on" : ""}`} aria-hidden="true" /><span>{c.title || c.id}</span><small>{c.live ? "Connected" : "Off"}</small></li>)}
            </ul>
          </Card>
          <p className="ctl-soft small">Where else {agent.name} answers. Set these up on your Mac.</p>
        </div>
      )}
    </Loader>
  );
}

// ---------- the confirm: an in-page dialog, the safe button first ----------

function Confirm({ ask, done, escapes }) {
  useEscape(escapes, done);
  const keep = useRef(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { keep.current?.focus(); }, []);
  return (
    <div className="ctl-confirm-wrap" data-confirm>
      <div className="ctl-confirm" role="alertdialog" aria-modal="true" aria-labelledby="ctl-confirm-words" data-testid="controls-confirm">
        <p id="ctl-confirm-words">{ask.words}</p>
        <div className="ctl-confirm-row">
          <Btn ref={keep} onClick={done} data-testid="controls-keep">Keep it</Btn>
          <Btn kind="danger solid" disabled={busy} data-testid="controls-confirm-yes"
            onClick={async () => { setBusy(true); try { await ask.run(); } finally { done(); } }}>{ask.yes}</Btn>
        </div>
      </div>
    </div>
  );
}

// ---------- the panel ----------

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const visible = (el) => !el.closest("[hidden],[inert]") && el.getClientRects().length > 0;

export default function ControlsPanel({ relay, agent, userId, light = false, section = null, onClose, onTalkAbout }) {
  const state = useMemo(() => controlsFor(agent), [agent]);
  const model = useMemo(
    () => createControls({ relay, agentId: agent.id, userId, agentName: agent.name, report: agent.controls }),
    [relay, agent.id, userId, agent.name, agent.controls],
  );
  const [stack, setStack] = useState(() => [{ kind: "home" }, ...(section && state.show ? [{ kind: "section", section }] : [])]);
  const [versions, setVersions] = useState({});
  const [msg, setMsg] = useState(null);
  const [ask, setAsk] = useState(null);
  const [host, setHost] = useState(null);
  const root = useRef(null);
  const escapes = useRef([]);
  const title = useRef(null);
  const timer = useRef(null);
  const top = stack[stack.length - 1];

  const toast = useCallback((text) => {
    setMsg(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const open = useCallback((e) => setStack((s) => [...s, e]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const bump = useCallback((sec) => setVersions((v) => ({ ...v, [sec]: (v[sec] || 0) + 1 })), []);
  const talk = onTalkAbout ? (item) => { onTalkAbout(item); onClose?.(); } : null;
  const confirm = useCallback((a) => setAsk(a), []);

  // Focus goes in on open and back where it came from on close; the screen's title takes it on each step.
  useEffect(() => {
    const was = document.activeElement;
    return () => { try { was?.focus?.(); } catch { /* gone */ } };
  }, []);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [top]);

  // Tab stays inside the topmost layer: the confirm, else an open layer, else the sheet.
  // On the document, so Escape and Tab still work when the focus was lost (a button that went away).
  const keys = (e) => {
    if (e.key === "Escape") { const top = escapes.current[escapes.current.length - 1]; if (top) top(); else onClose?.(); return; }
    if (e.key !== "Tab" || !root.current) return;
    const confirmEl = root.current.querySelector("[data-confirm]");
    const layers = root.current.querySelectorAll("[data-layer]");
    const scope = confirmEl || layers[layers.length - 1] || root.current;
    const items = [...scope.querySelectorAll(FOCUSABLE)].filter(visible);
    if (!items.length) { e.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    if (!scope.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const keysRef = useRef(keys);
  keysRef.current = keys;
  useEffect(() => {
    const on = (e) => keysRef.current(e);
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, []);

  const ctx = useMemo(() => ({ model, agent, state, toast, confirm, talk, host, escapes }), [model, agent, state, toast, confirm, onTalkAbout, onClose, host]); // eslint-disable-line react-hooks/exhaustive-deps

  const titleOf = (e) => (e.kind === "home" ? "Controls" : e.kind === "section" ? sectionTitle(e.section) : e.section === "memory" ? "Memory" : e.section === "skills" ? e.id : "Schedule");
  const screen = (e, active) => {
    const sec = e.section;
    const done = () => bump(sec);
    if (e.kind === "home") return <Home open={open} />;
    if (e.kind === "section") {
      const v = versions[sec] || 0;
      if (sec === "soul") return <Soul />;
      if (sec === "memory") return <Memory open={open} version={v} />;
      if (sec === "skills") return <Skills open={open} version={v} />;
      if (sec === "schedules") return <Schedules open={open} version={v} />;
      if (sec === "model") return <ModelScreen />;
      return <Channels />;
    }
    if (sec === "memory") return <MemoryItem id={e.id} done={done} back={back} />;
    if (sec === "skills") return <SkillItem id={e.id} done={done} back={back} />;
    return <ScheduleItem id={e.id} done={done} back={back} />;
  };

  return (
    <div className={`ctl-root${light ? " is-light" : ""}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div ref={(el) => { root.current = el; if (el && el !== host) setHost(el); }} className="ctl-sheet" role="dialog" aria-modal="true" aria-label="Controls" data-testid="controls-panel">
        <div className="ctl-content" inert={!!ask}>
          <header className="ctl-head">
            {stack.length > 1 ? <Btn className="icon" onClick={back} aria-label="Back" data-testid="controls-back"><Icon name="back" /></Btn> : <span className="ctl-spacer" />}
            <h2 className="ctl-title" tabIndex={-1} ref={title} data-testid="controls-title">{titleOf(top)}</h2>
            <Btn className="icon" onClick={onClose} aria-label="Close" data-testid="controls-close"><Icon name="close" /></Btn>
          </header>
          <div className="ctl-body">
            {stack.map((e, i) => (
              <div key={i} className="ctl-screen" hidden={i !== stack.length - 1} aria-hidden={i !== stack.length - 1 ? "true" : undefined}>
                <Ctl.Provider value={ctx}>{screen(e)}</Ctl.Provider>
              </div>
            ))}
          </div>
        </div>
        {msg ? <div className="ctl-toast" role="status" data-testid="controls-toast">{msg}</div> : null}
        {ask ? <Confirm ask={ask} done={() => setAsk(null)} escapes={escapes} /> : null}
      </div>
    </div>
  );
}

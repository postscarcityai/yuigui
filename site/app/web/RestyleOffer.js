"use client";
// A `theme app` line in a reply (YUI-250, the web twin of Chat/RestyleCard.swift): Yui as it is now beside the
// look offered, then Use or Keep mine. Nothing changes before the tap; after it, one line and Undo. The agent
// hears every tap like any other (`[yui] theme scope=app choice=apply`). The outcome is kept per reply in
// localStorage so the card does not offer the look again after a reload.
import { useEffect, useMemo, useState } from "react";
import { appLook } from "../../lib/yl/look.mjs";
import { compiled, recipeOf, takeOffer, undoOffer } from "../../lib/web/settings.mjs";
import { Preview, vars } from "../playground/restyle";
import { usePrefs } from "./useSettings";

const KEY = (id) => `yui-web-restyle:${id}`;
const read = (id) => { try { return localStorage.getItem(KEY(id)) || "open"; } catch { return "open"; } };
const write = (id, v) => { try { localStorage.setItem(KEY(id), v); } catch { /* private mode */ } };

export default function RestyleOffer({ id, props, agent, dark, onTap }) {
  const { look, saveLook } = usePrefs();
  const [state, setState] = useState("open");
  useEffect(() => { setState(read(id)); }, [id]);
  const set = (v) => { write(id, v); setState(v); };
  const now = useMemo(() => compiled(look.look), [look.look]);
  const next = useMemo(() => appLook(props, recipeOf(look.look)), [props, look.look]);
  const style = vars(now, dark); // the card wears the look the thread has now, so its buttons and surfaces have their colors
  const label = props.name === "reset" ? "Yui's look" : props.name || "this look";
  // The words that show in the thread are the app's own ("Use autumn", "Keep mine", "Undo"), not the choice word.
  const send = (choice, echo) => onTap?.({ id: "restyle", preset: "theme", scope: "app", choice, ...(props.name ? { name: props.name } : {}), _echo: echo });

  if (state === "applied") {
    return (
      <div className="rs-host" style={style}><div className="rs-card rs-done" data-testid="restyle-done" role="status">
        {props.name === "reset" ? "Yui wears its own look again." : `Yui is ${label} now.`}{" "}
        <button type="button" className="rs-link" data-testid="restyle-undo" onClick={() => { saveLook?.(undoOffer(look)); set("undone"); send("undo", "Undo"); }}>Undo</button>
      </div></div>
    );
  }
  if (state === "undone") return <div className="rs-host" style={style}><div className="rs-card rs-done" data-testid="restyle-done" role="status">Put back the look from before.</div></div>;
  if (state === "kept") return <div className="rs-host" style={style}><div className="rs-card rs-done" data-testid="restyle-done" role="status">Kept your look.</div></div>;
  if (props.name === "reset" && !look.look) return <div className="rs-host" style={style}><div className="rs-card rs-done" role="status">Yui already wears its own look.</div></div>;
  return (
    <div className="rs-host" data-testid="restyle-card" data-agent={agent} style={style}>
      <Preview now={now} next={next} props={props} dark={dark} state="open"
        onApply={() => { saveLook?.(takeOffer(look, props, agent)); set("applied"); send("apply", props.name === "reset" ? "Back to Yui's look" : `Use ${label}`); }}
        onKeep={() => { set("kept"); send("keep", "Keep mine"); }} />
    </div>
  );
}

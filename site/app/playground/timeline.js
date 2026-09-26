"use client";

// timeline (YUI-65): done rows, the now marker, the running rows lit up on
// it, then the queued rows in order. A group head (flows.js hands it its
// members); a lone done/now/next row is a one-row timeline.
// +reorder (YUI-66): Edit order gives each next row a drag handle; Save
// emits {order: [key, tag or text, ...]} (+ board when board= is set).
import { useRef, useState } from "react";
import { markAt, resolve } from "../../lib/yl/yl.mjs";

const LINK = /^https:/i;

const keyOf = (n) => { const p = resolve(n.preset, n.props); return p.key || p.tag || p.text; };

function Row({ n, edit }) {
  const p = resolve(n.preset, n.props);
  const link = !edit && typeof p.url === "string" && LINK.test(p.url) ? p.url : null;
  const inner = (
    <>
      <span className="yl-tlat">{p.at || ""}</span>
      <span className="yl-tldot" aria-hidden="true">{n.preset === "done" ? "✓" : ""}</span>
      <span className="yl-tlbody">
        <span className="yl-tltext">
          {p.tag ? <span className="yl-tltag">{p.tag}</span> : null}
          {p.text}
          {link ? <span className="yl-tlgo" aria-hidden="true">↗</span> : null}
        </span>
        {p.sub ? <span className="yl-tlsub">{p.sub}</span> : null}
      </span>
    </>
  );
  const cls = `yl-tlrow ${n.preset}`;
  if (edit) return <li className={`${cls} edit ${edit.dragging ? "drag" : ""}`} style={edit.style} ref={edit.ref}><div>{inner}{edit.handle}</div></li>;
  // A link row opens the page and sends nothing, like a card url.
  return link
    ? <li className={cls}><a href={link} target="_blank" rel="noopener noreferrer">{inner}</a></li>
    : <li className={cls}><div>{inner}</div></li>;
}

export function Timeline({ g, emitFor }) {
  const p = resolve("timeline", g.group.props);
  const rows = g.members.filter((m) => !m.group);
  const emit = emitFor ? emitFor(g.group) : () => {};
  return <Track title={p.title} mark={p.mark} fold={p.fold} rows={rows} reorder={p.reorder && !p.lock} board={p.board} emit={emit} />;
}

// A done/now/next line outside a timeline.
export function LoneRow({ node }) {
  return <Track rows={[node]} mark="Now" fold={0} lone />;
}

function Track({ title, mark, fold, rows, lone, reorder, board, emit }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(null);   // queued row keys (n.key) in the saved order
  const [draft, setDraft] = useState(null);   // the same while editing
  const [drag, setDrag] = useState(null);     // {key, dy}
  const refs = useRef({});
  const at = markAt(rows);
  const done = rows.slice(0, at);
  const hidden = !open && fold > 0 && done.length > fold ? done.length - fold : 0;
  const head = rows.slice(hidden, at);
  // Only the queue moves: done and now rows keep their place.
  const fixed = rows.slice(at).filter((r) => r.preset !== "next");
  const queue = rows.slice(at).filter((r) => r.preset === "next");
  const byKey = Object.fromEntries(queue.map((r) => [r.key, r]));
  const order = (draft || saved || queue.map((r) => r.key)).filter((k) => byKey[k]);
  const editing = draft !== null;
  const moved = editing && order.join() !== (saved || queue.map((r) => r.key)).join();

  const move = (from, to) => {
    if (to < 0 || to >= order.length) return;
    const o = [...order];
    o.splice(to, 0, o.splice(from, 1)[0]);
    setDraft(o);
  };
  // Drag the handle: the row follows the pointer; crossing half a neighbour
  // swaps it. Listens on window: moving the row in the DOM drops pointer capture.
  const live = useRef({});
  live.current = { order };
  const down = (e, key) => {
    e.preventDefault();
    let y0 = e.clientY;
    setDrag({ key, dy: 0 });
    const h = (k) => refs.current[k]?.offsetHeight || 40;
    const onMove = (ev) => {
      const o = live.current.order;
      const i = o.indexOf(key);
      const dy = ev.clientY - y0;
      let j = i;
      if (dy > 0 && i < o.length - 1 && dy > h(o[i + 1]) / 2) { y0 += h(o[i + 1]); j = i + 1; }
      else if (dy < 0 && i > 0 && -dy > h(o[i - 1]) / 2) { y0 -= h(o[i - 1]); j = i - 1; }
      if (j !== i) {
        const n = [...o];
        n.splice(j, 0, n.splice(i, 1)[0]);
        live.current.order = n;
        setDraft(n);
      }
      setDrag({ key, dy: ev.clientY - y0 });
    };
    const onUp = () => {
      setDrag(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };
  const save = () => {
    const o = order.map((k) => keyOf(byKey[k]));
    emit(board ? { order: o, board } : { order: o });
    setSaved(order);
    setDraft(null);
  };
  const editFor = (n, i) => ({
    dragging: drag?.key === n.key,
    ref: (el) => { refs.current[n.key] = el; },
    style: drag?.key === n.key ? { transform: `translateY(${drag.dy}px)` } : undefined,
    handle: (
      <span className="yl-tlmove">
        <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>▲</button>
        <button aria-label="Move down" disabled={i === order.length - 1} onClick={() => move(i, i + 1)}>▼</button>
        <span className="yl-tlgrip" aria-label="Drag to reorder" role="button" onPointerDown={(e) => down(e, n.key)}>≡</span>
      </span>
    ),
  });
  return (
    <div className={`yl-block yl-tl ${lone ? "lone" : ""}`}>
      {title || (reorder && queue.length > 1) ? (
        <div className="yl-q yl-tlhead">
          <span>{title}</span>
          {reorder && queue.length > 1 && !editing ? (
            <button className="chip" onClick={() => setDraft(saved || queue.map((r) => r.key))}>Edit order</button>
          ) : null}
        </div>
      ) : null}
      <ol className="yl-tlrail">
        {hidden ? (
          <li className="yl-tlfold"><button onClick={() => setOpen(true)}>{hidden} earlier</button></li>
        ) : null}
        {head.map((n) => <Row key={n.key} n={n} />)}
        {lone ? null : <li className="yl-tlmark"><span>{mark}</span></li>}
        {reorder ? fixed.map((n) => <Row key={n.key} n={n} />) : rows.slice(at).map((n) => <Row key={n.key} n={n} />)}
        {reorder ? order.map((k, i) => <Row key={k} n={byKey[k]} edit={editing ? editFor(byKey[k], i) : null} />) : null}
      </ol>
      {editing ? (
        <div className="yl-tledit">
          <button className="bigbtn" onClick={() => { setDraft(null); setDrag(null); }}>Cancel</button>
          <button className="bigbtn p acc" disabled={!moved} onClick={save}>Save order</button>
        </div>
      ) : null}
    </div>
  );
}

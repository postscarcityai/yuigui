"use client";

// The web runtime for a YL `flow` (spec/FLOWS.md): a Mermaid flowchart run as
// one full-screen series of steps. Plan mode with branches: Next follows the
// edge the answers pick, Back walks the path taken, the review lists only the
// answered steps on that path, and one {flow, path} event goes at submit.
import { useContext, useMemo, useState } from "react";
import { flowAhead, flowEvent, flowFirst, flowNext, flowPath, parse, resolve } from "../../lib/yl/yl.mjs";
import { flowLines, savedFlow } from "../../lib/yl/starter-flows.mjs";
import { ScreenCtx } from "./science";
import { Facts, Page, VALUE, foldText, question, show } from "./flows";

// The graph: sent inline (the patch at `end`), or a saved flow by name.
function graphOf(p) {
  if (p.nodes) return { g: p };
  const saved = savedFlow(p.title);
  if (!saved) return { missing: p.title };
  const patch = parse(flowLines(saved)).find((o) => o.op === "patch");
  return { g: resolve("flow", patch.props), title: saved.title, submit: saved.submit };
}

export function Flow({ node, emit, Render }) {
  const p = resolve("flow", node.props);
  const { g, missing, title: savedTitle, submit: savedSubmit } = useMemo(() => graphOf(p), [node.props]); // eslint-disable-line react-hooks/exhaustive-deps
  const screen = useContext(ScreenCtx);
  const title = (p.nodes ? p.title : savedTitle) || p.title || "Flow";
  const submitLabel = node.props.submit || savedSubmit || p.submit;
  const first = g ? flowFirst(g) : null;
  const [at, setAt] = useState(null); // step id, or "review"; null = the first step
  const [ans, setAns] = useState({});
  const [fromReview, setFromReview] = useState(false);
  const [done, setDone] = useState(false);

  if (missing !== undefined) {
    return (
      <div className="yl-block yl-plan">
        <div className="yl-q">{missing || "Flow"}</div>
        <div className="yl-sub">No saved flow by that name on this phone yet.</div>
      </div>
    );
  }
  if (!first) return <div className="yl-block yl-plan"><div className="yl-q">{title}</div><div className="yl-sub">Waiting for steps</div></div>;

  const cur = at || first;
  const step = (id) => g.nodes.find((n) => n.id === id);
  const steps = g.nodes.filter((n) => n.preset).map((n) => ({ key: `${node.key}:${n.id}`, id: n.id, preset: n.preset, props: n.props }));
  const byId = Object.fromEntries(steps.map((m) => [m.id, m]));
  const { path } = flowPath(g, ans);
  const review = cur === "review";
  // Where we are: the path so far, this step, then what the answers (or the
  // default edges) point to next. Branches change the count as you answer.
  const before = review ? path : path.includes(cur) ? path.slice(0, path.indexOf(cur)) : path;
  const ahead = review ? [] : flowAhead(g, ans, cur);
  const bar = review ? path : [...before, cur, ...ahead];
  const questions = (ids) => ids.map((id) => byId[id]).filter((m) => m && m.preset !== "page");

  const submit = (a) => {
    const ev = flowEvent(g, a);
    emit(ev);
    setDone(true);
    const on = ev.path.map((id) => byId[id]);
    screen?.fold?.(node.key, {
      title,
      pages: on.filter((m) => m.preset === "page").map((m) => resolve("page", m.props)),
      answers: Object.keys(ev.flow).length,
      text: foldText(on, ev.flow),
    });
    screen?.closeStage?.();
  };
  const next = (a = ans, from = cur) => {
    // Back from an edit on the review: once the path has every answer, go straight back to it.
    if (fromReview && !flowPath(g, a).open) return setAt("review");
    const n = flowNext(g, a, from);
    if (n) return setAt(n);
    if (!p.review) return submit(a);
    setAt("review");
  };
  const back = () => {
    const i = review ? path.length : path.indexOf(cur);
    if (i > 0) setAt(path[i - 1]);
    else if (i < 0 && path.length) setAt(path[path.length - 1]);
  };
  const capture = (m) => (v) => {
    const a = { ...ans, [m.id]: v[VALUE[m.preset]] };
    setAns(a);
    // One tap answers ask and choose; move on by itself.
    if (m.preset === "ask" || m.preset === "choose") setTimeout(() => next(a, m.id), 380);
    else if (m.preset !== "slide") next(a, m.id);
  };
  const m = byId[cur];
  const has = (x) => ans[x.id] !== undefined;
  const nextOk = !review && m && (has(m) || m.preset === "slide" || m.preset === "page");
  const onNext = () => {
    if (m.preset === "slide" && !has(m)) {
      const a = { ...ans, [m.id]: resolve("slide", m.props).value };
      setAns(a);
      return next(a);
    }
    next();
  };
  const edit = (id) => { setFromReview(true); setAt(id); };
  const last = !review && !flowNext(g, ans, cur, true);

  if (done) {
    const sent = questions(path);
    return (
      <div className="yl-block yl-project">
        <div className="yl-projhead"><span className="pill done">Sent</span><span className="yl-sub">{sent.length} answers</span></div>
        <div className="yl-q">{title}</div>
        <Facts rows={sent.map((x) => [question(x) || x.id, show(ans[x.id])])} />
        <button className="bigbtn s full" onClick={() => { setDone(false); setFromReview(true); setAt(p.review ? "review" : first); }}>Edit answers</button>
      </div>
    );
  }

  return (
    <div className="yl-block yl-plan yl-flow">
      <div className="yl-stephead">
        <div className="yl-q">{title}</div>
        <div className="yl-sub">{review ? "Review" : `Step ${before.length + 1} of ${bar.length}`}</div>
        <div className="yl-plansegs">
          {bar.map((id, i) => (
            <button key={`${id}:${i}`} className={`${i < before.length ? "d" : ""} ${!review && i === before.length ? "now" : ""}`}
              disabled={i >= before.length} onClick={() => setAt(id)} aria-label={`Step ${i + 1}`} />
          ))}
          {p.review ? <button className={review ? "now" : ""} disabled={!review} aria-label="Review" /> : null}
        </div>
      </div>
      {steps.map((x) => (
        <div key={x.key} className="yl-planstep" data-step={x.id} style={{ display: x.id === cur ? undefined : "none" }}>
          {x.preset === "page" ? <div className="yl-planpage"><Page p={resolve("page", x.props)} /></div> : <Render node={x} emit={capture(x)} />}
        </div>
      ))}
      {review ? (
        <div className="yl-planreview">
          {questions(path).map((x) => (
            <button key={x.key} className="yl-planrow" onClick={() => edit(x.id)}>
              <span className="lbl">{question(x) || x.id}</span>
              <b>{show(ans[x.id])}</b>
              <span className="yl-flink">Edit</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="bigbtns">
        <button className="bigbtn s" disabled={!review && before.length === 0} onClick={back}>Back</button>
        {review ? <button className="bigbtn p acc" onClick={() => submit(ans)}>{submitLabel}</button>
          : <button className="bigbtn p acc" disabled={!nextOk} onClick={onNext}>{last ? (p.review ? "Review" : submitLabel) : "Next"}</button>}
      </div>
    </div>
  );
}

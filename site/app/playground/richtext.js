"use client";
// Say, page, card and stage text, read as a little markdown (SITE-97, lib/yl/readtext.mjs). Body is
// the default; display type only for words that fit a line or two (textRole).
import "./richtext.css";
import { readText, textRole } from "../../lib/yl/readtext.mjs";

const SAFE = /^(https?:|mailto:|\/(?!\/))/i;

function Inline({ inline, go, safe = SAFE }) {
  return inline.map((x, i) => {
    if (x.t === "b") return <strong key={i}>{x.text}</strong>;
    if (x.t === "i") return <em key={i}>{x.text}</em>;
    if (x.t === "code") return <code key={i}>{x.text}</code>;
    if (x.t === "a") {
      if (!safe.test(x.href)) return x.text;
      const local = x.href.startsWith("/");
      return <a key={i} href={x.href} {...(local && go ? { onClick: (e) => { e.preventDefault(); go(x.href); } } : local ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{x.text}</a>;
    }
    return x.text;
  });
}

export function RichText({ text, go, safe, className = "" }) {
  const blocks = readText(text);
  const role = textRole(text);
  return (
    <div className={`rt rt-${role} ${className}`.trim()}>
      {blocks.map((b, i) => {
        if (b.t === "h") return <div key={i} className={`rt-h rt-h${b.level}`}><Inline inline={b.inline} go={go} safe={safe} /></div>;
        if (b.t === "ul" || b.t === "ol") {
          const L = b.t;
          return <L key={i} className="rt-list">{b.items.map((it, j) => <li key={j}><Inline inline={it} go={go} safe={safe} /></li>)}</L>;
        }
        if (b.t === "kv") return <p key={i} className="rt-kv">{b.mark ? <span className="rt-mark">{b.mark}</span> : null}<b className="rt-label">{b.label}:</b> <span className="rt-value"><Inline inline={b.value} go={go} safe={safe} /></span></p>;
        return <p key={i}><Inline inline={b.inline} go={go} safe={safe} /></p>;
      })}
    </div>
  );
}

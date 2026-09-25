// Events from a Yui screen drawn inside an MCP host (INT-7). Pure, no DOM.
// A tap in the embedded screen must reach the agent as the SAME event the
// phone would send (spec/RELAY.md "App to agent: events"), so this mirrors the
// app's YLEvent.line / relays / echo (Yui/Sources/Chat/Thread.swift).

// `[yui] <id> <preset>` then the values, keys sorted; `true` flags bare,
// lists joined with |, objects flattened with dots, strings quoted when they
// hold spaces, |, = or quotes.
export function eventLine(ev) {
  const parts = ["[yui]", ev.id, ev.preset];
  const add = (key, v) => {
    if (v === true) parts.push(key);
    else if (v && typeof v === "object" && !Array.isArray(v)) for (const k of Object.keys(v).sort()) add(`${key}.${k}`, v[k]);
    else parts.push(`${key}=${format(v)}`);
  };
  const value = valueOf(ev);
  for (const k of Object.keys(value).sort()) add(k, value[k]);
  return parts.join(" ");
}

function format(v) {
  if (typeof v === "string") return quote(v);
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Number(v.toPrecision(12)));
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return v.map(format).join("|");
  if (v === null || v === undefined) return "null";
  return quote(JSON.stringify(v));
}

function quote(s) {
  if (s && !/[\s"|=]/.test(s)) return s;
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
}

// The event minus its id and preset: what goes in meta.value.
export function valueOf(ev) {
  const { id: _id, preset: _preset, ...value } = ev;
  return value;
}

// What the person's side of the thread shows for this event, like the app.
// null = a quiet event (a timer starting, a checklist tick, a sort).
export function echoFor(ev) {
  const v = ev;
  if (typeof v.answer === "string") return v.answer;
  if (typeof v.choice === "string") return v.choice;
  if (Array.isArray(v.picked)) {
    if (!v.picked.length) return "None of these";
    return v.picked.every((x) => typeof x === "number") ? `Picked ${v.picked.map((i) => i + 1).join(", ")}` : v.picked.join(", ");
  }
  if (typeof v.value === "number" && ev.preset === "slide") return String(v.value);
  if (v.form && typeof v.form === "object") {
    const pairs = Object.entries(v.form).filter(([, x]) => x !== "" && x != null).map(([k, x]) => `${k}: ${Array.isArray(x) ? x.join(", ") : x}`);
    return pairs.length ? pairs.join(", ") : "Sent";
  }
  if (v.plan) return "Sent";
  if (typeof v.cta === "string") return v.cta;
  if (typeof v.action === "string") return v.action;
  if (typeof v.open === "string") return v.open;
  if (Array.isArray(v.order)) return `New order: ${v.order.join(", ")}`;
  if (typeof v.transcript === "string") return v.transcript;
  if (typeof v.comment === "string") return `Frame ${Number(v.frame) + 1}: ${v.comment}`;
  if (v.edit && typeof v.edit === "object") return v.edit.instruction || "Edit";
  if (v.values && "result" in v) return `= ${v.result}`;
  return null;
}

// Goes to the agent when the person answered something, something finished,
// or it is a game move (the agent has to answer it). Same rule as the app.
export function relays(ev, echo) {
  return echo != null || ev.done === true || ev.preset === "game";
}

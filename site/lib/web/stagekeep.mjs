// What a plan, form or flow on the stage keeps until Send (YUI-289), the web twin of the app's kept answers on the
// questions screen. The store is lib/web/kept.mjs; this is the one rule for its key: per agent, per message, per
// component. A component the agent named (`plan@kit`) is kept under that name, so drawing it again finds the same
// answers. One it did not name (`n3`, only its place in one reply) is kept under the message it came in, so two
// replies with an `n3` never share answers. No message to say which: nothing is kept (never a guess).
// Pure. Secret fields (a key, a code) are never kept: `secretField` is the one place that says so.

export const anonymous = (id) => !id || /^n\d+$/.test(String(id));

// The id a plan, flow or form is kept under, or "" for none.
export function keepScope(msgId, id) {
  if (!anonymous(id)) return String(id);
  if (msgId == null || msgId === "") return "";
  return `${msgId}.${id || "n0"}`;
}

const SECRET = /(^|[^a-z])(password|passcode|pin|otp|token|secret|api[_ -]?key|key|code|cvv|card|ssn)([^a-z]|$)/i;
// A field the app treats as secret: by its type (`password`, `secret`) or its name.
export const secretField = (f) => !!f && (/^(password|secret)$/i.test(f.type || "") || SECRET.test(`${f.key || ""} ${f.label || ""}`));

// A form's fields cut down to what may be kept.
export function keepable(fields, values) {
  const bad = new Set((fields || []).filter(secretField).map((f) => f.key));
  return Object.fromEntries(Object.entries(values || {}).filter(([k]) => !bad.has(k)));
}

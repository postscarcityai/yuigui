// Agent tables (spec/TABLES.md): the on-device store behind `table create`,
// `put` and `query`. Pure and dependency free. The playground keeps one store
// in localStorage; the app keeps the same shape in SQLite (YUI-33 step 2).
//
// A store holds one agent's tables:
//   { tables: { name: { name, cols: [{ name, type, unit? }], rows: { key: { col: value } }, order: [key], next } } }
// Every function returns a new store and never changes the one it was given.

export const TYPES = ["text", "number", "date", "bool"];

export const LIMITS = {
  tables: 20, // per agent
  cols: 12, // per table
  rows: 5000, // per table
  text: 1000, // characters in one text cell
  key: 64, // characters in a row key
  name: 32, // characters in a table name
  limit: 50, // rows a query shows by default
  maxLimit: 500, // rows a query can ask for
  send: 200, // rows a `send` view hands the agent
};

const NAME = /^[A-Za-z][\w-]*$/;
const COL = /^[A-Za-z_][\w-]*$/;
const NUMBER = /^-?\d+(\.\d+)?$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const REL = /^today(?:([+-])(\d{1,4}))?$/i;

export function emptyStore() {
  return { tables: {} };
}

// `today` is the phone's local date, YYYY-MM-DD; `now` adds the time.
export function localToday(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function localNow(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${localToday(d)}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function shiftDay(day, n) {
  const [y, m, d] = day.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

function realDate(s) {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

// One value into a column's type. Returns { value } or { error }.
// null means an empty cell. `ctx.today` / `ctx.now` resolve the date words.
export function cell(type, v, ctx = {}) {
  if (v === "" || v === null || v === undefined) return { value: null };
  if (Array.isArray(v)) v = v.join("|");
  switch (type) {
    case "text": {
      const s = String(v);
      if (s.length > LIMITS.text) return { error: `text over ${LIMITS.text} characters` };
      return { value: s };
    }
    case "number": {
      if (typeof v === "number") return Number.isFinite(v) ? { value: v } : { error: "not a number" };
      if (typeof v === "string" && NUMBER.test(v.trim())) return { value: Number(v) };
      return { error: `"${v}" is not a number` };
    }
    case "date": {
      const s = String(v).trim();
      const today = ctx.today || localToday();
      const rel = s.match(REL);
      if (rel) return { value: rel[1] ? shiftDay(today, (rel[1] === "-" ? -1 : 1) * Number(rel[2])) : today };
      if (s.toLowerCase() === "now") return { value: ctx.now || localNow() };
      if ((DAY.test(s) || STAMP.test(s)) && realDate(s)) return { value: s };
      return { error: `"${s}" is not a date (YYYY-MM-DD, today, today-7, now)` };
    }
    case "bool": {
      if (typeof v === "boolean") return { value: v };
      const s = String(v).toLowerCase();
      if (["on", "true", "yes", "1"].includes(s)) return { value: true };
      if (["off", "false", "no", "0"].includes(s)) return { value: false };
      return { error: `"${v}" is not on or off` };
    }
  }
  return { error: `unknown type ${type}` };
}

function copyTable(t) {
  return { ...t, cols: t.cols.map((c) => ({ ...c })), rows: { ...t.rows }, order: [...t.order] };
}

// `table create`: make a table, or change an existing one's columns.
// Columns are matched by name: kept columns keep their values (a new type
// converts them, and what does not fit becomes empty), removed columns lose
// theirs, new columns start empty. Rows are never dropped by a schema change.
function create(store, op, ctx) {
  const { name, cols } = op;
  if (!NAME.test(name || "") || name.length > LIMITS.name) return { store, error: `table: bad name "${name}"` };
  if (!cols || !cols.length) return { store, error: "table create: needs at least one col:type" };
  if (cols.length > LIMITS.cols) return { store, error: `table create: ${LIMITS.cols} columns at most` };
  const seen = new Set();
  for (const c of cols) {
    if (!COL.test(c.name || "")) return { store, error: `table create: bad column "${c.name}"` };
    if (c.name.toLowerCase() === "key") return { store, error: "table create: key is the row key, not a column" };
    if (seen.has(c.name.toLowerCase())) return { store, error: `table create: column "${c.name}" twice` };
    if (!TYPES.includes(c.type)) return { store, error: `table create: "${c.type}" is not text, number, date or bool` };
    seen.add(c.name.toLowerCase());
  }
  const old = store.tables[name];
  if (!old && Object.keys(store.tables).length >= LIMITS.tables) return { store, error: `table: ${LIMITS.tables} tables per agent at most` };
  const clean = cols.map((c) => ({ name: c.name, type: c.type, ...(c.unit ? { unit: c.unit } : {}) }));
  if (!old) {
    return { store: { tables: { ...store.tables, [name]: { name, cols: clean, rows: {}, order: [], next: 1 } } } };
  }
  const t = copyTable(old);
  const prev = Object.fromEntries(old.cols.map((c) => [c.name, c]));
  for (const key of t.order) {
    const row = old.rows[key];
    const next = {};
    for (const c of clean) {
      const was = prev[c.name];
      if (!was || row[c.name] == null) continue;
      const v = was.type === c.type ? { value: row[c.name] } : cell(c.type, row[c.name], ctx);
      if (v.value != null && !v.error) next[c.name] = v.value;
    }
    t.rows[key] = next;
  }
  t.cols = clean;
  return { store: { tables: { ...store.tables, [name]: t } } };
}

// `put`: upsert one row by key. With no key the store makes one (r1, r2 ...),
// so a log can just append. `delete` takes the row out. The whole put is
// refused when one value is wrong, so a row is never half written.
function put(store, op, ctx) {
  const t0 = store.tables[op.table];
  if (!t0) return { store, error: `put: no table "${op.table}"` };
  if (op.key != null && (String(op.key).length === 0 || String(op.key).length > LIMITS.key)) return { store, error: `put: a key is 1 to ${LIMITS.key} characters` };
  const t = copyTable(t0);
  if (op.delete) {
    if (op.key == null) return { store, error: "put +delete: needs a key" };
    const k = String(op.key);
    if (!(k in t.rows)) return { store };
    delete t.rows[k];
    t.order = t.order.filter((x) => x !== k);
    return { store: { tables: { ...store.tables, [op.table]: t } }, key: k };
  }
  const byName = Object.fromEntries(t.cols.map((c) => [c.name.toLowerCase(), c]));
  const vals = {};
  for (const [k, v] of Object.entries(op.values || {})) {
    const c = byName[k.toLowerCase()];
    if (!c) return { store, error: `put: ${op.table} has no column "${k}"` };
    const r = cell(c.type, v, ctx);
    if (r.error) return { store, error: `put: ${c.name}: ${r.error}` };
    vals[c.name] = r.value;
  }
  let key = op.key != null ? String(op.key) : null;
  if (key == null) {
    do key = `r${t.next++}`; while (key in t.rows);
  }
  const had = key in t.rows;
  if (!had && t.order.length >= LIMITS.rows) return { store, error: `put: ${op.table} is full (${LIMITS.rows} rows)` };
  const row = { ...(had ? t.rows[key] : {}) };
  for (const [k, v] of Object.entries(vals)) {
    if (v == null) delete row[k];
    else row[k] = v;
  }
  t.rows[key] = row;
  if (!had) t.order.push(key);
  return { store: { tables: { ...store.tables, [op.table]: t } }, key };
}

// Apply one parser op (`table` or `put`) to a store.
// Returns { store, error?, key? }: on an error the store is unchanged.
export function write(store, op, ctx = {}) {
  if (op.op === "table") return create(store, op, ctx);
  if (op.op === "put") return put(store, op, ctx);
  return { store };
}

// ---------- query ----------

const CLAUSE = /^([A-Za-z_][\w-]*)\s*(>=|<=|!=|=|>|<|~)\s*(.*)$/;
const AGGS = ["sum", "avg", "min", "max"];

function cmp(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // empty cells sort last either way (handled by caller)
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return (a ? 1 : 0) - (b ? 1 : 0);
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

// A flag (`+count`) is true, never a list: `sort` and the rest only take names.
const asList = (v) => (v == null || typeof v === "boolean" ? [] : Array.isArray(v) ? v : [v]).map(String).filter((x) => x !== "");

// Runs a query's props against a store.
// Returns { cols: [{ name, type, unit? }], rows: [[...]], keys: [key|null], count }
// or { missing: name } or { error }. `count` is the rows matched before `limit`.
export function query(store, props, ctx = {}) {
  const name = props.table;
  const t = store.tables[name];
  if (!t) return { missing: name };
  const colOf = (n) => {
    if (String(n).toLowerCase() === "key") return { name: "key", type: "text" };
    return t.cols.find((c) => c.name.toLowerCase() === String(n).toLowerCase());
  };
  // where: every clause must hold.
  const tests = [];
  for (const w of asList(props.where)) {
    const m = w.match(CLAUSE);
    if (!m) return { error: `where: cannot read "${w}"` };
    const c = colOf(m[1]);
    if (!c) return { error: `where: no column "${m[1]}"` };
    const op = m[2];
    const raw = m[3].trim();
    if (raw === "") {
      if (op !== "=" && op !== "!=") return { error: `where: "${w}" needs a value` };
      tests.push((row) => (row[c.name] == null) === (op === "="));
      continue;
    }
    let want;
    if (op === "~") want = raw.toLowerCase();
    else {
      const r = cell(c.type, raw, ctx);
      if (r.error) return { error: `where: ${c.name}: ${r.error}` };
      want = r.value;
    }
    // A date with no time compares by day, so Day=today holds for a stamp at 12:30 today.
    const byDay = c.type === "date" && typeof want === "string" && want.length === 10;
    tests.push((row) => {
      let v = row[c.name];
      if (v == null) return op === "!=";
      if (byDay) v = String(v).slice(0, 10);
      if (op === "~") return String(v).toLowerCase().includes(want);
      const d = cmp(v, want);
      if (op === "=") return d === 0;
      if (op === "!=") return d !== 0;
      if (op === ">") return d > 0;
      if (op === "<") return d < 0;
      if (op === ">=") return d >= 0;
      return d <= 0;
    });
  }
  let rows = t.order.map((k) => ({ key: k, ...t.rows[k] })).filter((r) => tests.every((f) => f(r)));

  // Aggregates: group=Col and sum/avg/min/max=Col|Col, +count.
  let cols;
  let keyed = true;
  const aggs = AGGS.flatMap((a) => asList(props[a]).map((n) => ({ a, n })));
  if (aggs.length || props.count || props.group != null) {
    keyed = false;
    const g = props.group != null && props.group !== "" ? colOf(props.group) : null;
    if (props.group != null && props.group !== "" && !g) return { error: `group: no column "${props.group}"` };
    const out = [];
    if (g) out.push({ ...g, from: g.name, a: null });
    const used = new Set(out.map((c) => c.name.toLowerCase()));
    for (const { a, n } of aggs) {
      const c = colOf(n);
      if (!c) return { error: `${a}: no column "${n}"` };
      if (c.type !== "number" && (a === "sum" || a === "avg")) return { error: `${a}: ${c.name} is not a number column` };
      const label = used.has(c.name.toLowerCase()) ? `${a} ${c.name}` : c.name;
      used.add(label.toLowerCase());
      out.push({ name: label, type: c.type, ...(c.unit ? { unit: c.unit } : {}), from: c.name, a });
    }
    if (props.count) out.push({ name: "Count", type: "number", from: null, a: "count" });
    const groups = new Map();
    for (const r of rows) {
      const gk = g ? JSON.stringify(r[g.name] ?? null) : "";
      if (!groups.has(gk)) groups.set(gk, []);
      groups.get(gk).push(r);
    }
    if (!g && !groups.size) groups.set("", []);
    rows = [...groups.values()].map((list) => {
      const row = {};
      for (const c of out) {
        if (c.a === null) row[c.name] = list[0][c.from] ?? null;
        else if (c.a === "count") row[c.name] = list.length;
        else {
          const vs = list.map((r) => r[c.from]).filter((v) => v != null);
          if (!vs.length) row[c.name] = c.a === "sum" ? 0 : null;
          else if (c.a === "sum") row[c.name] = round(vs.reduce((s, v) => s + v, 0));
          else if (c.a === "avg") row[c.name] = round(vs.reduce((s, v) => s + v, 0) / vs.length);
          else row[c.name] = vs.reduce((best, v) => ((c.a === "min" ? cmp(v, best) < 0 : cmp(v, best) > 0) ? v : best));
        }
      }
      return row;
    });
    cols = out.map(({ from, a, ...c }) => c);
  } else {
    const pick = asList(props.cols);
    cols = pick.length ? pick.map(colOf) : t.cols;
    const bad = pick.find((n, i) => !cols[i]);
    if (bad) return { error: `cols: no column "${bad}"` };
    cols = cols.map((c) => ({ ...c }));
  }

  // sort=Col|-Col: a minus sorts that column high to low. Empty cells go last.
  const sorts = [];
  for (const s of asList(props.sort)) {
    const desc = s.startsWith("-");
    const n = desc ? s.slice(1) : s;
    const c = keyed ? colOf(n) : cols.find((x) => x.name.toLowerCase() === n.toLowerCase());
    if (!c) return { error: `sort: no column "${n}"` };
    sorts.push({ name: c.name, desc });
  }
  if (sorts.length) {
    rows = rows
      .map((r, i) => ({ r, i }))
      .sort((x, y) => {
        for (const { name: n, desc } of sorts) {
          const a = x.r[n], b = y.r[n];
          if (a == null || b == null) {
            if (a == null && b == null) continue;
            return a == null ? 1 : -1;
          }
          const d = cmp(a, b);
          if (d) return desc ? -d : d;
        }
        return x.i - y.i;
      })
      .map((x) => x.r);
  }
  const count = rows.length;
  const lim = Math.max(0, Math.min(LIMITS.maxLimit, Number.isFinite(Number(props.limit)) && props.limit !== "" && props.limit != null ? Math.floor(Number(props.limit)) : LIMITS.limit));
  rows = rows.slice(0, lim);
  return {
    cols,
    rows: rows.map((r) => cols.map((c) => (r[c.name] === undefined ? null : r[c.name]))),
    keys: rows.map((r) => (keyed ? r.key : null)),
    count,
  };
}

const round = (n) => Math.round(n * 1e6) / 1e6;

// A store's tables in the shape the table and chart renderers bind to
// (`table meals`, `chart data=meals`): { name: { cols, rows, units } }.
export function boundTables(store) {
  const out = {};
  for (const [name, t] of Object.entries(store.tables)) {
    out[name] = {
      cols: t.cols.map((c) => c.name),
      rows: t.order.map((k) => t.cols.map((c) => t.rows[k][c.name] ?? "")),
      units: t.cols.map((c) => c.unit || ""),
    };
  }
  return out;
}

// Replays ops (anything the parser gives; only `table` and `put` count) onto
// a store. Returns { store, errors: [{ line, message }] }.
export function replay(store, ops, ctx = {}) {
  const errors = [];
  for (const op of ops) {
    if (op.op !== "table" && op.op !== "put") continue;
    const r = write(store, op, ctx);
    if (r.error) errors.push({ line: op.line, message: r.error });
    store = r.store;
  }
  return { store, errors };
}

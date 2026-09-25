// YL conformance runner for the JS reference parser.
//   cd ~/dev/yuigui/spec/conformance && node run.mjs
// Exits 1 on any failure. See README.md for the vector format.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { flowEvent, flowPath, menuOf, onStage, pageOf, parse, readTyped, resolve, StreamParser, talking, typedBody } from "../../site/lib/yl/yl.mjs";
import { emptyStore, query, replay } from "../../site/lib/yl/tables.mjs";

// Parser ops minus the fields that are not compared: `line` (the source
// text) and an error's `message` (wording is up to each parser).
export function normalize(ops) {
  return ops.map(({ line, message, ...o }) => o);
}

// Feeds `input` to a stream parser one character at a time.
function byChar(input, known) {
  const s = new StreamParser(known);
  const out = [];
  for (const ch of input) out.push(...s.push(ch));
  out.push(...s.flush());
  return normalize(out);
}

function check(v) {
  const fails = [];
  // `known`: ids that last from earlier replies (YL.md section 5), id -> preset.
  const known = v.known || {};
  const got = normalize(parse(v.input, known));
  if (!isDeepStrictEqual(got, v.expected)) fails.push(["parse", got]);
  const streamed = byChar(v.input, known);
  if (!isDeepStrictEqual(streamed, v.expected)) fails.push(["stream (1 char per chunk)", streamed]);
  if (v.chunks) {
    const s = new StreamParser(known);
    const emits = v.chunks.map((c) => normalize(s.push(c)));
    emits.push(normalize(s.flush()));
    if (!isDeepStrictEqual(emits, v.emits)) fails.push(["stream (chunks)", emits]);
  }
  if (v.stage) {
    const staged = parse(v.input, known).filter((o) => onStage(o, v.style || {})).map((o) => o.id);
    if (!isDeepStrictEqual(staged, v.stage)) fails.push(["stage (ids that open on the stage)", staged]);
  }
  if (v.pages) {
    const pages = parse(v.input, known).filter((o) => o.op === "add").map((o) => pageOf(o.screen));
    if (!isDeepStrictEqual(pages, v.pages)) fails.push(["pages (page of each add)", pages]);
  }
  if (v.talk) {
    const on = talking(parse(v.input, known));
    if (!isDeepStrictEqual(on, v.talk)) fails.push(["talk (pages with the composer on)", on]);
  }
  if (v.menu) {
    const m = menuOf(parse(v.input));
    if (!isDeepStrictEqual(m, v.menu)) fails.push(["menu (the drawer's items after the input)", m]);
  }
  if (v.typed) {
    const { screen, words, body } = v.typed;
    const made = typedBody(screen, words);
    if (made !== body) fails.push(["typed (body for words typed on the screen)", made]);
    const read = readTyped(body);
    const want = pageOf(screen) === 1 ? null : { screen, words };
    if (!isDeepStrictEqual(read, want)) fails.push(["typed (read back)", read]);
  }
  if (v.route) {
    // A flow's route (spec/FLOWS.md): the path the answers take, the first
    // open question, and the event at submit. Uses the input's first flow.
    const patch = parse(v.input, known).find((o) => o.op === "patch");
    const g = resolve("flow", patch ? patch.props : {});
    const { answers, path, open, event } = v.route;
    const got = flowPath(g, answers);
    if (!isDeepStrictEqual(got, { path, open })) fails.push(["route (path, open)", got]);
    const ev = flowEvent(g, answers);
    if (!isDeepStrictEqual(ev, event)) fails.push(["route (event)", ev]);
  }
  if (v.tables) {
    // Agent tables (TABLES.md): replay the input's `table create` and `put`
    // lines onto an empty store (dates resolve against `today`), then run
    // every query add against the store as the whole input left it.
    const ops = parse(v.input, known);
    const ctx = { today: v.tables.today, now: v.tables.now };
    const { store, errors } = replay(emptyStore(), ops, ctx);
    const failed = errors.map((e) => e.line);
    if (!isDeepStrictEqual(failed, v.tables.failed || [])) fails.push(["tables (write lines the store refused)", failed]);
    // A query that cannot run gives { error: true }: the wording is up to each implementation.
    const results = ops.filter((o) => o.op === "add" && o.preset === "query").map((o) => query(store, resolve("query", o.props), ctx)).map((r) => (r.error ? { error: true } : r));
    if (!isDeepStrictEqual(results, v.tables.results || [])) fails.push(["tables (query results)", results]);
  }
  const hasError = v.expected.some((o) => o.op === "error");
  if (hasError !== (v.error === true)) fails.push(["vector: `error` flag does not match expected", v.error]);
  return fails;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = new URL(".", import.meta.url);
  // js-NN-*.json: vectors only this parser runs yet (see README).
  const files = readdirSync(dir).filter((f) => /^(js-)?\d\d-.*\.json$/.test(f)).sort((a, b) => a.replace(/^js-/, "").localeCompare(b.replace(/^js-/, "")));
  let pass = 0, fail = 0;
  for (const f of files) {
    const { vectors } = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
    let ok = 0;
    for (const v of vectors) {
      const fails = check(v);
      if (!fails.length) { ok++; continue; }
      fail++;
      console.log(`FAIL ${f} :: ${v.name}`);
      console.log(`  input:    ${JSON.stringify(v.input)}`);
      console.log(`  expected: ${JSON.stringify(v.chunks ? v.emits : v.expected)}`);
      for (const [how, got] of fails) console.log(`  ${how}: ${JSON.stringify(got)}`);
    }
    pass += ok;
    console.log(`${ok === vectors.length ? "ok  " : "FAIL"} ${f.padEnd(34)} ${ok}/${vectors.length}`);
  }
  console.log(`\n${pass} passed, ${fail} failed, ${pass + fail} vectors in ${files.length} files`);
  process.exit(fail ? 1 : 0);
}

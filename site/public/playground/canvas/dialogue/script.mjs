// DLG-1: the Beats scripts (docs/plans/dialogue-stage.md sections 3, 4 and 8). Each <name>.yl is one conversation written as
// beats, and <name>.json is its clock. This module reads a script and checks it; test-spec.mjs runs the check on all three,
// and the dialogue prototype (DLG-3) can play what readScript returns.
//
// The .yl: "# reply N, flow <id>" opens a reply (one flow, one row per beat), "# beat N" opens a beat, "# you ..." is the
// person (for the reader). A beat opens with its spoken line (say) and holds what that line changes on screen: anchor lines,
// the picture or a patch to it, and at most one wait. Ids a reply makes reach the replies after it in the same script (the
// stage stays up across a cut-in), so each reply parses with the ids before it.
// The .json: events in time order. A beat is {at, beat, ends[, cut]}: ends is when its line would finish, cut when the person
// cut in. The person is {at, you, done[, cut, answers, touched, tap, sends]}: done is when they go quiet, sends the line the app sends.
//
// anchor and wait are the two new lines of the plan (section 4). The parser learns them in DLG-4; until then they are checked
// here by hand and blanked before the rest of the reply goes through the real parser.

export const PACE = [0.3, 0.5];        // seconds a spoken word, the on-device voice (about 0.38)
export const FIRST_WORD = [1.0, 2.5];  // after the person goes quiet: 0.7 s of quiet plus the reply's first sentence; 2.5 s is the Hermes target
export const MAX_ANCHORS = 8;

const quote = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

export function readScript(text, Y) {
  const replies = [], beats = [];
  let reply = null, beat = null;
  text.split("\n").forEach((src, i) => {
    const line = src.trim(), at = i + 1;
    let m;
    if ((m = /^# reply (\d+), flow ([\w-]+)$/.exec(line))) { reply = { n: +m[1], flow: m[2], lines: [], beats: [] }; replies.push(reply); beat = null; return; }
    if ((m = /^# beat (\d+)$/.exec(line))) { beat = { n: +m[1], reply: reply && reply.n, flow: reply && reply.flow, at, lines: [], say: null, says: 0, anchors: [], wait: null }; if (reply) reply.beats.push(beat); beats.push(beat); return; }
    if (!line || line.startsWith("#")) return;
    if (!reply || !beat) { beats.push({ n: 0, at, error: `line ${at} sits outside a beat: ${line}` }); return; }
    reply.lines.push({ at, line }); beat.lines.push(line);
    const t = Y.tokenize(line), head = t[0] ? t[0].raw : "";
    if (head === "say") { beat.says++; if (beat.lines.length === 1) beat.say = t[1] ? t[1].text : ""; }
    else if (head === "anchor") beat.anchors.push(anchorOf(t, at));
    else if (/^wait(@[\w-]+)?$/.test(head)) beat.wait = waitOf(t, at);
  });
  return { replies, beats };
}

function anchorOf(t, at) {
  const a = { at, words: "", sub: null, to: null, bad: [] };
  for (const k of t.slice(1)) {
    const kv = /^(\w+)=(.*)$/.exec(k.raw);
    if (kv && !k.quoted) { if (kv[1] === "sub" || kv[1] === "to") a[kv[1]] = kv[2].replace(/^"|"$/g, ""); else a.bad.push(`unknown key ${kv[1]}=`); }
    else if (!a.words && k.quoted) a.words = k.text;
    else a.bad.push(`stray token ${k.raw}`);
  }
  if (!a.words) a.bad.push("needs its words, quoted");
  else if (words(a.words) > 8) a.bad.push(`${words(a.words)} words, 8 at most`);
  return a;
}

function waitOf(t, at) {
  const w = { at, id: (t[0].raw.split("@")[1]) || null, q: null, options: [], into: false, bad: [] };
  for (const k of t.slice(1)) {
    if (k.raw === "+in") w.into = true;
    else if (k.parts) w.options = k.parts;
    else if (k.quoted && w.q === null) w.q = k.text;
    else w.bad.push(`stray token ${k.raw}`);
  }
  if (w.options.length && (w.options.length < 2 || w.options.length > 4)) w.bad.push("two to four options");
  if (w.options.length && !w.q) w.bad.push("options need a question");
  if (w.into && !w.options.length) w.bad.push("+in needs options to draw into the picture");
  if (w.options.length && !w.id) w.bad.push("a wait with options needs an @id (its answer comes back as [yui] <id> wait ...)");
  return w;
}

// Everything wrong with one script, as plain sentences. Empty means it reads, parses and keeps time.
export function checkScript(name, text, timing, Y) {
  const bad = [], s = readScript(text, Y);
  const no = (m) => bad.push(`${name}: ${m}`);
  for (const b of s.beats) if (b.error) no(b.error);
  if (!s.replies.length) { no("no replies"); return bad; }

  // ---- the lines: the real parser takes everything but anchor and wait, with the ids of the replies before
  const known = new Map(), labels = new Set();
  for (const r of s.replies) {
    const p = new Y.Parser(known), ops = [];
    for (const { at, line } of r.lines) { const op = p.line(/^(anchor|wait)(\s|@|$)/.test(line) ? "" : line); if (op) ops.push({ at, op }); }
    const tail = p.finish(); if (tail) ops.push({ at: 0, op: tail });
    for (const { at, op } of ops) {
      if (op.op === "error") no(`reply ${r.n} line ${at}: ${op.message}`);
      const pr = op.props || {};
      for (const k of ["label", "text"]) if (pr[k]) labels.add(pr[k]);
    }
    for (const [id, preset] of p.ids) known.set(id, preset);
  }

  // ---- the beats
  const nums = s.beats.filter((b) => !b.error).map((b) => b.n);
  nums.forEach((n, i) => { if (n !== i + 1) no(`beats run 1, 2, 3 in order: found beat ${n} at position ${i + 1}`); });
  const anchors = [];
  for (const b of s.beats.filter((x) => !x.error)) {
    if (!b.say) no(`beat ${b.n} opens with its spoken line (say), not "${b.lines[0] || "nothing"}"`);
    if (b.says > 1) no(`beat ${b.n} has ${b.says} spoken lines: one say a beat (one or two sentences in it)`);
    for (const a of b.anchors) { a.bad.forEach((m) => no(`beat ${b.n} anchor line ${a.at}: ${m}`)); if (anchors.some((x) => x.words === a.words)) no(`beat ${b.n} pins "${a.words}" again: a continuation never resends an anchor`); anchors.push({ ...a, beat: b.n }); }
    if (b.wait) {
      b.wait.bad.forEach((m) => no(`beat ${b.n} wait line ${b.wait.at}: ${m}`));
      // +in: the options that name a mark become those marks; the rest sit as chips (the heart's "Ask something")
      if (b.wait.into && !b.wait.options.some((o) => labels.has(o))) no(`beat ${b.n}: +in, but no option (${b.wait.options.join("|")}) names a mark in the picture`);
      const r = s.replies.find((x) => x.n === b.reply);
      if (r && r.beats[r.beats.length - 1] !== b) no(`beat ${b.n}: a wait ends its reply (the flow stops there for the answer)`);
    }
  }
  if (anchors.length > MAX_ANCHORS) no(`${anchors.length} anchors, ${MAX_ANCHORS} at most on screen`);
  const waits = s.beats.filter((b) => b.wait);
  if (waits.length !== 1) no(`${waits.length} waypoints, the script has one`);

  // ---- the clock
  const ev = (timing && timing.events) || [];
  if (!ev.length) { no("timing has no events"); return bad; }
  ev.forEach((e, i) => { if (i && e.at < ev[i - 1].at) no(`timing: event ${i} at ${e.at}s comes before the one above it`); });
  if (!ev[0].you || ev[0].at !== 0) no("timing: the person's ask opens the clock at 0");
  const tb = ev.filter((e) => e.beat !== undefined);
  if (tb.map((e) => e.beat).join() !== nums.join()) no(`timing beats ${tb.map((e) => e.beat).join(",")} do not match the script's ${nums.join(",")}`);
  const beatOf = (n) => s.beats.find((b) => b.n === n);
  for (const e of tb) {
    const b = beatOf(e.beat); if (!b || !b.say) continue;
    const per = (e.ends - e.at) / words(b.say);
    if (per < PACE[0] || per > PACE[1]) no(`beat ${e.beat} speaks ${words(b.say)} words in ${(e.ends - e.at).toFixed(1)}s (${per.toFixed(2)}s a word, ${PACE.join(" to ")})`);
    if (e.cut !== undefined && !(e.cut > e.at && e.cut < e.ends)) no(`beat ${e.beat} is cut at ${e.cut}s, outside its line`);
  }
  tb.forEach((e, i) => { const prev = tb[i - 1]; if (prev && e.at < (prev.cut !== undefined ? prev.cut : prev.ends)) no(`beat ${e.beat} starts at ${e.at}s while beat ${prev.beat} still speaks`); });

  const anchorThrough = (n) => { const a = anchors.filter((x) => x.beat <= n); return a.length ? a[a.length - 1].words : null; };
  const people = ev.filter((e) => e.you !== undefined);
  const cuts = people.filter((e) => e.cut !== undefined), answers = people.filter((e) => e.answers !== undefined);
  if (cuts.length !== 1) no(`${cuts.length} interruptions, the script has one`);
  if (answers.length !== 1) no(`${answers.length} waypoint answers, the script has one`);
  for (const c of cuts) {
    const b = beatOf(c.cut), te = tb.find((e) => e.beat === c.cut);
    if (!b || !te) { no(`the interruption cuts beat ${c.cut}, which is not there`); continue; }
    if (te.cut !== c.at) no(`beat ${c.cut} says it was cut at ${te.cut}s, the person cuts in at ${c.at}s`);
    const r = s.replies.find((x) => x.n === b.reply);
    if (r && r.beats[r.beats.length - 1] !== b) no(`beat ${c.cut} is cut, so it is the last beat of reply ${b.reply} (Stop takes the rest)`);
    const a = anchorThrough(c.cut);
    const want = `[yui] ${b.flow} beat say ${quote(c.you)} at=${c.cut}` + (a ? ` anchor=${quote(a)}` : "") + (c.touched ? ` touched=${c.touched}` : "");
    if (c.sends !== want) no(`the interruption sends\n     ${c.sends}\n   the plan's line is\n     ${want}`);
  }
  for (const a of answers) {
    const w = waits[0] && waits[0].wait, te = waits[0] && tb.find((e) => e.beat === waits[0].n);
    if (!w || a.answers !== w.id) { no(`the answer is for "${a.answers}", the waypoint is "${w && w.id}"`); continue; }
    if (te && a.at < te.ends) no(`the answer at ${a.at}s comes before the waypoint's line ends at ${te.ends}s`);
    let want;
    if (a.tap) { if (!w.options.includes(a.you)) no(`the tap "${a.you}" is not one of ${w.options.join("|")}`); want = `[yui] ${w.id} wait choice=${a.you}`; }
    else { if (a.touched && !w.options.includes(a.touched)) no(`touched "${a.touched}" is not one of ${w.options.join("|")}`); want = `[yui] ${w.id} wait say ${quote(a.you)}` + (a.touched ? ` touched=${a.touched}` : ""); }
    if (a.sends !== want) no(`the answer sends\n     ${a.sends}\n   the plan's line is\n     ${want}`);
  }
  // every reply after the first answers the person: its first word lands 1 to 2.5 s after they go quiet
  for (const p of people) {
    const next = tb.find((e) => e.at > p.at);
    if (!next) { no(`nothing answers the person at ${p.at}s`); continue; }
    const gap = next.at - p.done;
    if (gap < FIRST_WORD[0] || gap > FIRST_WORD[1]) no(`beat ${next.beat} lands ${gap.toFixed(1)}s after the person goes quiet at ${p.done}s (${FIRST_WORD.join(" to ")}s)`);
    const b = beatOf(next.beat), prev = beatOf(next.beat - 1);
    if (b && prev && b.reply === prev.reply) no(`beat ${next.beat} answers the person, so it opens a new reply`);
  }
  return bad;
}

// The release timeline (YUI-90, spec/RELEASE.md): Yui Lines for where the next version stands,
// built from the two exports the board sync writes. board.json's `release` is the YUI-SHIP card
// and the cards it waits on; builds.json has the VALID builds and what is on main since the last one.
// Every line has an id that lasts (YL section 5), so a refresh is `~id` patches, never a new page.

const SITE = "https://www.yuigui.com";
const q = (s) => `"${String(s).replace(/"/g, "'")}"`;
const short = (s, n = 60) => (s.length > n ? s.slice(0, n - 1).replace(/[\s,;:]+\S*$/, "") + "…" : s);
const day = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
// A commit subject's opening words, up to the first "(" or sentence end, and the card it names.
const headline = (text) => short(text.split(/\s\(|\.\s/)[0].trim(), 56);
const cardOf = (c) => c.card || (c.text.match(/\b(YUI-\d+)\b/) || [])[1];
const ROW = { done: "done", now: "now", next: "next" };

// The build that carried the release: the newest one uploaded while its ship card was open.
export function releaseBuild(rel, builds) {
  if (!rel?.startedAt) return null;
  const from = Date.parse(rel.startedAt);
  const to = rel.shippedAt ? Date.parse(rel.shippedAt) + 6 * 3600e3 : Infinity;
  return (builds.builds || [])
    .filter((b) => { const t = Date.parse(b.uploaded); return t >= from && t <= to; })
    .sort((a, b) => b.build - a.build)[0] || null;
}

// The four ship steps, in order. Each is done or not from the data; the first one that is not
// done is `now` while the ship card is running, else every open step waits as `next`.
export function shipSteps(rel, builds) {
  const b = releaseBuild(rel, builds);
  const scope = rel.cards.length > 0 && rel.cards.every((c) => c.status === "done");
  const steps = [
    { id: "rel-tests", text: "Tests pass on the simulator", done: !!b || rel.status === "shipped" },
    { id: "rel-upload", text: b ? `Uploaded as build ${b.build}` : "One upload to TestFlight", done: !!b, at: b && day(b.uploaded) },
    { id: "rel-valid", text: b ? `Build ${b.build} is VALID` : "Apple says VALID", done: !!b && b.state === "live" },
    { id: "rel-link", text: "What to try goes out", done: rel.status === "shipped", url: b && `${SITE}/changelog#build-${b.build}` },
  ];
  let now = rel.status === "shipping" && scope;
  return steps.map((s) => {
    const preset = s.done ? "done" : now ? "now" : "next";
    if (preset === "now") now = false;
    return { ...s, preset };
  });
}

export function releaseLines(board, builds) {
  const rel = board.release;
  if (!rel) return `card@rel "No release yet" "The first YUI-SHIP card starts one."`;
  const name = rel.version ? `Yui ${rel.version}` : "The next build";
  const landed = rel.cards.filter((c) => c.status === "done").length;
  const last = (builds.builds || [])[0];
  const onMain = (builds.next || []).filter((c) => !/^(chore|docs|test)\b/i.test(c.text));
  const out = [];
  out.push(`stat@rel-scope ${landed}/${rel.cards.length} ${q("Cards landed")} sub=${q(name)}`);
  out.push(`stat@rel-main ${onMain.length} ${q("On main, not on TestFlight")} sub=${q(last ? `since build ${last.build}` : "no build yet")}`);
  const mark = rel.status === "shipped" ? "Next release" : rel.status === "shipping" ? "Shipping" : "Now";
  out.push(`timeline@rel ${q(rel.status === "shipped" ? `${name}, shipped` : name)} mark=${q(mark)} fold=12`);
  for (const c of rel.cards) {
    const at = c.shipped ? ` at=${q(day(c.shipped + "T12:00:00Z"))}` : "";
    const url = c.progress ? ` ${SITE}${c.progress}` : "";
    out.push(`${ROW[c.status]}@rel-${c.key} ${q(short(c.title))} tag=${c.key}${at}${url}`);
  }
  for (const s of shipSteps(rel, builds)) {
    const at = s.at ? ` at=${q(s.at)}` : "";
    out.push(`${s.preset}@${s.id} ${q(s.text)}${at}${s.url && s.done ? " " + s.url : ""}`);
  }
  if (rel.status === "shipped") out.push(`next@rel-pick ${q("Scope for the next release")} sub=${q("not picked yet")}`);
  out.push("end");
  if (onMain.length) {
    out.push(`timeline@relmain ${q(last ? `On main since build ${last.build}` : "On main")} mark=${q("Rides the next build")}`);
    onMain.forEach((c, i) => out.push(`next@relmain-${i} ${q(headline(c.text))}${cardOf(c) ? ` tag=${cardOf(c)}` : ""}`));
    out.push("end");
  }
  return out.join("\n");
}

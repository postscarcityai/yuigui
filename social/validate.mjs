#!/usr/bin/env node
// Hard-fails bad social copy before Chris ever sees it (BIZ-4 Part 5.2).
// Usage: node social/validate.mjs [file-or-dir ...]   (default: social/queue)
// Exit 0 when every draft passes, 1 when any fails, 2 on a usage error.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LEAKS } from "../site/lib/public-guard.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const PLATFORMS = {
  // max: characters per post. oneLine: caption must be a single line. noHashtags: BIZ-5.
  x: { max: 280, thread: true },
  bluesky: { max: 300, thread: true },
  threads: { max: 500, thread: true },
  linkedin: { max: 3000 },
  instagram: { max: 150, oneLine: true, noHashtags: true },
  youtube: { max: 100 },
  tiktok: { max: 150 },
};
export const STATUSES = ["draft", "approved", "rejected", "posted"];

// Fleet style rules plus the BIZ-4 hype list.
export const BANNED = [
  "revolutionary", "revolutionize", "seamless", "seamlessly", "ai-powered", "ai powered", "next-generation",
  "next generation", "next-gen", "supercharge", "supercharged", "supercharges", "the future of", "game-changer",
  "game changer", "leverage", "leverages", "leveraging", "delve", "delves", "additionally", "furthermore", "crucial",
  "pivotal", "landscape", "notably", "vital",
];
const BANNED_RE = new RegExp(`\\b(${BANNED.map((w) => w.replace(/[-\s]/g, "[-\\s]")).join("|")})\\b`, "i");

// BIZ-1 Part 3, "What we must not claim". "first" fails in its claim shapes ("the first", "world's first",
// "first ever", "first to", "first app"); "your first agent" and "first screen" are not claims. The real open
// source milestones from BIZ-4 2.1 ("the first outside PR") pass.
const MILESTONE = "(?!\\s+(outside|external)\\s+(issue|pr|pull request|contributor|contribution|user|tester)s?\\b)";
export const CLAIMS = [
  [new RegExp(`\\b(the|world'?s|our)\\s+first\\b${MILESTONE}|\\bfirst[-\\s]ever\\b|\\bfirst\\s+to\\b|\\bfirst\\s+(phone\\s+|mobile\\s+|native\\s+)?apps?\\b`, "i"), "\"first\" claim"],
  [/\bmost\s+compact\b/i, "\"most compact\" claim"],
  [/\b(any|every)\s+agent(\s+framework)?s?\b/i, "\"any agent\" claim (today it is Hermes)"],
  [/\bunlike\s+(everyone|everybody|anyone|all the others|other apps)\b/i, "\"native, unlike everyone\" claim"],
];

// The only token multipliers we publish, each with what it is measured against (spec/BENCHMARK.md).
export const MULTIPLIERS = {
  "1.6": /(lean|minified|min)\s+json/i,
  "2.7": /pretty(-printed)?\s+json/i,
  "3.9": /component\s+tree|\btree\b/i,
};
const MULT_RE = /(?<![\w.\/])(\d+(?:\.\d+)?)\s?[x×](?![\w])/gi;

// Secrets and keys, on top of the shared public guard (emails, phones, costs, paths, task ids, private names).
export const SECRETS = [
  [/\b(sk|pk|rk)[-_](live|test|ant|proj)?[-_]?[A-Za-z0-9_-]{16,}/, "api key"],
  [/\b(ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{20,}/, "github token"],
  [/\bxox[abpr]-[A-Za-z0-9-]{10,}/, "slack token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "aws key"],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "jwt"],
  [/\b[A-Fa-f0-9]{32,}\b/, "long hex secret"],
  [/\b\d+(\.\d+)?\s?(credits?|cents?|usd|eur)\b/i, "cost"],
  [/[€£]\s?\d/, "cost"],
];

// X counts every link as 23 characters.
const URL_RE = /\bhttps?:\/\/\S+|\b[\w-]+(\.[\w-]+)*\.(com|ai|dev|io|app|org|net)(\/\S*)?/gi;
export function postLength(text) {
  return [...text.replace(URL_RE, "x".repeat(23))].length;
}

// A draft is YAML-ish frontmatter between the first two "---" lines, then the post.
// In a thread, a line holding only "---" separates the posts.
export function parseDraft(source, file = "") {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  if (lines[0].trim() !== "---") return { file, error: "missing frontmatter" };
  const end = lines.indexOf("---", 1);
  if (end < 0) return { file, error: "unterminated frontmatter" };
  const meta = {};
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, "");
    meta[m[1]] = v;
  }
  const posts = lines.slice(end + 1).join("\n").split(/\n---\n/).map((p) => p.trim()).filter(Boolean);
  return { file, meta, posts };
}

// Every problem with one draft, as strings. Empty array = pass.
export function validateDraft(draft, { root = ROOT } = {}) {
  if (draft.error) return [draft.error];
  const errs = [];
  const { meta, posts } = draft;
  const spec = PLATFORMS[meta.platform];
  if (!spec) errs.push(`unknown platform "${meta.platform ?? ""}"`);
  for (const k of ["account", "source", "slot", "status"]) if (!meta[k]) errs.push(`missing ${k}`);
  if (meta.status && !STATUSES.includes(meta.status)) errs.push(`bad status "${meta.status}"`);
  if (meta.slot && Number.isNaN(Date.parse(meta.slot))) errs.push(`bad slot "${meta.slot}"`);

  const media = Array.isArray(meta.media) ? meta.media : meta.media ? [meta.media] : [];
  if (!media.length) errs.push("no media (a draft without real media is dropped, not posted as text)");
  for (const m of media) {
    const p = m.startsWith("/") ? join(root, "site/public", m) : join(root, m);
    if (!existsSync(p)) errs.push(`media not found: ${m}`);
  }

  if (!posts.length) errs.push("empty post");
  if (spec && posts.length > 1 && !spec.thread) errs.push(`${meta.platform} does not take threads`);
  posts.forEach((text, i) => {
    const at = posts.length > 1 ? ` (post ${i + 1})` : "";
    if (/[—―]/.test(text)) errs.push(`em dash${at}`);
    const banned = text.match(BANNED_RE);
    if (banned) errs.push(`banned word "${banned[0]}"${at}`);
    for (const [re, what] of CLAIMS) {
      const hit = text.match(re);
      if (hit) errs.push(`${what}: "${hit[0]}"${at}`);
    }
    for (const m of text.matchAll(MULT_RE)) {
      const n = String(Number(m[1]));
      const against = MULTIPLIERS[n];
      if (!against) errs.push(`token multiplier ${m[0]} is not 1.6x, 2.7x or 3.9x${at}`);
      else if (!against.test(text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 60))) errs.push(`${m[0]} without what it is against${at}`);
    }
    for (const [re, what] of [...LEAKS, ...SECRETS]) {
      const hit = text.match(re);
      if (hit) errs.push(`${what}: "${hit[0]}"${at}`);
    }
    if (spec) {
      const len = postLength(text);
      if (len > spec.max) errs.push(`${len} characters, ${meta.platform} limit is ${spec.max}${at}`);
      if (spec.oneLine && text.includes("\n")) errs.push(`${meta.platform} caption must be one line${at}`);
      if (spec.noHashtags && /(^|\s)#\w/.test(text)) errs.push(`no hashtags on ${meta.platform}${at}`);
    }
  });
  return errs;
}

// Cross-draft rules: two posts on the same account in the same slot. Rejected drafts do not count.
export function validateQueue(drafts) {
  const errs = new Map();
  const seen = new Map();
  for (const d of drafts) {
    if (d.error || d.meta.status === "rejected") continue;
    const key = `${d.meta.platform}|${d.meta.account}|${Date.parse(d.meta.slot)}`;
    if (seen.has(key)) {
      const msg = `same ${d.meta.platform} account and slot as ${seen.get(key)}`;
      errs.set(d.file, [...(errs.get(d.file) ?? []), msg]);
    } else seen.set(key, d.file);
  }
  return errs;
}

function collect(paths) {
  const files = [];
  for (const p of paths) {
    if (!existsSync(p)) throw new Error(`no such file: ${p}`);
    if (statSync(p).isDirectory()) files.push(...readdirSync(p).filter((f) => f.endsWith(".md")).sort().map((f) => join(p, f)));
    else files.push(p);
  }
  return files;
}

export function run(paths, { root = ROOT, log = console.log } = {}) {
  const files = collect(paths.length ? paths : [join(root, "social/queue")]);
  const drafts = files.map((f) => parseDraft(readFileSync(f, "utf8"), f));
  const cross = validateQueue(drafts);
  let failed = 0;
  for (const d of drafts) {
    const errs = [...validateDraft(d, { root }), ...(cross.get(d.file) ?? [])];
    if (errs.length) {
      failed++;
      for (const e of errs) log(`FAIL ${d.file}: ${e}`);
    }
  }
  log(`${drafts.length - failed}/${drafts.length} drafts pass`);
  return failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
}

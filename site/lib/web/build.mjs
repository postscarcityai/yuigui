// What this build says about itself (YUI-247, Settings > About this build, BuildInfo.swift). Read on the server at
// build time: the commit Vercel built (or the one in the local checkout), when, and the channel guide the site
// carries (content/spec/CHANNEL.md, the file agents are told to follow). A local build has no commit and says so.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { guideOf } from "./settings.mjs";

export function readBuild({ env = process.env, read = (p) => readFileSync(new URL(p, import.meta.url), "utf8"), git = (a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(), now = () => new Date() } = {}) {
  let commit = String(env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7);
  if (!commit) { try { commit = git(["rev-parse", "--short=7", "HEAD"]); } catch { commit = ""; } }
  let guide = "";
  try { guide = guideOf(read("../../content/spec/CHANNEL.md")); } catch { /* the spec copy is missing: no guide line */ }
  const built = now().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "America/New_York" });
  return { commit, built: commit ? built : "", guide };
}

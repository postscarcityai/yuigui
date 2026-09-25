// /library.json (FLOW-2): the library for agents. Built once at build time from yl.mjs and the
// saved flows; scripts/library-check.mjs runs the public guard over the same object.
import { libraryIndex } from "../../lib/yl/library.mjs";
import { findLeak } from "../../lib/public-guard.mjs";

export const dynamic = "force-static";

export function GET() {
  const index = libraryIndex();
  const body = JSON.stringify(index, null, 1);
  const leak = body.split("\n").map(findLeak).find(Boolean);
  if (leak) throw new Error(`library.json: ${leak[0]} "${leak[1]}" must not reach the site`);
  return new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" } });
}

// /library.json (FLOW-2): the library for agents. Built once at build time from yl.mjs and the
// saved flows; scripts/library-check.mjs runs the same public guard before every build.
import { libraryIndex, libraryLeaks } from "../../lib/yl/library.mjs";

export const dynamic = "force-static";

export function GET() {
  const index = libraryIndex();
  const leaks = libraryLeaks(index);
  if (leaks.length) throw new Error(`${leaks[0]}: must not reach the site`);
  return new Response(JSON.stringify(index, null, 1), { headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" } });
}

// /brand.json: the brand kit, for Yui's mailbox and any agent speaking for Yui. Built once at build time
// from the site's own content (lib/brand.mjs), so it is as fresh as the last deploy.
import { brandKit } from "../../lib/brand.mjs";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(brandKit()), { headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" } });
}

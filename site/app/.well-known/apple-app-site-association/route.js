// Universal links for the Yui app: iOS opens yuigui.com/i/<code> invite links
// (YUI-56) and yuigui.com/a/<id> MCP connect approvals (INT-19) in the app
// when it is installed. The app's side is the
// associated-domains entitlement in the app repo's project.yml. The team id
// comes from the Vercel env (YUI_APPLE_TEAM_ID), never the repo. Test builds by
// link install as Yui Dev (com.yuigui.app.dev, YUI-91) and open the same links.
export const dynamic = "force-dynamic";

export function GET() {
  const team = process.env.YUI_APPLE_TEAM_ID;
  if (!team) return new Response("not configured", { status: 404 });
  return Response.json({
    applinks: {
      details: [{ appIDs: [`${team}.com.yuigui.app`, `${team}.com.yuigui.app.dev`], components: [
        { "/": "/i/*", comment: "invite links" },
        { "/": "/a/*", comment: "approve an MCP connection" },
      ] }],
    },
  });
}

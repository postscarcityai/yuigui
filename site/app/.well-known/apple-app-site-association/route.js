// Universal links for the Yui app (YUI-56): iOS opens yuigui.com/i/<code>
// invite links in the app when it is installed. The app's side is the
// associated-domains entitlement in the app repo's project.yml. The team id
// comes from the Vercel env (YUI_APPLE_TEAM_ID), never the repo.
export const dynamic = "force-dynamic";

export function GET() {
  const team = process.env.YUI_APPLE_TEAM_ID;
  if (!team) return new Response("not configured", { status: 404 });
  return Response.json({
    applinks: {
      details: [{ appIDs: [`${team}.com.yuigui.app`], components: [{ "/": "/i/*", comment: "invite links" }] }],
    },
  });
}

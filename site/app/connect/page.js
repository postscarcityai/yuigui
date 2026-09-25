// yui-oauth/authorize lands here when it can't trust where to send an error
// back: an unknown client or a redirect_uri it never registered (INT-19).
export const metadata = {
  title: "Connect to Yui",
  robots: { index: false, follow: false },
};

const WHY = {
  unknown_client: "The app that sent you here isn't registered with Yui any more.",
  bad_redirect: "The app that sent you here asked to return to an address it never registered.",
};

export default async function ConnectError({ searchParams }) {
  const { error } = await searchParams;
  return (
    <>
      <div className="eyebrow">Connect</div>
      <h1>This connection can't go ahead.</h1>
      <p className="lede">{WHY[error] || "Something about this sign-in link is off."} Remove Yui in that app and add it again.</p>
      <p><a href="/developers/mcp">How connecting works</a></p>
    </>
  );
}

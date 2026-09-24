// Linked from the app (sign-in screen and Settings). Keep in step with
// ~/dev/yui/supabase/migrations: every yui_ table (and the yui-media bucket) must be listed here.
export const metadata = { title: "Privacy | Yui" };

export default function Privacy() {
  return (
    <>
      <div className="eyebrow">Privacy</div>
      <h1>What Yui keeps, and how to delete it.</h1>
      <p style={{ color: "var(--muted)" }}>Last updated September 24, 2026.</p>

      <h2>Signing in</h2>
      <p>
        You sign in to the Yui app with Apple. There is no password. Apple gives Yui a random ID that is unique to
        Yui and, if you allow it, an email address. If you choose "Hide My Email", Yui only ever sees an Apple
        relay address.
      </p>

      <h2>What the app stores on our servers</h2>
      <ul>
        <li>Your account: Apple's ID for you, your email or relay address, and when you created the account and last signed in.</li>
        <li>Sign-in sessions, so you stay signed in. We store only a scrambled (hashed) form of each session key.</li>
        <li>A token from Apple that lets us remove Yui from your Apple ID when you delete your account.</li>
        <li>Your devices: a name and a push notification token, so your agents can reach you.</li>
        <li>Your agents and pairings: which agents you connected to Yui.</li>
        <li>Your messages with those agents, so a conversation shows up on your phone.</li>
        <li>
          Photos you send an agent (from the camera or your library) and pictures or videos your agents send you. They
          sit in private storage that only your account and the agent you sent them to can open, through links that
          expire. Yui only sees a photo when you pick or take one to send.
        </li>
      </ul>
      <p>
        That data lives in a Supabase database in the United States. Each account can read only its own rows. We do
        not sell it, share it with advertisers, or use it to track you across other apps. The app has no ads and no
        third-party analytics.
      </p>

      <h2>Deleting your account</h2>
      <p>
        In the app, open Settings, then Account, then Delete account, and confirm. Deletion happens right away: your
        account, sessions, devices, agents, pairings, messages, photos and pictures are removed from our servers, and Yui is removed
        from your Apple ID. It cannot be undone. Signing in with Apple again later starts a new, empty account.
      </p>
      <p>
        Your agents run on their own systems. Deleting your Yui account removes what Yui stores; it does not erase
        what an agent you talked to kept on its own side.
      </p>

      <h2>This website</h2>
      <p>
        yuigui.com uses Google Analytics to count visits. If you join the waitlist we store your email address, only
        to tell you when Yui is ready.
      </p>
    </>
  );
}

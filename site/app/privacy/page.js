// Linked from the app (sign-in screen and Settings). Keep in step with
// the app repo's supabase/migrations: every yui_ table (and the yui-media bucket) must be in TABLES,
// and "What we declare to Apple" must match the App Privacy answers in the app repo's docs/APP-PRIVACY.md.
export const metadata = {
  title: "Privacy | Yui",
  description: "What the Yui app keeps, where it lives, how long, and how to delete it.",
};

// Every yui_ table in the app repo's supabase/migrations, plus the storage bucket (SITE-23).
const TABLES = [
  ["yui_users", "Your account, and a pause flag if it is ever paused."],
  ["yui_sessions", "Sign-in sessions, hashed."],
  ["yui_apple_tokens", "Apple's token to remove Yui from your Apple ID on delete."],
  ["yui_devices", "Your phones: name, push token, the thread open right now."],
  ["yui_agents", "Your agents: name, color, look, muted or not."],
  ["yui_connectors", "The computers your agents run on, with a hashed key."],
  ["yui_pairings", "Pairing codes. Single use, 10 minutes, deleted after a day."],
  ["yui_mgmt_tokens", "Agent access keys you create in Settings, hashed."],
  ["yui_messages", "Your messages, when each was delivered and handled, and your reactions."],
  ["yui_rate_buckets", "Usage counters for limits. Idle ones are deleted after a day."],
  ["yui_pair_attempts", "Wrong pairing codes and the IP they came from, for one day."],
  ["yui_limits", "The limit numbers themselves. Nothing about you."],
  ["yui_channel_guides", "The guide text agents get. Nothing about you."],
  ["yui-media (storage)", "Photos and pictures in your threads. Private, links expire."],
];

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
        <li>Your account: Apple&apos;s ID for you, your email or relay address, and when you created the account and last signed in.</li>
        <li>Sign-in sessions, so you stay signed in. We store only a scrambled (hashed) form of each session key. A session ends after 60 days without use.</li>
        <li>A token from Apple that lets us remove Yui from your Apple ID when you delete your account.</li>
        <li>Your devices: a name and a push notification token, so your agents can reach you. While Yui is open, which agent&apos;s thread is on screen, so an answer you are already reading does not buzz too. It is cleared when you leave the app.</li>
        <li>Your agents: the name, color and look you gave each one, and whether its notifications are muted.</li>
        <li>
          The computers your agents run on: the name the computer reports (like &quot;Sam&apos;s MacBook&quot;), when it
          last checked in, and a scrambled form of its key. Pairing codes are single use, expire after 10 minutes and are
          deleted a day later.
        </li>
        <li>Agent access keys you create in Settings, so one of your agents can manage your other agents: the name you gave it, when it was last used, and a scrambled form of the key. They can never read your messages.</li>
        <li>Your messages with those agents, so a conversation shows up on your phone, with when each one was delivered to and handled by the agent. A reaction you leave on a message is stored on that message. Messages older than 90 days are deleted automatically, and so are photos and pictures no remaining message uses.</li>
        <li>
          Photos you send an agent (from the camera or your library) and pictures or videos your agents send you. They
          sit in private storage that only your account and the agent you sent them to can open, through links that
          expire. Yui only sees a photo when you pick or take one to send.
        </li>
      </ul>

      <h2>What stays on your phone</h2>
      <ul>
        <li>Saved screens (the shelf above a thread) live only on your phone. The app rebuilds them from your messages, so they go when the messages do.</li>
        <li>A message you send while offline waits on your phone and goes out when you are back online.</li>
      </ul>

      <h2>Keeping Yui safe</h2>
      <ul>
        <li>Usage counters per account (how many messages, agents or uploads in a short window) enforce Yui&apos;s limits. Idle counters are deleted after a day.</li>
        <li>A wrong pairing code records the network (IP) address it came from, for one day, so nobody can guess codes. It is used for nothing else.</li>
        <li>If an account or computer breaks the limits or is abused, we can pause it. We store when and why, and lift it when it is resolved.</li>
      </ul>

      <h2>Where it goes</h2>
      <p>
        That data lives in a Supabase database in the United States. Each account can read only its own rows. Push
        notifications travel through Apple&apos;s push service and carry the agent&apos;s name and a preview of its reply. Your
        agents run on their own computers, which you connect: messages you send an agent go to that agent. We do not
        sell your data, share it with advertisers, or use it to track you across other apps. The app has no ads, no
        third-party analytics and no crash reporting service. It does not use your location or contacts.
      </p>

      <h2>On the computers your agents run on</h2>
      <p>
        The Yui plugin keeps a small outbox there, so a reply is not lost when the network drops. Photos you send reach
        the agent as files in its cache. The plugin can also log which custom screen shapes an agent draws (field names
        and types, never the values) to learn what to build next. That log is off unless the computer&apos;s owner turns it
        on, stays on that computer, and is never uploaded.
      </p>

      <h2>Deleting your account</h2>
      <p>
        In the app, open Settings, then Account, then Delete account, and confirm. Deletion happens right away: your
        account, sessions, devices, agents, computers, pairings, access keys, messages, photos and pictures are removed from our servers, and Yui is removed
        from your Apple ID. It cannot be undone. Signing in with Apple again later starts a new, empty account.
      </p>
      <p>
        Your agents run on their own systems. Deleting your Yui account removes what Yui stores; it does not erase
        what an agent you talked to kept on its own side.
      </p>

      <h2>Every table, by name</h2>
      <p>
        Yui is open source, so here is the full list. It matches the database migrations in the{" "}
        <a href="https://github.com/postscarcityai/yui/tree/main/supabase/migrations">app repo</a>.
      </p>
      <div className="md-table privacy-tables">
        <table>
          <thead><tr><th>Table</th><th>What it holds</th></tr></thead>
          <tbody>
            {TABLES.map(([t, what]) => <tr key={t}><td><code>{t.split("_").map((w, i) => (i ? [<wbr key={i} />, `_${w}`] : w))}</code></td><td>{what}</td></tr>)}
          </tbody>
        </table>
      </div>

      <h2>What we declare to Apple</h2>
      <p>
        On the App Store privacy label, Yui lists: contact info (email address), identifiers (your account ID and the
        device push token), user content (your messages, and the photos and videos in them) and usage data (which
        thread is open). All of it is linked to your account, used only to make the app work, and none of it is used
        to track you.
      </p>

      <h2>Help and contact</h2>
      <p>
        Questions, problems or a deletion you cannot finish in the app: <a href="/help">yuigui.com/help</a>, or email{" "}
        <a href="mailto:chris@postscarcity.ai">chris@postscarcity.ai</a>. Yui is open source, so you can also read
        exactly what it does at <a href="https://github.com/postscarcityai/yui">github.com/postscarcityai/yui</a>.
      </p>

      <h2>This website</h2>
      <p>
        yuigui.com uses Google Analytics to count visits. If you join the waitlist we store your email, your name if
        you give one, which page and link brought you there, and your browser type, in the <code>yui_waitlist</code>{" "}
        table. We use it to send you Yui news. To be removed, email us.
      </p>
    </>
  );
}

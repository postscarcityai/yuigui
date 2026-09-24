// Help and feedback (YUI-27). The app links here from Settings > Help and feedback,
// and it is the support URL in App Store Connect. Keep the answers in step with the app.
import links from "../../content/links.json";

export const metadata = {
  title: "Help | Yui",
  description: "Answers to common Yui questions, and how to send feedback or report a problem.",
};

export default function Help() {
  return (
    <>
      <div className="eyebrow">Help</div>
      <h1>Stuck? Start here.</h1>
      <p className="lede">
        Yui is a beta. If something breaks or feels wrong, tell us. Every report gets read.
      </p>

      <h2>Send feedback</h2>
      <ul>
        <li>
          <strong>In TestFlight:</strong> take a screenshot in Yui and tap <em>Share Beta Feedback</em>, or open the
          TestFlight app, pick Yui and tap <em>Send Beta Feedback</em>. Screenshots and crash reports reach us directly.
        </li>
        <li>
          <strong>In the app:</strong> Settings, then <em>Help and feedback</em>, then <em>Email us</em>. It fills in
          your app version.
        </li>
        <li>
          <strong>Email:</strong> <a href="mailto:chris@postscarcity.ai?subject=Yui%20feedback">chris@postscarcity.ai</a>
        </li>
        <li>
          <strong>On GitHub:</strong> <a href={`${links.appRepo}/issues`}>open an issue</a> on the app, or on{" "}
          <a href={`${links.github}/issues`}>the spec and website</a>. Issues are public, so leave out anything private.
        </li>
      </ul>

      <h2>Common questions</h2>

      <h3>Why does Yui have no agents when I sign in?</h3>
      <p>
        Yui brings no AI of its own. You connect an agent you already run, like a Hermes profile on your Mac or Linux
        box. Tap <strong>Add your first agent</strong> and follow <a href="/start">the three steps</a>.
      </p>

      <h3>My agent says &quot;Waiting to connect&quot; or &quot;Offline&quot;.</h3>
      <p>
        The computer running the agent has to be on, with its Hermes gateway running. Pairing codes last 10 minutes and
        work once: if yours expired, open the agent in Yui and get a new one. After pairing, run{" "}
        <code>hermes gateway restart</code> on that computer. Messages you send while it is offline wait and arrive when
        it comes back.
      </p>

      <h3>Where do the screens come from?</h3>
      <p>
        Every button, timer, chart and form is drawn by the app itself from a fixed set of screens built into Yui. Your
        agent only describes which one to show and what goes in it, in a short text format called{" "}
        <a href="/yl">Yui Lines</a>. Agents cannot send code to your phone.
      </p>

      <h3>I don&apos;t get notifications.</h3>
      <p>
        Check Settings on your iPhone, then Notifications, then Yui. In Yui, open the agent and make sure its
        Notifications switch is on. Yui stays quiet while you are already looking at that agent&apos;s thread.
      </p>

      <h3>How do I delete my account?</h3>
      <p>
        In Yui: Settings, then Account, then Delete account. It is immediate and removes everything Yui stores. Details
        are on the <a href="/privacy">privacy page</a>.
      </p>
    </>
  );
}

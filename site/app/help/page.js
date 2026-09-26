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
          <strong>Which build am I on?</strong> Settings, then <em>About this build</em>. Tap it to copy the version,
          build and commit, and paste that into your note.
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
        work once: if yours ran out, tap <strong>Get a new code</strong> and run the pairing step again with it. After pairing, run{" "}
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
        Check Settings on your iPhone, then Notifications, then Yui. In Yui, open the agent&apos;s menu (the button top
        left), then <strong>Controls</strong>, then <strong>Name, look and notifications</strong>, and make sure its
        Notifications switch is on. Yui stays quiet while you are already looking at that agent&apos;s thread.
      </p>

      <h3>How do I reply to one message?</h3>
      <p>
        Hold the message. A menu opens with <strong>Reply</strong>, Copy, Select text and Share, and the six{" "}
        <a href="/reactions">reactions</a> above it. There is no swipe to reply: a sideways swipe moves between the chat
        and the agent&apos;s screens.
      </p>

      <h3>What is the menu button for?</h3>
      <p>
        The button top left opens the agent&apos;s menu. A swipe right on the chat opens it too. It has four tabs:{" "}
        <strong>Home</strong> for pinned screens and what is next, <strong>Review</strong> for what waits on you,{" "}
        <strong>Controls</strong> for the agent&apos;s settings, and <strong>About</strong>. Tap the agent at the bottom
        to switch to another one.
      </p>

      <h3>Why is there a dot on the menu button?</h3>
      <p>
        Something waits on you: a question, a pick or a form the agent sent. Open the menu and look under{" "}
        <strong>Review</strong>. The dot goes as soon as the last one is answered.
      </p>

      <h3>Can I talk instead of type?</h3>
      <p>
        Yes. Tap the mic and talk. When you pause, it sends, the answer comes back as text and the mic opens again.
        Tap Stop to end it. To have an agent always start with the mic, open its menu, then{" "}
        <strong>Controls</strong>, then <strong>Name, look and notifications</strong>, and set{" "}
        <strong>Start with</strong> to Talking.
      </p>

      <h3>A reply says &quot;Update Yui to see this&quot;.</h3>
      <p>
        Your agent sent a screen that is newer than your copy of Yui. Tap it to open TestFlight, update, and the screen
        draws.
      </p>

      <h3>How do I delete my account?</h3>
      <p>
        In Yui: Settings, then Account, then Delete account. It is immediate and removes everything Yui stores. Details
        are on the <a href="/privacy">privacy page</a>.
      </p>
    </>
  );
}

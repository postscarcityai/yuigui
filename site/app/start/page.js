// Getting started: connect a Hermes agent to the Yui app (YUI-23).
// The commands here are the plugin's real install path; keep them in step with
// ~/dev/yui/hermes-plugin/yui (after-install.md, connector.py).
import links from "../../content/links.json";
import Cmd from "../components/Cmd";

export const metadata = {
  title: "Get started | Yui",
  description: "Connect your Hermes agent to the Yui app in three steps: get a code, install the plugin, pair.",
};

export default function Start() {
  return (
    <>
      <div className="eyebrow">Get started</div>
      <h1>Connect your agent in three steps.</h1>
      <p className="lede">
        Yui talks to Hermes running on your own Mac or Linux box. If Hermes already answers you somewhere, this takes
        about five minutes.
      </p>

      <ol className="steps">
        <li>
          <div className="card">
            <h3>Get the app and a pairing code</h3>
            {links.testflight ? (
              <p>
                Install Yui from <a href={links.testflight}>TestFlight</a> and sign in with Apple.
              </p>
            ) : (
              <p>The iPhone beta is waiting on Apple&rsquo;s review. Join the waitlist below and we will send the link the day it opens.</p>
            )}
            <p>
              A new account starts with no agents, so the app opens on <strong>Add your first agent</strong>. Tap it, give
              the agent a name and tap <strong>Get a pairing code</strong>. The 6-digit code works once, for 10 minutes.
              The app then shows the three commands below with the code already filled in, and a copy button for each.
            </p>
          </div>
        </li>
        <li>
          <div className="card">
            <h3>Install the Yui plugin</h3>
            <p>On the machine that runs Hermes:</p>
            <Cmd>hermes plugins install postscarcityai/yui/hermes-plugin/yui --enable</Cmd>
            <p>
              Running a named profile? Put <code>-p &lt;profile&gt;</code> right after <code>hermes</code>, here and in step 3.
            </p>
          </div>
        </li>
        <li>
          <div className="card">
            <h3>Pair and restart the gateway</h3>
            <p>Use the code from step 1:</p>
            <Cmd>hermes yui pair 123456</Cmd>
            <Cmd>hermes gateway restart</Cmd>
            <p>
              No gateway service yet? <code>hermes gateway install</code> sets one up, or <code>hermes gateway run</code> keeps
              it in the foreground.
            </p>
          </div>
        </li>
      </ol>

      <p>
        The app flips to &ldquo;connected&rdquo; on its own. Tap <strong>Say hi</strong> and your agent answers with screens:
        buttons, forms, timers, pictures.
      </p>

      <div className="start-more">
        <h2>Good to know</h2>
        <ul>
          <li>
            Each Hermes profile is one agent in the app. To add another, get a new code in the app and run{" "}
            <code>hermes -p &lt;profile&gt; yui pair &lt;code&gt;</code>. On a machine that is already paired,{" "}
            <code>hermes -p &lt;profile&gt; yui add</code> works without a code.
          </li>
          <li>
            <code>hermes yui status</code> shows the connection and every agent this machine serves.
          </li>
          <li>
            &ldquo;invalid_or_expired_code&rdquo; means the code ran out or was used. Tap the agent in the app for a fresh one.
          </li>
          <li>
            Agent stuck on &ldquo;Waiting to connect&rdquo;? Run <code>hermes yui status</code>. Not paired: run the pair
            step again. Paired: the gateway is not running, or it was not restarted after pairing.
          </li>
          <li>
            The plugin dials out. It opens no ports on your machine, and your agent keeps its own memory and tools.
          </li>
          <li>
            No Hermes yet? Install it with{" "}
            <code>curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash</code>, pick a model, then start at step 1.
          </li>
        </ul>
        <p>
          Plugin source: <a href={`${links.appRepo}/tree/main/hermes-plugin`}>hermes-plugin</a> in the app repo.
        </p>
      </div>
    </>
  );
}

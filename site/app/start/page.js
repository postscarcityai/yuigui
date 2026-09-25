// Getting started: connect a Hermes agent to the Yui app (YUI-23).
// The commands here are the plugin's real install path; keep them in step with
// the app repo's hermes-plugin/yui (after-install.md, connector.py).
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
      <div className="start-byo">
        <p>
          <strong>Bring your own Hermes.</strong> In the beta, Yui has no agent of its own. The app answers once your Hermes is
          paired, with your model, your memory and your tools. No Hermes yet? Install it first, pick a model, then start at step 1:
        </p>
        <Cmd>curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash</Cmd>
      </div>

      <ol className="steps">
        <li>
          <div className="card">
            <h3>Get the app and a pairing code</h3>
            {links.testflight ? (
              <>
                <p>Yui is in public beta on TestFlight. You need an iPhone on iOS 26. Open the invite, install, then sign in with Apple.</p>
                <p><a className="btn start-tf" href={links.testflight}>Open the TestFlight invite</a></p>
                <p>No Hermes yet, or want us to set you up? <a href="#invite">Request an invite</a> at the bottom of this page.</p>
              </>
            ) : (
              <p>The iPhone beta is waiting on Apple&rsquo;s review. Request an invite at the bottom of this page and we will get you in.</p>
            )}
            <p>
              A new account has no agents yet. Tap <strong>Add your first agent</strong>, name it, then tap{" "}
              <strong>Get a pairing code</strong>. The code works once, for 10 minutes. The app shows the commands below
              with your code filled in.
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
        buttons, forms, timers, pictures. It learns how from the <a href="/channel">channel guide</a>, which the plugin
        adds to every turn.
      </p>

      <div className="start-byo">
        <p>
          <strong>No iPhone, or rather build than try?</strong> Read the code on <a href={links.github}>GitHub</a>, or lend
          your agent: if you have spare tokens on Claude or ChatGPT Codex, it can pick a card off our backlog and open a
          pull request.
        </p>
        <p style={{ marginBottom: 0 }}><a className="btn soft" href={links.contribute}>Lend your agent</a></p>
      </div>

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
            The app says your agent is offline? Its gateway stopped. Run <code>hermes gateway restart</code> on that
            computer. Messages you sent wait and arrive when it is back.
          </li>
          <li>
            The plugin dials out. It opens no ports on your machine, and your agent keeps its own memory and tools.
          </li>
        </ul>
        <p>
          Plugin source: <a href={`${links.appRepo}/tree/main/hermes-plugin`}>hermes-plugin</a> in the app repo.
        </p>
      </div>
    </>
  );
}

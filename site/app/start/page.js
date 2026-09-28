// Getting started: connect a Hermes agent to the Yui app (YUI-23), then every other way in (SITE-46).
// The Hermes commands stay written out here so the site chat can search them (lib/chat/search.mjs);
// lib/start-paths.mjs holds the same ones, and every other path, for the agent copy at /md/start (SITE-77).
import links from "../../content/links.json";
import Cmd from "../components/Cmd";
import Shots from "../components/Shots";
import Films from "../components/Films";
import AgentBox from "../components/AgentBox";
import { PATHS } from "../../lib/start-paths.mjs";

// Shots from build 162 on the simulator, demo account, the pairing flow of YuiPromoTests.testPromoPair (SITE-46).
const PAIR_SHOTS = [
  { src: "/progress/site46-code-light.webp", alt: "Add agent in Yui: the new agent Nova with a 6-digit pairing code and the commands to run, light mode" },
  { src: "/progress/site46-code-dark.webp", alt: "The same pairing code screen in dark mode" },
];
const FIRST_SHOTS = [
  { src: "/progress/site46-connected-light.webp", alt: "Nova is connected: a green check, Running on your Mac, and a Say hi to Nova button, light mode" },
  { src: "/progress/site46-first-light.webp", alt: "After pairing: Nova says hi and sends its first screen, a choice of three buttons, light mode" },
  { src: "/progress/site46-connected-dark.webp", alt: "Nova is connected, dark mode" },
  { src: "/progress/site46-first-dark.webp", alt: "Nova's first screen, dark mode" },
];

// `backticks` in a path's body become inline code.
const inline = (t) => t.split("`").map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));

export const metadata = {
  title: "Get started | Yui",
  description: "Connect your agent to the Yui app: Hermes in three steps, or OpenClaw, a webhook, Claude, ChatGPT, Claude Code, Cursor, an A2A agent or a model on your own machine.",
};

export default function Start() {
  return (
    <>
      <AgentBox path="/start" title="Connect your agent to Yui" paths={["hermes", "connector"]} />
      <div className="eyebrow">Get started</div>
      <h1>Connect your agent in three steps.</h1>
      <p className="lede">
        Yui talks to Hermes running on your own Mac or Linux box. If Hermes already answers you somewhere, this takes
        about five minutes.
      </p>
      <p className="start-crew">
        Want to see what an agent can do first? <a href="/crew">Meet the crew</a>: Yui and five starter agents, each with a demo to tap.
      </p>
      <div className="start-byo">
        <p>
          <strong>Bring your own agent.</strong> In the alpha, Yui has no agent of its own: a new account stays quiet until you
          connect one. Hermes is the main path, below. On something else? See <a href="#not-on-hermes">Not on Hermes?</a> No
          Hermes yet? Install it first, pick a model, then start at step 1:
        </p>
        <Cmd>curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash</Cmd>
      </div>

      <Films ids={["film-agents"]} lede="Every agent in its own look, pairing a new one, and one agent asking another. A minute, sound on." />

      <ol className="steps">
        <li>
          <div className="card">
            <h2>Get the app and a pairing code</h2>
            {links.testflight ? (
              <>
                <p>
                  The MVP is done and Yui is in alpha on TestFlight, listed as <strong>Yui Gui</strong>. Anyone with an iPhone on iOS 26 can join:
                  open the public link, install, then sign in with Apple.
                </p>
                <p><a className="btn start-tf" href={links.testflight}>Download on TestFlight</a></p>
                <p>No agent yet, or want us to set you up? <a href="#invite">Ask for a hand</a> at the bottom of this page.</p>
              </>
            ) : (
              <p>The iPhone beta is waiting on Apple&rsquo;s review. Request an invite at the bottom of this page and we will get you in.</p>
            )}
            <p>
              A new account has no agents yet. Tap <strong>Add your first agent</strong>, name it, then tap{" "}
              <strong>Get a pairing code</strong>. The code works once, for 10 minutes. The app shows the commands below
              with your code filled in.
            </p>
            <Shots images={PAIR_SHOTS} label="The pairing code in Yui" />
          </div>
        </li>
        <li>
          <div className="card">
            <h2>Install the Yui plugin</h2>
            <p>On the machine that runs Hermes:</p>
            <Cmd>hermes plugins install postscarcityai/yui/hermes-plugin/yui --enable</Cmd>
            <p>
              Running a named profile? Put <code>-p &lt;profile&gt;</code> right after <code>hermes</code>, here and in step 3.
            </p>
          </div>
        </li>
        <li>
          <div className="card">
            <h2>Pair and restart the gateway</h2>
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
      <Shots images={FIRST_SHOTS} label="The first screen after pairing" />

      <section className="start-paths" aria-labelledby="not-on-hermes">
        <h2 id="not-on-hermes">Not on Hermes?</h2>
        <p>
          Yui reaches other agents too. Each one starts the same way: in the app, <strong>Add agent</strong> gives you a
          6-digit code (swap it in for 123456). Then one command or one URL.
        </p>
        <div className="paths">
          {PATHS.map((p) => (
            <div className="card" id={p.id} key={p.id}>
              <h3>{p.title}</h3>
              <p>{inline(p.body)}</p>
              <Cmd label={p.label}>{p.cmd}</Cmd>
              <p><a href={p.href}>{p.link}</a></p>
            </div>
          ))}
        </div>
      </section>

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

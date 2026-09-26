// Getting started: connect a Hermes agent to the Yui app (YUI-23), then every other way in (SITE-46).
// The commands here are the real install paths; keep them in step with the app repo's
// hermes-plugin/yui (after-install.md, connector.py), adapters/ and the spec pages they link.
import links from "../../content/links.json";
import Cmd from "../components/Cmd";
import Shots from "../components/Shots";

const MCP_URL = "https://ewzzaoperdpxqxkshynx.supabase.co/functions/v1/yui-mcp";

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

// Not on Hermes? One block per path, each with its one command or URL and its spec page.
const PATHS = [
  {
    id: "openclaw",
    title: "OpenClaw",
    body: "Install the Yui channel plugin, pair it with the code from the app (`openclaw yui pair`), turn the channel on and restart the gateway. Needs OpenClaw 2026.6.11 or later.",
    cmd: "git clone https://github.com/postscarcityai/yui && openclaw plugins install ./yui/adapters/openclaw",
    href: "/developers/openclaw",
    link: "OpenClaw setup",
  },
  {
    id: "webhook",
    title: "Any agent that answers an HTTP POST",
    body: "The webhook bridge (Python or Node, no dependencies) runs on your machine. Pair it with the code, then point it at your agent's URL. From `adapters/webhook` in the app repo:",
    cmd: "python3 python/yui_webhook.py pair 123456 --ref my-agent",
    href: "/developers/webhook",
    link: "Webhook bridge",
  },
  {
    id: "claude-chatgpt",
    title: "Claude and ChatGPT",
    body: "Add Yui as a custom connector with this URL (Claude: Settings > Connectors; ChatGPT: developer mode at chatgpt.com/plugins). It signs in through yuigui.com/connect and you tap Allow in the app. Your chat stays where it is; the screens land on your phone.",
    cmd: MCP_URL,
    label: "the Yui MCP URL",
    href: "/developers/mcp#claude",
    link: "Claude and ChatGPT steps",
  },
  {
    id: "claude-code",
    title: "Claude Code or Cursor",
    body: "Claude Code adds the server, then `claude mcp get yui` and `claude mcp login yui`, and you approve it in Yui. Cursor, or any client that takes a URL and a header, uses a token you get from a pairing code.",
    cmd: `claude mcp add --transport http yui ${MCP_URL}`,
    href: "/developers/mcp#claude-code",
    link: "MCP server",
  },
  {
    id: "a2a",
    title: "An A2A agent",
    body: "Any agent with an Agent Card (ADK, LangGraph, CrewAI, Microsoft Agent Framework) pairs by its URL. The agent needs no Yui code. Node 22.18 or newer, from `adapters/a2a` in the app repo, then `node yui-a2a.ts run`:",
    cmd: "node yui-a2a.ts pair 123456 --card https://your-agent.example.com",
    href: "/developers/a2a",
    link: "A2A bridge",
  },
  {
    id: "own-model",
    title: "A model on your own machine",
    body: "Ollama by default; LM Studio, vLLM and llama.cpp by name, or any OpenAI-style URL. Node 22.18 or newer, from `adapters/openai-compat` in the app repo, then `node yui-openai.ts run`:",
    cmd: "node yui-openai.ts pair 123456 --model qwen2.5:7b",
    href: "/developers/models",
    link: "Model bridge",
  },
];

export const metadata = {
  title: "Get started | Yui",
  description: "Connect your agent to the Yui app: Hermes in three steps, or OpenClaw, a webhook, Claude, ChatGPT, Claude Code, Cursor, an A2A agent or a model on your own machine.",
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
          <strong>Bring your own agent.</strong> In the beta, Yui has no agent of its own: a new account stays quiet until you
          connect one. Hermes is the main path, below. On something else? See <a href="#not-on-hermes">Not on Hermes?</a> No
          Hermes yet? Install it first, pick a model, then start at step 1:
        </p>
        <Cmd>curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash</Cmd>
      </div>

      <ol className="steps">
        <li>
          <div className="card">
            <h2>Get the app and a pairing code</h2>
            {links.testflight ? (
              <>
                <p>
                  Yui is in public beta on TestFlight, listed as <strong>Yui Gui</strong>. Anyone with an iPhone on iOS 26 can join:
                  open the public link, install, then sign in with Apple.
                </p>
                <p><a className="btn start-tf" href={links.testflight}>Get the TestFlight beta</a></p>
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

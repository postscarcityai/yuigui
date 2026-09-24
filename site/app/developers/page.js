// Developers hub (SITE-13): one page that points at everything a builder needs.
// The section's other pages (playground, Yui Lines, channel guide) show in the nav's second row.
import Link from "next/link";
import links from "../../content/links.json";
import { specDocs } from "../../lib/spec.mjs";
import Cmd from "../components/Cmd";
import { BADGE_HTML, BADGE_MD, embedSnippet } from "../../lib/share-code.mjs";

export const metadata = {
  title: "Developers | Yui",
  description: "How Yui works under the hood: connect your agent, the Yui Lines screen language, the channel guide, the playground and the source.",
};

const cards = [
  ["/start", "Connect your agent", "Install the Hermes plugin and pair it with the app. About five minutes."],
  ["/developers/openclaw", "OpenClaw", "On OpenClaw? Install the Yui channel plugin, pair with the app's code, and your agent answers on your phone."],
  ["/developers/webhook", "Webhook bridge", "Not on Hermes? Any agent that answers an HTTP POST can talk in Yui. Python and Node, ten-line examples."],
  ["/playground", "Playground", "Edit a line and watch the screen draw, in your browser. Includes the token benchmark."],
  ["/yl", "Yui Lines spec", "The screen language: one short line per element, every preset and its options."],
  ["/developers/specs", "All specs", "Every spec, rendered from the repo: agents, the relay, adapters, the token benchmark and more."],
  ["/channel", "Channel guide", "What every agent on the Yui channel is told, and the eval that scores it."],
  ["/reactions", "Reactions", "Hold a message and react. What each of the six tells your agent to do."],
  ["/developers/community", "Community", "Who builds with Yui Lines, how to contribute, and the open challenge: draw your best screen in three lines."],
  ["/developers#share", "Share, embed, badge", "A link with a preview for any screen, a live screen for your own page, and a README badge."],
  ["/developers/flywheel", "Preset flywheel", "Custom screens agents keep sending become presets. What is logged (shapes, never values) and the promotion checklist."],
];

const parsers = [
  ["JavaScript", `${links.github}/blob/main/site/lib/yl/yl.mjs`, "site/lib/yl/yl.mjs, the reference. The playground and the site run it."],
  ["Swift", `${links.appRepo}/tree/main/Packages/YuiLines`, "Packages/YuiLines in the app repo. The iPhone app runs it."],
  ["Python", `${links.github}/tree/main/parsers/python`, "parsers/python. One file, standard library only."],
  ["Kotlin", `${links.github}/tree/main/parsers/kotlin`, "parsers/kotlin. JVM, Kotlin standard library only. Android later."],
];

export default function Developers() {
  return (
    <>
      <div className="eyebrow">Developers</div>
      <h1>How Yui works.</h1>
      <p className="lede">
        Works today on iPhone, with Hermes, OpenClaw or any agent behind a webhook. Your agent sends short lines of text, and the app turns each line into a
        native screen: a timer, a form, a choice. The agent never sends code, and it keeps running on your own machine.
      </p>

      <h2>Start here</h2>
      <div className="grid">
        {cards.map(([href, t, d]) => (
          <Link className="card" key={href} href={href}><h3>{t}</h3><p>{d}</p></Link>
        ))}
      </div>

      <h2>Every spec</h2>
      <ul className="spec-links">
        {specDocs().map((d) => <li key={d.slug}><Link href={d.href}>{d.label}</Link></li>)}
      </ul>

      <h2>The pieces</h2>
      <ul>
        <li><strong>Yui Lines.</strong> The wire format. <code>timer 40/20x8 Tabata</code> is a whole interval timer. One spec, one shared test suite, parsers in four languages (below).</li>
        <li><strong>The app.</strong> Native SwiftUI on iPhone. It draws every screen from a fixed set of presets built into the app.</li>
        <li><strong>The plugin.</strong> A Hermes platform plugin. It dials out to the relay, so your machine opens no ports, and each Hermes profile shows up as its own agent.</li>
        <li><strong>The relay.</strong> Supabase Realtime and a few edge functions carry messages both ways, hold them while either side is offline, and send a push when the app is closed.</li>
      </ul>

      <h2>Parsers</h2>
      <p>
        Every parser passes the same shared conformance vectors. Use one to read Yui Lines in your own agent,
        adapter or app. <code>spec/conformance/run-all.sh</code> runs them all.
      </p>
      <ul>
        {parsers.map(([lang, href, where]) => (
          <li key={lang}><strong>{lang}.</strong> <a href={href}>{where}</a></li>
        ))}
      </ul>
      <p>Want another language? Rust is next. Port the JavaScript one, make it pass the vectors, and open a pull request.</p>

      <h2>Other agent frameworks</h2>
      <p>
        Hermes works today, and so do <Link href="/developers/openclaw">OpenClaw</Link> and anything that answers an HTTP
        POST, through the <Link href="/developers/webhook">webhook bridge</Link>. An MCP server and more come after the
        MVP. The plan is in the <Link href="/roadmap#adapters">roadmap</Link>.
      </p>

      <h2 id="share">Share, embed, badge</h2>
      <p>
        Every screen on <Link href="/mockups">See it</Link> has its own link, <code>/s/&lt;id&gt;</code>, with a preview image that shows
        the lines and the screen they draw. In the <Link href="/playground">playground</Link>, Share packs whatever you typed into the link
        itself, so it opens that exact screen for anyone.
      </p>

      <h3 id="embed">Embed a live screen</h3>
      <p>Paste this into any page. The screen is live: people can tap it. Nothing is tracked inside the frame.</p>
      <div className="dev-embed">
        <iframe src="/embed?demo=tabata-timer" title="A Tabata timer drawn from one line of Yui Lines" width="340" height="690" loading="lazy" />
        <div className="dev-snippet" style={{ flex: "1 1 300px", minWidth: 0 }}>
          <Cmd>{embedSnippet("/embed?demo=tabata-timer", "A Tabata timer drawn by Yui")}</Cmd>
          <ul>
            <li><code>?demo=&lt;name&gt;</code> draws a playground sample, <code>?id=&lt;id&gt;</code> a See it screen.</li>
            <li><code>?yl=&lt;code&gt;</code> draws your own lines: press Share in the playground and copy the <code>yl</code> part of the link.</li>
            <li>Add <code>&amp;theme=light</code> for a light phone.</li>
          </ul>
        </div>
      </div>

      <h3 id="badge">Made with Yui Lines</h3>
      <p>
        Building on Yui Lines? Put the badge in your README. <img src="/badge/made-with-yui-lines.svg" alt="Made with Yui Lines" width="136" height="20" style={{ verticalAlign: "middle" }} />
      </p>
      <Cmd>{BADGE_MD}</Cmd>
      <Cmd>{BADGE_HTML}</Cmd>

      <h2>Source</h2>
      <ul>
        <li><a href={links.appRepo}>postscarcityai/yui</a>: the iPhone app, the Hermes plugin and the backend.</li>
        <li><a href={links.github}>postscarcityai/yuigui</a>: the spec, this website and the roadmap.</li>
      </ul>
      <p>Both are open source under Apache-2.0. Issues and pull requests are welcome; start with CONTRIBUTING.md in either repo, or the <Link href="/developers/community">community page</Link>.</p>
    </>
  );
}

// Developers hub (SITE-13): one page that points at everything a builder needs.
// The section's other pages (playground, Yui Lines, channel guide) show in the nav's second row.
import Link from "next/link";
import links from "../../content/links.json";

export const metadata = {
  title: "Developers | Yui",
  description: "How Yui works under the hood: connect your agent, the Yui Lines screen language, the channel guide, the playground and the source.",
};

const cards = [
  ["/start", "Connect your agent", "Install the Hermes plugin and pair it with the app. About five minutes."],
  ["/playground", "Playground", "Edit a line and watch the screen draw, in your browser. Includes the token benchmark."],
  ["/yl", "Yui Lines spec", "The screen language: one short line per element, every preset and its options."],
  ["/channel", "Channel guide", "What every agent on the Yui channel is told, and the eval that scores it."],
  ["/reactions", "Reactions", "Hold a message and react. What each of the six tells your agent to do."],
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
        Your agent sends short lines of text. The app turns each line into a native screen: a timer, a form, a choice.
        The agent never sends code, and it keeps running on your own machine.
      </p>

      <div className="grid">
        {cards.map(([href, t, d]) => (
          <Link className="card" key={href} href={href}><h3>{t}</h3><p>{d}</p></Link>
        ))}
      </div>

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
        Hermes works today. Adapters for OpenClaw, a webhook, an MCP server and more come after the MVP. The plan is in
        the <Link href="/roadmap#adapters">roadmap</Link>.
      </p>

      <h2>Source</h2>
      <ul>
        <li><a href={links.appRepo}>postscarcityai/yui</a>: the iPhone app, the Hermes plugin and the backend.</li>
        <li><a href={links.github}>postscarcityai/yuigui</a>: the spec, this website and the roadmap.</li>
      </ul>
      <p>Both are open source under Apache-2.0. Issues and pull requests are welcome; start with CONTRIBUTING.md in either repo.</p>
    </>
  );
}

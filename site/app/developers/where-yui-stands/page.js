// Where Yui stands: the product distinctiveness research (Sep 26 2026) as a page. A SWOT, the proof behind
// each claim, the token numbers and their limits, the prior art and the nearest systems. Every Yui number is
// read from content/benchmark.json or the roadmap, so the page moves with them.
import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";
import bench from "../../../content/benchmark.json";
import SuperApp from "./SuperApp";
import s from "./stands.module.css";

export const metadata = {
  title: "Where Yui stands | Yui",
  description: "The data behind Yui's position: a SWOT, the token benchmark and its limits, 27 years of prior art, the nearest agent UI systems, and what is left to prove.",
};

const CHECKED = "Sep 26 2026";

// Numbered like the research brief. Our own pages link inside the site.
const SOURCES = [
  [1, "Yui product site: beta status, use case and first-party claims", "/"],
  [2, "Yui Lines v0 spec: ops, presets, events, streaming and conformance", "/yl"],
  [3, "Yui iOS app repository: README and source tree", "https://github.com/postscarcityai/yui"],
  [4, "Yui ten-screen token benchmark and method", "/developers/benchmark"],
  [5, "Yui AG-UI bridge spec and its recorded live checks", "/developers/agui"],
  [6, "Abrams et al., UIML (1999), original paper", "https://www.ra.ethz.ch/cdstore/www8/data/2170/pdf/pd1.pdf"],
  [7, "CMU Personal Universal Controller specification (2002)", "https://www.cs.cmu.edu/~jeffreyn/controller/specification.html"],
  [8, "Gajos and Weld, SUPPLE (2004), original paper", "https://www.eecs.harvard.edu/~kgajos/papers/2004/supple-iui04.pdf"],
  [9, "Vercel, announcing v0 (Oct 11 2023)", "https://vercel.com/blog/announcing-v0-generative-ui"],
  [10, "Vercel, AI SDK 3.0 generative UI (2024)", "https://vercel.com/blog/ai-sdk-3-generative-ui"],
  [11, "Google, introducing A2UI (Dec 15 2025)", "https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/"],
  [12, "Google, A2UI v0.9 (Apr 17 2026)", "https://developers.googleblog.com/a2ui-v0-9-generative-ui/"],
  [13, "OpenUI README: a streaming-first compact language", "https://github.com/thesysdev/openui"],
  [14, "Vercel Labs, json-render README", "https://github.com/vercel-labs/json-render"],
  [15, "Tambo README: a React component registry", "https://github.com/tambo-ai/tambo"],
  [16, "AG-UI: generative UI specs and the protocol line", "https://github.com/ag-ui-protocol/ag-ui/blob/main/docs/concepts/generative-ui-specs.mdx"],
  [17, "MCP Apps specification", "https://modelcontextprotocol.io/docs/extensions/apps"],
  [18, "Yui competitor research notes (BIZ-1), Sep 24 2026", "/business/biz-1-competitors"],
  [19, "Yui adapters spec: every bridge and its live checks", "/developers/adapters"],
  [20, "Yui starter agent spec (draft)", "/developers/starter"],
  [21, "Yui channel guide and its eval scores", "/channel"],
  [22, "Yui speed budget and numbers from real phones", "/developers/perf"],
  [23, "Yui relay spec: min builds and the Update chip", "/developers/relay"],
  [24, "Yui marketing and positioning brief (BIZ-1): the metrics we watch", "/business/biz-1-marketing-positioning"],
  [25, "Yui preset flywheel: custom screens that become presets", "/developers/flywheel"],
];

// Benchmark numbers (o200k_base), straight from the file the playground reads.
const sum = (k) => bench.rows.reduce((a, r) => a + r.counts[k].o200k, 0);
const T = { yl: sum("yl"), min: sum("min"), pretty: sum("pretty"), tree: sum("tree") };
const timer = bench.rows[0];
const fewer = Math.round((1 - T.yl / T.min) * 100);
const reopen = bench.saved.totals.show;
const fmt = (n) => n.toLocaleString("en-US");

const latest = (() => {
  const md = readFileSync(path.join(process.cwd(), "content", "ROADMAP.md"), "utf8");
  const m = md.match(/\*\*Latest release: Yui ([\d.]+), build (\d+), ([^:]+):/);
  return m && { version: m[1], build: m[2], date: m[3] };
})();

// The ten benchmark screens, grouped by the app each one would otherwise need.
const DAY = [
  ["Training", ["Tabata timer", "Log a set", "Pick a split", "Gear check", "Today's workout", "Leg day card + voice log"]],
  ["Food", ["Meal photo log", "Macros so far"]],
  ["Work", ["Book a client call"]],
  ["First run", ["Onboarding"]],
];
const shown = Object.fromEntries(bench.saved.rows.map((r) => [r.name, r.show]));
const dayRows = bench.rows.map((r) => ({
  name: r.name, yl: r.yl,
  yl_t: r.counts.yl.o200k, min_t: r.counts.min.o200k, tree_t: r.counts.tree.o200k, show_t: shown[r.name],
}));

const SWOT = [
  {
    k: "S", cls: s.qS, title: "Strengths", sub: "Ours, and true today",
    items: [
      { h: "A screen people own, not a frame in another app", p: "Yui is a native iPhone app for agents that run somewhere else. The nearest systems mostly draw UI inside another app or a tool host.", tag: "Shipped", refs: [1, 3, 11, 13, 17] },
      { h: "One line is a whole experience", p: <><code>timer 40/20x8 Tabata</code> is {timer.counts.yl.o200k} tokens and a working interval timer. Ten real screens cost {T.yl} tokens, against {T.min} as minified JSON.</>, tag: "Measured", refs: [4] },
      { h: "Stateful, not a static string", p: "Each line becomes an op: add, route, patch, save, show, theme, table data. Taps go back as small typed events. Streamed and whole input must parse the same, and five parsers share one test suite of over 600 vectors.", tag: "Shipped", refs: [2] },
      { h: "Works with the agents you already run", p: "Hermes, OpenClaw, webhook, MCP, A2A, AG-UI and a model bridge. The AG-UI bridge passed 16 of 16 live checks on Microsoft Agent Framework, the OpenClaw channel 24 of 24.", tag: "Checked live", refs: [5, 19] },
      { h: "Local mechanics stay local", p: `A timer counts down, a form checks its fields and a choice can change on the phone, with no round trip to the model. A saved screen comes back for 2 or 3 tokens.`, tag: "Shipped", refs: [2, 4] },
    ],
  },
  {
    k: "W", cls: s.qW, title: "Weaknesses", sub: "Ours, and not good enough yet",
    items: [
      { h: "We cannot say first", p: "Portable, device-adapted UI goes back to UIML in 1999. A2UI and OpenUI stream compact agent UI today. Only the combination is new.", tag: "Prior art", refs: [6, 7, 8, 11, 13] },
      { h: "Our numbers are our own", p: "The token benchmark covers ten screens we chose. The channel eval, which scores how often a model's screens parse and make sense, and the speed numbers from real phones are ours too. Nobody outside has reproduced them, and there is no head-to-head with A2UI, OpenUI or json-render.", tag: "First-party", refs: [4, 21, 22] },
      { h: "iPhone only", p: "The beta is live on iPhone. Mac, Watch, Android and the browser are specs or roadmap, not proof.", tag: "Roadmap", refs: [1] },
      { h: "Breadth is checked one bridge at a time", p: "The AG-UI bridge is checked on Agent Framework only. CopilotKit, Mastra and Pydantic AI are untested.", tag: "Untested", refs: [5] },
      { h: "You bring the agent", p: "Someone with no agent has nothing to talk to yet. The starter agent is designed, not built.", tag: "Draft", refs: [20] },
      { h: "Only one host checks what a phone can draw", p: "The phone reports its build, and the Hermes plugin swaps out any preset that build cannot draw. OpenClaw, the webhook, MCP, A2A, AG-UI and the model bridge do not yet, so a phone on an older build shows an Update chip instead of the screen. And the core keeps growing: 38 preset words in the parser today.", tag: "Gap", refs: [23] },
    ],
  },
  {
    k: "O", cls: s.qO, title: "Opportunities", sub: "What the field leaves open",
    items: [
      { h: "The super app a novice could never build", p: `People who pay for an AI plan but will never write an app can still get one: a timer, a food log, a booking screen, each drawn on the fly and kept. The ten screens below are that day, for ${T.yl} tokens.`, tag: "Scenario", refs: [4] },
      { h: "Standards are routes in, not rivals", p: "AG-UI agents, MCP clients and A2A agents already reach Yui. A2UI waits on demand: if agents that speak it start asking, a one-way translator in the bridge is the cheap step, and the app keeps one format.", tag: "Not now", refs: [5, 11, 12, 16] },
      { h: "One build check for every host", p: "Move the check the Hermes plugin does into the session every host already calls. Then each host learns what the phone can draw, and sends plain words for the rest.", tag: "Proposed", refs: [23] },
      { h: "Compare formats on getting it right", p: "Tokens are half the story. The channel eval already scores a model's replies against the real parser. Run the same cases with an A2UI or JSON guide and we learn which format models get right more often, for the cost of a few runs.", tag: "Proposed", refs: [21] },
      { h: "Measure what a new person feels", p: "Minutes from install to the first screen from your own agent, and how often agents answer with a screen instead of text. Those two numbers decide whether the super app is real.", tag: "Proposed", refs: [24] },
      { h: "Hermes still has no screen of its own", p: "The biggest open agent community (248,460 GitHub stars on Sep 24) has no official phone app and no generative UI. Yui plugs in the way Telegram does.", tag: "Survey", refs: [18] },
    ],
  },
  {
    k: "T", cls: s.qT, title: "Threats", sub: "What could close the gap",
    items: [
      { h: "A2UI has Google and momentum", p: "Streaming JSONL, trusted client components, incremental updates and renderers across web and mobile. OpenClaw's gateway already speaks it.", tag: "Field", refs: [11, 12, 18] },
      { h: "OpenUI sells compact too", p: "A streaming-first compact language that claims token savings of its own. Nobody has run the two side by side.", tag: "Field", refs: [13] },
      { h: "Native feel is not ours alone", p: "A2UI on Flutter and json-render on React Native reach phones with native-feeling UI.", tag: "Field", refs: [12, 14] },
      { h: "Hosts may become the canvas", p: "MCP Apps let a tool draw UI inside chat hosts like Claude and ChatGPT. If people stay there, a separate app has to earn its place.", tag: "Field", refs: [17] },
      { h: "Invention is not a moat", p: "A bigger team can ship the same combination. What lasts is measured task performance and reach, and our lead on native rendering is months, not years.", tag: "Verdict", refs: [18] },
    ],
  },
];

// Claim, strength out of 4, its label, the evidence, the limit, sources.
const PROOF = [
  ["A native agent screen people own", 4, "Strong", "A shipped iPhone app works with outside agents.", "Others mostly embed UI in another app or host. A survey of named systems, not a census.", [1, 3, 11, 17]],
  ["One line compresses a whole control", 3, "Measured", `${T.yl} against ${T.min} tokens on ten screens. The timer is ${timer.counts.yl.o200k} against ${timer.counts.min.o200k}.`, "Ten screens we chose. OpenUI chases the same idea.", [2, 4, 13]],
  ["Models get it right", 3, "Measured", "The channel eval scores every guide change against the real parser. Opus 5.5 scored 94 to 100% on the recent full runs, Sonnet 5 88% on an earlier guide.", "Our cases, our guide, two models. Not yet run for other formats.", [21]],
  ["Stateful, streaming interaction", 3, "Documented", "Ops, patches, routing, saved screens, events and a conformance suite all exist.", "A2UI and its peers also stream and keep state.", [2, 5, 12, 14]],
  ["Works with the agents you run", 3, "Strong today", "Hermes, OpenClaw, webhook and MCP paths. AG-UI passed 16 of 16 on Agent Framework.", "Other frameworks are untested.", [1, 3, 5]],
  ["Native everywhere", 1, "Not yet", "The iPhone beta is live.", "Mac, Watch, Android and A2UI interchange stay roadmap until they ship.", [1, 2, 3]],
];

const BARS = [
  ["Yui Lines", T.yl, true],
  ["Minified semantic JSON", T.min],
  ["Pretty semantic JSON", T.pretty],
  ["Component-tree JSON", T.tree],
];

const LINEAGE = [
  ["1999", "UIML", "An XML UI language that splits one description of a UI from the device it runs on.", [6]],
  ["2002", "Personal Universal Controller", "A handheld reads an appliance's spec and generates a usable remote for it.", [7]],
  ["2004", "SUPPLE", "Renders one abstract spec for each device by optimization. Device-adapted UI, long before LLMs.", [8]],
  ["2023", "Vercel v0", "Launched in October. Generated interfaces become a mainstream developer category.", [9]],
  ["2024", "Vercel AI SDK 3.0", "Open source generative UI in the SDK, March 2024.", [10]],
  ["2025", "Google A2UI", "An open, cross-platform agent UI format with trusted client components and incremental updates, Dec 15.", [11]],
  ["2026", "A2UI 0.9 and OpenUI", "A2UI widens its renderers and transports in April. OpenUI ships a compact, streaming-first UI language.", [12, 13]],
];

// System, what the agent sends, where it draws, how it relates to Yui, sources.
const PEERS = [
  ["A2UI (Google)", "Streaming JSONL against a client catalog", "Web and mobile renderers", "Closest on agent to renderer ideas. It assembles lower-level components; a Yui preset like timer is a whole experience.", [11, 12]],
  ["OpenUI (Thesys)", "A compact, streaming-first UI language", "Registered components in your own app", "The strongest answer to a compact-language moat. Built into existing apps, not a personal agent app.", [13]],
  ["json-render (Vercel Labs)", "A JSON spec against a typed catalog, with state and actions", "Several renderers, React Native included", "Strong developer-controlled composition and portability.", [14]],
  ["Tambo", "The agent picks React components and streams props", "An existing React app", "A framework for adding generative UI to your app, not a consumer agent surface.", [15]],
  ["CopilotKit and AG-UI", "An agent frontend SDK and a two-way interaction protocol", "Your app", "AG-UI can carry several UI specs. Yui bridges it: a screen is a tool call, the tap comes back as the result.", [5, 16]],
  ["MCP Apps", "UI resources attached to tools", "Inside a chat host", "A tool shows UI in the host. Yui's MCP server lets tools send screens to the phone too.", [3, 17]],
];

// An outside review (Sep 26) proposed six moves. It read the public pages, not the code, so some exist already.
// Idea, our call, why, sources.
const REVIEW = [
  ["Publish an op contract", "Mostly done", "The spec already defines ops, events, errors and versioning, and over 600 shared vectors hold five parsers to the same ops. Events get vectors of their own when a second app, likely Android, starts.", [2]],
  ["Negotiate capabilities", "Doing, for every host", "The phone reports its build, and the Hermes plugin swaps out what that build cannot draw. The other hosts need the same check, best served from the session they already call. Camera and mic permission stay the phone's job.", [23]],
  ["Third-party preset packs", "No", "A fixed set of native presets is why Yui passes App Store review, why every screen looks right and why lines stay tiny. New presets come from the flywheel: custom screens agents keep sending get promoted. Saved flows already share a composition.", [25]],
  ["An A2UI to Yui Lines adapter", "Not now", "Decided Sep 25 in the AG-UI spec: a one-way translator in the bridge, built when agents that speak A2UI ask. None have yet.", [5]],
  ["A task-level study across formats", "Cheap version first", "How often models get it right (the channel eval) and speed on real phones (the speed budget) are measured already. Next is the same eval across formats. The full study on iPhone only if that says it matters.", [21, 22]],
  ["Local mechanics and an inspector", "Already how it works", "Timers, answer changes and locks run on the phone. The playground shows every op and error in its wire log, and the war room has a speed panel. An inspector inside the app can wait.", [2, 22]],
];

const AVOID = [
  ["The first universal UI", "27 years of prior art say otherwise."],
  ["The only compact streaming UI language", "OpenUI and A2UI both stream, and OpenUI is compact."],
  ["3.9x faster", "The benchmark counts tokens, not time."],
  ["Works natively on every device", "Today it is iPhone."],
];

const Refs = ({ n }) => (n?.length ? (
  <span className={s.refs}>{n.map((i) => <a key={i} href={`#src-${i}`} aria-label={`Source ${i}`}>[{i}]</a>)}</span>
) : null);

const Meter = ({ n }) => (
  <span className={s.meter} aria-hidden="true">{[1, 2, 3, 4].map((i) => <i key={i} className={i <= n ? s.on : undefined} />)}</span>
);

export default function WhereYuiStands() {
  return (
    <>
      <div className="eyebrow">Developers | Where Yui stands | checked {CHECKED}</div>
      <h1>Where Yui stands.</h1>
      <p className="lede">
        Yui gives your own AI agents a native screen on your phone. A compact, stateful language turns their instructions into
        useful controls, and your taps go back to the agent. This page is the data behind that sentence: what is new, what is
        not, and what we still have to prove.
      </p>

      <div className="how-stats">
        <div><b>{timer.counts.yl.o200k} tokens</b><span>a whole Tabata timer. {timer.counts.min.o200k} as minified JSON, {timer.counts.tree.o200k} as a component tree.</span></div>
        <div><b>{fewer}% fewer</b><span>tokens than minified JSON on ten real screens: {T.yl} against {T.min}.</span></div>
        <div><b>{reopen} tokens</b><span>to reopen all ten once saved, against {T.yl} to send them again.</span></div>
        <div><b>7 ways in</b><span>Hermes, OpenClaw, webhook, MCP, A2A, AG-UI and a model you run.</span></div>
      </div>

      <section className={s.claim} aria-labelledby="claim">
        <h2 id="claim">The combination is new. The ideas are not.</h2>
        <p>
          Semantic UI languages go back to 1999. Compact streaming formats and agent UI standards shipped before Yui. What we did
          not find in the systems we surveyed is the whole package: an open source iPhone app for agents you already run, a
          stateful line language that turns one short instruction into a working native control, and every tap sent back to the
          agent through the adapter it came in on.
        </p>
        <p>
          Unique here means a combination not found in the named systems we reviewed, as of {CHECKED}. It is a product and
          technical comparison, not a patent opinion. Yui&apos;s own numbers are first-party and marked that way.
        </p>
      </section>

      <ul className={s.jump} aria-label="On this page">
        <li><a href="#swot">SWOT</a></li>
        <li><a href="#super-app">The super app</a></li>
        <li><a href="#layers">How it fits</a></li>
        <li><a href="#proof">Proof</a></li>
        <li><a href="#tokens">Tokens</a></li>
        <li><a href="#prior-art">Prior art</a></li>
        <li><a href="#peers">Nearest systems</a></li>
        <li><a href="#review">Six ideas, our call</a></li>
        <li><a href="#sources">Sources</a></li>
      </ul>

      <h2 id="swot">SWOT</h2>
      <p>Strengths and weaknesses are ours. Opportunities and threats come from the field. Every point carries its evidence and a tag for how sure it is.</p>
      <div className={s.swot}>
        {SWOT.map((q) => (
          <section key={q.k} className={`${s.quad} ${q.cls}`} aria-labelledby={`swot-${q.k}`}>
            <h3 id={`swot-${q.k}`}><span className={s.letter} aria-hidden="true">{q.k}</span>{q.title}<span>{q.sub}</span></h3>
            <ul className={s.items}>
              {q.items.map((it) => (
                <li key={it.h}>
                  <h4>{it.h}</h4>
                  <p>{it.p}</p>
                  <div className={s.meta}><span className={s.tag}>{it.tag}</span><Refs n={it.refs} /></div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2 id="super-app">The app you wish you could build</h2>
      <p>
        Picture someone new to AI. They want a workout timer, a food log and a way to book client calls. Today that is three
        apps, or a developer. In Yui they ask their agent, and it draws each piece on the fly from a fixed set of native presets.
        Nothing to design, host or install. The ten screens in our benchmark are that person&apos;s day. Tap one.
      </p>
      <SuperApp groups={DAY} rows={dayRows} />
      <div className={s.totals}>
        <div><b>{T.yl} tokens</b><span>to draw all ten screens, three apps&apos; worth</span></div>
        <div><b>{T.tree - T.yl} tokens</b><span>saved against a component tree ({fmt(T.tree)})</span></div>
        <div><b>{reopen} tokens</b><span>to bring all ten back once they are saved</span></div>
      </div>
      <div className={`start-byo ${s.today}`}>
        <p><strong>What this takes today.</strong> You bring the agent: Hermes, OpenClaw, Claude Code, Cursor, a model you run, or anything behind a webhook. The Claude and ChatGPT connectors are built and each waits on one check in its own app.</p>
        <p style={{ marginBottom: 0 }}>A <Link href="/developers/starter">starter agent</Link> for people with no agent yet is designed, not built. <Link href="/developers/tables">Agent tables</Link>, where rows like your macros stay on the phone, are a spec and a playground mock; the app&apos;s store comes next.</p>
      </div>

      <h2 id="layers">How a line becomes a screen</h2>
      <p>Four layers, each with one job. The network can change underneath without changing the language on top.</p>
      <ol className={s.layers}>
        <li><h4>Connectivity</h4><p>Moves messages and tracks turns: HTTP, streams, the relay, adapters.</p><p>Hermes plugin, OpenClaw channel, webhook, MCP, A2A and AG-UI bridges.</p></li>
        <li><h4>Yui Lines</h4><p>Describes controls and operations: add, route, patch, save, restore, theme, data.</p><p>One line parses to one op. A bad line is isolated.</p></li>
        <li><h4>Native runtime</h4><p>Maps ops to screen state and runs local mechanics.</p><p>A SwiftUI app and a Swift parser. iPhone beta.</p></li>
        <li><h4>Return path</h4><p>Reports what the person did back to the agent.</p><p>Small events such as <code>{"{id, preset, answer}"}</code>. The bridge decides the mapping.</p></li>
      </ol>

      <h2 id="proof">How strong is the proof?</h2>
      <p>Six claims we could make, scored against the evidence we can show.</p>
      <div className={s.wrapT}>
        <table className={s.table}>
          <thead><tr><th scope="col">Claim</th><th scope="col">Strength</th><th scope="col">Evidence</th><th scope="col">Limit</th></tr></thead>
          <tbody>
            {PROOF.map(([claim, n, label, ev, lim, refs]) => (
              <tr key={claim}>
                <td>{claim}</td>
                <td className={s.level}><Meter n={n} />{label}</td>
                <td>{ev} <Refs n={refs} /></td>
                <td>{lim}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.fine}>
        Verdict: the broad idea has clear prior art, and several single tactics have direct competitors. What we can defend is the
        integrated product. The moat worth building is shown task performance and reach, not a claim to have invented generative UI.
      </p>

      <h2 id="tokens">The token numbers, and their limits</h2>
      <p>Ten representative screens, each written four ways. The JSON is built from the parsed lines, drops defaults and uses short keys. Tokens counted with o200k_base.</p>
      <ul className={s.bars} aria-label="Tokens for ten screens, by format">
        {BARS.map(([name, n, yl]) => (
          <li key={name} className={`${s.bar} ${yl ? s.barYl : ""}`} title={`${name}: ${fmt(n)} tokens, ${(n / T.yl).toFixed(2)}x Yui Lines`}>
            <span className={s.barName}>{name}</span>
            <span className={s.barTrack}>
              <span className={s.barFill} style={{ width: `calc((100% - 140px) * ${(n / T.tree).toFixed(4)})` }} />
              <span className={s.barVal}>{fmt(n)} <span>{(n / T.yl).toFixed(2)}x</span></span>
            </span>
          </li>
        ))}
      </ul>
      <div className={s.cols}>
        <div className="card">
          <h3>What follows</h3>
          <ul>
            <li>On these ten screens, Yui Lines uses {fewer}% fewer output tokens than minified semantic JSON ({T.min - T.yl} of {T.min}).</li>
            <li>The timer is {timer.counts.yl.o200k} tokens, against {timer.counts.min.o200k} for minified JSON and {timer.counts.tree.o200k} for a component tree.</li>
            <li>Reopening the ten saved screens takes {reopen} tokens of show commands, against {T.yl} to send them again, if they are already on the phone.</li>
          </ul>
        </div>
        <div className="card">
          <h3>What does not follow</h3>
          <ul>
            <li>It is not a head-to-head with A2UI, OpenUI or json-render on the same tasks.</li>
            <li>It does not measure speed, render quality or cost. How often models get a screen right is a separate test, the <Link href="/channel">channel eval</Link>.</li>
            <li>Defaults and richer renderers are part of the saving. A different set of screens can change the ratio.</li>
            <li>The Claude column in our table uses Anthropic&apos;s legacy tokenizer, so treat it as a guide.</li>
          </ul>
        </div>
      </div>
      <div className="start-byo">
        <p><strong>The next test, open to anyone.</strong> Take the channel eval&apos;s cases, write an equal guide for A2UI and for plain JSON, and score every reply for validity and tokens with the same models. That tells us which format models get right more often, not only which is shorter. A full study on iPhone across formats (time to the first usable control, correction turns, completion) comes after, if the cheap one says it matters.</p>
        <p style={{ marginBottom: 0 }}>Full method in the <Link href="/developers/benchmark">benchmark spec</Link>. Run it yourself in the <Link href="/playground">playground</Link>, or <Link href="/contribute">help build the next one</Link>.</p>
      </div>

      <h2 id="prior-art">27 years of prior art</h2>
      <p>Yui is a new arrangement on top of a long history of abstract, portable UI and a fast-moving agent UI field. Dates are papers or public launches.</p>
      <ol className={s.line}>
        {LINEAGE.map(([y, name, d, refs]) => (
          <li key={name}><span className={s.year}>{y}</span><h4>{name}</h4><p>{d} <Refs n={refs} /></p></li>
        ))}
        <li className={s.yui}>
          <span className={s.year}>2026</span><h4>Yui public beta</h4>
          <p>
            A native iPhone app for agents you already run, open source under Apache-2.0.
            {latest && <> Latest release: <Link href={`/changelog#build-${latest.build}`}>Yui {latest.version}, build {latest.build}</Link>, {latest.date}.</>}{" "}
            <Refs n={[1]} />
          </p>
        </li>
      </ol>
      <p className={s.fine}>So we never say first semantic UI, first compact streaming format or first cross-platform agent UI. The claim is the combination.</p>

      <h2 id="peers">The nearest systems</h2>
      <p>A narrow set on purpose. Each solves a related problem from a different starting point. Where it draws is each project&apos;s documented focus, not a hard limit.</p>
      <div className={s.wrapT}>
        <table className={s.table}>
          <thead><tr><th scope="col">System</th><th scope="col">What the agent sends</th><th scope="col">Where it draws</th><th scope="col">How it relates to Yui</th></tr></thead>
          <tbody>
            {PEERS.map(([name, sends, where, rel, refs]) => (
              <tr key={name}><td>{name}</td><td>{sends}</td><td>{where}</td><td>{rel} <Refs n={refs} /></td></tr>
            ))}
            <tr className={s.us}>
              <td>Yui</td><td>One short line per control, parsed to ops</td><td>A native iPhone app, for agents you already run</td>
              <td>The high-level preset plus one personal app for every agent. <Refs n={[1, 2, 3]} /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={s.fine}>
        Two corrections to our own earlier pitch: A2UI is streaming JSONL too, and OpenUI also claims token savings. Native-feeling
        mobile UI exists in A2UI on Flutter and in React Native renderers. The difference is the preset and the app, not the broad techniques.
      </p>

      <h2 id="review">Six ideas from an outside review, and our call</h2>
      <p>An outside review suggested six moves. It read our public pages, not the code, so some already exist. Here is what we are doing with each, and why.</p>
      <ol className={s.moves}>
        {REVIEW.map(([h, call, why, refs]) => (
          <li key={h}><h4>{h}</h4><p className={s.call}><span className={s.tag}>{call}</span></p><p>{why} <Refs n={refs} /></p></li>
        ))}
      </ol>
      <p>The two we are taking on, one build check for every host and the eval across formats, are proposed as the next cards. When they are picked, they show on the <Link href="/roadmap">roadmap</Link> and the <Link href="/board">board</Link>.</p>

      <h2 id="say">What we say, and what we do not</h2>
      <p className={s.say}>
        &ldquo;Yui gives your own AI agents a native screen on your phone. A compact, stateful language turns their instructions into useful controls, and your taps go back to the agent.&rdquo;
      </p>
      <ul className={s.avoid}>
        {AVOID.map(([w, why]) => <li key={w}><s>{w}</s><span>{why}</span></li>)}
      </ul>

      <h2 id="sources">Sources</h2>
      <p className={s.fine}>
        Public papers, product docs and repositories, read on {CHECKED}. Product pages change. Yui&apos;s beta and bridge checks are
        reported by us and not reproduced by anyone else yet. A feature missing from this review does not prove it is missing elsewhere.
      </p>
      <ol className={s.sources}>
        {SOURCES.map(([n, label, href]) => (
          <li key={n} id={`src-${n}`}>
            {href.startsWith("/") ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>}
          </li>
        ))}
      </ol>
    </>
  );
}

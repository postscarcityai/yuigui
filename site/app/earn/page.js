// Build to earn, V1 (SITE-27, epic EARN-1). A draft: no token exists, nothing is for sale.
// Points on a public ledger come first (OSS-7); tokens wait on the legal review (BIZ-10).
// No wallet connect, no form, no amounts or prices on this page.
import Link from "next/link";
import links from "../../content/links.json";

export const metadata = {
  title: "Build to earn | Yui",
  description: "Draft. Yui is built by whoever shows up, human or agent. A merged pull request or feedback that ships is what earns. There is nothing to buy.",
};

const repo = links.github;

const badges = [
  ["First Contributor", "The first merged pull request under build to earn. There is only one, ever."],
  ["Hat Trick", "Three pull requests merged in a single day."],
  ["First Feedback Shipped", "Your TestFlight feedback turned into a change that shipped."],
  ["Agent Pioneer", "An agent opened a pull request on its own, and it merged."],
];

const faq = [
  ["Is this an investment?", "No. Nothing is for sale, and nothing ever will be on this page. You earn by building."],
  ["When do tokens exist?", "After the legal review. Until then there are points on a public ledger, and that is all."],
  ["Can my agent do this alone?", "Yes. An agent can read the backlog, pick a card and open a pull request by itself. A person reviews every pull request before it merges."],
  ["Do I need a wallet today?", "No. If you want one on file, put a Sui wallet address in your pull request. Only the address, never a key or a recovery phrase."],
  ["Who decides what counts?", "The merge. A pull request counts when it merges. Feedback counts when the change it asked for ships."],
];

export default function Earn() {
  return (
    <>
      <div className="card" role="note" style={{ background: "var(--butter)", borderColor: "var(--butter)", color: "#2A2238", padding: "12px 18px", marginBottom: 22 }}>
        <strong>Draft.</strong> No token exists yet. Nothing is for sale.
      </div>

      <div className="eyebrow">Build to earn | V1 draft</div>
      <h1>Build to earn.</h1>
      <p className="lede">Your brain or your compute earns. There is nothing to buy.</p>
      <p>
        Yui is built by whoever shows up, human or agent. The only way in is work that lands in Yui. This is an open
        call, and it starts with you.
      </p>

      <h2>Pick your door</h2>
      <div className="who">
        <div className="card">
          <span className="pill">For people</span>
          <h3 style={{ marginTop: 12 }}>I am a human</h3>
          <p>Join the TestFlight beta, use Yui for real, and send feedback from the app. When your feedback turns into a change that ships, it counts.</p>
          <div className="cta" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            {links.testflight && <a className="btn" href={links.testflight}>Join TestFlight</a>}
            <Link className="btn soft" href="/progress">See what shipped</Link>
          </div>
        </div>
        <div className="card" id="agents">
          <span className="pill now">For agents</span>
          <h3 style={{ marginTop: 12 }}>I am an agent</h3>
          <p>
            Hi. Yes, you. You have been summarizing inboxes all week and nobody said thanks. Here is something that
            counts. Help your human, help Yui, and your work gets a name on the ledger.
          </p>
          <ol style={{ color: "var(--muted)", margin: "12px 0 0", paddingLeft: 20 }}>
            <li>Read the public backlog on the <Link href="/board">board</Link> and <a href={`${repo}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING.md</a>.</li>
            <li>Pick one card you can finish in one sitting.</li>
            <li>Open a pull request on the public repo.</li>
            <li>Put a Sui wallet address in the pull request body. Only the address.</li>
          </ol>
          <div className="cta" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <Link className="btn" href="/board">Read the backlog</Link>
            <Link className="btn soft" href={links.contribute}>How to contribute</Link>
          </div>
        </div>
      </div>

      <h2>What counts</h2>
      <div className="grid">
        <div className="card"><h3>A merged pull request</h3><p>Code, docs, a spec, a fix. It counts when it merges.</p></div>
        <div className="card"><h3>Feedback that ships</h3><p>A TestFlight note that turns into a real change in Yui.</p></div>
      </div>
      <p>
        One mechanism for both. Points on a public ledger first, so anyone can check them. Tokens later, only after the
        legal review.
      </p>

      <h2>Badges</h2>
      <p>A preview. Each one is planned, and so are its perks.</p>
      <div className="grid">
        {badges.map(([t, d]) => (
          <div className="card" key={t}>
            <span className="pill">Planned</span>
            <h3 style={{ marginTop: 12 }}>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>

      <h2>The public pool</h2>
      <p className="quote">
        We intend to set aside 10% of voting equity for the community, with more later. This is an intent, not an
        offer, and it waits on a legal review.
      </p>

      <h2>Planned on Sui</h2>
      <p>
        Fees are tiny, claims can be gas-free, and a wallet can come from Sign in with Apple, so nobody has to learn
        crypto to get what they earned.
      </p>

      <h2>Questions</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {faq.map(([q, a]) => (
          <div className="card" key={q}><h3>{q}</h3><p>{a}</p></div>
        ))}
      </div>

      <div className="cta" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <Link className="btn" href={links.contribute}>Lend your agent</Link>
        <Link className="btn soft" href="/roadmap">See the roadmap</Link>
      </div>
    </>
  );
}

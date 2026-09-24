import Link from "next/link";
import { specDocs } from "../../../lib/spec.mjs";

export const metadata = {
  title: "Specs | Yui",
  description: "Every Yui spec, rendered from the repo: the Yui Lines screen language, the channel guide, reactions, the token benchmark, agents, the relay and adapters.",
};

export default function Specs() {
  return (
    <>
      <div className="eyebrow">Developers | Specs | rendered from spec/ in the repo</div>
      <h1>Every spec, in the open.</h1>
      <p className="lede">
        How Yui works, written down. Start with Yui Lines, the screen language. These pages are built from the same files as the repo, so they never drift.
      </p>
      <div className="grid">
        {specDocs().map((d) => (
          <Link className="card" key={d.slug} href={d.href}><h3>{d.label}</h3><p>{d.blurb}</p></Link>
        ))}
      </div>
    </>
  );
}

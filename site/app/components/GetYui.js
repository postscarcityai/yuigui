"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import links from "../../content/links.json";
import { keepUtm, trackCta } from "../../lib/track.mjs";
import CtaLink from "./CtaLink";
import InviteRequest from "./InviteRequest";

// The ways in, at the bottom of every page: the public beta, the code, lending your agent (SITE-24), and asking for a hand (SITE-26).
export default function GetYui() {
  const where = usePathname() || "/";
  useEffect(keepUtm, []);
  return (
    <section className="wrap getyui" aria-labelledby="getyui-h">
      <h2 id="getyui-h">Try Yui, or help build it</h2>
      <div className="getyui-grid">
        <div className="card">
          <h3>Get the public beta</h3>
          {links.testflight ? (
            <>
              <p>Yui is in public beta on TestFlight for iPhone on iOS 26. Install it, then connect the agent you already run: Hermes, OpenClaw, Claude Code, a model you run, or anything behind a webhook.</p>
              <div className="cta">
                <CtaLink cta="testflight" where={where} href={links.testflight}>Get the TestFlight beta</CtaLink>
                <Link className="btn soft" href="/start" onClick={() => trackCta("start", where)}>Connect your agent</Link>
              </div>
            </>
          ) : (
            <p>The public beta is waiting on Apple&rsquo;s review. It will need Hermes running on your own computer. Request an invite below and we will get you in.</p>
          )}
        </div>
        <div className="card">
          <h3>Star it on GitHub</h3>
          <p>Yui is open source under Apache 2.0. Star the repo, open an issue, or send a pull request.</p>
          <div className="cta">
            <CtaLink cta="github" where={where} href={links.github}>Star on GitHub</CtaLink>
            <CtaLink cta="github-app" where={where} className="btn soft" href={links.appRepo}>App code</CtaLink>
          </div>
        </div>
        <div className="card">
          <h3>Lend your agent</h3>
          <p>Spare tokens on Claude or ChatGPT Codex? Your agent can pick a card off our backlog and open a pull request. Yui@home, like SETI@home.</p>
          <div className="cta">
            <Link className="btn" href={links.contribute} onClick={() => trackCta("lend-agent", where)}>Lend your agent</Link>
            <Link className="btn soft" href="/earn" onClick={() => trackCta("earn", where)}>Build to earn</Link>
          </div>
        </div>
      </div>
      <InviteRequest source={`cta:${where}`.slice(0, 60)} />
    </section>
  );
}

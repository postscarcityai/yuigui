"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import links from "../../content/links.json";
import { keepUtm } from "../../lib/track.mjs";
import CtaLink from "./CtaLink";
import Waitlist from "./Waitlist";

// The three ways in, at the bottom of every page: the beta, the code, the waitlist.
export default function GetYui() {
  const where = usePathname() || "/";
  useEffect(keepUtm, []);
  return (
    <section className="wrap getyui" aria-labelledby="getyui-h">
      <h2 id="getyui-h">Try Yui, or help build it</h2>
      <div className="getyui-grid">
        <div className="card">
          <h3>Get the TestFlight beta</h3>
          {links.testflight ? (
            <>
              <p>Install Yui on your iPhone today. Bring your own agent: the beta talks to Hermes running on your own computer.</p>
              <CtaLink cta="testflight" where={where} href={links.testflight}>Get the TestFlight beta</CtaLink>
            </>
          ) : (
            <p>The public beta is waiting on Apple&rsquo;s review. It will need Hermes running on your own computer. Join the waitlist and we will send the link the day it opens.</p>
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
      </div>
      <Waitlist source={`cta:${where}`.slice(0, 60)} />
    </section>
  );
}

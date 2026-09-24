export const metadata = { title: "Business plan | Yui" };

const sections = [
  {
    h: "Problem",
    p: [
      "People who run personal AI agents talk to them through text channels like Telegram. Text is fine for conversation and bad for everything else.",
      "A yes or no question should be two buttons. A workout should be a timer. A pipeline should be a table. Today the agent can only describe these things.",
      "Getting a new app into the App Store is hard, and most agent frontends are fixed templates that look the same for everyone.",
    ],
  },
  {
    h: "Solution",
    p: [
      "Yui is one approved mobile app that any agent can plug into. Chat is the home screen. The agent can take over the screen at any time and render UI from a shared component kit: buttons, multi-select with free text, forms, sliders, timers, lists, tables, charts, camera and mic.",
      "The agent sends Yui Lines, one short line per screen element, never code. The app is native SwiftUI and renders each line with a built-in preset. That keeps it safe, fast and native, and lets every agent carry its own colors, face and voice.",
    ],
  },
  {
    h: "Who it is for, in order",
    p: [
      "1. Lobster users: people already running Hermes, OpenClaw or similar agents. They have the agent, they lack the screen. Chris is user zero.",
      "2. Technical early adopters who will paste their own API keys (OpenRouter, fal, Replicate) to get going today.",
      "3. Everyone else, later: download, add a card, get a starter team of agents (trainer, nutritionist, assistant) through a guided interview.",
    ],
  },
  {
    h: "Business model (hypotheses to test)",
    p: [
      "Phase A: free for bring-your-own-agent and bring-your-own-keys users. Build usage and proof, spend nothing on inference.",
      "Phase B: subscription for hosted agents, with usage credits for models and image generation bought in the app.",
      "Phase C: a connector library (HubSpot first) and premium components for agents that run a business, not just a workout.",
      "No prices are set. Pricing gets decided once hosted agents exist and real per-user inference cost is measured.",
    ],
  },
  {
    h: "Why now",
    p: [
      "Personal agents moved from demos to daily tools in 2026. Their owners hit the text ceiling every day.",
      "Generative UI is now practical: models reliably emit short structured lines, and iOS 26 gives a native app on-device models, speech, Live Activities and Siri hooks that a web wrapper cannot reach.",
      "Edge platforms (Cloudflare Workers and Durable Objects) make a cheap, always-on relay between agent and phone easy to run.",
    ],
  },
  {
    h: "Edge",
    p: [
      "Agent-agnostic: any agent can drive it, so users do not have to switch frameworks.",
      "Generative by default: the screens are built for one person in the moment, not picked from a template gallery.",
      "Channel-agnostic: start on Telegram or SMS, finish on the screen the agent built.",
    ],
  },
  {
    h: "Risks",
    p: [
      "App Store review of an app whose UI is generated at runtime. Mitigation: the app only renders a fixed native component kit, never downloaded code. Telegram Mini Apps are the fallback path.",
      "Generated UI that looks bad. Mitigation: strict component kit, UX rules in the agent skill, per-agent themes.",
      "Big platforms ship the same idea. Mitigation: move fast, own the bring-your-own-agent niche first.",
      "Inference cost for hosted users. Mitigation: BYO keys first, credits later, on-device models where they fit.",
    ],
  },
  {
    h: "Milestones",
    p: [
      "Week 1: this hub. Weeks 1-3: UI protocol and web playground. Weeks 2-5: Arnold drives a screen from Telegram. Weeks 4-8: native SwiftUI build on TestFlight on Chris's phone. Weeks 8-12: onboarding and starter agents. Q1 2027: data layer and connectors. Q1-Q2 2027: public App Store listing.",
    ],
  },
  {
    h: "What it costs to get to TestFlight",
    p: [
      "Apple Developer account: $99 a year. Vercel and Cloudflare free tiers cover the hub and relay at this scale. Model usage runs through existing keys. Every spend gets Chris's sign-off first.",
    ],
  },
];

export default function Plan() {
  return (
    <>
      <div className="eyebrow">Business plan | draft 1, Sep 23 2026</div>
      <h1>Yui business plan</h1>
      <p className="lede">A first draft built from the pitch. Numbers stay out until we have real ones.</p>
      <p>The detailed working docs (positioning, revenue models, outreach) are public too: <a href="/business">business docs</a>.</p>
      {sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {s.p.map((t) => <p key={t}>{t}</p>)}
        </section>
      ))}
    </>
  );
}

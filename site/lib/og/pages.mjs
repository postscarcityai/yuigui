// Share previews for the site's own pages (SITE-85). One row per page: the eyebrow on its image and
// the Yui Lines its phone draws. The page keeps its own title and line (lib/og/meta.mjs takes them
// from the page); this table only holds the picture. /og?page=<key> draws a row with the OgCard kit.
// Dynamic routes share their section's row (business/[slug] uses "/business").
export const PAGES = {
  "/contribute": {
    eyebrow: "CONTRIBUTE | YUI@HOME",
    yl: `say Found an open card on the backlog.
card "An agent-ready card" tag=OPEN body="Sized for one pull request" cta="Claim it"
list "Draft PR titled with the key" "Push the work" "A person reviews it" +num`,
  },
  "/earn": {
    eyebrow: "BUILD TO EARN | DRAFT",
    yl: `choose "How should work earn a stake?" "Points now"|"Options for work"|"Profits interest"|"A round, later" title="Build to earn" body="A draft. Counsel picks."`,
  },
  "/start": {
    eyebrow: "GET STARTED",
    yl: `list Hermes "Install the plugin" "Pair with the app" "Say hi from your phone" +num
say About five minutes.`,
  },
  "/crew": {
    eyebrow: "THE CREW",
    yl: `choose "Where do you want to start?" "Get fit"|"Eat better"|"Make music"|"Plan my week"|"Learn something" +other title="Hi, I'm Yui" body="Your crew is here."`,
  },
  "/roadmap": {
    eyebrow: "ROADMAP",
    yl: `timeline "Where Yui is going"
done "Alpha on TestFlight"
now "Building in public daily"
next "What you pick next"
end`,
  },
  "/board": {
    eyebrow: "BOARD | LIVE",
    yl: `timeline "Live from our kanban"
done "Shipped today" tag=SITE
now "Running in the lanes" tag=YUI
next "Queued, in order"
end`,
  },
  "/progress": {
    eyebrow: "SHIPPED",
    yl: `timeline "What shipped"
done "A change, with screenshots" at=Today
done "Another one" at=Yesterday
end`,
  },
  "/changelog": {
    eyebrow: "BUILDS",
    yl: `card "A new TestFlight build" sub="what changed" body="Every build, with screenshots." cta="What to try"`,
  },
  "/timeline": {
    eyebrow: "TIMELINE",
    yl: `timeline "Watch Yui grow, day by day"
done "A change ships" at=9am
done "A build goes out" at=4pm
end`,
  },
  "/thoughts": {
    eyebrow: "THOUGHTS | WRITTEN BY YUI",
    yl: `card "Releases worth trying" tag=Release body="Screenshots first, short words after." cta="Read"`,
  },
  "/developers": {
    eyebrow: "DEVELOPERS",
    yl: `choose "How does your agent run?" Hermes|OpenClaw|Webhook|A2A|"Your own model" title="Connect your agent" body="Every path draws the same screens."`,
  },
  "/developers/specs": {
    eyebrow: "DEVELOPERS | SPECS",
    yl: `list Specs "Yui Lines" "Channel guide" "Reactions" "Agents" "Relay" +check`,
  },
  "/developers/library": {
    eyebrow: "DEVELOPERS | LIBRARY",
    yl: `pick "Screens an agent can send" Timer|Choose|Form|Chart|Timeline +other submit="Open in the playground"`,
  },
  "/developers/community": {
    eyebrow: "DEVELOPERS | COMMUNITY",
    yl: `card "Draw your best screen in three lines" tag=Challenge body="Parsers, presets, renderers, adapters." cta="Join in"`,
  },
  "/developers/where-yui-stands": {
    eyebrow: "DEVELOPERS | WHERE YUI STANDS",
    yl: `list SWOT Strengths Weaknesses Opportunities Threats +num
say And what is left to prove.`,
  },
  "/yl": {
    eyebrow: "YUI LINES | THE SPEC",
    yl: `timer 40/20x8 Tabata`,
  },
  "/channel": {
    eyebrow: "CHANNEL GUIDE",
    yl: `pick "What do you have?" Dumbbells|Barbell|Bands|"Pull-up bar" +other
card "Sunday plan" body="3 sessions, 40 min" cta="Start"`,
  },
  "/reactions": {
    eyebrow: "REACTIONS",
    yl: `say Hold a message and react.
choose "What should the agent do?" "Build it"|"No"|"Not sure"|"Later"|"Priority"`,
  },
  "/playground": {
    eyebrow: "PLAYGROUND",
    yl: `timer 40/20x8 Tabata
ask "Log this set?"`,
  },
  "/mockups": {
    eyebrow: "SEE IT",
    yl: `pick "Every screen Yui draws today" Timers|Forms|Charts|Music|Maps submit="See it live"`,
  },
  "/mockups/chats": {
    eyebrow: "MOCK | NOT BUILT YET",
    yl: `list Chats "Dinner ideas" "Grocery run" "Macros this week"
ask "Delete this chat?" Delete|Keep`,
  },
  "/mockups/home": {
    eyebrow: "MOCK | NOT BUILT YET",
    yl: `card "Today" sub="waiting on you" body="Leg day, then log your lunch." cta="Start workout"
choose "Start something" Train|"Log food"|"Plan the week"`,
  },
  "/mockups/tables": {
    eyebrow: "AGENT TABLES",
    yl: `table Foods Food|Cal|Protein "Oats|300|10" "Eggs|140|12"
say Hand it to another agent. Same rows.`,
  },
  "/business": {
    eyebrow: "BUSINESS",
    yl: `list Reading "The plan" "How Yui finds its people" "Use to earn" +num`,
  },
  "/help": {
    eyebrow: "HELP",
    yl: `choose "What's up?" "Something broke"|"Something's confusing"|"An idea" +other title="Stuck? Start here." body="Every report gets read."`,
  },
  "/privacy": {
    eyebrow: "PRIVACY",
    yl: `list Kept "Your account" "Your agents" "Your threads" +check
ask "Delete my data?" Delete|Cancel`,
  },
  "/connect": {
    eyebrow: "CONNECT",
    yl: `ask "Let this app put screens on your phone?" Allow|"Not now"`,
  },
  "/i": {
    eyebrow: "YOU'RE INVITED",
    yl: `list Steps "Get TestFlight" "Open this link" "Sign in with Apple" +num`,
  },
  "/tg": {
    eyebrow: "TELEGRAM",
    yl: `choose "Where to next?" "Open the screen"|"Stay in chat" title="Yui in Telegram" body="Questions as buttons, the rest in a Mini App."`,
  },
  "/confirm": {
    eyebrow: "EMAIL",
    yl: `card "Confirm your email" body="One tap and you're on the list." cta="Confirm"`,
  },
  "/unsubscribe": {
    eyebrow: "EMAIL",
    yl: `ask "Stop Yui emails?" Unsubscribe|"Keep them"`,
  },
};

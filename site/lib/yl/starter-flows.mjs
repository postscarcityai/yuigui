// Starter flows (FLOW-1): saved flows every Yui has, from Chris's own work.
// `flow website-intake` runs one by name; each is also a playground sample.
// Pure Mermaid between the header and `end`, so each renders on GitHub as is.
// Spec: spec/FLOWS.md.

export const STARTER_FLOWS = [
  {
    name: "website-intake",
    id: "intake",
    title: "Client website intake",
    submit: "Send the brief",
    agent: "Scout",
    blurb: "Sit with a client and get everything out of them. Shops and redesigns get their own questions.",
    source: `flowchart TD
  %% hi: page "Let's plan your site" body="About ten questions. Your answers become the brief, so guess when you are not sure."
  hi([Start]) --> biz
  %% biz: form "Your business" "Business name":text! "What you do":long "Who it is for":text
  biz[Your business] --> kind
  %% kind: choose "What are we building?" "New site"|Redesign|Shop|"Landing page"
  kind{What are we building?}
  kind -->|Redesign| today
  kind -->|Shop| products
  kind --> goal
  %% today: form "The site today" "Current site":url! "What works":long "What you hate":long
  today[The site today] --> goal
  %% products: slide "How many products?" 1-500
  products[How many products?] --> pay
  %% pay: pick "How do you take payment?" Stripe|Shopify|Square|"Not sure yet"
  pay[Payments] --> goal
  %% goal: choose "What should a visitor do first?" Call|Book|Buy|"Sign up"|Read
  goal[First action]
  goal -->|kind=Landing page| brand
  goal --> pages
  %% pages: pick "Which pages?" Home|About|Services|Pricing|Blog|Contact +other
  pages[Pages] --> brand
  %% brand: form "Your brand" logo:yes colors:text "A site you like":url
  brand[Brand] --> budget
  %% budget: slide "Budget, in thousands" 2-50 "$2k"|"$50k"
  budget[Budget]
  budget -->|budget>=15| meet
  budget --> done
  %% meet: ask "Want a call to walk through it?" "Yes, book it"|"Email is fine"
  meet[Call?] --> done((Brief))`,
  },
  {
    name: "self-scope",
    id: "scope",
    title: "Scope a project yourself",
    submit: "Scope it",
    agent: "Yui",
    blurb: "Turn an idea into a scope: what done looks like, how big it is, who does it. Big ones get cut down first.",
    source: `flowchart TD
  %% hi: page "Scope it yourself" body="Answer what you know and guess the rest. At the end you get a one-page scope."
  hi([Start]) --> what
  %% what: form "The project" "Project name":text! "What done looks like":long!
  what[The project] --> kind
  %% kind: choose "What kind of work is it?" Software|Content|Event|"Something else"
  kind{Kind of work}
  kind -->|Software| runs
  kind --> size
  %% runs: pick "Where does it run?" Web|iPhone|Android|"Internal tool"
  runs[Platforms] --> size
  %% size: choose "How big does it feel?" "A weekend"|"A few weeks"|"A few months"|"No idea"
  size{How big?}
  size -->|A few months or No idea| cut
  size --> who
  %% cut: page "Let's cut it down" body="Big projects slip. Name the smallest version someone would use or pay for, and ship that first." points="One user|One job|One screen if you can"
  cut[Cut it down] --> mvp
  %% mvp: form "The smallest version" "What ships first":long!
  mvp[Smallest version] --> who
  %% who: choose "Who does the work?" "Just me"|"Me and a team"|"I'll hire it out"
  who{Who does it?}
  who -->|I'll hire it out| budget
  who --> dates
  %% budget: slide "Budget, in thousands" 1-100 "$1k"|"$100k"
  budget[Budget] --> dates
  %% dates: form "Timing" start:date deadline:date
  dates[Timing] --> worry
  %% worry: mic "What worries you most about it?"
  worry[Biggest worry] --> done((Scope))`,
  },
  {
    name: "workout-checkin",
    id: "checkin",
    title: "Workout check-in",
    submit: "Send to my coach",
    agent: "Coach",
    blurb: "Before a session: sleep, energy, anything sore. A bad night or a real hurt changes the plan.",
    source: `flowchart TD
  %% sleep: slide "How did you sleep?" 1-10 Awful|Great
  sleep[Sleep] --> energy
  %% energy: choose "Energy right now?" Low|OK|High
  energy[Energy] --> check{Rough day?}
  check -->|sleep<5 or energy=Low| easy
  check --> sore
  %% easy: page "Take it easy today" body="Short sleep or low energy means a lighter session still counts. Your coach will see why."
  easy[Easy day] --> sore
  %% sore: pick "Anything sore?" Legs|Back|Shoulders|Arms|Nothing
  sore[Sore spots]
  sore -->|sore=Nothing| today
  sore --> hurt
  %% hurt: choose "Sore, or does it hurt?" "Just sore"|"It hurts"
  hurt{Sore or hurt?}
  hurt -->|It hurts| rest
  hurt --> today
  %% rest: page "Skip that area today" body="Sharp or joint pain means rest it. Your coach will swap those lifts."
  rest[Rest it] --> today
  %% today: choose "Today's session?" "Full session"|"Lighter version"|"Mobility only"|"Rest day"
  today{Session}
  today -->|Rest day| note
  today --> time
  %% time: slide "Minutes you have" 15-90
  time[Time] --> note
  %% note: mic "Anything your coach should know?"
  note[Note] --> done((Coach))`,
  },
  {
    name: "onboarding",
    id: "onboard",
    title: "Meet Yui",
    submit: "Meet my agents",
    agent: "Yui",
    blurb: "The first run: your name, how much you know about AI, what you want help with. Ends with two starter agents picked for you.",
    source: `flowchart TD
  %% hi: page "Hi, I'm Yui" body="Three quick questions, then I suggest your first agents. You can change any answer before you send."
  hi([Start]) --> you
  %% you: form "What should I call you?" name:text!
  you[Your name] --> know
  %% know: slide "How much do you know about AI?" 1-5 "Brand new"|"I run agents"
  know{AI so far}
  know -->|know<=2| basics
  know -->|know>=4| runs
  know --> want
  %% basics: page "An agent, in one line" body="An AI helper with one job, like a trainer or a planner. It remembers you, and in Yui it answers with screens, not walls of text." points="You talk or tap|It answers with a screen|You stay in charge"
  basics[What is an agent?] --> want
  %% runs: choose "Do you run an agent already?" Hermes|OpenClaw|"Something else"|"Not yet"
  runs[Your agent] --> want
  %% want: pick "What do you want help with?" "Get fit"|"Eat better"|"Get organized"|"Learn something" +other
  want[What you want] --> words
  %% words: mic "Tell me more, in your own words"
  words[In your words] --> suggest{Suggest}
  suggest -->|want=Get fit and want=Eat better| duo
  suggest -->|want=Get fit| fit
  suggest -->|want=Eat better| food
  suggest -->|want=Learn something| learn
  suggest --> organized
  %% duo: page "Coach and Basil" body="A trainer and a nutritionist. They see the same week, so meals follow the training." points="Coach plans your workouts and runs the timer. Look: coach|Basil turns a photo of a meal into macros. Look: matcha"
  duo[Coach and Basil] --> team
  %% fit: page "Coach and Penny" body="A trainer, and an assistant who keeps the week clear for it." points="Coach plans your workouts and runs the timer. Look: coach|Penny keeps your lists, reminders and plans. Look: studio"
  fit[Coach and Penny] --> team
  %% food: page "Basil and Coach" body="A nutritionist first. A trainer is there when you want to move more." points="Basil turns a photo of a meal into macros. Look: matcha|Coach plans your workouts and runs the timer. Look: coach"
  food[Basil and Coach] --> team
  %% learn: page "Quill and Penny" body="A study buddy, and an assistant who makes the time for it." points="Quill quizzes you with cards and slides. Look: wizard|Penny keeps your lists, reminders and plans. Look: studio"
  learn[Quill and Penny] --> team
  %% organized: page "Penny and Quill" body="A personal assistant first. A study buddy for anything new you pick up." points="Penny keeps your lists, reminders and plans. Look: studio|Quill quizzes you with cards and slides. Look: wizard"
  organized[Penny and Quill] --> team
  %% team: pick "Which ones do you want?" Coach|Basil|Penny|Quill
  team[Your agents] --> connect{Connect}
  connect -->|runs=Hermes or runs=OpenClaw| plug
  connect --> bring
  %% plug: page "Plug in the agent you run" body="Install the Yui plugin and pair with a code. Each agent you picked becomes a profile on it, with its own look. The steps are at yuigui.com/start."
  plug[Plug in] --> done((Agents))
  %% bring: page "Yui brings the screens, you bring the agent" body="Yui has no built-in agent yet. Set up Hermes once, free, on your own computer, and each agent you picked becomes a profile on it. The steps are at yuigui.com/start."
  bring[Bring an agent] --> done`,
  },
];

const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// A saved flow by name: `flow website-intake` or `flow "Website intake"`.
export function savedFlow(name) {
  const s = slug(name);
  return STARTER_FLOWS.find((f) => f.name === s || slug(f.title) === s) || null;
}

// A starter as the lines an agent would send inline.
export const flowLines = (f, id = f.id) =>
  `flow@${id} "${f.title}" submit="${f.submit}"\n${f.source}\nend`;

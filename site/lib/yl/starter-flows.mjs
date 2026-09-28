// Starter flows (FLOW-1): saved flows every Yui has, from Chris's own work.
// `flow website-intake` runs one by name; each is also a playground sample.
// Pure Mermaid between the header and `end`, so each renders on GitHub as is.
// Spec: spec/FLOWS.md.

import { flowVariant, parse, resolve, variantName } from "./yl.mjs";

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
  {
    name: "connect",
    id: "connect",
    title: "Connect your tools",
    submit: "Connect",
    agent: "Yui",
    blurb: "Pick the tools your agent may use, read what each one allows in plain words, allow or skip each. Sign-in buttons come next.",
    source: `flowchart TD
  %% hi: page "Connect your tools" body="Sign in once and your agent can use them for you. You pick the tools and see what each one allows before anything happens." points="You sign in on Google or HubSpot, never in Yui|Yui never sees your password|Switch any tool off later, from the drawer"
  hi([Start]) --> tools
  %% tools: pick "Which tools should your agent use?" "Google Calendar"|Gmail|HubSpot
  tools[Your tools] --> has_cal{Calendar?}
  has_cal -->|tools=Google Calendar| cal
  has_cal --> has_mail
  %% cal: choose "Let your agent use it?" Allow|"Not now" tag=Calendar title="Google Calendar" body="It can see your calendars and events and find a time that works. Adding or moving an event is a separate ask, the first time you want one. It never shares your calendar."
  cal[Calendar] --> has_mail{Gmail?}
  has_mail -->|tools=Gmail| mail
  has_mail --> has_crm
  %% mail: choose "Let your agent use it?" Allow|"Not now" tag=Mail title="Gmail" body="It can search and read your mail, add labels and write drafts. It has no send button: every draft waits in Gmail for you."
  mail[Gmail] --> has_crm{HubSpot?}
  has_crm -->|tools=HubSpot| crm
  has_crm --> sees
  %% crm: choose "Let your agent use it?" Allow|"Not now" tag=CRM title="HubSpot" body="It can look up contacts, companies and deals, add notes and tasks, and update a record when you ask. It sees only what your own HubSpot login can see."
  crm[HubSpot] --> sees
  %% sees: page "What your agent sees" body="Only what a tool sends back when the agent asks it something. Your sign-in stays with your agent, never in the Yui app and never in a Yui database." points="Anything it changes shows up here first|Switch a tool off from the drawer|Or remove it on Google or HubSpot"
  sees[What it sees] --> ready{Any allowed?}
  ready -->|cal=Allow or mail=Allow or crm=Allow| signin
  ready --> skip
  %% signin: page "Next: one sign-in each" body="Send this and your agent answers with a sign-in button for each tool you allowed. Then you can ask it things like:" points="Find me an hour with Dana this week|What came in today that needs me?|Who is my next call, and what did we say last time?"
  signin[Sign in next] --> fin((Connected))
  %% skip: page "Nothing connected, and that's fine" body="Your agent works without them. Connect a tool any time from the drawer."
  skip[Nothing yet] --> fin`,
  },
  {
    // The crew's own flows (SITE-70 to SITE-74): each member walks you from a check-in to its tool.
    // Arnold, the trainer, from workout-checkin: the answers pick the session, sessionReply runs it.
    name: "trainer-session",
    id: "session",
    title: "Today's session",
    submit: "Start the timer",
    agent: "Coach",
    blurb: "The trainer's check-in: sleep, anything sore, minutes free, your gear. The answers pick the session, then the interval timer runs it.",
    source: `flowchart TD
  %% hi: page "Let's build today's session" body="Four quick questions. Your answers pick the moves and the intervals, then the timer runs it." points="How you slept|Anything sore|Minutes free|Your gear"
  hi([Start]) --> sleep
  %% sleep: slide "How did you sleep?" 1-10 Awful|Great
  sleep[Sleep] --> sore
  %% sore: pick "Anything sore?" Legs|Back|Shoulders|Arms|Nothing
  sore[Sore spots]
  sore -->|sore=Nothing| minutes
  sore --> hurt
  %% hurt: choose "Sore, or does it hurt?" "Just sore"|"It hurts"
  hurt{Sore or hurt?}
  hurt -->|It hurts| rest
  hurt --> minutes
  %% rest: page "We work around it" body="Sharp or joint pain means rest that spot. Today's moves skip it. If it keeps hurting, see a doctor."
  rest[Work around it] --> minutes
  %% minutes: slide "Minutes free?" 10-45 step=5 value=20 unit=min
  minutes[Minutes] --> gear
  %% gear: choose "What do you have?" "Just me"|Dumbbells|Kettlebell|Bands
  gear[Gear] --> build{Build it}
  build -->|sleep<5| easy
  build -->|minutes<=15| quick
  build -->|gear=Just me| body
  build --> loaded
  %% easy: page "Easy session" body="Short sleep, so we keep it light. Long rests, no grinding. It still counts." points="30s on, 30s off|Squat to a chair|Wall push-up|Glute bridge|Dead bug"
  easy[Easy] --> warm
  %% quick: page "Quick hit" body="Short on time, so short and hard. All out for 20, rest 10." points="20s on, 10s off|Squat|Push-up|Mountain climber|Jumping jack"
  quick[Quick] --> warm
  %% body: page "Bodyweight circuit" body="No gear, no problem. You are the weight." points="40s on, 20s off|Squat|Push-up|Reverse lunge|Plank"
  body[Bodyweight] --> warm
  %% loaded: page "Strength circuit" body="You have gear, so we load the big moves. Dumbbell, kettlebell or band, same four." points="45s on, 15s off|Goblet squat|Row|Overhead press|Romanian deadlift"
  loaded[Strength] --> warm
  %% warm: choose "Warm up first?" "Yes, 3 minutes"|"I'm warm"
  warm{Warm up?}
  warm -->|Yes, 3 minutes| warmup
  warm --> go
  %% warmup: page "Warm-up, 3 minutes" body="Do these now, easy pace. Then start the timer." points="Arm circles, 30s|Hip circles, 30s|Squats, 1 min|March in place, 1 min"
  warmup[Warm-up] --> go((Timer))`,
  },
  {
    // Basil, the nutritionist, from the meal demo (spec/MEAL.md): a plate to macros. How sure he is
    // shapes the next step (sure: straight on; a guess: one question on the part he can't see).
    // plateReply saves the row to his meals table and answers with Today, as in his app pages.
    name: "nutritionist-plate",
    id: "plate",
    title: "A plate to macros",
    submit: "Save to my meals",
    agent: "Basil",
    blurb: "The nutritionist's photo read: pick a plate, see his guess and how sure he is, fix the portion. It goes in your meals and today's totals update.",
    source: `flowchart TD
  %% hi: page "Snap a plate, get the macros" body="Pick a plate. I guess what's on it and say how sure I am. You fix what I got wrong, and it goes in your log." points="Pick a photo|My guess, and how sure|Fix the portion|Today's totals"
  hi([Start]) --> photo
  %% photo: choose "Which plate is yours?" Pancakes|Salmon|"Poke bowl"
  photo{Plate}
  photo -->|photo=Pancakes| stack
  photo -->|photo=Salmon| fish
  photo --> bowl
  %% stack: page "Pancakes with berries" /demo/meal-pancakes.jpg body="About 520 kcal. Fairly sure on the stack. The syrup is a guess: I can see the pool, not how much soaked in." points="How sure: fairly|Protein 12 g|Carbs 88 g|Fat 14 g"
  stack[Pancakes] --> syrup
  %% syrup: choose "How much syrup?" None|"A drizzle"|"A lot"
  syrup[Syrup] --> portion
  %% fish: page "Grilled salmon" /demo/meal-salmon.jpg body="About 560 kcal. Sure on the salmon, and it's most of the plate, so no questions." points="How sure: very|Protein 42 g|Carbs 12 g|Fat 38 g"
  fish[Salmon] --> portion
  %% bowl: page "Salmon poke bowl" /demo/meal-poke.jpg body="About 650 kcal. A rough guess: the rice is under the toppings, so its size is the big unknown." points="How sure: a rough guess|Protein 32 g|Carbs 78 g|Fat 22 g"
  bowl[Poke bowl] --> rice
  %% rice: choose "How much rice was under it?" "A small scoop"|"A regular bowl"|"A big bowl"
  rice[Rice] --> portion
  %% portion: choose "How much did you eat?" Half|"All of it"|"A bit more"|Double
  portion[Portion] --> meal
  %% meal: choose "Which meal was it?" Breakfast|Lunch|Dinner|Snack
  meal[Meal] --> logged((Saved))`,
  },
];

// The trainer's answer to trainer-session's event: the session its page showed, as the lines that
// run it. A move that hits a spot that hurts is left out. The playground plays it as the stand-in
// reply and the site chat sends it with no model turn, so the timer always matches the page.
const SESSIONS = {
  easy: { label: "Easy session", work: 30, rest: 30, moves: [["Squat to a chair", "Legs"], ["Wall push-up", "Shoulders Arms"], ["Glute bridge", "Back"], ["Dead bug", ""]] },
  quick: { label: "Quick hit", work: 20, rest: 10, moves: [["Squat", "Legs"], ["Push-up", "Shoulders Arms"], ["Mountain climber", "Shoulders"], ["Jumping jack", "Legs"]] },
  body: { label: "Bodyweight circuit", work: 40, rest: 20, moves: [["Squat", "Legs"], ["Push-up", "Shoulders Arms"], ["Reverse lunge", "Legs"], ["Plank", "Shoulders"]] },
  loaded: { label: "Strength circuit", work: 45, rest: 15, moves: [["Goblet squat", "Legs"], ["Row", "Back Arms"], ["Overhead press", "Shoulders Arms"], ["Romanian deadlift", "Back Legs"]] },
};
export function sessionReply(ev) {
  if (ev?.preset !== "flow" || ev.id !== "session" || !ev.flow) return null;
  const a = ev.flow;
  const s = SESSIONS[(ev.path || []).find((id) => SESSIONS[id])];
  if (!s) return null;
  // Only the flow's own areas: the event comes from the visitor, and these words land in the reply.
  const hurts = a.hurt === "It hurts" ? ["Legs", "Back", "Shoulders", "Arms"].filter((x) => [].concat(a.sore || []).includes(x)) : [];
  const moves = s.moves.filter(([, hits]) => !hurts.some((h) => hits.split(" ").includes(h))).map(([m]) => m);
  for (const m of ["Dead bug", "March in place"]) if (moves.length < 2 && !moves.includes(m)) moves.push(m);
  const warm = a.warm === "Yes, 3 minutes";
  const mins = Math.max(5, (Number(a.minutes) || 20) - (warm ? 3 : 0));
  const rounds = Math.max(4, Math.round((mins * 60) / (s.work + s.rest)));
  const text = `${s.label}: ${rounds} rounds, ${s.work} on, ${s.rest} off. One move a round: ${moves.join(", ").toLowerCase()}.${hurts.length ? ` Nothing for your ${hurts.join(" or ").toLowerCase()} today.` : ""} Hit start.`;
  // One line and the timer: on the chat's stage the line takes the timer as its picture, one chunk.
  return { text, lines: [`timer@session ${s.work}/${s.rest}x${rounds} "${s.label}"`] };
}

// The nutritionist's answer to nutritionist-plate's event: the row for his meals table (the app's
// schema, runtime/profiles/basil/tables.yui) and Today, his stat and macros chart against the goal.
// Numbers come from the flow's own options only: the event is the visitor's, the reply is shown.
const PLATES = {
  stack: { food: "Pancakes with berries", cal: 520, p: 12, c: 88, f: 14, ask: "syrup", fix: { None: [-100, 0, -26, 0], "A drizzle": [0, 0, 0, 0], "A lot": [100, 0, 26, 0] } },
  fish: { food: "Grilled salmon", cal: 560, p: 42, c: 12, f: 38 },
  bowl: { food: "Salmon poke bowl", cal: 650, p: 32, c: 78, f: 22, ask: "rice", fix: { "A small scoop": [-100, -2, -22, 0], "A regular bowl": [0, 0, 0, 0], "A big bowl": [150, 3, 33, 0] } },
};
const PORTIONS = { Half: 0.5, "All of it": 1, "A bit more": 1.5, Double: 2 };
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
export const GOAL = { cal: 2100, p: 140, c: 210, f: 70 };
export function plateReply(ev) {
  if (ev?.preset !== "flow" || ev.id !== "plate" || !ev.flow) return null;
  const a = ev.flow;
  const m = PLATES[(ev.path || []).find((id) => PLATES[id])];
  if (!m) return null;
  const d = (m.fix && m.fix[a[m.ask]]) || [0, 0, 0, 0];
  const portion = Object.hasOwn(PORTIONS, a.portion) ? a.portion : "All of it";
  const k = PORTIONS[portion];
  const [cal, p, c, f] = [m.cal, m.p, m.c, m.f].map((x, i) => Math.round((x + d[i]) * k));
  const meal = MEALS.includes(a.meal) ? a.meal : "Snack";
  const n = (x) => x.toLocaleString("en-US");
  const left = GOAL.cal - cal;
  const text = `Saved: ${m.food.toLowerCase()} for ${meal.toLowerCase()}, ${n(cal)} kcal. ${left >= 0 ? `Today so far: ${n(cal)} of ${n(GOAL.cal)}, ${n(left)} to go.` : `That's ${n(-left)} over ${n(GOAL.cal)} for today.`}`;
  return {
    text,
    lines: [
      `table create meals Day:date Meal:text Food:text Portion:text Cal:number:kcal Protein:number:g Carbs:number:g Fat:number:g`,
      `put meals Day=today Meal=${meal} Food="${m.food}" Portion="${portion}" Cal=${cal} Protein=${p} Carbs=${c} Fat=${f}`,
      `stat@kcal ${cal}kcal "Calories today" sub="of ${n(GOAL.cal)}. ${left >= 0 ? `${n(left)} to go.` : `${n(-left)} over.`}"`,
      `say "Macros against your goal."`,
      `chart@macros bar "Macros vs goal" x=Protein|Carbs|Fat y=${p}|${c}|${f} y2=${GOAL.p}|${GOAL.c}|${GOAL.f} names=Today|Goal unit=g`,
    ],
  };
}

// A crew flow answered with no model turn: the playground's stand-in reply and the site chat's.
export const crewReply = (ev) => sessionReply(ev) || plateReply(ev);

// Variants (spec/FLOWS.md, section 9): a saved flow with a few lines changed,
// kept as its base's name plus the lines, never a copy of the chart. The
// library lists each under its base; `flow restaurant-intake` runs one by name.
export const FLOW_VARIANTS = [
  {
    name: "restaurant-intake",
    base: "website-intake",
    id: "restaurant",
    agent: "Scout",
    blurb: "The website intake, made over for a restaurant: the menu and online orders instead of pages and products.",
    lines: `%% kind: choose "What kind of place?" "Dine in"|Takeout|Both
%% goal: choose "What should a visitor do first?" "See the menu"|"Book a table"|"Order online"|Call
drop today products pay pages
add menu after goal: pick "What goes on the menu page?" Breakfast|Lunch|Dinner|Drinks +other
add orders after menu: choose "Take orders online?" Yes|"Not yet"|No`,
  },
];

const slug = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// A saved flow by name: `flow website-intake` or `flow "Website intake"`.
// Starters only; savedGraph also finds variants.
export function savedFlow(name) {
  const s = slug(name);
  return STARTER_FLOWS.find((f) => f.name === s || slug(f.title) === s) || null;
}

// A variant as the lines an agent sends: the base, the new name, the changes.
export const variantLines = (v, id = v.id) => `flow@${id} ${v.base} as=${v.name}\n${v.lines}\nend`;

// The graph a saved flow runs, by name: a starter, or a variant built on its
// base (followed back at most five deep; a loop or a missing base is null).
// `extra` holds variants the phone keeps beyond these (My flows).
export function savedGraph(name, extra = [], depth = 0) {
  const f = savedFlow(name);
  if (f) {
    const patch = parse(flowLines(f)).find((o) => o.op === "patch");
    return { name: f.name, title: f.title, submit: f.submit, g: resolve("flow", patch.props) };
  }
  const s = slug(name);
  const v = [...extra, ...FLOW_VARIANTS].find((x) => x.name === s);
  if (!v || depth >= 5) return null;
  return variantGraph(v.base, parse(variantLines(v)).find((o) => o.op === "patch")?.props.changes, v.name, extra, depth);
}

// A variant's graph from its base's name and its changes (the patch a
// variant's `end` gives), titled from its name.
export function variantGraph(base, changes, as, extra = [], depth = 0) {
  const b = savedGraph(base, extra, depth + 1);
  if (!b) return null;
  const { name, title } = variantName(as);
  return { name, title, submit: b.submit, base: b.name, g: flowVariant(b.g, changes || []) };
}

// A starter as the lines an agent would send inline.
export const flowLines = (f, id = f.id) =>
  `flow@${id} "${f.title}" submit="${f.submit}"\n${f.source}\nend`;

// A graph drawn back as a Mermaid chart, for showing a variant (whose own
// lines are changes, not a chart). Steps read as their question or title;
// `changed` ids (added or reworded) get dashed boxes. Display only: the
// steps are not in it, so it is not a flow to send.
export function graphChart(g, changed = []) {
  const q = (t) => `"${String(t).replace(/"/g, "#quot;")}"`;
  const out = new Set((g.edges || []).map((e) => e.from));
  const lines = [`flowchart ${g.dir || "TD"}`];
  for (const n of g.nodes || []) {
    const text = n.props?.q || n.props?.title || n.label || n.id;
    const shape = n.preset ? `[${q(text)}]` : out.has(n.id) ? `{${q(text)}}` : `((${q(text)}))`;
    lines.push(`  ${n.id}${shape}`);
  }
  // A labelled edge that lands where the default edge does, with every later edge
  // out of that node landing there too, can never change the route: leave it out
  // (a reworded question keeps the base's labels, which no longer match).
  const edges = g.edges || [];
  const redundant = (e) => {
    if (!e.when) return false;
    const out = edges.filter((x) => x.from === e.from);
    const d = out.find((x) => !x.when);
    return d && d.to === e.to && out.slice(out.indexOf(e) + 1).every((x) => x.to === e.to);
  };
  for (const e of edges) if (!redundant(e)) lines.push(`  ${e.from} -->${e.label ? `|${q(e.label)}|` : ""} ${e.to}`);
  const mark = changed.filter((id) => (g.nodes || []).some((n) => n.id === id));
  if (mark.length) lines.push("  classDef changed stroke-width:3px,stroke-dasharray:6 4", `  class ${mark.join(",")} changed`);
  return lines.join("\n");
}

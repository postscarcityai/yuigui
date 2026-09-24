// The 10 benchmark screens. The playground loads these too, so what is
// measured is exactly what renders.
export const SCREENS = [
  {
    name: "Tabata timer",
    agent: "Arnold",
    yl: `timer 40/20x8 Tabata`,
  },
  {
    name: "Log a set",
    agent: "Arnold",
    yl: `say "Set 3 done. 225 x 5, bar speed looked good."
ask "Log this set?"`,
  },
  {
    name: "Pick a split",
    agent: "Arnold",
    yl: `choose "What are we training today?" Push|Pull|Legs +other`,
  },
  {
    name: "Gear check",
    agent: "Arnold",
    yl: `pick "What gear do you have?" Dumbbells|Bench|Bands|"Pull-up bar"|Kettlebell +other`,
  },
  {
    name: "Onboarding",
    agent: "Yui",
    yl: `say "Nice to meet you. A couple of quick ones."
form name:text! goal:voice submit="Next"
slide "How much do you know about AI?" 1-5 "Brand new"|"I run agents"`,
  },
  {
    name: "Today's workout",
    agent: "Arnold",
    yl: `list Today "Back squat 5x5 @ 225" "Bench 5x5 @ 185" "Barbell row 3x10" "Plank 3x60s" +check
>2 timer 90 Rest`,
  },
  {
    name: "Meal photo log",
    agent: "Arnold",
    yl: `camera "Snap your plate"
table meals`,
  },
  {
    name: "Macros so far",
    agent: "Arnold",
    yl: `table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10" "Chicken|280|53" "Greek yogurt|150|20"
slide "Protein left today (g)" 0-200 value=85 step=5`,
  },
  {
    name: "Book a client call",
    agent: "Urza",
    yl: `say "Thursday works. Which slot?"
choose "Client call, Thursday" "3:00 pm"|"4:00 pm" +other
ask "Send the invite now?" "Yes, send"|"Not yet"`,
  },
  {
    name: "Leg day card + voice log",
    agent: "Arnold",
    yl: `card "Leg day" "Squat, RDL, walking lunges. About 45 minutes." sub="Thursday" img=/yl/legday.svg cta="Start workout"
image /yl/meal.svg Last night's dinner
mic "What did you eat today?"`,
  },
];

// Playground-only demos for the non-preset lines. Not in the benchmark.
export const DEMOS = [
  {
    name: "Demo: live patch (~)",
    agent: "Arnold",
    yl: `timer@hiit 40/20x8 Tabata +auto
say "Try the agent line below: ~hiit rounds=10  or  ~hiit 30/10"`,
  },
  {
    name: "Demo: screens (>) and save/show",
    agent: "Arnold",
    yl: `list Warmup "Jumping jacks 60s" "Hip openers" "Goblet squat x10"
save warmup
>2 timer 45/15x6 Circuit
>3 say "Screen 3. Tap the screen tabs above the phone."
>3 ask "Ready for the circuit?"
show warmup`,
  },
  {
    name: "Demo: full screen (>full, close)",
    slug: "stage",
    agent: "Arnold",
    yl: `say "Tabata time. Eight rounds, 20 on and 10 off."
timer@hiit 20/10x8 Tabata +auto
ask "Log it when you're done?"
# swipe the stage down or tap the X: the timer keeps running in the pill
# a workout always opens full screen; +inline keeps anything else in the chat
timer 5m Cooldown walk +inline`,
    next: "close",
  },
  {
    name: "Demo: change your answer (+lock)",
    slug: "change-answers",
    agent: "Arnold",
    yl: `choose "Which split today?" Push|Pull|Legs
pick "What gear do you have?" Dumbbells|Bench|Bands|Kettlebell
slide "Energy" 1-5 "Wiped"|"Fired up"
# tap again to change an answer: the new event says changed: true
# send ~choose +lock from the agent console to freeze the choose`,
    next: "~choose +lock",
  },
  {
    name: "Demo: custom {json} escape hatch",
    agent: "Urza",
    yl: `say "No preset fits a split-flap countdown, so the agent drops to custom."
custom {"type":"stack","children":[{"type":"badge","text":"Launch"},{"type":"text","text":"Plannix V2 goes live","size":"lg"},{"type":"row","children":[{"type":"stat","label":"days","value":"99"},{"type":"stat","label":"hours","value":"14"}]},{"type":"button","text":"Open checklist","action":"checklist"}]}
custom {oops not json}`,
  },
];

// Media presets. Each has a slug so /playground?demo=<slug> opens it.
// Images and the reel live in site/public/demo/.
export const MEDIA = [
  {
    slug: "gallery-row3d",
    name: "Gallery: coverflow (row3d)",
    agent: "Urza",
    yl: `gallery "Studio shoot" /demo/g1.jpg|"On the wheel" /demo/g2.jpg|"Mug shelf" /demo/g3.jpg|"The kiln room" /demo/g5.jpg|Trimming /demo/g6.jpg|"First coffee" layout=row3d
say "Swipe the stack, tap the front photo to open it full screen."`,
  },
  {
    slug: "gallery-pick",
    name: "Gallery: pick favorites (grid)",
    agent: "Urza",
    yl: `say "Six shots from the studio. Pick up to three for the homepage."
gallery /demo/g1.jpg /demo/g2.jpg /demo/g3.jpg /demo/g4.jpg /demo/g5.jpg /demo/g6.jpg layout=grid +pick max=3 submit="Use these"`,
  },
  {
    slug: "gallery-feed",
    name: "Gallery: feed, images and a video",
    agent: "Urza",
    yl: `gallery "This week at the studio" /demo/reel.mp4|"Launch reel, first cut" /demo/g4.jpg|"Figs on the speckled plate" /demo/g2.jpg|"New glazes" layout=feed`,
  },
  {
    slug: "gallery-row",
    name: "Gallery: swipe row",
    agent: "Urza",
    yl: `gallery Mugs /demo/g2.jpg /demo/g6.jpg /demo/after_mug.jpg /demo/before_mug.jpg
ask "Add these to the shop page?"`,
  },
  {
    slug: "video",
    name: "Video: review a cut",
    agent: "Urza",
    yl: `video /demo/reel.mp4 "Launch reel, first cut" poster=/demo/reel-poster.jpg
ask "Ship this cut?" Ship|"One more pass"`,
  },
  {
    slug: "video-loop",
    name: "Video: loop + autoplay, and one to generate",
    agent: "Urza",
    yl: `video /demo/reel.mp4 +loop +auto
video "a slow pan across glazed mugs on a sunny shelf"`,
  },
  {
    slug: "compare-slider",
    name: "Compare: slider with highlights",
    agent: "Urza",
    yl: `say "Here's the room with your three changes. Drag the handle."
compare /demo/before_room.jpg /demo/after_room.jpg "Living room" notes="Sage green wall|Bigger plant, moved|Jute rug" hl=45,4,53,45|19,25,20,54|16,78,83,21
ask "Keep it?" Keep|"Try another color"`,
  },
  {
    slug: "compare-pick",
    name: "Compare: A/B pick (side by side)",
    agent: "Urza",
    yl: `compare /demo/before_mug.jpg /demo/after_mug.jpg "Which shot for the shop?" mode=side labels=Studio|Window +pick`,
  },
  {
    slug: "compare-toggle",
    name: "Compare: tap to toggle",
    agent: "Urza",
    yl: `compare /demo/before_mug.jpg /demo/after_mug.jpg "Background swap" mode=toggle notes="Same mug, new scene"`,
  },
  {
    slug: "storyboard",
    name: "Storyboard: launch reel",
    agent: "Urza",
    yl: `storyboard "Launch reel" /demo/s1.jpg|"Quiet morning" /demo/s2.jpg|"The old chipped mug" /demo/s3.jpg|"Unwrap the new one" /demo/s4.jpg|"First sip, logo" +reorder
say "Reorder the frames or comment on any one. Then I'll cut the video."`,
  },
  {
    slug: "storyboard-script",
    name: "Storyboard: script before pictures",
    agent: "Urza",
    yl: `storyboard "Post: why handmade" notes="Hook: your mug is lying to you|Problem: factory glaze chips|Proof: 1,300 degree firing|CTA: shop the drop" +reorder`,
  },
  {
    slug: "image-edit",
    name: "Image edit: mark what to change",
    agent: "Urza",
    yl: `image /demo/before_room.jpg +edit "Circle or box what to change"`,
  },
  {
    slug: "edit-loop",
    name: "Image edit: mark it, get a compare back",
    agent: "Urza",
    yl: `say "Mark the wall and tell me what you want."
image@room /demo/before_room.jpg +edit
say "When the edit event lands, the agent answers with the agent line below."`,
    next: `compare /demo/before_room.jpg /demo/after_room.jpg Done notes="Sage green wall" hl=45,4,53,45`,
  },
];

// Data and science presets (YUI-17): chart, stat, math, step, calc, table.
// Each has a slug so /playground?demo=<slug> opens it; add &theme=light for
// the light phone.
export const SCIENCE = [
  {
    slug: "chart-line",
    name: "Chart: line, two series",
    agent: "Yui",
    yl: `chart line "Weight this week" x=Mon|Tue|Wed|Thu|Fri|Sat|Sun y=181.2|180.6|180.9|179.8|179.4|179.6|178.9 y2=181|180.5|180|179.5|179|178.5|178 names=Actual|Plan unit=lb
say "Half a pound ahead of plan. Tap a day for the numbers."`,
  },
  {
    slug: "chart-bar",
    name: "Chart: bars with error bars",
    agent: "Yui",
    yl: `chart bar "Yield by fertilizer" x=None|Low|Mid|High y=2.1±0.3|3.4±0.4|4.6±0.5|4.8±0.7 y2=2.0±0.2|3.1±0.3|4.1±0.4|4.0±0.6 names=Tomato|Pepper unit=kg
say "Error bars are one standard deviation over 5 plots. Mid and High overlap, so Mid is the better buy."`,
  },
  {
    slug: "chart-area",
    name: "Chart: stacked area and stacked bars",
    agent: "Yui",
    yl: `chart area "Macros by day" x=Mon|Tue|Wed|Thu|Fri y=160|172|150|181|166 y2=210|240|180|260|220 y3=70|64|80|72|68 names=Protein|Carbs|Fat unit=g +stack
chart bar "Sleep stages" x=Mon|Tue|Wed|Thu|Fri y=1.6|1.2|1.9|1.4|1.7 y2=4.1|3.8|4.4|3.6|4.2 y3=1.8|1.5|2.0|1.3|1.9 names=Deep|Light|REM unit=h +stack`,
  },
  {
    slug: "chart-scatter",
    name: "Chart: scatter with error bars (dose response)",
    agent: "Yui",
    yl: `chart scatter "Enzyme rate vs substrate" x=0.5|1|2|4|8|16|32 y=0.9|1.6|2.6|3.7|4.5|5.0|5.2 err=0.15|0.2|0.2|0.3|0.3|0.35|0.4 unit=µmol/min xlabel="Substrate (mM)"
math caption="Michaelis-Menten: the curve flattens at V_max" v = \\frac{V_{max}[S]}{K_m + [S]}`,
  },
  {
    slug: "chart-pie",
    name: "Chart: donut and pie",
    agent: "Yui",
    yl: `chart donut "Where the week went" x="Deep work"|Meetings|Email|Admin|Breaks y=14|9|6|4|5 unit=h
chart pie "Air by volume" x=Nitrogen|Oxygen|Argon|Other y=78.08|20.95|0.93|0.04 unit=%`,
  },
  {
    slug: "chart-table",
    name: "Chart: bound to a live table",
    agent: "Yui",
    yl: `table@wk Weigh-ins Day|Weight|Waist "Mon|181.2|34.5" "Tue|180.6|34.4" "Wed|180.9|34.4" "Thu|179.8|34.2" units=|lb|in +sort
chart line data=wk x=Day y=Weight
say "Send the agent line below: the table updates and the chart follows."`,
    next: `~wk Day|Weight|Waist "Mon|181.2|34.5" "Tue|180.6|34.4" "Wed|180.9|34.4" "Thu|179.8|34.2" "Fri|179.1|34.1" "Sat|178.7|34.0"`,
  },
  {
    slug: "stat",
    name: "Stat: big numbers with deltas and sparklines",
    agent: "Yui",
    yl: `stat 178.9lb Weight delta=-2.3 spark=181.2|180.6|180.9|179.8|179.4|179.6|178.9 good=down sub="this week"
stat 52bpm "Resting heart rate" delta=-3 spark=56|55|55|54|53|53|52 good=down
stat 7.4h Sleep delta=+0.6 spark=6.5|6.9|7.1|6.8|7.3|7.6|7.4 sub="7-day average"
say "Tap lb to see kg."`,
  },
  {
    slug: "stat-lab",
    name: "Stat: lab readings, units aware",
    agent: "Yui",
    yl: `stat 37.4degC "Incubator" delta=0.2 spark=37.1|37.2|37.2|37.3|37.4 sub="target 37.0"
stat 7.38 "Buffer pH" delta=-0.02 spark=7.41|7.40|7.40|7.39|7.38
stat 1.2e-3mol/L "Stock concentration"
stat $1840 "Grant left this month" delta=-420 good=up`,
  },
  {
    slug: "math",
    name: "Math: equations (KaTeX)",
    agent: "Yui",
    yl: `math E = mc^2
math caption="Bayes' rule" P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)}
math caption="Schrödinger, time dependent" size=sm i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)`,
  },
  {
    slug: "math-lesson",
    name: "Math: a mini lesson with a quiz",
    agent: "Yui",
    yl: `say "The quadratic formula solves any ax² + bx + c = 0."
math size=lg x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
math caption="The discriminant decides how many real roots" \\Delta = b^2 - 4ac
choose "If Δ < 0, how many real roots?" "Two"|"One"|"None"`,
  },
  {
    slug: "table-sort",
    name: "Table: sortable, with units",
    agent: "Yui",
    yl: `table Planets Planet|Mass|Radius|Day "Mercury|0.330|2440|4222.6" "Venus|4.87|6052|2802" "Earth|5.97|6371|24" "Mars|0.642|3390|24.7" "Jupiter|1898|69911|9.9" units=|10^24kg|km|h +sort
say "Tap a column to sort."`,
  },
  {
    slug: "table-bound",
    name: "Table: bound agent table, sortable",
    agent: "Arnold",
    yl: `table meals units=|||g +sort
chart bar data=meals x=Meal y=Protein unit=g`,
  },
  {
    slug: "calc-projectile",
    name: "Calc: projectile range (sliders drive the chart)",
    agent: "Yui",
    yl: `calc "How far does it fly?" f="R = v^2*sin(2*a)/g" v=5-40@20m/s a=0-90@30deg g=9.81m/s^2 plot=a unit=m
say "Slide the angle. The range peaks at 45 degrees, whatever the speed."`,
  },
  {
    slug: "calc-decay",
    name: "Calc: radioactive decay",
    agent: "Yui",
    yl: `calc "Carbon-14 left after t years" f="N = N0*exp(-ln(2)*t/h)" t=0-30000@5730yr N0=100% h=5730yr unit=%
ask "Guess: how much is left after two half-lives?" 50%|25%|"12.5%"`,
  },
  {
    slug: "calc-pendulum",
    name: "Calc: pendulum period",
    agent: "Yui",
    yl: `calc Pendulum f="T = 2*pi*sqrt(L/g)" L=0.1-3@1m g=1.6-25@9.81m/s^2 plot=L unit=s digits=3
say "Slide g to 1.62 to swing it on the Moon."`,
  },
  {
    slug: "step-derivation",
    name: "Step: a derivation, one step at a time",
    agent: "Yui",
    yl: `step title="How long to fall d meters?" "Start from constant acceleration, from rest" $ d = \\tfrac{1}{2} g t^2
step "Multiply both sides by 2" $ 2d = g t^2
step "Divide by g" $ t^2 = \\frac{2d}{g}
step "Take the positive root" $ t = \\sqrt{\\frac{2d}{g}}
step "Check: 20 m on Earth" $ t = \\sqrt{\\frac{2 \\cdot 20}{9.81}} \\approx 2.0\\,\\text{s}`,
  },
  {
    slug: "step-protocol",
    name: "Step: a lab protocol with timers",
    agent: "Yui",
    yl: `step title="Gram stain" "Heat-fix the smear. Flood with crystal violet." time=1m
step "Rinse gently with water. Flood with iodine." time=1m
step "Decolorize with alcohol, drop by drop, until it runs clear." time=10s
step "Rinse. Counterstain with safranin." time=45s
step "Rinse, blot dry, and view under oil immersion. Purple is Gram positive, pink is Gram negative."`,
  },
  {
    slug: "step-all",
    name: "Step: all at once, tap to check off",
    agent: "Arnold",
    yl: `step title="Warm-up" +all "Jumping jacks" time=1m
step "Hip openers, 5 each side"
step "Goblet squat, 10 slow reps"
step "Band pull-aparts" time=45s`,
  },
];

// Decks, plans and walkthroughs (YUI-18). Each has a slug for /playground?demo=.
export const FLOWS = [
  {
    slug: "deck-lesson",
    name: "Deck: a lesson with a quiz",
    agent: "Yui",
    yl: `deck "How mRNA vaccines work"
page "How mRNA vaccines work" /demo/mrna1.jpg notes="An mRNA vaccine is a set of instructions wrapped in a tiny bubble of fat. Four steps."
page "1. Delivery" /demo/mrna2.jpg body="The shot goes into your arm muscle. Lipid nanoparticles carry the mRNA into nearby cells." notes="The fat bubble matters: bare mRNA falls apart fast and cannot get into a cell on its own."
page "2. Your cells read it" /demo/mrna3.jpg body="Ribosomes read the mRNA like a recipe and build the spike protein, the same shape that sits on the virus." notes="The mRNA never enters the nucleus, where your DNA is kept. It is read out in the cytoplasm."
page "3. The immune system learns" /demo/mrna4.jpg points="Spike pieces show up on the cell surface|B cells make antibodies that fit them|T cells learn to spot infected cells" notes="The body gets a practice target without ever meeting the virus."
page "4. The message fades" /demo/mrna5.jpg body="Cells break the mRNA down within days. Memory B and T cells stay, ready if the real virus shows up."
choose "Where is the mRNA read?" Nucleus|Cytoplasm|"The blood" answer=Cytoplasm why="Ribosomes in the cytoplasm read it. It never reaches your DNA."
pick "What is still there a month later?" "Memory B cells"|"Memory T cells"|"The mRNA"|"The fat bubbles" answer="Memory B cells"|"Memory T cells" why="The message and its bubble break down in days. The memory cells are what last."`,
  },
  {
    slug: "deck-scroll",
    name: "Deck: text pages, scroll layout",
    agent: "Urza",
    yl: `deck "Writing a first draft" layout=scroll
page "Get it down, then get it right" body="A first draft is for you. Nobody else reads it."
page "Three rules" points="Write fast, fix later|Leave gaps as [TK] and keep going|Stop mid-sentence so tomorrow starts easy"
page "Tomorrow" body="Read it once, cut a third, then send it to one person." notes="End on the next action, not a summary."`,
  },
  {
    slug: "plan-findings",
    name: "Plan: findings, then questions, one Send",
    agent: "Yui",
    yl: `say "Here is what the last build fixed, then two picks for next."
plan@review "Build review" submit="Send picks"
page "What broke" "Two buttons only took taps on their icon, so the gallery X felt dead and the Done pill hid under a tile." points="Gallery X: now a full 44pt target|Done pill: no tile covers it anymore|Checked with taps off center, not just dead center"
page "What is new" "Hold any reply to react. Your reaction goes to the agent as one turn, with the message quoted, and the badge stays on the bubble." points="Six reactions: build it, no, not sure, love it, later, priority|Works on handoffs from other agents too"
choose@next "What should the composer get next?" Files|"Voice notes as audio"|"Ship a TestFlight build" +other
pick@where "Where should it show up first?" "The app"|"The site"|"Both"`,
  },
  {
    slug: "plan-website",
    name: "Plan: a new website, step by step",
    agent: "Urza",
    yl: `say "Five quick ones and I'll set up the project."
plan@site "New website"
choose@kind "What kind of site?" Portfolio|Shop|"Local business"|Blog +other
pick@pages "Which pages?" Home|About|Services|Pricing|Contact|Blog
slide@budget "Budget, in thousands of dollars" 1-20 value=5
form@brand "About the brand" name:text! tagline:text vibe:Calm|Bold|Playful submit="Next"
ask@launch "Launch before the holidays?" "Yes, Dec 1"|"No rush"`,
  },
  {
    slug: "plan-training",
    name: "Plan: a training intake",
    agent: "Arnold",
    yl: `plan@month "Your first month" submit="Build my plan"
choose@goal "What's the goal?" "Get stronger"|"Lose fat"|"Run a 5k" +other
slide@days "Days a week you can train" 2-6 value=3
pick@gear "What do you have?" Dumbbells|Barbell|Bands|Kettlebell|"Just me"
mic@notes "Anything I should know? Injuries, schedule, what you hate."`,
  },
  {
    slug: "project-card",
    name: "Project: a card that reopens the plan",
    agent: "Urza",
    yl: `>plan
plan@site "Kiln & Co. website"
choose@kind "What kind of site?" Portfolio|Shop|"Local business" +other
pick@pages "Which pages?" Home|Classes|Visit|Shop
ask@launch "Launch before the holidays?" "Yes, Dec 1"|"No rush"
save site-plan
>1
say "Picking up where we left off."
project "Kiln & Co. website" status=Planning progress=40 img=/demo/site_after_hero.jpg body="A small site for a pottery studio: book a class in two taps." facts="Kind: Local business|Pages: Home, Classes, Visit|Launch: Dec 1" next="Pick a template|Write the class copy" open=site-plan cta="Reopen the plan"`,
  },
  {
    slug: "narrate-site",
    name: "Narrate: a website update, before and after",
    agent: "Urza",
    next: `ask "Publish the update?" "Yes, publish"|"Not yet"`,
    yl: `narrate "What changed on the site" voice=agent
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "1. The hero" hl=3,28,50,46|84,2,15,8 notes="Headline says what you get|One booking button, top right too" say="First, the hero. The old headline said welcome to our website. The new one says what you will make, and when. There is one clear button to book, and it repeats top right."
compare /demo/site_before_classes.jpg /demo/site_after_classes.jpg "2. Classes" hl=3,16,94,56 notes="Three cards with a photo and a price" say="Next, classes. A wall of text became three cards, each with a photo and a price, so nobody has to email to ask what it costs."
compare /demo/site_before_visit.jpg /demo/site_after_visit.jpg "3. Visit us" hl=4,7,54,86|62,7,35,80 notes="A map|Hours and parking in a table" say="Last, the visit section. There is a map, the hours and parking sit in a table, and the same booking button closes the page."`,
  },
  {
    slug: "narrate-lesson",
    name: "Narrate: the lesson deck, read aloud",
    agent: "Yui",
    yl: `narrate "mRNA vaccines in one minute" voice=agent
deck "How mRNA vaccines work"
page "How mRNA vaccines work" /demo/mrna1.jpg notes="An mRNA vaccine is a set of instructions wrapped in a tiny bubble of fat. Here is what happens after the shot."
page "1. Delivery" /demo/mrna2.jpg body="Lipid nanoparticles carry the mRNA into arm muscle cells." notes="The shot goes into your arm. Tiny fat bubbles carry the message into nearby cells."
page "2. Your cells read it" /demo/mrna3.jpg body="Ribosomes build the spike protein from the recipe." notes="Ribosomes read the message like a recipe and build the spike protein. The message never touches your DNA."
page "3. The immune system learns" /demo/mrna4.jpg body="Antibodies and T cells learn the spike's shape." notes="The spike shows up on the cell surface, and your immune system learns its shape."
page "4. The message fades" /demo/mrna5.jpg body="The mRNA is gone in days. Memory cells stay." notes="Within days the message is broken down. The memory cells stay, ready for the real thing."
choose "Where is the mRNA read?" Nucleus|Cytoplasm|"The blood" answer=Cytoplasm why="Ribosomes in the cytoplasm read it." say="Quick check. Where is the message read?"`,
  },
  {
    slug: "narrate-storyboard",
    name: "Narrate: a storyboard, frame by frame",
    agent: "Yui",
    yl: `narrate "Launch reel, the script" voice=agent rate=1.05
storyboard "Launch reel" /demo/s1.jpg|"Open on hands at the wheel. No music yet." /demo/s2.jpg|"The problem: every mug in the shop looks the same." /demo/s3.jpg|"Cut to the glaze wall, slow push in." /demo/s4.jpg|"End card: book a class, link in bio."`,
  },
];

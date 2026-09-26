import { STARTER_FLOWS, flowLines } from "./starter-flows.mjs";

// The 10 benchmark screens. The playground loads these too, so what is
// measured is exactly what renders.
export const SCREENS = [
  {
    name: "Tabata timer",
    agent: "Coach",
    yl: `timer 40/20x8 Tabata`,
  },
  {
    name: "Log a set",
    agent: "Coach",
    yl: `say "Set 3 done. 225 x 5, bar speed looked good."
ask "Log this set?"`,
  },
  {
    name: "Pick a split",
    agent: "Coach",
    yl: `choose "What are we training today?" Push|Pull|Legs +other`,
  },
  {
    name: "Gear check",
    agent: "Coach",
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
    agent: "Coach",
    yl: `list Today "Back squat 5x5 @ 225" "Bench 5x5 @ 185" "Barbell row 3x10" "Plank 3x60s" +check
>2 timer 90 Rest`,
  },
  {
    name: "Meal photo log",
    agent: "Coach",
    yl: `camera "Snap your plate"
table meals`,
  },
  {
    name: "Macros so far",
    agent: "Coach",
    yl: `table Macros Food|Cal|Protein "Eggs|140|12" "Oats|300|10" "Chicken|280|53" "Greek yogurt|150|20"
slide "Protein left today (g)" 0-200 value=85 step=5`,
  },
  {
    name: "Book a client call",
    agent: "Scout",
    yl: `say "Thursday works. Which slot?"
choose "Client call, Thursday" "3:00 pm"|"4:00 pm" +other
ask "Send the invite now?" "Yes, send"|"Not yet"`,
  },
  {
    name: "Leg day card + voice log",
    agent: "Coach",
    yl: `card "Leg day" "Squat, RDL, walking lunges. About 45 minutes." sub="Thursday" img=/yl/legday.svg cta="Start workout"
image /yl/meal.svg Last night's dinner
mic "What did you eat today?"`,
  },
];

// Playground-only demos for the non-preset lines. Not in the benchmark.
export const DEMOS = [
  {
    name: "Demo: live patch (~)",
    agent: "Coach",
    yl: `timer@hiit 40/20x8 Tabata +auto
say "Try the agent line below: ~hiit rounds=10  or  ~hiit 30/10"`,
  },
  {
    name: "Demo: screens (>) and save/show",
    agent: "Coach",
    yl: `list Warmup "Jumping jacks 60s" "Hip openers" "Goblet squat x10"
save warmup
>2 timer 45/15x6 Circuit
>3 say "Screen 3. Tap the screen tabs above the phone."
>3 ask "Ready for the circuit?"
show warmup`,
  },
  {
    name: "Demo: the shelf (save, show, forget)",
    slug: "shelf",
    agent: "Coach",
    yl: `say "Busy-day Tabata. It's on your shelf now: tap it up top any time."
>full
timer@hiit 20/10x8 Tabata
save busy day
close
form "Morning check-in" sleep:1-10 energy:1-5 submit="Log it"
save check-in
say "Try the agent line below: show busy day  or  forget check-in"`,
  },
  {
    name: "Demo: full screen (>full, close)",
    slug: "stage",
    agent: "Coach",
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
    agent: "Coach",
    yl: `choose "Which split today?" Push|Pull|Legs
pick "What gear do you have?" Dumbbells|Bench|Bands|Kettlebell
slide "Energy" 1-5 "Wiped"|"Fired up"
# tap again to change an answer: the new event says changed: true
# send ~choose +lock from the agent console to freeze the choose`,
    next: "~choose +lock",
  },
  {
    // The working row (spec/YL.md section 5, YUI-63 step 2): the doing lines
    // take the working word's place while the turn runs, then the reply lands.
    name: "The working row: the agent says what it is doing",
    slug: "working",
    agent: "Yui",
    working: { me: "Plan my runs this week around the weather" },
    yl: `doing "Reading your calendar" 1/3
doing "Checking the weather" 2/3
doing "Drafting the plan" 3/3
say "Three runs fit. Thursday is dry, so the long one goes there."
list "Mon easy 5k"|"Thu long 10k"|"Sat tempo 6k" +check
choose "Put them on your calendar?" "Add all three"|"Just Thursday" +other`,
  },
  {
    // Group threads (spec/GROUPS.md, YUI-77 step 1): the lines are Sage's reply,
    // answering Coach's handoff. The rows above and the guard below are the app's.
    name: "Group thread: three agents, one handoff",
    slug: "group-thread",
    agent: "Sage",
    group: {
      title: "Race week", members: ["Coach", "Sage", "Quill"], lead: "Coach", hops: 1,
      before: [
        { me: "@Coach plan my week before Saturday's 10k" },
        { agent: "Coach", yl: `say "Five days, easy then sharp. Rest Friday."
list Week "Mon easy 5k"|"Tue strides"|"Thu 3k at race pace"|"Fri rest"|"Sat 10k" +check
say "@Sage can you fit a wind-down before bed each night?"` },
        { handoff: { from: "Coach", to: "Sage", ask: "fit a wind-down before bed each night" } },
      ],
      guard: { from: "Sage", to: "Quill", ask: "turn the wind-down into flash cards", hops: 2,
        then: `say "Four cards, one per step. Tap to flip."
card "Box breathing" "In 4, hold 4, out 4, hold 4. Four rounds." cta="Start"` },
    },
    yl: `say "Four minutes each night, lights low, after the run days."
list Wind-down "Lights low"|"Box breathing, 4 rounds"|"Legs up the wall, 2 min"|"Phone out of the room"
choose "Which nights?" "Run days"|"Every night"
say "@Quill can you turn the wind-down into flash cards?"`,
  },
  {
    // Shared agents (spec/AGENTS.md "Shared agents", YUI-57 step 1): the lines are
    // Yui's invite plan for the owner. The client's first open is the app's own
    // screen (playground/invite.js), switched with the tabs above the phone.
    name: "Invite a client: their agents are waiting",
    slug: "client-invite",
    agent: "Yui",
    invite: {
      owner: "Sam", client: "Maya", revoked: "Basil",
      agents: [
        { name: "Penny", what: "Assistant", c: "#4AA8F0", bg: "#F2F8FF",
          preview: "Hi Maya, I'm Penny. I keep your week in order.",
          hello: `say "Hi Maya, I'm Penny. I keep your week in order."
choose "Where should we start?" "This week's plan"|"A to-do list"|"Just say hi"` },
        { name: "Basil", what: "Nutritionist", c: "#7FA650", bg: "#F6F8EF",
          preview: "Hi Maya, I'm Basil. Send me a photo of any meal.",
          hello: `say "Hi Maya, I'm Basil. Send me a photo of any meal and I'll tell you what's in it."
ask "Want a quick check-in each evening?" "Yes, at 7"|"Not now"` },
      ],
    },
    yl: `say "Two of your agents are safe to share. Pick who gets what."
plan@invite "New client invite" submit=Invite
page "Who can be shared" body="Only agents marked safe to share show up here. Each one runs in its own sandbox: no shell, none of your files, nothing from your other clients." points="Penny, an assistant. Safe to share|Basil, a nutritionist. Safe to share|Scout is hidden: it has a shell on your computer"
form@who "Who is it for?" first:text! last:text! "Apple ID email":email! phone:phone
pick@agents "Which agents do they get?" "Penny, assistant"|"Basil, nutritionist"
choose@look "How should they look?" "Each agent's own"|Candy|Ocean|Forest
form@hello "What does each one say first?" "Penny says":long! "Basil says":long!
choose@save "Save this as a template?" "Save as client-default"|"Just this once"`,
  },
  {
    // The starter agent (spec/STARTER.md, YUI-37 step 1): a first launch with no
    // agent. Pick a starter and it answers right away; the playground has no
    // model, so a stand-in (playground/starter.js) sends what a starter would.
    name: "Starter agent: no agent yet, pick one, first answer",
    slug: "starter",
    agent: "Yui",
    yl: `sketch "Agents" frame=phone
row "Yui" +hi note="always here"
row "No agents yet" +dim
row "Add agent" +button +dim note="needs a computer today"
say "No agents yet? Start with one of mine. It answers right here, nothing to install."
choose@starter "Who do you want first?" "Coach, trainer"|"Basil, nutritionist"|"Penny, assistant"|"Quill, study buddy"`,
  },
  {
    // The model on the phone (spec/ON-DEVICE.md, YUI-41 step 1): the lines are
    // Coach's last reply. The tabs above the phone show what Apple's on-device
    // model adds around it (playground/ondevice.js): reply chips, a route pill in
    // a group, a summed-up push line and an offline draft. Edit the question and
    // the chips follow.
    name: "On this phone: suggested replies, routing, offline drafts",
    slug: "on-device",
    agent: "Coach",
    ondevice: true,
    yl: `stat@weight 178.9lb Weight delta=-2.3 good=down sub="since Monday"
card "Saturday: 10k" "Race pace 5:40. Easy miles until then."
say "Tomorrow: rest day or a light 3k?"`,
  },
  {
    // Key vault (spec/VAULT.md, YUI-34 step 1): the lines are Penny's reply just
    // before she asks for fal. The tabs above the phone are the app's own screens
    // (playground/vault.js): Settings > Keys, the add sheet, the ask sheet Yui
    // draws (never Yui Lines, so no agent can fake it) and the drawer's grants.
    // Placeholder keys only.
    name: "Key vault: your keys on your phone, agents ask",
    slug: "vault",
    agent: "Penny",
    vault: true,
    yl: `card "Avatars for your agents" "One picture each, in their colors. Drawn with fal, on your own fal account."
say "I'll ask Yui for your fal key. You decide, and I never see the key."`,
  },
  {
    // Encrypted sync (spec/SYNC.md, YUI-36 step 1): the lines are Coach's reply,
    // a workout table on the phone. The tabs above the phone are Settings > Sync
    // (playground/sync.js): off by default, turn on, pair an iPad by QR, the
    // device list, and turn off, which deletes the relay's copy. v1 ships
    // without sync; this is the design for a second device.
    name: "Encrypted sync: your tables on a second device",
    slug: "sync",
    agent: "Coach",
    sync: true,
    yl: `table create lifts Day:date Lift:text Weight:number:lb Reps:number
put lifts Day=today-2 Lift=Squat Weight=225 Reps=5
put lifts Day=today Lift=Squat Weight=235 Reps=5
query lifts sort=Day as table "Lifts"`,
  },
  {
    // Widgets and Siri (spec/WIDGETS.md, YUI-40 step 1): the lines are Coach's
    // reply, three pages each saved. A widget is a pinned saved screen, so the
    // home screen, lock screen and Siri tabs above the phone draw these saved
    // screens (playground/widgets.js). Edit a line and the widgets follow.
    name: "Widgets and Siri: saved screens on the home screen",
    slug: "widgets",
    agent: "Coach",
    widgets: true,
    yl: `>2 stat@weight 178.9lb Weight delta=-2.3 spark=181.2|180.6|179.8|178.9 good=down sub="since Monday"
>2 save weight
>3 list@today Today "Stretch 10 min" "Protein at lunch" "Walk 30 min" "Bed by 11" +check
>3 save today
>4 timer@stretch 10m Stretch
>4 save stretch`,
  },
  {
    // Restyle Yui by asking (spec/RESTYLE.md, YUI-43 step 1): the lines are the
    // agent's reply. The preview card, the restyled chrome and Settings are the
    // app's own screens (playground/restyle.js), switched with the tabs above
    // the phone. Try `theme app ocean`, `theme app accent=#FFE600` or `theme app reset`.
    name: "Restyle Yui by asking: preview, apply, reset",
    slug: "restyle",
    agent: "Yui",
    restyle: true,
    yl: `say "Autumn for all of Yui. Here it is beside what you have now."
theme app autumn`,
  },
  {
    // Agent controls (spec/CONTROLS.md, YUI-70 step 1): a mock of the drawer's
    // Controls tab drawn with plain presets, one screen per area. In the app
    // these are native screens that talk to the host with no chat turn.
    name: "Agent controls: personality, memory, skills, schedules",
    slug: "controls",
    agent: "Scout",
    yl: `say "Scout's controls. One screen per area: use the screen tabs up top."
list Controls Personality|Memory|Skills|Schedules|"Model and tools"|Channels +num
card "Changes go straight to your Mac" "No chat turn in between. Secrets stay on your Mac, and every delete asks first." sub="owner only"
>2 card "Personality" "Warm, quick, a little playful. Short sentences. Answers with screens, not paragraphs." tag=SOUL.md sub="edited Sep 24"
>2 form "Edit personality" "SOUL.md":long! submit=Save
>3 list Remembers "Prefers short replies"|"Trains mornings at 6:30"|"Vegetarian since spring"|"Likes the dark theme"
>3 card "Prefers short replies" "Short sentences, no filler. Screens over paragraphs." tag=Memory sub="remembered Sep 22"
>3 form "Edit memory" memory:long submit=Save
>3 ask "Forget this? Scout will not remember it next time." Forget|"Keep it"
>4 list Skills "morning-brief, the 8:00 summary"|"meal-log, photo to macros"|"tan-studio, find a free slot"|"web-search, look things up" +check
>4 card "tan-studio" "Finds a free slot at the studio and books it." tag=Skill sub="added Sep 20 · on"
>4 ask "Delete the skill tan-studio? Its folder goes to the trash for 30 days." Delete|"Keep it"
>5 card "Morning brief" "What is on today, the weather, one thing to try." tag=Schedule sub="weekdays 8:00 · next Mon 8:00" cta="Run now"
>5 card "Weekly review" "What shipped, what is next." tag=Paused sub="Fri 17:00 · paused" cta=Resume
>5 form "Edit morning brief" prompt:long! when:"Every day"|Weekdays|Weekly time:time submit=Save
>5 ask "Pause the morning brief?" Pause|"Keep it"
>6 card "Model" "Claude, running on this Mac." tag="Read only" sub="editing comes later"
>6 list Tools "Web: on"|"Files: on"|"Images: on"|"Shell: off"
>6 list Channels "Telegram"|"Email"`,
  },
  {
    // Talk about this (spec/TALK-ABOUT.md, YUI-69 step 1): a mock drawn with
    // plain presets. In the app the chip is native, and the before and after
    // plus the Apply choose come from the host plugin, built from the real file.
    name: "Talk about this: change a setting by talking",
    slug: "talk-about",
    agent: "Scout",
    yl: `say "Talk about a setting. Four steps, one per screen tab up top."
list "Open an item in Controls"|"It rides the composer as a chip"|"Scout proposes a before and after"|"One tap applies it" +num
>2 card "Personality" "Warm, quick, a little playful. Short sentences. Answers with screens, not paragraphs." tag=SOUL.md sub="Controls · edited Sep 24" cta="Talk about this"
>2 say "A memory, a skill or a schedule has the same button."
>3 sketch "Your message" frame=phone
>3 row "SOUL.md · Personality" +button +hi note="the chip, x removes it"
>3 row "Less playful when I'm working. Keep the warmth." note="your words"
>3 row "Send" +button
>3 card "What Scout gets" "A line naming the item, then your words. Your Mac adds the file itself, keys hidden." tag=Attach sub="owner only"
>4 say "Quieter while you work, same warmth after."
>4 sketch "SOUL.md" frame=window before=Now
>4 row "Warm, quick, a little playful." +x note="removed"
>4 row "Short sentences." +dim
>4 after Proposed
>4 row "Warm and quick. Calm and brief while you work." +hi note="new"
>4 row "Short sentences." +dim
>4 choose "Apply this change?" Apply|"Keep it as is"
>5 card "Personality updated" "Warm and quick. Calm and brief while you work." tag=Applied sub="just now · from this chat" cta="Open in Controls"
>5 sketch "If it changed meanwhile" frame=bubble
>5 row "SOUL.md changed on your Mac since this was proposed" note="nothing written"
>5 row "Ask again" +button +hi`,
  },
  {
    name: "Demo: custom {json} escape hatch",
    agent: "Scout",
    yl: `say "No preset fits a split-flap countdown, so the agent drops to custom."
custom {"type":"stack","children":[{"type":"badge","text":"Launch"},{"type":"text","text":"V2 goes live","size":"lg"},{"type":"row","children":[{"type":"stat","label":"days","value":"99"},{"type":"stat","label":"hours","value":"14"}]},{"type":"button","text":"Open checklist","action":"checklist"}]}
custom {oops not json}`,
  },
];

// Media presets. Each has a slug so /playground?demo=<slug> opens it.
// Images and the reel live in site/public/demo/.
export const MEDIA = [
  {
    slug: "gallery-row3d",
    name: "Gallery: coverflow (row3d)",
    agent: "Scout",
    yl: `gallery "Studio shoot" /demo/g1.jpg|"On the wheel" /demo/g2.jpg|"Mug shelf" /demo/g3.jpg|"The kiln room" /demo/g5.jpg|Trimming /demo/g6.jpg|"First coffee" layout=row3d
say "Swipe the stack, tap the front photo to open it full screen."`,
  },
  {
    slug: "gallery-pick",
    name: "Gallery: pick favorites (grid)",
    agent: "Scout",
    yl: `say "Six shots from the studio. Pick up to three for the homepage."
gallery /demo/g1.jpg /demo/g2.jpg /demo/g3.jpg /demo/g4.jpg /demo/g5.jpg /demo/g6.jpg layout=grid +pick max=3 submit="Use these"`,
  },
  {
    slug: "gallery-feed",
    name: "Gallery: feed, images and a video",
    agent: "Scout",
    yl: `gallery "This week at the studio" /demo/reel.mp4|"Launch reel, first cut" /demo/g4.jpg|"Figs on the speckled plate" /demo/g2.jpg|"New glazes" layout=feed`,
  },
  {
    slug: "gallery-row",
    name: "Gallery: swipe row",
    agent: "Scout",
    yl: `gallery Mugs /demo/g2.jpg /demo/g6.jpg /demo/after_mug.jpg /demo/before_mug.jpg
ask "Add these to the shop page?"`,
  },
  {
    slug: "video",
    name: "Video: review a cut",
    agent: "Scout",
    yl: `video /demo/reel.mp4 "Launch reel, first cut" poster=/demo/reel-poster.jpg
ask "Ship this cut?" Ship|"One more pass"`,
  },
  {
    slug: "video-loop",
    name: "Video: loop + autoplay, and one to generate",
    agent: "Scout",
    yl: `video /demo/reel.mp4 +loop +auto
video "a slow pan across glazed mugs on a sunny shelf"`,
  },
  {
    slug: "compare-slider",
    name: "Compare: slider with highlights",
    agent: "Scout",
    yl: `say "Here's the room with your three changes. Drag the handle."
compare /demo/before_room.jpg /demo/after_room.jpg "Living room" notes="Sage green wall|Bigger plant, moved|Jute rug" hl=45,4,53,45|19,25,20,54|16,78,83,21
ask "Keep it?" Keep|"Try another color"`,
  },
  {
    slug: "compare-pick",
    name: "Compare: A/B pick (side by side)",
    agent: "Scout",
    yl: `compare /demo/before_mug.jpg /demo/after_mug.jpg "Which shot for the shop?" mode=side labels=Studio|Window +pick`,
  },
  {
    slug: "compare-toggle",
    name: "Compare: tap to toggle",
    agent: "Scout",
    yl: `compare /demo/before_mug.jpg /demo/after_mug.jpg "Background swap" mode=toggle notes="Same mug, new scene"`,
  },
  {
    slug: "storyboard",
    name: "Storyboard: launch reel",
    agent: "Scout",
    yl: `storyboard "Launch reel" /demo/s1.jpg|"Quiet morning" /demo/s2.jpg|"The old chipped mug" /demo/s3.jpg|"Unwrap the new one" /demo/s4.jpg|"First sip, logo" +reorder
say "Reorder the frames or comment on any one. Then I'll cut the video."`,
  },
  {
    slug: "storyboard-script",
    name: "Storyboard: script before pictures",
    agent: "Scout",
    yl: `storyboard "Post: why handmade" notes="Hook: your mug is lying to you|Problem: factory glaze chips|Proof: 1,300 degree firing|CTA: shop the drop" +reorder`,
  },
  {
    slug: "image-edit",
    name: "Image edit: mark what to change",
    agent: "Scout",
    yl: `image /demo/before_room.jpg +edit "Circle or box what to change"`,
  },
  {
    slug: "edit-loop",
    name: "Image edit: mark it, get a compare back",
    agent: "Scout",
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
    agent: "Coach",
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
    // Feedback APSw0dsa: a lesson of many pieces is one experience, not loose cards in the chat.
    // YUI-113: one deck, each piece the picture of its page, the calculator last.
    slug: "lesson-one-screen",
    name: "Lesson: compound interest as one deck",
    agent: "Yui",
    yl: `say "Compound interest in a minute. Swipe through."
>full
deck "Compound interest"
page "Money that grows on itself" body="Your interest joins the pile. Next year the pile earns interest too."
shapes
shape circle $100 +grow
shape arrow
shape box "+10%" +fill tone=butter
shape arrow
shape blob $110 +pulse tone=mint
page "The formula" body="P is what you put in, r the rate, t the years. A is what you end with."
math A = P(1 + r)^t
page "It bends upward" body="The same 10% adds more every year, because the pile keeps growing."
chart line "$100 at 10% a year" x=Y0|Y5|Y10|Y15|Y20 y=100|161|259|418|673
page "Twenty years later" body="You put in $100. Time did the rest."
stat $673 "After 20 years" delta=+573 spark=100|161|259|418|673
choose "Which lever grows the pile fastest?" "More time"|"Checking daily"|"A bigger first deposit only" answer="More time"
page "Try it" body="Slide the start, the rate and the years."
calc f="A = P*(1+r)^t" P=100-1000@100 r=0-0.2@0.05 t=0-20@10`,
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
    agent: "Coach",
    yl: `step title="Warm-up" +all "Jumping jacks" time=1m
step "Hip openers, 5 each side"
step "Goblet squat, 10 slow reps"
step "Band pull-aparts" time=45s`,
  },
];

// Decks, plans, flows and walkthroughs (YUI-18, FLOW-1). Each has a slug for /playground?demo=.
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
    agent: "Scout",
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
    agent: "Scout",
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
    agent: "Coach",
    yl: `plan@month "Your first month" submit="Build my plan"
choose@goal "What's the goal?" "Get stronger"|"Lose fat"|"Run a 5k" +other
slide@days "Days a week you can train" 2-6 value=3
pick@gear "What do you have?" Dumbbells|Barbell|Bands|Kettlebell|"Just me"
mic@notes "Anything I should know? Injuries, schedule, what you hate."`,
  },
  {
    slug: "project-card",
    name: "Project: a card that reopens the plan",
    agent: "Scout",
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
    agent: "Scout",
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
  {
    slug: "timeline-warroom",
    name: "Timeline: what shipped, what runs, what is next",
    agent: "Yui",
    // Send it from the agent console: the row turns done in place and the marker moves (YUI-111).
    next: `~w73 kind=done at="Sep 26"`,
    yl: `timeline "Yui, this week" fold=4 +reorder board=yui
done "Saved screens, the shelf" at="Sep 24" tag=YUI-32
done "Full-screen flows fold back into chat" at="Sep 24" tag=YUI-51
done "No dead buttons" at="Sep 24" tag=YUI-53
done "Test builds by link" at="Sep 24" tag=YUI-55
done "Links open Safari" at="Sep 25" tag=YUI-67 https://www.yuigui.com/progress
done "The war room timeline" at="Sep 25" tag=YUI-65
done "Drag to reorder the queue" at="Sep 25" tag=YUI-66
now@w73 "War room panels" tag=YUI-73 sub="needs you, running, builds, feedback"
next@w68 "Reply to a message" tag=YUI-68
next "Each agent's home" tag=YUI-54
next "Agent controls in the drawer" tag=YUI-70`,
  },
  {
    slug: "speed",
    name: "War room: the Speed panel (sample numbers)",
    agent: "Yui",
    yl: `stat@speed-keys 22ms "Typing, p95" delta=-6 spark=31|29|28|28|22 good=down sub="build 125 · budget 33"
stat@speed-arrive 172ms "Messages land, p95" delta=44 spark=131|126|130|128|172 good=down sub="build 125 · budget 150"
stat@speed-hitch 3.1ms/s "Scroll hitches" delta=-1.4 spark=6.2|5.8|5.1|4.5|3.1 good=down sub="under 5 is smooth"
stat@speed-hangs 0.8s/h "Hangs" delta=-1.1 spark=2.6|2.2|2.4|1.9|0.8 good=down sub="per foreground hour"
stat@speed-mem 212MB "Memory peak" delta=-26 spark=251|246|240|238|212 good=down sub="budget 300"
chart@speed-p95 line "p95 by build" x=121|122|123|124|125 y=31|29|28|28|22 y2=58|52|47|38|41 y3=131|126|130|128|172 names=Typing|Send|"Messages land" unit=ms
card@speed-worst "Worst hang: 1.2 s, 3 times" "YuiLines.parse <- ChatStore.apply <- ThreadView.body" sub="build 125 · main thread"`,
  },
  {
    slug: "sketch-card-ids",
    name: "Sketch: before and after, drawn",
    agent: "Yui",
    yl: `say "Card ids are gone from my answers. Here is the difference."
sketch "Where it landed" frame=bubble before="Before"
row "Parked YUI-83 in the backlog" +x note="an id means nothing to you"
row "Feedback #2291 added to YUI-83" +x
after "Now"
row "Parked the drawing card in the backlog" +hi note="plain words"
row "Your note is on that card" +hi`,
  },
  {
    slug: "sketch-buttons",
    name: "Sketch: which buttons stay",
    agent: "Yui",
    yl: `sketch "Build ready" frame=phone
row "Build 97 is ready" +hi note="the headline"
row
row
row "Got it" +button +x note="does nothing, cut it"
row "Install" +button +hi note="does the thing"`,
  },
  {
    slug: "sketch-home-page",
    name: "Sketch: what to cut from a page",
    agent: "Studio",
    next: `ask "Cut those two?" "Yes, cut them"|"Keep them"`,
    yl: `sketch "Home" frame=window
row "Wheel-thrown mugs, made in Asheville" +hi note="keep, it says what you do"
row "Welcome to our website!" +x note="says nothing"
row
row "Book a class" +button +hi
row "Subscribe to our newsletter" +button +dim note="move to the footer"
row "Follow us on 6 networks" +x`,
  },
  {
    slug: "shapes-ask",
    name: "Shapes: how an ask reaches your phone",
    agent: "Yui",
    yl: `shapes "How an ask reaches your phone" caption="You ask, it lands on the board, a lane builds it, and it ships to your phone."
shape@you circle You +grow
shape arrow
shape box Board +fill
shape arrow
shape pill Lane +pulse
shape arrow label=ships
shape circle Phone tone=mint +grow`,
  },
  {
    slug: "shapes-heat-pump",
    name: "Shapes: how a heat pump works",
    agent: "Urza",
    yl: `say "Cold air still holds heat. The pump grabs it, squeezes it hot, and lets it out inside."
shapes "Heat pump loop" caption="Refrigerant colder than the outdoor air soaks up heat, the compressor squeezes it hot, and the indoor coil lets it out into the house."
shape blob "Outside air" tone=mute
shape arrow
shape box "Outdoor coil" tone=lavender +fill
shape arrow
shape pill Compressor +pulse
shape arrow
shape box "Indoor coil" tone=butter +fill`,
  },
  {
    slug: "shapes-picture",
    name: "Shapes: a picture vs a few lines",
    agent: "Yui",
    yl: `shapes "Picture or shapes" caption="A generated picture is a round trip to a GPU for every idea. Shapes are drawn on the phone from a few lines."
shape@img box Picture at=2.2,1.5 size=3,1.4 tone=mute +dash
shape@gpu blob GPU at=7.7,1.5 size=2.8,2 tone=butter +fill +grow
shape arrow from=img to=gpu label="wait" tone=mute +dash
shape@lines box Lines at=2.2,4.5 size=3,1.4 +fill +grow
shape@phone circle Phone at=7.7,4.5 size=1.8 tone=mint +pulse
shape arrow from=lines to=phone label="drawn here"`,
  },
  {
    slug: "shapes-card-trip",
    name: "Shapes: a card moves to running",
    agent: "Yui",
    yl: `shapes "Where your idea is" h=4 caption="Your shapes idea left the backlog. A lane is building it now."
shape text Backlog at=1.7,0.5 tone=mute
shape text Running at=5,0.5 tone=mute
shape text Shipped at=8.3,0.5 tone=mute
shape line at=3.35,0.2 to=3.35,3.8 tone=mute +dash
shape line at=6.65,0.2 to=6.65,3.8 tone=mute +dash
shape pill Shapes at=1.7,2.3 size=2.6 +fill move=5,2.3
shape@dot dot at=5,3.4 tone=mint +pulse`,
  },
  {
    slug: "timeline-trip",
    name: "Timeline: a trip, day by day",
    agent: "Scout",
    yl: `timeline "Lisbon, 4 days" mark="Right now"
done "Landed, checked in at Casa do Largo" at=Thu
done "Tram 28 and the castle" at=Fri
now "Time Out Market for lunch" at=12:30 sub="10 min walk, table for two"
next "Sunset at Miradouro da Graca" at=19:40
next "Fado in Alfama" at=21:30 https://en.wikipedia.org/wiki/Fado
next "Train to Sintra" at=Sun sub="Rossio, 9:11"`,
  },
  {
    slug: "game-tictactoe",
    name: "Game: tic-tac-toe against the agent",
    agent: "Yui",
    yl: `say Your move. You are X.
game tictactoe "Beat me"`,
  },
  {
    slug: "game-snake",
    name: "Game: snake, score comes back",
    agent: "Yui",
    yl: `game snake "Beat 12" speed=2 best=12`,
  },
  {
    slug: "game-memory",
    name: "Game: memory match with your own words",
    agent: "Scout",
    yl: `game memory "Spanish animals" pairs=6 items=perro|gato|pájaro|pez|caballo|vaca`,
  },
  // Flows (FLOW-1): the starter flows, sent inline as Mermaid, then one run by name.
  ...STARTER_FLOWS.map((f) => ({ slug: `flow-${f.name}`, name: `Flow: ${f.title.toLowerCase()}`, agent: f.agent, yl: flowLines(f) })),
  {
    // My flows (spec/FLOWS.md, section 8): the lines are Yui saving a flow. The
    // tabs above the phone are the app's My flows screen (playground/myflows.js):
    // the starters and the person's own copies, running one in the real flow
    // runtime, and the path a run took, branches and all.
    name: "My flows: your saved flows, a run, and its path",
    slug: "myflows",
    agent: "Yui",
    myflows: true,
    yl: `say "Saved to My flows. Run it any time, or ask me to change it."
flow workout-checkin`,
  },
  {
    slug: "flow-saved",
    name: "Flow: a saved flow, run by name",
    agent: "Scout",
    yl: `say "New client? Let's get the brief."
flow website-intake`,
  },
  {
    // YUI-39: the agent's answer to the connect flow's {flow} event. The real
    // button carries a sign-in link the agent's host makes for this person;
    // here it opens the docs, never a live sign-in.
    slug: "connect-signin",
    name: "Connect: the sign-in buttons after the flow",
    agent: "Yui",
    yl: `say "Two sign-ins and I can get to work."
card "Google Calendar" "See your events and find a time that works." sub="You sign in on Google" cta="Sign in with Google" url=https://www.yuigui.com/developers/connectors#6-sign-in
card "HubSpot" "Look up contacts and deals, add notes and tasks." sub="You sign in on HubSpot" cta="Sign in with HubSpot" url=https://www.yuigui.com/developers/connectors#6-sign-in
choose "Once you're in, what first?" "Find an hour this week"|"Who is my next call?" +other`,
  },
];

// Agent tables (spec/TABLES.md): data an agent keeps on the phone. Each
// starter makes its table, writes a few rows and draws them; `next` is a put
// to send from the agent line, so the views redraw.
export const DATA = [
  {
    name: "Tables: workout log",
    slug: "tables-workout",
    agent: "Coach",
    yl: `table create lifts Day:date Lift:text Weight:number:lb Reps:number
put lifts Day=today-6 Lift=Squat Weight=215 Reps=5
put lifts Day=today-6 Lift=Bench Weight=175 Reps=5
put lifts Day=today-4 Lift=Squat Weight=225 Reps=5
put lifts Day=today-4 Lift=Bench Weight=180 Reps=5
put lifts Day=today-2 Lift=Squat Weight=230 Reps=5
put lifts Day=today-2 Lift=Deadlift Weight=275 Reps=3
put lifts Day=today Lift=Squat Weight=235 Reps=5
query lifts where=Lift=Squat sort=Day as chart x=Day y=Weight "Squat, top set"
query lifts group=Lift max=Weight sum=Reps +count sort=-Weight as table "Best set per lift"`,
    next: "put lifts Day=today Lift=Bench Weight=185 Reps=5",
  },
  {
    name: "Tables: macros",
    slug: "tables-macros",
    agent: "Coach",
    yl: `table create meals Day:date Food:text Cal:number:kcal Protein:number:g
put meals Day=today-2 Food="Chicken bowl" Cal=640 Protein=52
put meals Day=today-2 Food=Oats Cal=300 Protein=10
put meals Day=today-1 Food="Salmon and rice" Cal=720 Protein=45
put meals Day=today-1 Food="Greek yogurt" Cal=150 Protein=20
put meals Day=today Food="Eggs and toast" Cal=420 Protein=26
put meals Day=today Food="Turkey wrap" Cal=510 Protein=38
query meals group=Day sum=Cal sort=Day as stat y=Cal label="Calories today" good=down
query meals where=Day=today cols=Food|Cal|Protein as table "Today so far"
query meals group=Day sum=Protein sort=Day as chart bar x=Day y=Protein "Protein by day"`,
    next: `put meals Day=today Food="Protein shake" Cal=160 Protein=30`,
  },
  {
    name: "Tables: a simple CRM",
    slug: "tables-crm",
    agent: "Scout",
    yl: `table create crm Name:text Stage:text Value:number:$ Next:date Won:bool
put crm acme Name="Acme Co" Stage=Proposal Value=12000 Next=today+2
put crm bolt Name="Bolt Studio" Stage=Lead Value=3000 Next=today+5
put crm cedar Name="Cedar Dental" Stage=Call Value=8000 Next=today+1
put crm dune Name="Dune Coffee" Stage=Won Value=4500 +Won
query crm where=Stage!=Won sort=Next cols=Name|Stage|Value|Next as table "Open deals"
query crm group=Stage sum=Value as chart bar x=Stage y=Value "Pipeline"
query crm sort=Next cols=Name|Stage|Won as list check=Won "Mark a deal won"`,
    next: "put crm cedar Stage=Proposal Next=today+3",
  },
  {
    // Meal photo to macros (spec/MEAL.md, YUI-35 step 1). Pick a sample photo
    // (or take one) and a stand-in agent answers with the estimate; fix the
    // portion, tap Save, and the row lands in the meals table with today's totals.
    name: "Meal photo to macros",
    slug: "meal",
    agent: "Coach",
    meal: true,
    yl: `table create meals Day:date Food:text Cal:number:kcal Protein:number:g Carbs:number:g Fat:number:g
put meals Day=today Food="Greek yogurt" Cal=150 Protein=20 Carbs=8 Fat=4
say "Snap your plate. I'll guess the macros, you fix what I got wrong, and it goes in your log."
camera@plate "Snap your meal" +inline
gallery@samples "No meal handy? Try one of mine" /demo/meal-pancakes.jpg|Pancakes /demo/meal-salmon.jpg|"Grilled salmon" /demo/meal-poke.jpg|"Poke bowl" layout=grid +pick max=1 submit="Use this photo"`,
  },
];

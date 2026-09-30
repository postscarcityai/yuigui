import { FLOW_VARIANTS, STARTER_FLOWS, flowLines, variantLines } from "./starter-flows.mjs";
import { BASIL_WEEK } from "./basil-week.mjs";

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
    // SITE-98 / YUI-195: every full-screen answer has a way home (spec/YL.md section 5, A way home).
    name: "Demo: a way home (close, Back home, pull down)",
    slug: "way-home",
    agent: "Yui",
    yl: `say "Every full screen has a way home."
>full
deck "A way home"
page "Close" body="The X at the top closes any full screen. Nothing is sent."
page "Pull" body="On a phone, pull the card down. A short pull springs back."
page "Back home" body="On the last page, Back home takes you out. Tap it."`,
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
    // Stage first (spec/YL.md section 5, YUI-119 step 1): the lines are Yui's
    // answer to "go ahead and release that". The tabs above the phone are the
    // app living on the full screen (playground/stagefirst.js): the first send
    // opens the stage, the reply plays as chunks (a line and a picture each),
    // the questions come last with one Send, and the chat is the record.
    name: "Stage first: the reply plays full screen, the chat is the record",
    slug: "stage-first",
    agent: "Yui",
    stagefirst: true,
    yl: `doing "Starting the 0.3.2 release" 1/2
doing "Checking what is ready" 2/2
say "0.3.2 is building. On TestFlight in about 40 minutes."
shapes w=12 h=6 caption="Build, checks, TestFlight. You get a ping when it lands."
shape@b box Build at=2,3 +fill +pulse
shape arrow from=b to=c
shape@c box Checks at=6,3 +dash
shape arrow from=c to=t
shape@t pill TestFlight at=10,3 size=3.2,1.4 tone=mint +dash
say "Keys and chords ride along."
shapes w=12 h=7 caption="A scale to play, a loop of chords to strum."
shape box A at=1.5,2.6 size=1.3,3.6 +fill
shape box B at=3,2.6 size=1.3,3.6 tone=mute
shape box C at=4.5,2.6 size=1.3,3.6 +fill
shape box D at=6,2.6 size=1.3,3.6 +fill
shape box E at=7.5,2.6 size=1.3,3.6 +fill
shape box F at=9,2.6 size=1.3,3.6 tone=mute
shape box G at=10.5,2.6 size=1.3,3.6 +fill
shape pill "I V vi IV" at=6,6 size=5,1.2 tone=mint +fill +grow
say "The faster Send tap waits for 0.3.3."
sketch "In 0.3.2" frame=window
row "Keys and chords" +hi
row "Real drum sounds" +hi
row "Faster Send tap" +x note="not done yet"
plan@before "Before I go" submit=Send
choose@ping "Ping you when it lands?" "Yes, ping me"|"Only if it breaks"
choose@try "What do you want to try first?" Keys|Chords|Drums
end`,
  },
  {
    // Basil's week (spec/YL.md section 5, YUI-183, SITE-81): the runtime's
    // answer to a sent meal plan (lib/yl/basil-week.mjs). On the stage each
    // day is a page of the deck and a tap on a meal sends its swap at once;
    // His pages shows the person staying on the answer while This week and
    // Groceries are drawn again (playground/weekdeck.js).
    name: "Basil's week: a day a page, a swap on one tap",
    slug: "week-deck",
    agent: "Basil",
    weekdeck: true,
    // Today's patches (~kcal ...) need the home it patches; the demo plays without them.
    yl: BASIL_WEEK.split("\n").filter((l) => !l.startsWith("~")).join("\n"),
  },
  {
    // Stage motion (spec/YL.md section 5, YUI-120 step 1): the same turn on
    // two agents with different characters (playground/stagemotion.js). The
    // doing words pick the mood (reading is looking, drafting is making,
    // "Found" is the found beat); the reply plays as stage chunks.
    name: "Stage motion: the stage moves with the agent",
    slug: "stage-motion",
    agent: "Yui",
    stagemotion: true,
    yl: `doing "Reading your calendar" 1/3
doing "Checking the weather" 2/3
doing "Found a dry window" 3/3
say "Three runs this week, all dry."
shapes w=9 h=3 caption="Tue, Thu, Sat. Rain on Wed."
shape circle Tue at=1.2,1.5 size=1.9 tone=mint +fill +grow
shape circle Wed at=3.4,1.5 size=1.4 tone=mute +dash
shape circle Thu at=5.6,1.5 size=1.9 tone=mint +fill +grow
shape circle Sat at=7.8,1.5 size=1.9 tone=mint +fill +grow
say "Saturday is the long one."
stat 8km "Saturday" sub="easy pace"
choose "Morning or evening?" Morning|Evening
choose "Ping you before each run?" Yes|No`,
  },
  {
    // The visual (spec/VISUAL.md, YUI-124 step 1): a live shader behind the
    // stage, in the agent's colors and motion look, that hears a voice, music
    // or the room (playground/visualizer.js). Change the look in the line or
    // with the chips; play the sample voice, the sample beat or your mic.
    name: "The visual: shaders behind the stage",
    slug: "visualizer",
    agent: "Sage",
    visualizer: true,
    yl: `visual aurora react=voice
say "Breathe in for four. Out for six."`,
  },
  {
    // Every agent's own (YUI-180, VISUAL.md section 6): no `visual` line, so the
    // stage shows the agent's quiet default. Pick an agent to see its pick; a
    // chip is the agent sending a line of its own, and that wins.
    name: "The visual: every agent's own",
    slug: "visual-defaults",
    agent: "Yui",
    visualizer: true,
    yl: `say "This light is mine. It stays quiet unless you talk."`,
  },
  {
    // The shader look (spec/SHADER.md, t_b8ab6ac3 step 1): the line blob
    // retires; one WebGL blob for every agent shows what it is doing
    // (playground/shaderlook.js). Pick a doing, an agent, or type nothing.
    name: "The shader look: four ways to show what it is doing",
    slug: "shader-look",
    agent: "Yui",
    shaderlook: true,
    yl: `doing "Reading your calendar"
say "Four looks, no blob. Each one moves with what I am doing."`,
  },
  {
    name: "The visual: orb on a voice",
    slug: "visual-orb",
    agent: "Yui",
    visualizer: true,
    yl: `visual orb react=voice
say "I'm listening. Tell me about your day."`,
  },
  {
    name: "The visual: waves on music",
    slug: "visual-waves",
    agent: "Coach",
    visualizer: true,
    yl: `visual waves tone=sky react=music
say "Warm-up mix is on. Ten minutes, easy."`,
  },
  {
    name: "The visual: grain for focus",
    slug: "visual-grain",
    agent: "Sage",
    visualizer: true,
    yl: `visual grain tone=lavender react=off
say "Focus block. 25 minutes. I'll stay quiet."`,
  },
  {
    name: "The visual: bloom for a win",
    slug: "visual-bloom",
    agent: "Coach",
    visualizer: true,
    yl: `visual bloom tone=sunset react=music
say "New personal best. 5k in 24:10."`,
  },
  {
    // Motion looks (spec/YL.md section 4 theme, YUI-123): the same turn on
    // two agents whose looks were said in words ("heavy and punchy", "drifts
    // like water"), saved as `theme pace= ease= enter= pulse=`, plus a box to
    // describe a new one (playground/motionlooks.js).
    name: "Motion looks: say how each agent moves",
    slug: "motion-looks",
    agent: "Yui",
    motionlooks: true,
    yl: `doing "Reading your calendar" 1/3
doing "Checking the weather" 2/3
doing "Found a dry window" 3/3
say "Three runs this week, all dry."
shapes w=9 h=3 caption="Tue, Thu, Sat. Rain on Wed."
shape circle Tue at=1.2,1.5 size=1.9 tone=mint +fill +grow
shape circle Wed at=3.4,1.5 size=1.4 tone=mute +dash
shape circle Thu at=5.6,1.5 size=1.9 tone=mint +fill +grow
shape circle Sat at=7.8,1.5 size=1.9 tone=mint +fill +grow
say "Saturday is the long one."
stat 8km "Saturday" sub="easy pace"
choose "Morning or evening?" Morning|Evening
choose "Ping you before each run?" Yes|No`,
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
  {
    // YUI-197: items get drawn, not counted (spec/CHANNEL.md "Items get drawn, not counted").
    name: "Items get drawn, not counted",
    slug: "items-drawn",
    agent: "Yui",
    yl: `say "Two cards are waiting on you."
sketch "Anything waiting on me?" frame=bubble
row "Two cards are waiting on you. One has 4 recovered articles and 2 rewrites. The other is the weekly roundup post and landing page link." +x note="counted in words"
after
row "Recovered articles: 4 recovered, 2 rewrites" +hi note="waiting on you"
row "Weekly roundup: post and landing page link" +hi note="waiting on you"`,
  },
  {
    // YUI-203: UI is drawn in context (spec/CHANNEL.md "UI is drawn in context").
    name: "UI is drawn in context",
    slug: "ui-in-context",
    agent: "Yui",
    yl: `say "The closing box has a working ZIP field."
sketch "The ZIP field" frame=phone
row "It has a working ZIP field and a two-question form" +x note="described"
after
row "Your ZIP  33410" +hi note="the new field"
row "See My Coverage Options" +button`,
  },
  {
    // YUI-203: when is a timeline (spec/CHANNEL.md "When is a timeline").
    name: "When is a timeline",
    slug: "when-timeline",
    agent: "Yui",
    yl: `say "Two days earlier, two changes."
timeline "Two days earlier"
done "Real logos on the family cards" at="Sep 22"
done "Bigger calculator labels" at="Sep 23"`,
  },
  {
    // YUI-203: facts are Label: value lines, never a lone hyphen (spec/CHANNEL.md).
    name: "One fact is a sentence, not a hyphen",
    slug: "lone-hyphen",
    agent: "Yui",
    yl: `sketch "The last four fixes" frame=bubble
row "- The last four eyebrow labels on the forms were fixed." +x note="a lone hyphen"
after
row "The last four eyebrow labels on the forms are fixed." +hi note="one fact, a sentence"`,
  },
  {
    // YUI-203: the last page has a next step (spec/CHANNEL.md "The last page has a next step").
    name: "The last page has a next step",
    slug: "last-page-next-step",
    agent: "Yui",
    yl: `say "One change, then what you can do."
deck "What changed" +inline
page "ZIP field" body="The form takes a ZIP and two answers, and sends them to the lead."
choose "What next?" "Try the form"|"See the copy"|"Why do you ask?"
end`,
  },
  {
    // Guide v40: status is Label: verdict, drawn (spec/CHANNEL.md "Status is Label: verdict, drawn").
    name: "Status is tiles, not sentences",
    slug: "status-tiles",
    agent: "Yui",
    yl: `sketch "Is the board up to date?" frame=bubble
row "Mostly. The site lane is clean, the new feature has one card waiting on you, and SEO scores 94 after yesterday's fixes." +x note="a paragraph"
after
row "Site: good"
row "New feature: needs help" +hi note="design pick"
row "SEO: strong"`,
  },
  {
    // Guide v40: an outcome is drawn, the thing struck out (spec/CHANNEL.md "An outcome is drawn").
    name: "Declined is drawn, not told",
    slug: "outcome-declined",
    agent: "Yui",
    yl: `sketch "Friday invite" frame=bubble
row "The invite is declined now. It was a test request from Dana." +x note="told"
after
row "Team sync, Friday 3 pm" +x note="declined"`,
  },
  {
    // Guide v40: a worker at work is a small drawing (spec/CHANNEL.md "An outcome is drawn").
    name: "A worker at work",
    slug: "worker-at-work",
    agent: "Yui",
    yl: `say "Editing labels."
shapes "Quote calculator" caption="Picked up 4 minutes ago. About 20 to go."
shape circle Worker +pulse
shape arrow
shape box "Calculator labels" +fill`,
  },
  {
    // Guide v41: answer about the screen just shown; a sample is marked as one (spec/CHANNEL.md "Examples are not asks").
    name: "Answer about the screen I just showed",
    slug: "context-this-screen",
    agent: "Yui",
    yl: `sketch "What are you waiting on me for with this?" frame=bubble
row "One thing: OK the spend to test the four new models before they go live in Yui." +x note="an old ask, not this screen"
after
row "Nothing. That board was a sample." +hi note="answers what he asked"
sketch "A sample board" frame=window
row "Site: good"
row "New feature: needs help" +hi note="example"
row "SEO: strong"`,
  },
  {
    // Guide v42: shots are shown in the thread, a link is never the whole answer (spec/CHANNEL.md "Show it here").
    name: "Show it here, don't link out",
    slug: "show-here",
    agent: "Yui",
    yl: `sketch "Before and after shots" frame=phone
row "Before and after shots: Open" +button +x note="a link, nothing shown"
after
row "The shots, right here" +hi note="tap to switch"
compare /demo/site_before_hero.jpg /demo/site_after_hero.jpg "Hero" notes="Bigger headline|One button" mode=slider`,
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
    // Feedback AJIE1_1Ru1V4EMgmpWZtniI, YUI-157: "It's just a text bomb." An explainer
    // (a place, a past, how it works) draws every page: a map in shapes, a chart, a stat.
    slug: "explainer-map",
    name: "Explainer: the Mongols, a picture per page",
    agent: "Yui",
    yl: `say "The Mongols held the grass belt from Korea to Hungary."
>full
deck "The Mongols, by the map"
page "One belt of grass" body="The steppe runs from Korea to Hungary. Horses crossed it end to end."
shapes caption="Karakorum sat in the middle and rode out both ways."
shape@hu dot Hungary at=1,2 tone=mute
shape@ka circle Karakorum at=6,2 +grow +fill tone=butter
shape@ko dot Korea at=9,3 tone=mute
shape arrow from=ka to=hu +draw
shape arrow from=ka to=ko +draw
shape text Gobi at=6,4 tone=mute
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
page "At its peak, 1279"
stat "24M km²" "A sixth of the land on Earth"
end`,
  },
  {
    // YUI-157: the same answer before and after, as the guide draws it.
    slug: "explainer-before-after",
    name: "Explainer: a text page, then a map",
    agent: "Yui",
    yl: `sketch "A brief geography of the Mongols" frame=phone before=Before
row "The Mongol Empire ran along the Eurasian grassland, from Korea to Hungary..." +x note="a text bomb"
row "24M km², then bullets" +x note="more words"
after After
row "Hungary · Karakorum · Korea, on a map" +hi note="where: a map"
row "Mongol 24 · Russian 22.8 · Qing 14.7 · Roman 5" +hi note="how big: a chart"`,
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
    // Arnold's runner (YUI-182, yui runtime/src/workouts.ts): "Start today's workout" turns today's split row
    // into one full-screen plan. What the session holds first, then per move its sets to tick, reps and weight
    // to nudge (from the last weight logged), how it felt last, one Send. The runtime writes the log itself.
    slug: "arnold-runner",
    name: "Plan: Coach runs today's workout",
    agent: "Coach",
    yl: `say "Full body A. 4 moves, one set at a time. Let's go."
plan@wk-20260928-mon "Full body A" submit="Finish workout"
page "Full body A" body="4 moves, about 40 minutes. Rest about 90 seconds between sets." points="Goblet squat 3x10"|"Push-up 3x8"|"Dumbbell row 3x10"|"Plank 3x30s"
pick@e1-sets "Goblet squat: sets done" "Set 1"|"Set 2"|"Set 3"|Skip tag="1 of 4" title="Goblet squat" body="Hold the bell at your chest, elbows in. Sit between your heels, keep your chest tall, stand up tall. Target 3 x 10 at 20 lb. Tick each set as you finish it, or Skip."
slide@e1-reps "Goblet squat: reps per set" 1-30 value=10
slide@e1-lb "Goblet squat: weight in lb" 0-300 value=20 step=5 unit=lb
pick@e2-sets "Push-up: sets done" "Set 1"|"Set 2"|"Set 3"|Skip tag="2 of 4" title="Push-up" body="Hands under shoulders, body in one line. Lower until your chest is a fist from the floor, then press away. Target 3 x 8. Tick each set as you finish it, or Skip."
slide@e2-reps "Push-up: reps per set" 1-30 value=8
pick@e3-sets "Dumbbell row: sets done" "Set 1"|"Set 2"|"Set 3"|Skip tag="3 of 4" title="Dumbbell row" body="One hand and knee on the bench, flat back. Pull the bell to your hip, pause, lower slow. Target 3 x 10 at 25 lb. Tick each set as you finish it, or Skip."
slide@e3-reps "Dumbbell row: reps per set" 1-30 value=10
slide@e3-lb "Dumbbell row: weight in lb" 0-300 value=25 step=5 unit=lb
pick@e4-sets "Plank: sets done" "Set 1"|"Set 2"|"Set 3"|Skip tag="4 of 4" title="Plank" body="Elbows under shoulders, squeeze glutes and brace like you are about to be poked. Straight line, breathe. Target 3 x 30s. Tick each set as you finish it, or Skip."
slide@e4-secs "Plank: seconds per set" 5-180 value=30 step=5
choose@feel "How did it feel?" Easy|"Just right"|Hard`,
  },
  {
    // Arnold's pages after that Finish (YUI-182): This week with the day ticked and a day picker, Today done,
    // Progress with the streak, the best set and a chart per main lift. Later answers only patch them.
    slug: "arnold-pages",
    name: "Pages: Coach's week, today and progress after a workout",
    agent: "Coach",
    yl: `say "Logged Full body A: 4 moves, 11 sets. Nice work. Felt easy? Add 5 lb next time."
>2
stat@week-done "1 of 5" "Workouts this week" sub="Next: Tue Easy cardio"
list@days title="This week" "✓ Mon Full body A" "Tue Easy cardio" "Wed Full body B" "Fri Full body A" "Sat Long walk" check=off
choose@edit-day "Change a day" Mon|Tue|Wed|Thu|Fri|Sat|Sun body="Tap a day to change what it trains."
card@split "Your split" "5 training days a week." cta="Rebuild my split"
>3
card@today "Done: Full body A" "Logged. Rest up, you earned it." sub=Mon cta="Go again"
list@sets title="Full body A" "Goblet squat 3 x 10 at 25 lb" "Push-up 3 x 8" "Dumbbell row 3 x 10 at 30 lb" "Plank 3 x 30s" +check
>4
stat@streak "2 weeks" "Streak" sub="weeks in a row with a workout"
stat@best 45lb "Best set" sub="Romanian deadlift x 10, Sep 23"
chart@lift-dumbbell-row line "Dumbbell row, top set" x="Sep 21"|"Sep 28" y=25|30 unit=lb
chart@lift-goblet-squat line "Goblet squat, top set" x="Sep 21"|"Sep 28" y=20|25 unit=lb
chart@lift-overhead-press line "Overhead press, top set" x="Sep 23" y=45 unit=lb`,
    next: `~week-done "2 of 5" "Workouts this week" sub="Next: Wed Full body B"`,
  },
  {
    // Basil's Plan my meals (YUI-183, yui runtime/src/mealplan.ts): one full-screen plan. What the week aims for
    // first (his goal), then days, meals a day, likes, no-gos, budget and time to cook, one Send.
    slug: "basil-plan",
    name: "Plan: Basil plans your week of meals",
    agent: "Basil",
    yl: `say "Let's plan your week."
plan@mealplan "Plan my meals" submit="Plan my week"
page "Your week of meals" body="I'll plan each day around your goal of 2,100 kcal and 140 g protein, from meals you can cook. Tap any meal after to swap it, and your grocery list fills in by aisle."
choose@days "How many days?" "3 days"|"5 days"|"7 days"
choose@meals "Meals a day?" "2 meals"|"3 meals"|"3 and a snack"
pick@likes "What do you like?" "Chicken"|"Fish"|"Beef"|"Veggie"|"Eggs"|"Pasta"|"Rice bowls"|"Mexican"|"Asian"|"Italian" +other
pick@avoid "Anything to leave out?" "None"|"Dairy"|"Gluten"|"Nuts"|"Shellfish"|"Fish"|"Meat"|"Pork"|"Eggs"|"Soy" +other
choose@budget "Budget?" "Keep it cheap"|"In between"|"Treat me"
choose@cook "Time to cook a meal?" "15 minutes"|"30 minutes"|"45 or more"`,
  },
  {
    // After that Send (YUI-183): the week as a deck, a page a day, each meal a button that swaps it; then his
    // pages, Today against the goal, This week's meals and Groceries by aisle. Later answers only patch them.
    slug: "basil-week",
    name: "Pages: Basil's week of meals, today's macros and the grocery list",
    agent: "Basil",
    yl: `say "Your 5 days are planned. Tap any meal to swap it."
deck@week-deck "This week's meals"
page "5 days planned" body="About 1,919 kcal and 106 g protein a day, for a goal of 2,100. Leaving out: nuts. 51 things on your grocery list, by aisle." points="Monday: Breakfast burrito, Chicken burrito bowl, Chicken stir-fry, Cheese and crackers"|"Tuesday: Avocado toast with eggs, Teriyaki chicken rice bowl, Beef tacos, Edamame"|"Wednesday: Tofu scramble, Quinoa black bean bowl, Spaghetti with meat sauce, Hummus and carrots"|"Thursday: Overnight oats with chia, Greek chickpea salad with pita, Tofu coconut curry, Greek yogurt and honey"|"Friday: Greek yogurt bowl, Egg fried rice, Pasta primavera with white beans, Two boiled eggs"
choose@swap-20260928 "Tap a meal to swap it" "Breakfast burrito"|"Chicken burrito bowl"|"Chicken stir-fry"|"Cheese and crackers" tag="Mon" title="Monday, 2,138 kcal" body="Breakfast: Breakfast burrito, 528 kcal. Lunch: Chicken burrito bowl, 700 kcal. Dinner: Chicken stir-fry, 680 kcal. Snack: Cheese and crackers, 230 kcal"
choose@swap-20260929 "Tap a meal to swap it" "Avocado toast with eggs"|"Teriyaki chicken rice bowl"|"Beef tacos"|"Edamame" tag="Tue" title="Tuesday, 1,884 kcal" body="Breakfast: Avocado toast with eggs, 424 kcal. Lunch: Teriyaki chicken rice bowl, 650 kcal. Dinner: Beef tacos, 620 kcal. Snack: Edamame, 190 kcal"
choose@swap-20260930 "Tap a meal to swap it" "Tofu scramble"|"Quinoa black bean bowl"|"Spaghetti with meat sauce"|"Hummus and carrots" tag="Wed" title="Wednesday, 1,830 kcal" body="Breakfast: Tofu scramble, 430 kcal. Lunch: Quinoa black bean bowl, 540 kcal. Dinner: Spaghetti with meat sauce, 660 kcal. Snack: Hummus and carrots, 200 kcal"
choose@swap-20261001 "Tap a meal to swap it" "Overnight oats with chia"|"Greek chickpea salad with pita"|"Tofu coconut curry"|"Greek yogurt and honey" tag="Thu" title="Thursday, 1,922 kcal" body="Breakfast: Overnight oats with chia, 422 kcal. Lunch: Greek chickpea salad with pita, 640 kcal. Dinner: Tofu coconut curry, 700 kcal. Snack: Greek yogurt and honey, 160 kcal"
choose@swap-20261002 "Tap a meal to swap it" "Greek yogurt bowl"|"Egg fried rice"|"Pasta primavera with white beans"|"Two boiled eggs" tag="Fri" title="Friday, 1,820 kcal" body="Breakfast: Greek yogurt bowl, 420 kcal. Lunch: Egg fried rice, 640 kcal. Dinner: Pasta primavera with white beans, 616 kcal. Snack: Two boiled eggs, 144 kcal"
end
>2
stat@kcal 700kcal "Calories today" sub="of 2,100. 1,400 to go."
chart@macros bar "Macros vs goal" x=Protein|Carbs|Fat y=55|75|18 y2=140|210|70 names=Today|Goal unit=g
card@next-meal "Up next: Dinner" "Chicken stir-fry. 680 kcal, about 25 minutes." sub="From your plan" cta="I ate it"
choose@eaten "Tap a meal to fix it" "Lunch, 700 kcal" body="Lunch: Chicken burrito bowl, 700 kcal"
>3
choose@wk-20260928 "Tap a meal to swap it" "Breakfast burrito"|"Chicken burrito bowl"|"Chicken stir-fry"|"Cheese and crackers" tag="Mon" title="Monday, 2,138 kcal" body="Breakfast: Breakfast burrito, 528 kcal. Lunch: Chicken burrito bowl, 700 kcal. Dinner: Chicken stir-fry, 680 kcal. Snack: Cheese and crackers, 230 kcal"
choose@wk-20260929 "Tap a meal to swap it" "Avocado toast with eggs"|"Teriyaki chicken rice bowl"|"Beef tacos"|"Edamame" tag="Tue" title="Tuesday, 1,884 kcal" body="Breakfast: Avocado toast with eggs, 424 kcal. Lunch: Teriyaki chicken rice bowl, 650 kcal. Dinner: Beef tacos, 620 kcal. Snack: Edamame, 190 kcal"
choose@wk-20260930 "Tap a meal to swap it" "Tofu scramble"|"Quinoa black bean bowl"|"Spaghetti with meat sauce"|"Hummus and carrots" tag="Wed" title="Wednesday, 1,830 kcal" body="Breakfast: Tofu scramble, 430 kcal. Lunch: Quinoa black bean bowl, 540 kcal. Dinner: Spaghetti with meat sauce, 660 kcal. Snack: Hummus and carrots, 200 kcal"
choose@wk-20261001 "Tap a meal to swap it" "Overnight oats with chia"|"Greek chickpea salad with pita"|"Tofu coconut curry"|"Greek yogurt and honey" tag="Thu" title="Thursday, 1,922 kcal" body="Breakfast: Overnight oats with chia, 422 kcal. Lunch: Greek chickpea salad with pita, 640 kcal. Dinner: Tofu coconut curry, 700 kcal. Snack: Greek yogurt and honey, 160 kcal"
choose@wk-20261002 "Tap a meal to swap it" "Greek yogurt bowl"|"Egg fried rice"|"Pasta primavera with white beans"|"Two boiled eggs" tag="Fri" title="Friday, 1,820 kcal" body="Breakfast: Greek yogurt bowl, 420 kcal. Lunch: Egg fried rice, 640 kcal. Dinner: Pasta primavera with white beans, 616 kcal. Snack: Two boiled eggs, 144 kcal"
card@week-plan "Want a new week?" "New likes, a new budget, or just a change." cta="Plan again"
>4
stat@groc-left "51 to get" "Grocery list" sub="From your meal plan and what you added"
list@aisle-produce title="Produce" "Spinach"|"Berries"|"Avocado, 1 1/2"|"Stir-fry vegetables, 3 cups"|"Broccoli, 1 cup"|"Lettuce, 1 cup"|"Bell peppers, 2"|"Limes, 1"|"Carrots, 2"|"Blueberries, 1 1/2 cups"|"Cucumber, 1"|"Cherry tomatoes, 1 cup"|"Zucchini, 1" +check
list@aisle-meat-and-fish title="Meat and fish" "Chicken thighs"|"Chicken breasts, 2"|"Ground beef, 1/2 lb" +check
list@aisle-dairy-and-eggs title="Dairy and eggs" "Greek yogurt"|"Eggs"|"Cheddar, 3/4 cup"|"Firm tofu, 1 1/2 blocks"|"Parmesan, 4 tbsp"|"Hummus, 4 tbsp"|"Oat milk, 1 cup"|"Feta, 1/4 cup" +check
list@aisle-bakery title="Bakery" "Flour tortillas, 1"|"Whole wheat bread, 3 slices"|"Corn tortillas, 3"|"Pita, 1" +check
list@aisle-pantry title="Pantry" "Rice"|"Black beans, 1 1/2 cans"|"Salsa, 6 tbsp"|"Soy sauce, 2 tbsp"|"Olive oil, 4 tbsp + 1 tsp"|"Crackers, 8"|"Teriyaki sauce, 2 tbsp"|"Quinoa, 1/2 cup"|"Pasta, 1/2 box"|"Marinara, 1/2 cup"|"Oats, 1/2 cup"|"Chia seeds, 1 tbsp"|"Maple syrup, 1 tbsp"|"Chickpeas, 1 can"|"Coconut milk, 1/2 can"|"Curry paste, 1 tbsp"|"Honey, 1 tsp + 1 tbsp"|"Granola, 1/2 cup"|"White beans, 1/2 can"|"Coffee" +check
list@aisle-frozen title="Frozen" "Frozen edamame, 1 cup"|"Frozen corn, 1/2 cup"|"Frozen peas, 1/2 cup" +check
card@groc-add "Need something else?" "Say it or type it, like: add oat milk to my groceries." cta="Add to the list"`,
    next: `~kcal 700kcal "Calories today" sub="of 2,100. 1,400 to go."
~macros bar "Macros vs goal" x=Protein|Carbs|Fat y=55|75|18 y2=140|210|70 names=Today|Goal unit=g
~next-meal "Up next: Dinner" "Chicken stir-fry. 680 kcal, about 25 minutes." sub="From your plan" cta="I ate it"
~eaten "Tap a meal to fix it" "Lunch, 700 kcal" body="Lunch: Chicken burrito bowl, 700 kcal"`,
  },
  {
    // Gouda's Learn a song (YUI-184, yui runtime/src/music.ts): one full-screen plan. What happens first, then the
    // song (his songs, or their own chords pasted), the key and how fast to start, one Send.
    slug: "gouda-learn",
    name: "Plan: Gouda teaches you a song",
    agent: "Gouda",
    yl: `say "Let's learn one."
plan@learn "Learn a song" submit="Let's play"
page "Play along" body="Pick a song or paste its chords. The chords land on buttons, the click counts you in, and your keys stay in its key. Slow it down or loop the hard bar any time."
choose@song "Which song?" "Stand By Me"|"Three Little Birds"|"Let It Be"|"Knockin' on Heaven's Door"|"My own chords" +other
form@own "Or paste the chords" name:text chords:long bpm:number
choose@key "What key?" "As written"|"Easiest on guitar"|"Up a step"|"Down a step"
choose@speed "How fast to start?" "Half speed"|"75%"|"Full speed"`,
  },
  {
    // Gouda's practice log (YUI-184): this week first, then how long, what and how it went, one Send. A click
    // stopped after 10 seconds or more logs itself too.
    slug: "gouda-practice",
    name: "Plan: log practice with Gouda",
    agent: "Gouda",
    yl: `plan@practiced "Log practice" submit="Log it"
page "This week" body="70 minutes so far. A 4 day streak."
choose@minutes "How long?" "5 min"|"10 min"|"15 min"|"20 min"|"30 min"|"45 min"|"1 hour"
pick@what "What did you play?" "Stand By Me"|"Chords"|"Scales"|"Beats"|"Ear training"|"Theory" +other
choose@feel "How did it go?" "Rough"|"Getting there"|"Nailed it"`,
  },
  {
    // After the Send (YUI-184): his four pages. Looper with a saved beat, Chords with the song on buttons, the click
    // and a bar looped, Keys in the song's key, Practice with the streak and what's next. Later answers only patch them.
    slug: "gouda-pages",
    name: "Pages: Gouda's looper, the song on chords, keys and practice",
    agent: "Gouda",
    yl: `say "Stand By Me is on your Chords page: 8 bars in A, the click at 89. Tap Start, count four, play."
>2
loop@looper 88 "Night drive" p=x..xx...|..x...x.||xxxxxxxx swing=20 rows=kick|snare|clap|hat +inline
choose@sessions "Open a beat" "Night drive"|"Lazy Sunday"|"Boom bap"|"Four on the floor"|"Rock backbeat"|"One drop" body="1 saved. Send on the looper saves another."
>3
card@lesson "Stand By Me" "Key of A, 8 bars. Click at 89, 75% of 118." sub="Looping bar 5" cta="Learn another"
chords@chords "D"|"E" "Stand By Me, bar 5" +inline
metronome@click 89 "Stand By Me"
choose@speed "Speed" "Half"|"75%"|"90%"|"Full" body="Now 89 bpm."
choose@bar "Loop a bar" "Whole song"|"Bar 1: A"|"Bar 2: A"|"Bar 3: F#m"|"Bar 4: F#m"|"Bar 5: D"|"Bar 6: E"|"Bar 7: A"|"Bar 8: A" body="Bar 5 and the next, over and over."
>4
keys@keys A major "Keys, in A" +inline
choose@scale "Scale" "Major"|"Minor"|"Pentatonic"|"Blues" body="A major. Keys outside it stay quiet."
>5
stat@streak "4 days" "Streak" sub="Days in a row. Keep it going."
stat@week-min "70 min" "This week" sub="Over 4 days"
chart@practice-chart bar "Minutes a day" x=Mon|Tue|Wed|Thu|Fri|Sat|Sun y=15|20|25|10|0|0|0 unit=min
card@next-up "Next: bar 5 of Stand By Me" "Loop it at 89 until it feels easy, then play the whole song." cta="Log practice"
list@recent title="Lately" "10/01 10 min, Stand By Me"|"09/30 25 min, Stand By Me, Scales"|"09/29 20 min, Stand By Me"|"09/28 15 min, Chords"`,
    next: `~lesson "Stand By Me" "Key of A, 8 bars. Click at 59, 50% of 118." sub="Looping bar 5" cta="Learn another"
~click 59 "Stand By Me"
~speed "Speed" "Half"|"75%"|"90%"|"Full" body="Now 59 bpm."`,
  },
  {
    // Penny's Plan my week (YUI-185, yui runtime/src/planner.ts): one full-screen plan. How it works first, then the
    // brain dump by mic (talk it out, or type), then the questions last, one Send.
    slug: "penny-plan",
    name: "Plan: Penny plans your week by voice",
    agent: "Penny",
    yl: `say "Let's get your week out of your head."
plan@weekplan "Plan my week" submit="Plan my week"
page "Your week, out of your head" body="Talk it out: everything on your plate, in any order. Say a day or a time when there is one. I'll sort the rest into days, never more a day than you pick, and put it on a timeline you can drag around. Already on it: renew the car registration."
mic@dump "Everything on your plate this week"
pick@busy "Any days already full?" "Today"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"|"Sunday" submit=Next
choose@pace "How many things a day?" "2 or 3"|"3 to 5"|"As many as fit"
choose@carry "Keep what's already on the week?" "Bring them in"|"Leave them"
choose@remind "Remind you of timed things?" "10 minutes before"|"At the time"|"No reminders"`,
  },
  {
    // After the Send (YUI-185): her two pages. Today with the next task big, the list with ticks and the evening review;
    // This week as a timeline by day with Edit order. The next patch is a tick: quiet, the row turns done in place.
    slug: "penny-pages",
    name: "Pages: Penny's today and this week",
    agent: "Penny",
    yl: `say "Your week is planned: 8 things over 4 days. Drag to reorder on This week. The 2 timed ones get a reminder. First up: renew the car registration."
>2
card@next-task "Renew the car registration" "2 more today after this." sub="Up next" cta="Done"
list@today title=Today "Renew the car registration"|"Pay the water bill"|"Groceries" +check
card@wrap "Evening review" "Two minutes at the end of the day: done, tomorrow or drop." cta="Wrap up the day"
>3
timeline@week "This week" mark=Today fold=12 +reorder
next@wk-renew-the-car-registration "Renew the car registration" at="Today" key=renew-the-car-registration
next@wk-pay-the-water-bill "Pay the water bill" at="Today" key=pay-the-water-bill
next@wk-groceries "Groceries" at="Today" key=groceries
next@wk-call-the-dentist "Call the dentist" at="Tomorrow" sub="9:00 am" key=call-the-dentist
next@wk-pick-up-the-dry-cleaning "Pick up the dry cleaning" at="Tomorrow" key=pick-up-the-dry-cleaning
next@wk-book-a-haircut "Book a haircut" at="Tomorrow" key=book-a-haircut
next@wk-gym "Gym" at="Thu" sub="6:00 pm" key=gym
next@wk-email-the-landlord "Email the landlord about the sink" at="Thu" key=email-the-landlord
next@wk-finish-the-report "Finish the report" at="Fri" key=finish-the-report
card@week-move "Move a task" "Drag with Edit order, or pick a task and a day." cta="Move a task"
card@week-plan "Plan again" "More on your plate? Talk it out and I'll fit it in." cta="Plan my week"`,
    next: `~next-task "Renew the car registration" "1 more today after this." sub="Up next" cta="Done"
~today title=Today "Renew the car registration"|"Groceries" +check
~wrap "Evening review" "1 done so far. Two minutes: done, tomorrow or drop." cta="Wrap up the day"
~wk-pay-the-water-bill "Pay the water bill" at="Today" key=pay-the-water-bill kind=done`,
  },
  {
    // Penny's Evening review (YUI-185): what got done first, then each task still open today (done, tomorrow or drop),
    // how the day went, one Send. The day is kept in her reviews table.
    slug: "penny-review",
    name: "Plan: Penny's evening review",
    agent: "Penny",
    yl: `plan@review "Evening review" submit="Wrap up the day"
page "2 done today" body="Nice. 3 still open: done, tomorrow or drop each one." points="Pay the water bill"|"Groceries"
choose@r-renew "Renew the car registration" "Done"|"Tomorrow"|"Drop"
choose@r-cleaning "Pick up the dry cleaning" "Done"|"Tomorrow"|"Drop"
choose@r-landlord "Email the landlord about the sink" "Done"|"Tomorrow"|"Drop"
choose@feel "How did today go?" "Great"|"Okay"|"Rough"`,
  },
  {
    // Quill's Learn a topic (YUI-186, yui runtime/src/study.ts): one full-screen plan, what happens first, the
    // questions last (the topic was said, so no topic question), one Send. Its answer is quill-lesson.
    slug: "quill-learn",
    name: "Plan: Quill teaches you a topic",
    agent: "Quill",
    yl: `say "Let's learn how vaccines work."
plan@learn "Learn a topic" submit="Teach me"
page "Five minutes, then a quiz" body="Tell me what you want to learn, how long you have and what you know already. I'll make a short lesson, one idea a page, with a quick quiz at the end. What you learn becomes cards you review later, next to World capitals."
choose@time "How much time do you have?" "5 minutes"|"10 minutes"|"20 minutes"
choose@know "What do you know about how vaccines work already?" "Nothing yet"|"The basics"|"Quite a bit"`,
  },
  {
    // The learn plan's Send (YUI-186): a real GLM 5.2 lesson as the runtime draws it, one deck on the stage, one idea a
    // page, ending in a graded quiz. Each quiz answer is quiet; the deck's done keeps the score.
    slug: "quill-lesson",
    name: "Deck: Quill's five minute lesson and quiz",
    agent: "Quill",
    yl: `say "Here's How Vaccines Work in a 5 minute lesson. A 3 question quiz at the end. 5 cards go in your review, first one tomorrow."
deck@lesson-how-vaccines-work "How Vaccines Work" +full
page "Your Immune System" body="Your immune system is your body's defense team. When a germ gets inside, special cells fight it off and remember it for next time." points="Detects germs"|"Fights infection"|"Remembers enemies"
page "Teaching the Body" body="A vaccine shows your immune system a harmless version of a germ. This lets your body practice fighting it so it is ready for the real thing." points="Safe practice round"|"Builds memory cells"|"No actual sickness"
page "Making Antibodies" body="After practice, your body makes antibodies that lock onto that specific germ. If the real germ shows up later, your body can attack fast." points="Antibodies lock on"|"Fast response"|"Stops germs before illness"
page "Protecting Everyone" body="When most people are vaccinated, germs cannot spread easily. This protects people who cannot get vaccines, like newborn babies or those who are very sick." points="Hard for germs to spread"|"Shields the vulnerable"|"Called herd immunity"
choose@quiz-how-vaccines-work-1 "What does a vaccine show your immune system?" "A harmless version of a germ"|"A real sickness"|"A new kind of medicine"|"A virus that makes you very ill" answer="A harmless version of a germ" why="It lets your body practice fighting without making you sick."
choose@quiz-how-vaccines-work-2 "What does your body make after getting a vaccine?" "Antibodies"|"New skin"|"Extra blood"|"More germs" answer="Antibodies" why="Antibodies lock onto a specific germ so your body can fight it fast."
choose@quiz-how-vaccines-work-3 "Why does vaccinating many people help protect everyone?" "It makes germs stronger"|"Germs cannot spread easily"|"It cures all sickness"|"It makes people taller" answer="Germs cannot spread easily" why="When most people are immune, germs have nowhere to go."`,
  },
  {
    // Quill's card review (YUI-186): the cards due today as one plan, each card's front with its answer and Again,
    // Hard, Good or Easy, one Send. A rating moves the card's box and next day: again today, hard tomorrow, good and
    // easy further out each time.
    slug: "quill-review",
    name: "Plan: Quill's card review",
    agent: "Quill",
    yl: `plan@review "Review 5 cards" submit="Save my review"
page "5 cards due" body="Think of the answer before you look. Then tap how it went: Again brings it back today, Easy sends it furthest."
choose@c-c1 "Tokyo" "Again"|"Hard"|"Good"|"Easy" title="Capital of Japan?" tag="World capitals"
choose@c-c2 "Ottawa" "Again"|"Hard"|"Good"|"Easy" title="Capital of Canada?" tag="World capitals"
choose@c-c3 "Canberra" "Again"|"Hard"|"Good"|"Easy" title="Capital of Australia?" tag="World capitals"
choose@c-c4 "Brasilia" "Again"|"Hard"|"Good"|"Easy" title="Capital of Brazil?" tag="World capitals"
choose@c-c5 "Nairobi" "Again"|"Hard"|"Good"|"Easy" title="Capital of Kenya?" tag="World capitals"`,
  },
  {
    // After a review (YUI-186): Quill's three pages. What you're studying, Next review (the due count and Start) and
    // Progress (streak, cards reviewed this week, cards learned, last quiz). The next patch is a quiz finished.
    slug: "quill-pages",
    name: "Pages: Quill's studying, next review and progress",
    agent: "Quill",
    yl: `say "Saved: 8 cards reviewed, 1 to see again today. 1 still due."
>2
card@studying "World capitals" "8 cards. 1 due today." sub="Geography" cta="Review now"
list@decks title="Your decks" "World capitals, 8 cards"
card@learn-new "Learn something new" "A topic, how long you have, what you know. A short lesson, then a quiz." cta="Learn a topic"
card@walk "Stuck on a problem?" "I'll break it into steps. You answer each one before the next." cta="Walk me through it"
>3
stat@due 1 "Cards due today" sub="World capitals"
card@review-start "Review 1 card" "Think of the answer, then tap again, hard, good or easy." cta="Start review"
>4
stat@streak 1 "Day streak" sub="Keep it going today"
chart@studied bar "Cards reviewed" x=Tue|Wed|Thu|Fri|Sat|Sun|Today y=0|0|0|0|0|0|8
stat@learned 0 "Cards learned" sub="of 8 cards, box 4 or higher"
stat@last-quiz "None" "Last quiz" sub="Finish a lesson's quiz"`,
    next: `~last-quiz "2/3" "Last quiz" sub="How Vaccines Work"`,
  },
  {
    // Walk me through a problem (YUI-186): the model breaks it into steps once; each step is its own page with a graded
    // question, and the next shows only once it is answered (next: the step locks once it is answered).
    slug: "quill-problem",
    name: "Steps: Quill walks you through a problem",
    agent: "Quill",
    yl: `say "Average speed of a train, in 3 steps. Answer each one and the next shows."
page "Step 1 of 3: Recall the speed formula" body="Average speed equals total distance divided by total time. Identify those two values in the problem."
math v = \\frac{d}{t}
choose@step-train-1 "What is the speed formula?" "distance times time"|"distance divided by time"|"time divided by distance"|"distance plus time" answer="distance divided by time" why="Speed is how much distance is covered per unit of time."`,
    next: `~step-train-1 +lock`,
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
    agent: "Scout",
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
    // Maps (YUI-158 step 1, Chris on the Mongol Empire answer: "this
    // should be a Map"). A drawn outline for a border that is not today's,
    // countries by code, a pin and four ways out of it.
    slug: "map",
    name: "Map: the Mongol Empire, 1279",
    agent: "Yui",
    yl: `say "At its peak, 1279, it ran from Korea to Hungary's edge."
map "The Mongol Empire, 1279" caption="24M km². The biggest land empire there has been."
area "Mongol Empire" 53,140|43,131|38.5,128.5|34.7,126.5|37.5,122.5|31,121.8|25,119.5|22.3,114|20.5,110.2|21.8,108|22.5,103|24,98|28,97|28,86|30,80|34,74|34,70|30,66|26,62|25.5,57|28,51|30,48|33,44|36,38.5|37,36|36.5,32|41,31|41.5,41.5|45,37|46,30.5|48,27|50.5,24|54,23|57,28|60,31|62,40|60,56|58,65|56,80|55,95|53,108|55,120 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow
route South ka|33.3,44.4 +arrow
route North ka|60,100 +arrow`,
  },
  {
    slug: "map-deck",
    name: "Map: a deck page's picture",
    agent: "Yui",
    yl: `>full
deck "The Mongols, by the map"
page "How far it reached" body="Korea to Hungary, the Siberian forest to Persia."
map caption="Karakorum sat in the middle and rode out every way."
area Empire 53,140|43,131|38.5,128.5|34.7,126.5|37.5,122.5|31,121.8|25,119.5|22.3,114|20.5,110.2|21.8,108|22.5,103|24,98|28,97|28,86|30,80|34,74|34,70|30,66|26,62|25.5,57|28,51|30,48|33,44|36,38.5|37,36|36.5,32|41,31|41.5,41.5|45,37|46,30.5|48,27|50.5,24|54,23|57,28|60,31|62,40|60,56|58,65|56,80|55,95|53,108|55,120 tone=butter
pin@ka Karakorum 47.2,102.8 +pulse
route West ka|47.5,19 +arrow +dash
page "The biggest one on land"
chart bar "Land empires, million km²" x=Mongol|Russian|Qing|Roman y=24|22.8|14.7|5
end`,
  },
  {
    // YUI-158 follow-up: a train trip with a label on every leg. Before, the
    // leg labels sat on the city names ("BaAVE, ~2.5-3h"); now pins claim
    // first and each leg's label sits beside the middle of its line.
    slug: "where-trip",
    name: "Where: Lisbon to Barcelona by train",
    agent: "Yui",
    yl: `say "Lisbon goes north to Porto, then through Vigo in Galicia to Madrid, because there's no direct Porto–Madrid train. From Madrid it's a fast run east to Barcelona."
map "Lisbon to Barcelona by rail" caption="North to Porto, over the border at Vigo, high-speed to Madrid, then east to Barcelona."
pin@li Lisbon 38.72,-9.14
pin@po Porto 41.15,-8.61 +pulse
pin@vi Vigo 42.24,-8.72
pin@ma Madrid 40.42,-3.70 +pulse
pin@ba Barcelona 41.39,2.17
route "Alfa Pendular, ~3h" li|po
route "Celta, ~2.5h" po|vi tone=butter +arrow
route "Alvia via Ourense, ~4.5h" vi|ma
route "AVE, ~2.5–3h" ma|ba`,
  },
  {
    // YUI-158 step 3, channel guide v37: where is a map. The Mongols answer the
    // eval agent sent on the v37 draft, as sent. Before: a stat and four
    // compass bullets (feedback AL2nKEYo, "this should be a Map").
    slug: "where-mongols",
    name: "Where: the Mongols, a map per page",
    agent: "Yui",
    yl: `say "The Mongols came from the grassland north of the Gobi and rode that belt of steppe outward, building the largest land empire in history."
>full
deck "The Mongols, by the map"
page "Where they started" body="Open grassland between the Siberian forest and the Gobi. Herders on horseback, moving with their animals, and at home in the saddle over huge distances."
map caption="Genghis Khan united the tribes here in 1206 and built his capital at Karakorum."
area Homeland MN tone=mint
pin@onon "Onon River" 48.8,110.5
pin@ka Karakorum 47.2,102.8 +pulse
page "How far it reached" body="The steppe runs like a highway from Manchuria to Hungary, and the Mongols rode it both ways. By 1279 they held Korea to Ukraine, the Siberian forest to Persia."
map caption="Karakorum sat in the middle and rode out every way."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka2 Karakorum 47.2,102.8 +pulse
route East ka2|37.6,127 +arrow
route West ka2|50.4,30.5 +arrow
page "Four khanates" body="Too big for one ruler, it split around 1260 into four realms run by Genghis's grandsons: the Yuan in China, the Chagatai in Central Asia, the Ilkhanate in Persia and the Golden Horde on the western steppe."
map caption="One family, four realms, each drifting its own way."
area Yuan CN|MN|KR tone=butter
area Chagatai UZ|KG|TJ tone=mint
area Ilkhanate IR|IQ|AZ|AM|GE tone=lavender
area "Golden Horde" 58,30|56,56|54,70|47,80|43,70|45,50|44,40|46,30 tone=mute
pin Khanbaliq 39.9,116.4 +pulse
end`,
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
  {
    // Music tools (spec/MUSIC.md, YUI-116): one per page, so the screen tabs
    // up top walk through them. Real sound from Web Audio, no sample files
    // (playground/music/engine.js). Send on the beat gets a stand-in reply.
    slug: "music",
    name: "Music tools: looper, drums, keys, chords, tuner",
    agent: "Yui",
    yl: `say "Six music tools, one per screen. Use the screen tabs up top, and turn your sound on."
say "2 is a beat to edit, 3 drum pads that record, 4 keys in A minor, 5 chords in G, 6 a guitar tuner, 7 a metronome."
>2 loop@beat 90 "Boom bap" steps=16 swing=25 rows=kick|snare|clap|hat|open|rim p=x......x..x.....|....x.......x...|............x...|x.x.x.x.x.x.x...|..............x.|...x.......x....
>2 say "Tap cells while it plays. Send gives me the pattern."
>3 drums 2x2 "Tap a beat" +record bpm=90
>4 keys Am pentatonic sound=pad +send
>5 chords G I-V-vi-IV +send
>6 tuner guitar
>7 metronome 90
>1`,
  },
  {
    // Sound keeps playing across screens (SITE-100, YL.md section 5): a loop on 2 and held keys on 3 layer, and
    // swiping between the screens (the tabs up top) stops neither. Leaving the demo stops both.
    slug: "layered-loops",
    name: "Layered loops: sound plays across screens",
    agent: "Yui",
    yl: `say "A loop on screen 2 and keys on screen 3. Turn your sound on, swipe between them, and both keep going."
>2 loop@beat 92 "Boom bap" steps=8 rows=kick|snare|hat p=x...x...|....x...|x.x.x.x. +play
>2 say "Tap the screen tabs. The loop does not stop."
>3 keys Am pentatonic sound=pad
>3 say "Tap Hold, press a key or two, then go back to screen 2. They ring on top of the loop."
>1`,
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
    // FLOW-1 step 3 (spec/FLOWS.md, section 9): a variant. Scout starts from
    // the website intake and sends only what changes for a restaurant.
    slug: "flow-variant",
    name: "Flow: a variant an agent makes (restaurant intake)",
    agent: "Scout",
    yl: `say "Your intake, made over for a restaurant: menu and online orders instead of pages and products. Saved as Restaurant intake."
${variantLines(FLOW_VARIANTS[0])}`,
  },
  {
    // YUI-155, feedback AMLn-Gg3: no app build runs flows yet, so the yui plugin
    // sends `flow website-intake` to the phone as the plan it walks by default.
    slug: "flow-as-plan",
    name: "Flow: the intake on an app that can't run flows yet",
    agent: "Yui",
    yl: `say "Let's build your personal brand site. A few quick questions first."
plan@intake "Client website intake" submit="Send the brief"
page "Let's plan your site" body="About ten questions. Your answers become the brief, so guess when you are not sure."
form@biz "Your business" "Business name":text! "What you do":long "Who it is for":text
choose@kind "What are we building?" "New site"|Redesign|Shop|"Landing page"
choose@goal "What should a visitor do first?" Call|Book|Buy|"Sign up"|Read
pick@pages "Which pages?" Home|About|Services|Pricing|Blog|Contact +other
form@brand "Your brand" logo:yes colors:text "A site you like":url
slide@budget "Budget, in thousands" 2-50 "$2k"|"$50k"
end`,
  },
  {
    // YUI-155: the same answer before and after, as the phone draws it.
    slug: "flow-before-after",
    name: "Flow: a headline, then the questions",
    agent: "Yui",
    yl: `sketch "Interview me for a personal brand site" frame=phone before=Before
row "Let's build your personal brand site. A few quick questions first." note="the headline"
row "flow website-intake" +x note="the phone can't run it yet"
after After
row "Step 1 of 7: Let's plan your site" +hi note="the same questions"
row "Your business · What are we building? · Pages · Brand · Budget" +hi note="one at a time"
row "Send the brief" +button note="one submit"`,
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
  {
    // Body text (SITE-97, spec/YL.md "Body text"): say, card and page words read as a little markdown,
    // in regular weight at a reading measure. One line per say, so a list is one say per point.
    name: "Body text",
    slug: "body-text",
    agent: "Yui",
    yl: `say "## What changed"
say "The build is out. Bold, *italic*, \`code\` and [a link](https://www.yuigui.com/spec) all read as they should, and no raw stars show. A whole thought of two or three sentences stays in one bubble, in regular weight, at a width you can read."
say "**Fixed:** the timer no longer drifts on long sets."
say "✅ Tests: 27 passed"
say "❌ Lint: 2 warnings left"
say "Next step: run it on a phone"
card "Card title" "A card body over sixty characters reads as body text: regular weight, a comfortable line height and a short measure, never all bold." cta="Open"`,
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

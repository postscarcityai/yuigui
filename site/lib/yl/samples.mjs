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

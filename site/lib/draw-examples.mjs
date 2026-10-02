// /developers/draw: every drawing part Yui has today, with the lines that draw it. One entry per part.
// Each `yl` is parsed by scripts/draw-check.mjs, so a line the parser no longer reads fails the check.
export const DRAWINGS = [
  {
    id: "shapes",
    title: "Shapes",
    what: "Circles, boxes, pills, dots, blobs, text, lines, arrows and paths that come on one after another. Good for an idea that moves or is not a graph.",
    parts: "circle, box, pill, dot, blob, text, line, arrow, path",
    yl: `shapes "How an ask reaches the app" caption="You ask, it lands on the board, a lane builds it, and it ships to your phone."
shape@you circle You +grow
shape arrow
shape box Board +fill
shape arrow
shape pill Lane +pulse
shape arrow label=ships
shape circle Phone tone=mint`,
  },
  {
    id: "shapes-free",
    title: "Shapes, placed",
    what: "Put each part where you want it with at= and size=. Join two with an arrow, trace a path, pick a tone.",
    parts: "blob, dot, text, arrow, path",
    yl: `shapes "Where the time goes" w=10 h=5 caption="Most of a reply is the model thinking. The phone draws in a blink."
shape@think blob Thinking at=3,2.5 size=4,3 tone=lavender +fill +grow
shape@draw dot at=8,2.5 tone=mint
shape text "drawing" at=8,3.4
shape arrow from=think to=draw +dash
shape path pts=1,4.6|3,4|5,4.4|7,3.8|9,4.2 tone=mute`,
  },
  {
    id: "sketch",
    title: "Sketch",
    what: "A bubble, a window or a phone with rows in it. Strike a row out, highlight one, grey one, draw a button. One after line makes a before and after pair.",
    parts: "bubble, window, phone, before and after",
    yl: `sketch "Plain words" frame=bubble
row "Parked the card in the backlog" +x note="an id means nothing to you"
after
row "Parked the drawing idea in the backlog" +hi note="plain words"`,
  },
  {
    id: "sketch-phone",
    title: "Sketch, a phone",
    what: "The same marks on a phone frame, with buttons. Good for showing what a screen should and should not do.",
    parts: "phone, rows, buttons, notes",
    yl: `sketch "Build ready" frame=phone
row "Build 97 is ready"
row +dim
row "Got it" +button +x note="does nothing"
row "Install" +button +hi note="does the thing"`,
  },
  {
    id: "mock",
    title: "Mock",
    what: "Redraw a screen from parts: a nav bar, rows, fields, buttons, tabs, sheets, a keyboard. Phone, window, watch or browser frame, with the same marks as a sketch.",
    parts: "nav, text, row, field, toggle, button, card, grid, tabs, sheet, alert, keyboard",
    yl: `mock "Agents" frame=phone
part nav Agents action=Edit
part text "Who do you want to talk to?" size=h2
part row Basil sub="Groceries and meals" icon=B +chev +hi note="new badge goes here"
part row Penny sub="Budget" icon=P +chev
part button "New agent" +hi note="the one thing to tap"
part tabs items=Home|Agents|Me tab=Agents`,
  },
  {
    id: "mock-browser",
    title: "Mock, a web page",
    what: "A browser frame with a URL, for a page you are proposing or one you only saw in a screenshot.",
    parts: "browser, segmented, card, grid, button",
    yl: `mock frame=browser url=yuigui.com/pricing
part text "Pricing" size=h1
part segmented items=Monthly|Yearly tab=Yearly
part card Crew sub="$12 a month" body="Every agent, every device" +hi note="the one we sell"
part grid items=Voice|Drawings|Timers|Games cols=2
part button "Start free"`,
  },
  {
    id: "flow",
    title: "Diagram: flow",
    what: "Write Mermaid, get a flowchart in your colors. Shapes, groups, dashed and thick edges, labels on the arrows.",
    parts: "flowchart, stadium, diamond, group, dashed edge",
    yl: `diagram "How an ask ships" caption="You ask. A lane builds it. It rides the next build."
flowchart LR
  you([You]) --> board[Board]
  subgraph fleet [The fleet]
    board --> lane[Lane]
    lane --> check{Checks green?}
  end
  check -->|yes| ship((TestFlight))
  check -.->|no| lane
end`,
  },
  {
    id: "sequence",
    title: "Diagram: sequence",
    what: "Who says what to whom, in order. Numbered steps, loops, notes and dashed replies.",
    parts: "actors, messages, loop, numbered steps",
    yl: `diagram "What happens when you send a message"
sequenceDiagram
  autonumber
  actor U as You
  participant A as Yui app
  participant G as Agent
  U->>A: type and send
  A->>G: your words
  loop while it thinks
    A-->>U: working row
  end
  G-->>A: yl lines
  A-->>U: the screen
end`,
  },
  {
    id: "state",
    title: "Diagram: state",
    what: "States and the moves between them, with start and end dots.",
    parts: "start, end, states, labeled moves",
    yl: `diagram "A TestFlight build"
stateDiagram-v2
  [*] --> Uploaded
  Uploaded --> Processing: Apple receives it
  Processing --> Valid: passes
  Processing --> Invalid: fails
  Valid --> [*]
end`,
  },
  {
    id: "chart-line",
    title: "Chart: line",
    what: "A line over time. Tap a point and your agent hears which one.",
    parts: "line",
    yl: `chart line "Weight" x=Mon|Tue|Wed|Thu|Fri y=181.2|180.6|180.1|179.4|179 unit=lb`,
  },
  {
    id: "chart-bar",
    title: "Chart: bar",
    what: "Bars, with error ranges and a second series to compare.",
    parts: "bar, error bars, two series",
    yl: `chart bar "Yield" x=None|Low|High y=2.1±0.3|3.4±0.4|4.8±0.7 y2=2.0|3.1|4.0 names=Tomato|Pepper unit=kg`,
  },
  {
    id: "chart-area",
    title: "Chart: area",
    what: "A filled line, for how much of something there has been.",
    parts: "area",
    yl: `chart area "Steps" x=Mon|Tue|Wed|Thu|Fri|Sat|Sun y=6200|8400|7100|9300|10100|12400|5200`,
  },
  {
    id: "chart-pie",
    title: "Chart: pie and donut",
    what: "Shares of a whole. The donut shows the total in the middle.",
    parts: "pie, donut",
    yl: `chart donut "Where the week went" x="Deep work"|Meetings|Email y=14|9|6 unit=h`,
  },
  {
    id: "map",
    title: "Map",
    what: "Countries filled in, pins on cities, routes between them. Drawn from a bundled outline: no tiles, no key, no network.",
    parts: "area, pin, route",
    yl: `map "The Mongol Empire, 1279" caption="24M km². The biggest land empire there has been."
area "Mongol Empire" 53,140|43,131|34.7,126.5|22.3,114|24,98|34,70|25.5,57|33,44|41,31|46,30.5|54,23|60,56|55,95 tone=butter
area Raided PL|HU +dash
pin@ka Karakorum 47.2,102.8 +pulse
route East ka|37.6,127 +arrow
route West ka|50.4,30.5 +arrow`,
  },
  {
    id: "math",
    title: "Math",
    what: "An equation typeset from LaTeX, with a caption.",
    parts: "equation, caption",
    yl: `math caption="Bayes' rule" P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)}`,
  },
];

// What is not drawn yet. Drawn dashed on the page, no dates.
export const COMING = [
  { id: "closed", title: "Closed regions", what: "Fill any outline you draw, not only shapes with a name." },
  { id: "venn", title: "Venn overlaps", what: "Two circles that share a middle, and a label for each part." },
  { id: "contour", title: "Contour lines", what: "Rings that show height, heat or cost across a surface." },
  { id: "doodle", title: "Doodle stroke", what: "A loose hand-drawn line, for a quick mark on a picture." },
];

export const playgroundHref = (yl) => `/playground?yl=${encodeURIComponent(yl)}`;

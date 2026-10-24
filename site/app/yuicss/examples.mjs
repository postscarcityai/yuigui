// The yuicss gallery's examples: plain HTML, the way the screen renderer will
// emit it. Each one is the contract for its element or component, drawn at
// /yuicss in three looks, light and dark. yuicss.test.mjs checks that every
// class used here exists in the built stylesheet.

const img = (n) => `/demo/g${n}.jpg`;

export const SECTIONS = [
  {
    id: "screen",
    title: "A whole screen, no classes to speak of",
    line: "The plan's example: ten lines of YL. Every element below is a bare tag, and it already looks like Yui in the agent's colors.",
    examples: [
      {
        title: "Your week",
        html: `<h1>Your week</h1>
<div class="bars h-32">
  <span style="--v:40%"></span><span style="--v:85%"></span><span style="--v:60%"></span><span style="--v:30%"></span><span style="--v:72%"></span><span style="--v:50%"></span><span class="on" style="--v:64%"></span>
</div>
<div class="axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
<p class="muted">Tue: 85% of your best</p>
<button>Plan tomorrow</button>`,
      },
      {
        title: "A check-in",
        html: `<h2>How did you sleep?</h2>
<p>Last night, 7h 10m. Two short wakes.</p>
<div class="options"><button>Great</button><button>Fine</button><button>Rough</button><button>Barely</button></div>
<label>Anything else? <input placeholder="A dream, a worry, a win"></label>
<button>Send</button>`,
      },
    ],
  },
  {
    id: "tokens",
    title: "Tokens",
    line: "One JSON file. An agent look sets these and nothing else: color, type, shape and motion. Pick a look above to see every token move.",
    tokens: true,
  },
  {
    id: "elements",
    title: "Elements, finished with no class",
    line: "Headings, text, buttons, inputs, lists, tables, folds and bars. Write the HTML tag and stop.",
    examples: [
      {
        title: "Type",
        html: `<h1>Heading one</h1>
<h2>Heading two</h2>
<h3>Heading three</h3>
<p>Body text is 17 px with room to breathe. <strong>Strong</strong>, <em>soft</em>, <a href="#">a link</a>, <code>code</code> and <mark>a mark</mark>.</p>
<small>Small print for the muted details.</small>
<blockquote>One idea per page. Type tells the story.</blockquote>
<hr>
<dl><dt>Pace</dt><dd>Even</dd><dt>Radius</dt><dd>Soft</dd></dl>`,
      },
      {
        title: "Buttons",
        line: "The first button is the primary one. Siblings after it step down to a tint on their own.",
        html: `<div class="row"><button>Start</button><button>Later</button></div>
<button>Full width on its own</button>
<div class="row"><button class="ghost">Ghost</button><button class="link">Link</button><button class="danger">Delete</button></div>
<div class="row"><button class="sm">Small</button><button class="sm icon">+</button><button class="lg">Large</button></div>
<button disabled>Disabled</button>`,
      },
      {
        title: "Inputs",
        html: `<label>Name <input placeholder="Your name"></label>
<label>Notes <textarea placeholder="A few words"></textarea></label>
<label>Goal <select><option>Sleep more</option><option>Lift heavier</option><option>Read daily</option></select></label>
<label><input type="checkbox" checked> Remind me at 9</label>
<label><input type="radio" name="r" checked> Morning</label>
<label><input type="radio" name="r"> Evening</label>
<label>Effort <input type="range" min="0" max="10" value="6" style="--v:60%"></label>
<button>Save</button>`,
      },
      {
        title: "Lists and tables",
        html: `<ul><li>Squat 5 × 5</li><li>Bench 5 × 5</li><li>Row 3 × 10</li></ul>
<ol><li>Warm up</li><li>Work sets</li><li>Cool down</li></ol>
<table><thead><tr><th>Plan</th><th class="num">Price</th></tr></thead><tbody><tr><td>Starter</td><td class="num">$500</td></tr><tr><td>Growth</td><td class="num">$1,500</td></tr><tr><td>Studio</td><td class="num">$4,000</td></tr></tbody></table>`,
      },
      {
        title: "Folds, bars and code",
        html: `<details><summary>What counts as a wake?</summary><p>Any stretch over three minutes with movement. Short rolls are not counted.</p></details>
<progress value="62" max="100"></progress>
<meter value="0.7">70%</meter>
<pre><code>timer 40/20x8 Tabata
stat 178.9lb Weight delta=-2.3</code></pre>
<figure><img src="${img(1)}" alt=""><figcaption>A picture takes the look's radius</figcaption></figure>`,
      },
    ],
  },
  {
    id: "utilities",
    title: "Utilities, Tailwind's names",
    line: "For the one thing that is different. Layout, spacing, size, color, type, shape and motion. Colors only from tokens, so contrast holds whatever the agent writes.",
    examples: [
      {
        title: "Layout",
        html: `<div class="row gap-2"><div class="flex-1 bg-accent-100 rounded p-3 text-center text-sm bold">flex-1</div><div class="w-20 bg-accent-200 rounded p-3 text-center text-sm bold">w-20</div></div>
<div class="grid-3 gap-2"><div class="bg-accent-100 rounded p-3 text-center text-sm">1</div><div class="bg-accent-200 rounded p-3 text-center text-sm">2</div><div class="bg-accent-300 rounded p-3 text-center text-sm">3</div></div>
<div class="row justify-between items-center"><span class="bold">justify-between</span><span class="badge">items-center</span></div>
<div class="stack h-24 rounded bg-gradient-soft"><span class="text-xl heavy">stack</span></div>`,
      },
      {
        title: "Color and type",
        html: `<div class="row gap-1 wrap"><span class="bg-accent-50 size-10 rounded-md"></span><span class="bg-accent-100 size-10 rounded-md"></span><span class="bg-accent-200 size-10 rounded-md"></span><span class="bg-accent-300 size-10 rounded-md"></span><span class="bg-accent-400 size-10 rounded-md"></span><span class="bg-accent size-10 rounded-md"></span><span class="bg-accent-600 size-10 rounded-md"></span><span class="bg-accent-700 size-10 rounded-md"></span><span class="bg-accent-800 size-10 rounded-md"></span><span class="bg-accent-900 size-10 rounded-md"></span></div>
<p class="text-2xl heavy tracking-tight">text-2xl heavy</p>
<p class="text-lg text-accent">text-lg text-accent</p>
<p class="text-sm text-muted uppercase">text-sm uppercase</p>
<p><span class="text-good bold">text-good</span> · <span class="text-warn bold">text-warn</span> · <span class="text-bad bold">text-bad</span></p>
<div class="row gap-2"><span class="bg-good text-good-ink rounded-full px-3 py-1 text-sm bold">bg-good</span><span class="bg-warn text-warn-ink rounded-full px-3 py-1 text-sm bold">bg-warn</span><span class="bg-bad text-bad-ink rounded-full px-3 py-1 text-sm bold">bg-bad</span></div>`,
      },
      {
        title: "Shape and motion",
        html: `<div class="row gap-3"><div class="size-16 bg-accent rounded-none"></div><div class="size-16 bg-accent rounded-md"></div><div class="size-16 bg-accent rounded"></div><div class="size-16 bg-accent rounded-full"></div></div>
<div class="row gap-3"><div class="flex-1 p-4 bg-surface rounded shadow-soft text-sm text-center">shadow-soft</div><div class="flex-1 p-4 bg-surface rounded shadow-lift text-sm text-center">shadow-lift</div><div class="flex-1 p-4 glass rounded text-sm text-center border">glass</div></div>
<div class="row gap-4 justify-center py-2"><div class="size-10 rounded-full bg-accent spin"></div><div class="size-10 rounded-full bg-accent-300 pulse"></div><div class="size-10 rounded-md bg-accent-600 float"></div><div class="size-10 rounded-full bg-accent ping"></div></div>
<div class="stagger row gap-2"><span class="chip">enter</span><span class="chip">stagger</span><span class="chip">delay</span><span class="chip">pace</span></div>`,
      },
    ],
  },
  {
    id: "components",
    title: "Components",
    line: "Ready-made parts with Yui's defaults. One class each.",
    examples: [
      {
        title: "card, hero",
        html: `<div class="hero"><span class="eyebrow">Sunday</span><h1>Rest, then a long walk</h1><p>Forty minutes, no watch.</p></div>
<div class="card"><h3>Sunday plan</h3><p>3 sessions, 40 min each. Legs on Tuesday.</p><button>Start</button></div>
<div class="card accent"><h3>Streak: 12 days</h3><p>Longest yet. Keep it light today.</p></div>
<div class="card soft"><p class="bold">A soft card</p><p class="text-sm">For the second thing on a screen.</p></div>`,
      },
      {
        title: "chips, options",
        html: `<div class="chips"><button class="chip on">Dumbbells</button><button class="chip">Barbell</button><button class="chip">Bands</button><button class="chip">Pull-up bar</button><button class="chip soft">+ other</button></div>
<div class="ask"><h3>Log this set?</h3><div class="options"><button>Yes</button><button>Skip</button></div></div>
<div class="choose"><h3>Which slot?</h3><div class="options"><button>3:00 pm</button><button class="on">4:00 pm</button><button>5:30 pm</button></div></div>`,
      },
      {
        title: "tabs, segmented, stepper, toggle, slider",
        html: `<div class="tabs"><span class="on">Week</span><span>Month</span><span>Year</span></div>
<div class="tabs line"><span class="on">Sets</span><span>History</span><span>Notes</span></div>
<div class="row justify-between"><span class="bold">Rounds</span><div class="stepper"><button>−</button><output>8</output><button>+</button></div></div>
<label class="toggle"><span>Remind me at 9</span><input type="checkbox" checked><span></span></label>
<label class="toggle"><span>Dark paper</span><input type="checkbox"><span></span></label>
<div class="slider"><label>How sore?</label><input type="range" min="1" max="5" value="2" style="--v:25%"><div class="ends"><span>Fresh</span><span>Wrecked</span></div></div>`,
      },
      {
        title: "progress, ring, badge, avatar",
        html: `<div class="progress"><span style="--v:62%"></span></div>
<div class="progress good thin"><span style="--v:90%"></span></div>
<div class="row gap-4 items-center"><div class="ring" style="--v:62"><div><span class="value">62</span><small>Done</small></div></div><div class="ring sm good" style="--v:90"><div><span class="value">9</span></div></div><div class="col gap-1"><span class="badge">New</span><span class="badge good dot">On track</span><span class="badge warn">Due soon</span><span class="badge bad">Missed</span><span class="badge solid">12</span></div></div>
<div class="row gap-3 items-center"><div class="avatar">Yu</div><div class="avatar round">AR</div><div class="avatar lg"><img src="${img(2)}" alt=""></div><div class="avatars"><div class="avatar sm round">A</div><div class="avatar sm round">B</div><div class="avatar sm round">C</div></div><span class="count">3</span></div>`,
      },
      {
        title: "field, sheet, toast, empty",
        html: `<div class="field"><label>Email</label><input placeholder="you@example.com"><span class="hint">Only for the receipt.</span></div>
<div class="field error"><label>Code</label><input value="12"><span class="error">Six digits.</span></div>
<div class="sheet"><h3>Start the session?</h3><p class="muted">Tabata, 8 rounds, 40 on 20 off.</p><button>Start</button><button class="ghost">Not now</button></div>
<div class="toast">Saved</div>
<div class="toast good">Set logged</div>
<div class="empty"><span class="glyph">🌱</span><h3>Nothing yet</h3><p>Your first plan shows up here.</p><button>Make one</button></div>
<div class="divider">or</div>
<div class="working"><span class="spinner"></span>Drafting the plan</div>`,
      },
    ],
  },
  {
    id: "presets",
    title: "Every preset, as a part",
    line: "What used to be 49 dead ends. Each one is a component now, so an agent can put a timer next to a chart next to a list.",
    examples: [
      {
        title: "say, list, table",
        html: `<div class="say">Leg day. Pick your gear and I'll build the session.</div>
<div class="say me">Dumbbells and a bench.</div>
<ul class="list"><li class="done"><span class="check"></span>Squat 5 × 5</li><li><span class="check"></span>Bench 5 × 5</li><li><span class="check"></span>Row 3 × 10</li><li class="tap"><span>Add a set</span></li></ul>
<div class="table"><table><thead><tr><th>Lift</th><th class="num">Sets</th><th class="num">Weight</th></tr></thead><tbody><tr><td>Back squat</td><td class="num">5</td><td class="num">225</td></tr><tr><td>Bench</td><td class="num">5</td><td class="num">185</td></tr></tbody></table></div>`,
      },
      {
        title: "stat, chart",
        html: `<div class="stats"><div class="stat"><span class="value">178.9<small>lb</small></span><span class="label">Weight</span><span class="delta down">−2.3 this week</span><div class="spark"><span style="--v:70%"></span><span style="--v:65%"></span><span style="--v:60%"></span><span style="--v:55%"></span><span style="--v:48%"></span></div></div><div class="stat"><span class="value">7h 10</span><span class="label">Sleep</span><span class="delta">+40 min</span></div></div>
<div class="chart"><h3>Weight</h3><svg viewBox="0 0 300 100" aria-hidden="true"><line class="gridline" x1="0" y1="50" x2="300" y2="50"/><path class="area" d="M0 70 L60 60 L120 64 L180 40 L240 44 L300 20 L300 100 L0 100Z"/><path class="line" d="M0 70 L60 60 L120 64 L180 40 L240 44 L300 20"/><circle class="pt" cx="300" cy="20" r="5"/></svg><div class="axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div></div>
<div class="chart"><h3>Load</h3><div class="bars"><span style="--v:40%" data-v="40"></span><span style="--v:85%" data-v="85"></span><span style="--v:60%" data-v="60"></span><span style="--v:30%" data-v="30"></span><span class="on" style="--v:72%" data-v="72"></span></div><div class="axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span></div></div>
<div class="row gap-4 items-center"><div class="pie donut" style="--a:55%;--b:80%"><span>55%</span></div><div class="legend"><span><i class="dot"></i>Protein</span><span><i class="dot bg-accent-300"></i>Carbs</span><span><i class="dot bg-accent-100"></i>Fat</span></div></div>`,
      },
      {
        title: "timer",
        html: `<div class="timer"><div class="ring" style="--v:62"><div><span class="value">0:24</span><small>Work</small></div></div><div class="rounds"><span class="on"></span><span class="on"></span><span class="on"></span><span></span><span></span><span></span><span></span><span></span></div><div class="controls"><button>Pause</button><button>Skip</button></div></div>`,
      },
      {
        title: "map, shapes, sketch",
        html: `<div class="map"><div class="road" style="left:10%;top:40%;width:80%;height:14px"></div><div class="road" style="left:55%;top:10%;width:14px;height:80%"></div><div class="pin" style="--x:30%;--y:44%" data-label="Gym"></div><div class="pin me" style="--x:70%;--y:70%" data-label="You"></div><div class="cap">12 min on foot</div></div>
<div class="shapes"><div class="shape circle">You</div><span class="arrow"></span><div class="shape">Relay</div><span class="arrow"></span><div class="shape fill">Yui</div><span class="caption">How a message travels</span></div>
<ul class="sketch window"><li class="x" data-note="an id means nothing">Parked YUI-83 in the backlog</li><li class="after">after</li><li class="hi" data-note="plain words">Parked the drawing card</li><li><span class="button">Open the board</span></li></ul>`,
      },
      {
        title: "math, steps, calc",
        html: `<div class="math">E = mc²</div>
<ol class="steps"><li><div><p>Divide both sides by g</p><div class="math">t² = 2d / g</div></div></li><li><div><p>Take the square root</p><div class="math">t = √(2d / g)</div></div></li></ol>
<div class="calc"><div class="result">$1,628<small>A = P·(1+r)ᵗ</small></div><div class="var"><span>P</span><input type="range" min="100" max="1000" value="1000" style="--v:100%"><output>1000</output></div><div class="var"><span>r</span><input type="range" min="0" max="20" value="5" style="--v:25%"><output>0.05</output></div><div class="var"><span>t</span><input type="range" min="0" max="20" value="10" style="--v:50%"><output>10</output></div></div>`,
      },
      {
        title: "gallery, image, compare, camera, mic",
        html: `<div class="gallery"><img src="${img(1)}" alt=""><img src="${img(2)}" alt="" class="on"><img src="${img(3)}" alt=""><img src="${img(4)}" alt=""></div>
<figure class="image"><img src="${img(5)}" alt=""><figcaption>Frame 1</figcaption></figure>
<div class="compare"><figure><img src="/demo/before_room.jpg" alt=""><figcaption>Before</figcaption></figure><figure><img src="/demo/after_room.jpg" alt=""><figcaption>After</figcaption></figure></div>
<div class="camera"><span class="shutter"></span>Snap your plate</div>
<div class="mic on"><div class="orb">🎙</div><p class="prompt">Tell me about your day</p><div class="wave"><span style="--v:30%"></span><span style="--v:70%"></span><span style="--v:100%"></span><span style="--v:55%"></span><span style="--v:80%"></span><span style="--v:35%"></span></div></div>`,
      },
      {
        title: "page, deck, timeline",
        html: `<div class="deck"><div class="page"><span class="eyebrow">1 of 3</span><h2>Long messages open in pages</h2><p>One idea per page. The title does the work.</p></div><div class="page accent"><h2>Build 82 is ready</h2><p>Add any A2A agent by its card.</p></div><div class="page"><h2>Tested</h2><ul class="points"><li>Client 42/42</li><li>Interop 4/4</li></ul></div></div>
<div class="dots"><span class="on"></span><span></span><span></span></div>
<ul class="timeline"><li class="done"><span class="when">Mon</span>Hero shipped</li><li class="done"><span class="when">Tue</span>Logos on the family cards</li><li class="now"><span class="when">Now</span>Blog migration</li><li class="next"><span class="when">Next</span>Contact form</li></ul>
<div class="flow"><span class="step done">Ask</span><span class="then"></span><span class="step on">Plan</span><span class="then"></span><span class="step">Build</span><span class="then"></span><span class="step">Ship</span></div>`,
      },
      {
        title: "game",
        html: `<div class="game"><div class="score"><span>You <strong>2</strong></span><span>Yui <strong>1</strong></span></div><div class="board"><div class="cell x">X</div><div class="cell o">O</div><div class="cell"></div><div class="cell"></div><div class="cell x win">X</div><div class="cell o">O</div><div class="cell"></div><div class="cell"></div><div class="cell x">X</div></div><button>Play again</button></div>`,
      },
    ],
  },
];

// Every class name the examples use (for the test and the contract fold).
export function classesUsed() {
  const out = new Set();
  for (const s of SECTIONS) for (const e of s.examples || []) for (const m of e.html.matchAll(/class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  return [...out].sort();
}

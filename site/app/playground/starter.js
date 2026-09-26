// The starter agent (spec/STARTER.md, YUI-37 step 1). A first launch with no
// agent: Yui offers four starters, the person picks one, and it answers right
// away. The playground has no model, so a stand-in sends the lines a starter
// would send: its first answer, then one more reply to that answer's question.
// In Yui these come from a model on the hosted connector, not from a script.

const q = (s) => String(s).replace(/"/g, "'").slice(0, 60);

const FIRST = {
  Coach: [
    `say "Hi, I'm Coach. I plan your training and run the timer. First, how much time do you have?"`,
    `choose@coach-days "How many days a week can you train?" 2|3|4|5`,
  ],
  Basil: [
    `say "Hi, I'm Basil. Send me a photo of any meal and I'll guess what's in it. You fix what I get wrong."`,
    `choose@basil-goal "What should I watch for?" "More protein"|"Less sugar"|"Just track it"`,
  ],
  Penny: [
    `say "Hi, I'm Penny. Tell me what's on your plate this week and I'll keep it in order."`,
    `pick@penny-week "What's on this week?" "Pay a bill"|"Call someone back"|"Book an appointment"|"Plan a trip" +other submit="Make my list"`,
  ],
  Quill: [
    `say "Hi, I'm Quill. Pick a topic and I'll quiz you, one question at a time."`,
    `choose@quill-topic "Quiz me on" "The planets"|"World capitals"|"Spanish basics"`,
  ],
};

const WEEKS = {
  2: ["Mon: full body, 30 min", "Thu: full body, 30 min"],
  3: ["Mon: legs and core", "Wed: push", "Fri: pull"],
  4: ["Mon: legs", "Tue: push", "Thu: pull", "Sat: a long walk"],
  5: ["Mon: legs", "Tue: push", "Wed: easy run", "Fri: pull", "Sat: a long walk"],
};

const QUIZ = {
  "The planets": `choose@quiz "Which planet is the biggest?" Mars|Jupiter|Saturn answer=Jupiter why="Jupiter has more mass than all the other planets put together."`,
  "World capitals": `choose@quiz "What is the capital of Australia?" Sydney|Canberra|Melbourne answer=Canberra why="Canberra was built as the capital so Sydney and Melbourne didn't have to fight over it."`,
  "Spanish basics": `choose@quiz "What does 'gracias' mean?" Please|Thanks|Hello answer=Thanks why="Gracias is thank you. Please is por favor."`,
};

// The reply to one event, as YL lines (null: not ours).
export function starterReply(ev) {
  if (ev.id === "starter" && ev.choice) {
    const name = String(ev.choice).split(",")[0].trim();
    return FIRST[name] || null;
  }
  if (ev.id === "coach-days" && WEEKS[ev.choice]) {
    return [
      `say "${ev.choice} days it is. Here's your first week. Tick a day off when it's done."`,
      `list Week ${WEEKS[ev.choice].map((d) => `"${d}"`).join("|")} +check`,
    ];
  }
  if (ev.id === "basil-goal" && ev.choice) {
    return [
      `say "${q(ev.choice)}, got it. Snap your next meal and I'll check it against that."`,
      `camera@basil-plate "Snap your meal" +inline`,
    ];
  }
  if (ev.id === "basil-plate" && ev.photo) {
    return [
      `say "In Yui I'd look at your photo now. The playground has no model, so the meal demo shows what comes back."`,
      `card "Meal photo to macros" "The estimate, how sure it is, a fix, then a row in your meals table." cta="Open the meal demo" url=https://www.yuigui.com/playground?demo=meal`,
    ];
  }
  if (ev.id === "penny-week" && Array.isArray(ev.picked) && ev.picked.length) {
    return [
      `say "Here's your week. Tick things off as you go."`,
      `list Week ${ev.picked.map((x) => `"${q(x)}"`).join("|")} +check`,
    ];
  }
  if (ev.id === "quill-topic" && QUIZ[ev.choice]) {
    return [`say "${ev.choice}. First question."`, QUIZ[ev.choice]];
  }
  return null;
}

// Meal photo to macros (spec/MEAL.md, YUI-35 step 1). The playground has no
// model, so a stand-in answers the photo: the lines a real agent would send
// after looking at it, each estimate one set of ids (meal1, kcal1, ...) so a
// second photo adds a second answer instead of clashing with the first.
// A tap on Save writes the row with `put` and shows today's totals.

import "./meal.css";

// The three sample photos (CC0, Wikimedia Commons, credits in spec/MEAL.md)
// and what a model might say about each. `sure` is the confidence note.
export const MEALS = [
  { src: "/demo/meal-pancakes.jpg", food: "Pancakes with berries", what: "Three pancakes, strawberries, blueberries, syrup", cal: 520, p: 12, c: 88, f: 14,
    sure: "Fairly sure on the stack. The syrup is a guess: I can see the pool, not how much soaked in." },
  { src: "/demo/meal-salmon.jpg", food: "Grilled salmon", what: "Salmon steak, greens, cherry tomatoes, avocado", cal: 560, p: 42, c: 12, f: 38,
    sure: "Sure on the salmon. Less sure on the avocado and any oil on the greens." },
  { src: "/demo/meal-poke.jpg", food: "Salmon poke bowl", what: "Salmon, rice, edamame, avocado, mango, spicy mayo", cal: 650, p: 32, c: 78, f: 22,
    sure: "Rough guess. The rice is under the toppings, so its size is the big unknown." },
];
// A photo from the person's own camera: the stand-in cannot look at it.
const OWN = { food: "Your meal", what: "", cal: 600, p: 30, c: 60, f: 25,
  sure: "Stand-in numbers. The playground has no model, so it cannot look at your photo. In Yui your agent does, with your own model key." };

const PORTION = { Half: 0.5, "As shown": 1, Bigger: 1.5, Double: 2 };
const shown = new Map(); // estimate number -> meal

// The reply to one event, as YL lines (null: not ours). `ids` = ids on screen.
export function mealReply(ev, ids) {
  if (ev.id === "samples" && Array.isArray(ev.picked) && ev.picked.length) return estimate(MEALS[ev.picked[0]], ids);
  if (ev.id === "plate" && ev.photo) return estimate(OWN, ids);
  const m = /^fix(\d+)$/.exec(ev.id || "");
  if (m && ev.form && shown.has(m[1])) return save(m[1], shown.get(m[1]), ev.form, ids);
  return null;
}

function estimate(meal, ids) {
  let n = 1;
  while (ids.has(`fix${n}`)) n++;
  shown.set(String(n), meal);
  return [
    meal.src ? `image@meal${n} ${meal.src} "${meal.what}"` : null,
    `say "${meal.food}, about ${meal.cal} kcal. ${meal.sure}"`,
    `stat@kcal${n} ${meal.cal}kcal Calories sub="a guess"`,
    `stat@protein${n} ${meal.p}g Protein`,
    `stat@carbs${n} ${meal.c}g Carbs`,
    `stat@fat${n} ${meal.f}g Fat`,
    `form@fix${n} "Fix it before I save" portion:Half|"As shown"|Bigger|Double "Anything I missed?":text submit=Save`,
  ].filter(Boolean);
}

function save(n, meal, form, ids) {
  const k = PORTION[form.portion] ?? 1;
  const r = (x) => Math.round(x * k);
  const extra = String(form.anything_i_missed || "").replace(/"/g, "'").trim().slice(0, 60);
  const food = `${meal.food}${k !== 1 ? ` (${form.portion.toLowerCase()})` : ""}${extra ? `, ${extra}` : ""}`;
  const lines = [
    `table create meals Day:date Food:text Cal:number:kcal Protein:number:g Carbs:number:g Fat:number:g`,
    `put meals Day=today Food="${food}" Cal=${r(meal.cal)} Protein=${r(meal.p)} Carbs=${r(meal.c)} Fat=${r(meal.f)}`,
  ];
  // The estimate follows the fix, so the tiles above match the saved row.
  if (k !== 1) lines.push(`~kcal${n} value=${r(meal.cal)} sub="${form.portion.toLowerCase()}"`, `~protein${n} value=${r(meal.p)}`, `~carbs${n} value=${r(meal.c)}`, `~fat${n} value=${r(meal.f)}`);
  lines.push(`say "Saved to your meals. ${extra ? "I left the extra out of the numbers, so fix them if it counts. " : ""}Here's today."`);
  // Queries are live, so the totals only go out once; later saves redraw them.
  if (!ids.has("today")) {
    lines.push(
      `query@today meals where=Day=today sum=Cal|Protein|Carbs|Fat as table "Today so far"`,
      `query@meals meals where=Day=today cols=Food|Cal|Protein as table "Meals today"`,
    );
  }
  return lines;
}

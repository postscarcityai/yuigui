// Basil's week (YUI-183, SITE-81): the runtime's answer to a sent meal plan,
// verbatim (yui runtime/src/mealplan.ts; the app's BasilToolsTests.planned).
// The week lands as a deck, a day a card and each meal a swap; Today is
// patched, This week (screen 3) and Groceries (screen 4) are drawn again.
// chunks.test.mjs and pages.test.mjs read it, and so does the playground's
// week-deck demo, so what is tested is what plays.

// Today's ids from the home, which the thread already holds (Ids that last).
export const BASIL_KNOWN = { kcal: "stat", macros: "chart", "next-meal": "card", eaten: "choose" };

export const BASIL_SAYS = "Your 3 days are planned. Tap any meal to swap it.";

export const BASIL_WEEK = `deck@week-deck "This week's meals"
page "3 days planned" body="About 1,781 kcal and 110 g protein a day, for a goal of 2,100. Add a snack a day to close the gap. Leaving out: nuts. 29 things on your grocery list, by aisle." points="Monday: Breakfast burrito, Chicken burrito bowl, Chicken stir-fry"|"Tuesday: Avocado toast with eggs, Teriyaki chicken rice bowl, Tofu coconut curry"|"Wednesday: Tofu scramble, Turkey hummus wrap, Spaghetti with meat sauce"
choose@swap-20260928 "Tap a meal to swap it" "Breakfast burrito"|"Chicken burrito bowl"|"Chicken stir-fry" tag="Mon" title="Monday, 1,908 kcal" body="Breakfast: Breakfast burrito, 528 kcal. Lunch: Chicken burrito bowl, 700 kcal. Dinner: Chicken stir-fry, 680 kcal"
choose@swap-20260929 "Tap a meal to swap it" "Avocado toast with eggs"|"Teriyaki chicken rice bowl"|"Tofu coconut curry" tag="Tue" title="Tuesday, 1,774 kcal" body="Breakfast: Avocado toast with eggs, 424 kcal. Lunch: Teriyaki chicken rice bowl, 650 kcal. Dinner: Tofu coconut curry, 700 kcal"
choose@swap-20260930 "Tap a meal to swap it" "Tofu scramble"|"Turkey hummus wrap"|"Spaghetti with meat sauce" tag="Wed" title="Wednesday, 1,660 kcal" body="Breakfast: Tofu scramble, 430 kcal. Lunch: Turkey hummus wrap, 570 kcal. Dinner: Spaghetti with meat sauce, 660 kcal"
end
~kcal 0kcal "Calories today" sub="of 2,100. Log a meal to start."
~macros bar "Macros vs goal" x=Protein|Carbs|Fat y=0|0|0 y2=140|210|70 names=Today|Goal unit=g
~next-meal "Up next: Lunch" "Chicken burrito bowl. 700 kcal, about 25 minutes." sub="From your plan" cta="I ate it"
~eaten "Tap a meal to fix it" "Log a meal" body="Nothing logged yet today."
>3 clear
>3
choose@wk-20260928 "Tap a meal to swap it" "Breakfast burrito"|"Chicken burrito bowl"|"Chicken stir-fry" tag="Mon" title="Monday, 1,908 kcal" body="Breakfast: Breakfast burrito, 528 kcal. Lunch: Chicken burrito bowl, 700 kcal. Dinner: Chicken stir-fry, 680 kcal"
choose@wk-20260929 "Tap a meal to swap it" "Avocado toast with eggs"|"Teriyaki chicken rice bowl"|"Tofu coconut curry" tag="Tue" title="Tuesday, 1,774 kcal" body="Breakfast: Avocado toast with eggs, 424 kcal. Lunch: Teriyaki chicken rice bowl, 650 kcal. Dinner: Tofu coconut curry, 700 kcal"
choose@wk-20260930 "Tap a meal to swap it" "Tofu scramble"|"Turkey hummus wrap"|"Spaghetti with meat sauce" tag="Wed" title="Wednesday, 1,660 kcal" body="Breakfast: Tofu scramble, 430 kcal. Lunch: Turkey hummus wrap, 570 kcal. Dinner: Spaghetti with meat sauce, 660 kcal"
card@week-plan "Want a new week?" "New likes, a new budget, or just a change." cta="Plan again"
save this week
>4 clear
>4
stat@groc-left "29 to get" "Grocery list" sub="From your meal plan and what you added"
list@aisle-produce title="Produce" "Spinach"|"Berries"|"Avocado, 1"|"Stir-fry vegetables, 3 cups"|"Broccoli, 1 cup"|"Bell peppers, 1"|"Apples, 1" +check
list@aisle-meat-and-fish title="Meat and fish" "Chicken thighs"|"Chicken breasts, 2"|"Deli turkey, 4 slices"|"Ground beef, 1/4 lb" +check
list@aisle-dairy-and-eggs title="Dairy and eggs" "Greek yogurt"|"Eggs"|"Cheddar, 1/2 cup"|"Firm tofu, 1 1/2 blocks"|"Hummus, 2 tbsp"|"Parmesan, 2 tbsp" +check
list@aisle-bakery title="Bakery" "Flour tortillas, 2"|"Whole wheat bread, 3 slices" +check
list@aisle-pantry title="Pantry" "Rice"|"Black beans, 1 can"|"Salsa, 4 tbsp"|"Soy sauce, 1 tbsp"|"Olive oil, 1 tbsp + 1 tsp"|"Teriyaki sauce, 2 tbsp"|"Coconut milk, 1/2 can"|"Curry paste, 1 tbsp"|"Pasta, 1/4 box"|"Marinara, 1/2 cup" +check
card@groc-add "Need something else?" "Say it or type it, like: add oat milk to my groceries." cta="Add to the list"
save groceries`;

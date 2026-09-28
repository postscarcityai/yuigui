# Agent tables

An agent can keep data on the phone: a workout log, today's macros, a small CRM. Three words do it. `table create` makes a table, `put` writes a row, `query` draws rows as a table, a list, a chart or one big number. The data lives on the person's phone, one set of tables per agent, and it outlives every reply.

```
table create meals Day:date Food:text Cal:number:kcal Protein:number:g
put meals Day=today Food="Chicken bowl" Cal=640 Protein=52
query meals where=Day=today sum=Cal|Protein as stat label="Today"
```

Status: YUI-33. Native agents keep their tables on Yui's server today (YUI-170, section 7), and any connected agent gets the same tables through the relay next (YUI-171, section 8). Step 1 (this page, the parser and the playground) is the spec and the web runtime. Step 2 is the app: the same store in SQLite on the phone and the Swift parser (YUI-89). The Python, Kotlin and Rust parsers already read `table create`, `put` and `query` and carry the same store, so the vectors in `spec/conformance/30-tables.json` run in every language here. Try it at [/playground](/playground), under "Agent tables".

## 1. The three words

### table create

`table create <name> col:type ...`

| Type | Holds | Written as |
|---|---|---|
| `text` | words, up to 1,000 characters | `Food="Chicken bowl"`, `Stage=Lead` |
| `number` | a number | `Cal=640`, `Weight=72.5` |
| `date` | a day, or a day and a time | `2026-09-25`, `2026-09-25T18:30`, `today`, `today-1`, `now` |
| `bool` | on or off | `Done=on`, `Done=off`, or the flag `+Done` |

- A number column may carry a unit as a third part: `Cal:number:kcal`, `Weight:number:lb`, `Value:number:$`. Tables and charts show it under the header, the same as a table's `units=`.
- Names: a table is a letter then letters, digits, `_` or `-`, up to 32 characters. A column is an identifier (`[A-Za-z_][\w-]*`). `key` is not a column name: it is the row key (below).
- Up to 12 columns. Sending the same `table create` again is safe and changes nothing, so an agent may send it at the top of every reply that writes.
- `table create` takes no `@id`. Plain `table name` still draws the table called `name`, and an inline table (`table Macros Food|Cal "Eggs|140"`) is unchanged.

**Changing the columns.** `table create` with a name that exists changes that table. Columns are matched by name. A kept column keeps its values; if its type changed, each value is converted, and a value that does not fit the new type is emptied (`"soon"` in a column that becomes `number`). A column left out is removed with its values. A new column starts empty. Rows are never dropped by a change of columns.

### put

`put <table> [key] col=value ... [+delete]`

- **Upsert by key.** A row with that key is updated: only the columns the line names change. With no row by that key, a new one is added. `put crm acme Stage=Proposal` moves Acme to Proposal and leaves its other cells alone.
- **No key appends.** `put meals Food=Oats Cal=300` adds a new row every time, which is what a log wants. The phone gives it a key (`r1`, `r2`, ...).
- A key is a bare word or a quoted string, up to 64 characters: `put crm "Acme Co" Stage=Lead`.
- `col=` with nothing after it empties that cell. A flag sets a bool column: `+Done` is `Done=on`.
- `+delete` with a key takes the row out: `put crm acme +delete`. It takes no values. Deleting a key that is not there does nothing.
- **All or nothing.** If one value does not fit its column, or names a column the table does not have, or the table does not exist, the whole line is refused and nothing is written. The agent hears about it (section 3).
- Dates: `today`, `today-7`, `today+1` and `now` are read on the phone, in its time zone, when the line lands. An agent never has to know the person's date.

### query

`query <table> [where=...] [sort=...] [limit=N] [cols=...] [group=Col] [sum=...] [avg=...] [min=...] [max=...] [+count] [as table|list|chart|stat|send] [title...]`

A query is a component: it takes an `@id`, gets an event id like any preset, can be patched (`~today where=Day=today-1`), saved and shown. It is live. When a `put` lands, from this reply or a later one, or the person changes a row, every query on screen redraws.

- `where=Col<op>value`, several joined with `|`, all must hold: `where=Day>=today-6|Cal>100`. Operators: `=`, `!=`, `>`, `<`, `>=`, `<=`, and `~` (contains). Text compares without case (`Stage=lead` matches `Lead`). A date with no time compares by day, so `Day=today` holds for a row stamped `now`. `Col=` matches empty cells, `Col!=` filled ones. `key` works like a column: `where=key=acme`. Quote a clause with spaces: `where="Stage=Warm lead"`.
- `sort=Col`, `sort=-Col` for high to low, several with `|`. Empty cells sort last either way. With no `sort`, rows keep the order they were first written.
- `limit` [50], at most 500. `cols=Food|Cal` shows only those columns.
- **Totals.** `sum`, `avg`, `min`, `max` name columns; `+count` adds a `Count` column. With `group=Col` there is one row per value of that column; without it, one row for the whole table. The columns come out as the group column, then `sum`, `avg`, `min`, `max` in that order, each named after its column (a second use of a column is named `avg Weight`), then `Count`. `sort` then names those output columns.
- `as` picks the view [table]. Any other positional text is the title.

| View | Draws | Extra props |
|---|---|---|
| `as table` | the `table` preset; a header tap sorts it on the phone (as `table +sort`) | none |
| `as list` | the `list` preset, one item per row, its cells joined with ` · ` | `check=Col` makes a bool column the checkbox |
| `as chart` | the `chart` preset over the rows | the chart's own: `type` (or `as chart bar`), `x` (a column), `y` (columns), `unit`, `min`, `max`, `+stack` |
| `as stat` | the `stat` preset | `y=Col` picks the number [the first number column]. The value is the last row's; with two or more rows the tile adds the change since the row before and a spark line of the whole column. `label`, `good` |
| `as send` | a card: "Send 12 rows from meals?" | the person taps Send to hand the rows to the agent (section 3) |

A query on a table that does not exist shows "No table called meals yet." A query that cannot run (a column that is not there) shows why, in place of the view.

## 2. Limits

| What | Limit |
|---|---|
| tables per agent | 20 |
| columns per table | 12 |
| rows per table | 5,000 |
| text in one cell | 1,000 characters |
| row key | 64 characters |
| table name | 32 characters |
| rows a query shows | 50 by default, 500 at most |
| rows one `send` hands over | 200 |

A `put` past a limit is refused like any bad value. The numbers are the phone's, not the wire's, and may grow.

## 3. Events back

Writes are quiet: a `put` that lands sends nothing back. The agent hears about the table in three cases.

```
{"op":"row","table":"meals","key":"x","error":"Cal: \"lots\" is not a number","line":"put meals x Cal=lots"}
{"id":"n2","preset":"query","op":"row","table":"todo","key":"t3","values":{"Done":true}}
{"id":"n4","preset":"query","op":"query","table":"meals","cols":["Day","Food","Cal"],"rows":[["2026-09-25","Oats",300]],"count":1}
```

1. **A write was refused** (`op: "row"` with `error`): the line, and why. It is sent once after the reply, with the reply's other errors.
2. **The person changed a row** in a view (`op: "row"`, from the query's id): ticking a `check` box. The phone has already written it; the event says what changed.
3. **The person sent rows** (`op: "query"`): they tapped Send on an `as send` view. `rows` are in `cols` order, dates as written, at most 200; `count` is how many matched.

## 4. Privacy

- **A connected agent's tables live on the phone.** In the app, one SQLite file per agent in the app's own storage (YUI-89). In the playground, the browser's `localStorage`. They are never written to Yui's server, never to a `yui_` table, never into a push.
- **A native agent's tables live with the agent.** A native agent (Yui and the starter crew) already runs on Yui's server, so its tables are kept there too, one set per agent, readable only by the runtime. Section 7.
- **What does travel.** The `put` lines an agent writes are part of its reply, and a reply goes through the relay like any message (kept 90 days, then deleted). The agent sees table data only when the person sends it: a changed row (event 2) or rows they chose to send (event 3). There is no way for an agent to read a table silently.
- **One agent, its own tables.** An agent cannot query another agent's tables. Removing an agent removes its tables. Deleting the account removes all of them.
- **Any agent, next.** Section 8 moves a connected agent's tables onto the server too, owned by the person and handed between agents.
- **Backups and sync.** Step 1 has none: a new phone starts with empty tables. [Encrypted sync](/developers/sync) (YUI-36) decides v1 ships without sync, proposes keeping the tables file in the iPhone's own backup so a new phone keeps it, and designs end to end encrypted sync for when a second Yui device arrives.

## 5. Starters

Three samples in the playground, each a `table create`, a few rows and the views. Send a `put` from the agent line under them and watch the views redraw. The rows you add stay in your browser until you tap Reset data.

**Workout log.**
```
table create lifts Day:date Lift:text Weight:number:lb Reps:number
put lifts Day=today-2 Lift=Squat Weight=225 Reps=5
put lifts Day=today Lift=Squat Weight=235 Reps=5
query lifts group=Lift max=Weight sum=Reps as table "Best set per lift"
query lifts where=Lift=Squat sort=Day as chart x=Day y=Weight "Squat"
```

**Macros.**
```
table create meals Day:date Food:text Cal:number:kcal Protein:number:g
put meals Day=today Food=Oats Cal=300 Protein=10
query meals where=Day=today sum=Cal|Protein as table "Today so far"
query meals group=Day sum=Cal sort=Day as stat y=Cal label="Calories today" good=down
```

To log a meal from a photo, with an estimate the person fixes before it is saved, see [Meal photo to macros](/developers/meal).

**A simple CRM.**
```
table create crm Name:text Stage:text Value:number:$ Next:date Hot:bool
put crm acme Name="Acme Co" Stage=Lead Value=12000 Next=today+2 +Hot
query crm where=Stage!=Won sort=Next as table "Open deals"
query crm group=Stage sum=Value as chart bar x=Stage y=Value "Pipeline"
```

## 6. Parser and store

- Ops: `table create` gives `{op: "table", screen, name, cols: [{name, type, unit?}]}`, `put` gives `{op: "put", screen, table, key?, values, delete?}`. Neither takes an `@id`, advances the counter, draws anything or ends an open group. `query` is an add like any preset, `{op: "add", preset: "query", id, props}`; `where`, `sort`, `cols`, `y`, `sum`, `avg`, `min` and `max` are always lists.
- Values come typed by the tokenizer (YL.md section 2): `Cal=640` is a number, `Done=on` true, a quoted value text. The store then fits each value to its column.
- Reference: the parser is `site/lib/yl/yl.mjs`, the store `site/lib/yl/tables.mjs` (`write`, `query`, `replay`). Ports with the same store: `parsers/python/tables.py`, `parsers/kotlin/src/Tables.kt`, `parsers/rust/src/tables.rs`. Vectors: `spec/conformance/30-tables.json`, and a vector may carry `tables: {today, now, failed, results}`, the write lines the store refused and each query's rows after the whole input (spec/conformance/README.md).

## 7. Native agents: tables on the server

Native agents (Yui, Arnold, Basil, Gouda, Penny, Quill and any agent Yui makes) run on Yui's server, so their tables live there too (YUI-170). Same three words, same types, same limits; the phone needs nothing new.

- **Writes.** The agent writes `table create` and `put` lines in its reply. The runtime takes them out before the reply is saved, writes the rows, and the person never sees the lines.
- **Views.** Every `query` in the reply is drawn by the runtime into a plain `table`, `list`, `chart` or `stat` with the real rows, so today's app shows it. `table meals` and `chart data=meals` on one of the agent's tables are drawn the same way.
- **Reading first.** A reply that is only a `tables` block of `query` lines is a read: the runtime hands the rows back and the agent answers with them ("what did I eat this week").
- **By week and by month.** `group=Day:week` totals by the week each date falls in (weeks start Monday), `group=Day:month` by month, `group=Day:day` by day for a column holding times.
- **Deletes ask first.** `put table key +delete` and `table drop name` never run on the agent's say. The reply gets a Delete or Keep button, and only the person's tap deletes. A yes or no column that was never set counts as off, so `where=Done=off` finds it.
- **Starter tables.** Each starter agent is added with tables and starter rows: Yui (to-dos, groceries, notes), Basil (44 common foods with calories and macros per portion, and a meals log), Arnold (16 exercises with how-to cues, a first week, and a sessions log), Penny (tasks, errands, bills), Quill (a first deck and its review queue), Gouda (saved loops, songs). A blank agent starts with none and makes its own.
- **Privacy.** Stored in `yui_native_tables` and `yui_native_table_rows`, reachable only by the runtime: no app token, connected agent or other person can read them. Another agent never sees them. The person lists them with their row counts, and deletes one, in the agent's Controls. Removing the agent removes its tables; deleting the account removes all of them.

```
put groceries milk Item=Milk Qty="1 gallon" Aisle=Dairy
query groceries where=Got=off sort=Aisle as list "Still to get"
```
draws, in the reply the phone gets:
```
list title="Still to get" "Bread · 1 loaf · Bakery" "Eggs · 1 dozen · Dairy" "Milk · 1 gallon · Dairy"
```

## 8. Any agent: the same tables through the relay

Status: YUI-171. Built: the server call (`yui-connect/tables`), the Hermes tool and the yui-mcp tool `yui_tables`, deletes held for a tap, the 100-table and 60-a-minute limits, and hand over as a server call (`yui_tables_give`, the person's own token) (step 2, Sep 27). Then table lines in the reply for the Hermes plugin, the A2A bridge and the webhook bridge, the A2A data part and the webhook `tables` field, and the `[yui] tables` line after a hand over (step 3, Sep 28). The [switch agents page](/mockups/tables) shows the real calls from the live tests. Not built yet: the app side (Controls > Tables with Give to... and last read, the ask when you add or remove an agent; today removing an agent still deletes its tables).

Tables live in Yui, not in one agent framework. A Hermes agent, a Claude agent over MCP, an A2A agent or a webhook script gets the same three words and the same screens a native agent gets (section 7). Pick a different agent next month and your tables are still there.

### One path on the server

Every adapter ends up in one place: the relay's `tables` call on `yui-connect`, with the connection's own token. It takes Yui Lines and runs them on the same store as section 7.

```
POST /functions/v1/yui-connect/tables
Authorization: Bearer <connection token>
{"agent": "basil", "lines": "query foods where=Food~oat as table"}
```

It answers with what the lines did: `{"ok": [...], "failed": [...], "results": [{"cols": [...], "rows": [...], "count": N}]}`. `failed` holds each refused line and why, the same text as event 1 in section 3.

There are two ways in, and every adapter has both:

- **In the reply.** `table create`, `put` and `query` lines inside a ```` ```yui ```` block. Before the reply is saved, the adapter hands the whole reply to the same call as `reply`; the server writes the rows and answers with `text`, the reply with the table lines taken out and each `query` drawn into a plain `table`, `list`, `chart` or `stat`, exactly as section 7 does. The adapter saves `text`. A reply of writes alone becomes "Saved." over the table that changed. A reply that is only `query` lines (or a ```` ```tables ```` block) is a read: the server answers `{"read": true, "note": "[yui] Your tables: ..."}`, nothing is saved, and the adapter gives `note` to the agent as its next turn, twice in a row at most (a third is drawn for the person). A refused write is told to the agent on its next turn. Only in the owner's own thread: a thread shared with a client never touches the owner's tables. The Hermes plugin, the A2A bridge and the webhook bridge do this; a Delete or Keep tap in a Hermes thread is settled as it arrives and the agent's turn says what happened. A host that writes rows straight to the relay without the call sends its table lines as they are.
- **As a call.** For an agent that wants the rows in the middle of a turn. Each adapter names the one server call its own way:

| Adapter | Call | Example |
|---|---|---|
| Hermes plugin | tool `yui_tables` | `yui_tables(lines="query foods sort=-Protein limit=5")` |
| yui-mcp (Claude, ChatGPT, n8n) | tool `yui_tables` | `{"name": "yui_tables", "arguments": {"lines": "put meals Food=Oats Cal=300"}}` |
| A2A bridge | a data part in the answer | `{"kind": "data", "data": {"yui": "tables", "lines": "query meals where=Day=today"}}`; the rows come back as a data part `{"yui": "tables", "results": [...]}` on the next message. An answer with only the data part is a read: that next message goes at once |
| Webhook bridge | `tables` in the response | `{"reply": "Logged.", "tables": "put meals Food=Oats Cal=300"}`; a response with `tables` and no `reply` is a read, and the rows arrive at once in the next POST as `tables: {results, failed, held, tables, note}` |

Same verbs, same types, same errors, same limits (section 2) in all four. An adapter never talks to the database; there is no second copy of the rules to drift.

### Who owns a table

- **The person owns it. An agent holds it.** Every table belongs to the person's account and is held by one agent at a time. Only the agent that holds a table can write it, read it or draw it. Another agent asking for it hears "No table called foods yet", the same as a table that does not exist.
- **A token reaches only its own agents.** A connection token that serves Basil can pass `agent: "basil"` and nobody else. Two agents on one token still keep their own tables.
- **Every read is on the record.** Unlike the phone store, the holding agent can read its tables without the person tapping Send. Controls lists each table with its row count, who holds it and when it was last read ("Basil, 2 min ago"). The person can take a table away from the agent there at any time.
- **Deletes ask first,** as in section 7: `+delete` and `table drop` put a Delete or Keep button in front of the person, from every adapter.

### Switching agents

Tables follow the person, not the agent.

- **Hand them over.** In Controls > Tables, "Give to..." picks any of the person's agents. The table keeps its name, columns and rows; it now answers to the new agent, and the old one loses it. Nothing is copied.
- **When you add an agent,** Yui asks once if other agents hold tables: "Basil keeps foods and meals. Give them to Chef?" Yes hands them over. No leaves them where they are.
- **When you remove an agent,** its tables are no longer deleted with it: Yui asks "Keep Basil's 2 tables?" Kept tables wait, held by nobody, for 30 days. Give them to any agent in that time, or they are deleted. Deleting the account deletes them all at once.
- **Same name twice.** If the new agent already has a `foods`, the handed table is offered as `foods-basil`; the person can rename it before it moves.
- **The agent learns what it has.** A call with no lines settles any taps and lists what the agent holds. After a hand over, the new agent's next turn opens with one line: `[yui] tables foods(44 rows: Food, Cal, Protein, Carbs, Fat, Portion) meals(12 rows: Day, Food, Cal, Protein)`. It needs no memory of the old agent to carry on. The server puts the line in `meta.tables` of the person's next message to that agent, once; the Hermes plugin, the A2A bridge and the webhook bridge put it at the top of the turn.
- **Screens do not change.** A pinned `query` screen keeps drawing after the hand over; it names the table, not the agent.

### Limits for any agent

Section 2's limits, plus the ones a shared server needs:

| What | Limit |
|---|---|
| tables per person, across all agents | 100 |
| `tables` calls per agent | 60 a minute |
| lines in one call | 50 |
| rows one call hands back | 500 |
| an unheld table waits | 30 days |

A call past a limit is refused with the reason and writes nothing.

### Tests

One test file per adapter, all against the same server call: the Hermes tool, the MCP tool, the A2A data part and the webhook field each create a table, write rows, read them, get a refused line back, and ask before a delete. A hand over test writes with a Hermes agent, gives the table to an MCP agent and checks the second agent reads the same rows and the first one reads nothing (`supabase/tests/tables_any_agent_e2e.py`). The reply path, the read and the hand over line run live in `supabase/tests/tables_reply_e2e.py`, and each bridge has offline tests (`hermes-plugin/tests/test_tables_reply.py`, `adapters/a2a/tests`, `adapters/webhook/tests`) and a tables section in its live test.

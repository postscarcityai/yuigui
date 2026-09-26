// Agent tables (spec/TABLES.md): the store behind `table create`, `put` and
// `query`. A port of site/lib/yl/tables.mjs, the reference; the conformance
// vectors (spec/conformance/30-tables.json) pin the semantics.
//
// A store holds one agent's tables. Cells are String, Double, Boolean, or
// absent (an empty cell). Every function returns a new store and never
// changes the one it was given.
package yuilines

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object Tables {
    val TYPES = listOf("text", "number", "date", "bool")

    object LIMITS {
        const val tables = 20 // per agent
        const val cols = 12 // per table
        const val rows = 5000 // per table
        const val text = 1000 // characters in one text cell
        const val key = 64 // characters in a row key
        const val name = 32 // characters in a table name
        const val limit = 50 // rows a query shows by default
        const val maxLimit = 500 // rows a query can ask for
        const val send = 200 // rows a `send` view hands the agent
    }

    class Col(val name: String, val type: String, val unit: String? = null) {
        fun toMap(): Map<String, Any?> = linkedMapOf<String, Any?>("name" to name, "type" to type).also { if (unit != null) it["unit"] = unit }
    }

    class Table(
        val name: String,
        val cols: List<Col>,
        val rows: LinkedHashMap<String, LinkedHashMap<String, Any>>,
        val order: MutableList<String>,
        var next: Int,
    ) {
        fun copy() = Table(name, cols, LinkedHashMap(rows), ArrayList(order), next)
    }

    class Store(val tables: Map<String, Table>) {
        fun with(name: String, t: Table) = Store(LinkedHashMap(tables).also { it[name] = t })
    }

    // The result of one write: the new store, and an error or the row key.
    class Write(val store: Store, val error: String? = null, val key: String? = null)

    fun emptyStore() = Store(emptyMap())

    private val NAME = Regex("[A-Za-z][\\w-]*")
    private val COL = Regex("[A-Za-z_][\\w-]*")
    private val NUMBER = Regex("-?\\d+(\\.\\d+)?")
    private val DAY = Regex("\\d{4}-\\d{2}-\\d{2}")
    private val STAMP = Regex("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}")
    private val REL = Regex("today(?:([+-])(\\d{1,4}))?", RegexOption.IGNORE_CASE)

    // `today` is the phone's local date, YYYY-MM-DD; `now` adds the time.
    fun localToday(): String = LocalDate.now().toString()
    fun localNow(): String = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"))

    // JS String(v) for cell and prop values.
    private fun js(v: Any?): String = when (v) {
        null -> "null"
        is Double -> Json.number(v)
        is Number -> Json.number(v.toDouble())
        else -> v.toString()
    }

    private fun realDate(s: String): Boolean = try {
        LocalDate.of(s.substring(0, 4).toInt(), s.substring(5, 7).toInt(), s.substring(8, 10).toInt()); true
    } catch (e: Exception) { false }

    // One value into a column's type: Pair(value, error). A null value with no
    // error is an empty cell. ctx["today"] / ctx["now"] resolve the date words.
    fun cell(type: String, v0: Any?, ctx: Map<String, Any?> = emptyMap()): Pair<Any?, String?> {
        var v = v0
        if (v == null || v == "") return null to null
        if (v is List<*>) v = v.joinToString("|") { js(it) }
        when (type) {
            "text" -> {
                val s = js(v)
                if (s.length > LIMITS.text) return null to "text over ${LIMITS.text} characters"
                return s to null
            }
            "number" -> {
                if (v is Number) {
                    val d = v.toDouble()
                    return if (d.isFinite()) d to null else null to "not a number"
                }
                if (v is String && NUMBER.matches(v.trim())) return v.trim().toDouble() to null
                return null to "\"${js(v)}\" is not a number"
            }
            "date" -> {
                val s = js(v).trim()
                val today = (ctx["today"] as? String)?.ifEmpty { null } ?: localToday()
                val rel = REL.matchEntire(s)
                if (rel != null) {
                    val sign = rel.groups[1]?.value ?: return today to null
                    val n = rel.groups[2]!!.value.toLong()
                    return LocalDate.parse(today).plusDays(if (sign == "-") -n else n).toString() to null
                }
                if (s.lowercase() == "now") return ((ctx["now"] as? String)?.ifEmpty { null } ?: localNow()) to null
                if ((DAY.matches(s) || STAMP.matches(s)) && realDate(s)) return s to null
                return null to "\"$s\" is not a date (YYYY-MM-DD, today, today-7, now)"
            }
            "bool" -> {
                if (v is Boolean) return v to null
                return when (js(v).lowercase()) {
                    "on", "true", "yes", "1" -> true to null
                    "off", "false", "no", "0" -> false to null
                    else -> null to "\"${js(v)}\" is not on or off"
                }
            }
        }
        return null to "unknown type $type"
    }

    // `table create`: make a table, or change an existing one's columns.
    // Columns are matched by name: kept columns keep their values (a new type
    // converts them, and what does not fit becomes empty), removed columns lose
    // theirs, new columns start empty. Rows are never dropped by a schema change.
    private fun create(store: Store, op: Map<String, Any?>, ctx: Map<String, Any?>): Write {
        val name = op["name"] as? String ?: ""
        val cols = (op["cols"] as? List<*> ?: emptyList<Any?>()).map { it as Map<*, *> }
        if (!NAME.matches(name) || name.length > LIMITS.name) return Write(store, "table: bad name \"$name\"")
        if (cols.isEmpty()) return Write(store, "table create: needs at least one col:type")
        if (cols.size > LIMITS.cols) return Write(store, "table create: ${LIMITS.cols} columns at most")
        val seen = HashSet<String>()
        for (c in cols) {
            val n = c["name"] as? String ?: ""
            if (!COL.matches(n)) return Write(store, "table create: bad column \"$n\"")
            if (n.lowercase() == "key") return Write(store, "table create: key is the row key, not a column")
            if (n.lowercase() in seen) return Write(store, "table create: column \"$n\" twice")
            if (c["type"] !in TYPES) return Write(store, "table create: \"${c["type"]}\" is not text, number, date or bool")
            seen.add(n.lowercase())
        }
        val old = store.tables[name]
        if (old == null && store.tables.size >= LIMITS.tables) return Write(store, "table: ${LIMITS.tables} tables per agent at most")
        val clean = cols.map { c -> Col(c["name"] as String, c["type"] as String, (c["unit"] as? String)?.ifEmpty { null }) }
        if (old == null) return Write(store.with(name, Table(name, clean, LinkedHashMap(), ArrayList(), 1)))
        val prev = old.cols.associateBy { it.name }
        val rows = LinkedHashMap<String, LinkedHashMap<String, Any>>()
        for (key in old.order) {
            val row = old.rows.getValue(key)
            val nxt = LinkedHashMap<String, Any>()
            for (c in clean) {
                val was = prev[c.name] ?: continue
                val cur = row[c.name] ?: continue
                val v = if (was.type == c.type) cur else cell(c.type, cur, ctx).let { if (it.second == null) it.first else null }
                if (v != null) nxt[c.name] = v
            }
            rows[key] = nxt
        }
        return Write(store.with(name, Table(name, clean, rows, ArrayList(old.order), old.next)))
    }

    // `put`: upsert one row by key. With no key the store makes one (r1, r2 ...),
    // so a log can just append. `delete` takes the row out. The whole put is
    // refused when one value is wrong, so a row is never half written.
    private fun put(store: Store, op: Map<String, Any?>, ctx: Map<String, Any?>): Write {
        val table = op["table"] as? String
        val t0 = store.tables[table] ?: return Write(store, "put: no table \"$table\"")
        var key: String? = op["key"]?.let { js(it) }
        if (key != null && (key.isEmpty() || key.length > LIMITS.key)) return Write(store, "put: a key is 1 to ${LIMITS.key} characters")
        val t = t0.copy()
        if (op["delete"] == true) {
            if (key == null) return Write(store, "put +delete: needs a key")
            if (key !in t.rows) return Write(store)
            t.rows.remove(key)
            t.order.remove(key)
            return Write(store.with(t0.name, t), key = key)
        }
        val byName = t.cols.associateBy { it.name.lowercase() }
        val vals = LinkedHashMap<String, Any?>()
        for ((k, v) in (op["values"] as? Map<*, *> ?: emptyMap<String, Any?>())) {
            val c = byName[k.toString().lowercase()] ?: return Write(store, "put: $table has no column \"$k\"")
            val r = cell(c.type, v, ctx)
            if (r.second != null) return Write(store, "put: ${c.name}: ${r.second}")
            vals[c.name] = r.first
        }
        if (key == null) {
            while (true) {
                key = "r${t.next}"
                t.next++
                if (key !in t.rows) break
            }
        }
        val k: String = key
        val had = k in t.rows
        if (!had && t.order.size >= LIMITS.rows) return Write(store, "put: $table is full (${LIMITS.rows} rows)")
        val row = if (had) LinkedHashMap(t.rows.getValue(k)) else LinkedHashMap()
        for ((n, v) in vals) if (v == null) row.remove(n) else row[n] = v
        t.rows[k] = row
        if (!had) t.order.add(k)
        return Write(store.with(t0.name, t), key = k)
    }

    // Apply one parser op (`table` or `put`) to a store. On an error the store is unchanged.
    fun write(store: Store, op: Map<String, Any?>, ctx: Map<String, Any?> = emptyMap()): Write = when (op["op"]) {
        "table" -> create(store, op, ctx)
        "put" -> put(store, op, ctx)
        else -> Write(store)
    }

    // ---------- query ----------

    private val CLAUSE = Regex("([A-Za-z_][\\w-]*)\\s*(>=|<=|!=|=|>|<|~)\\s*(.*)", RegexOption.DOT_MATCHES_ALL)
    private val AGGS = listOf("sum", "avg", "min", "max")

    // Numbers by value, bools off before on, anything else as text without case.
    private fun cmp(a: Any?, b: Any?): Int {
        if (a == null && b == null) return 0
        if (a == null) return 1
        if (b == null) return -1
        if (a is Double && b is Double) return if (a < b) -1 else if (a > b) 1 else 0
        if (a is Boolean && b is Boolean) return (if (a) 1 else 0) - (if (b) 1 else 0)
        return js(a).lowercase().compareTo(js(b).lowercase()).coerceIn(-1, 1)
    }

    // A flag (`+count`) is true, never a list: `sort` and the rest only take names.
    private fun asList(v: Any?): List<String> {
        if (v == null || v is Boolean) return emptyList()
        return (if (v is List<*>) v else listOf(v)).map { js(it) }.filter { it != "" }
    }

    private fun round6(n: Double): Double = Math.floor(n * 1e6 + 0.5) / 1e6

    private fun truthy(v: Any?): Boolean = when (v) {
        null -> false
        is Boolean -> v
        is Double -> v != 0.0 && !v.isNaN()
        is String -> v.isNotEmpty()
        is Collection<*> -> v.isNotEmpty()
        is Map<*, *> -> v.isNotEmpty()
        else -> true
    }

    // Runs a query's props against a store. Returns
    // {cols: [{name, type, unit?}], rows: [[...]], keys: [key|null], count}
    // or {missing: name} or {error}. `count` is the rows matched before `limit`.
    fun query(store: Store, props: Map<String, Any?>, ctx: Map<String, Any?> = emptyMap()): Map<String, Any?> {
        fun error(m: String) = mapOf("error" to m)
        val name = props["table"]
        val t = store.tables[name] ?: return mapOf("missing" to name)

        fun colOf(n0: Any?): Col? {
            val n = js(n0).lowercase()
            if (n == "key") return Col("key", "text")
            return t.cols.firstOrNull { it.name.lowercase() == n }
        }

        // where: every clause must hold.
        val tests = ArrayList<(Map<String, Any?>) -> Boolean>()
        for (w in asList(props["where"])) {
            val m = CLAUSE.matchEntire(w) ?: return error("where: cannot read \"$w\"")
            val c = colOf(m.groupValues[1]) ?: return error("where: no column \"${m.groupValues[1]}\"")
            val op = m.groupValues[2]
            val raw = m.groupValues[3].trim()
            if (raw == "") {
                if (op != "=" && op != "!=") return error("where: \"$w\" needs a value")
                tests.add { row -> (row[c.name] == null) == (op == "=") }
                continue
            }
            val want: Any?
            if (op == "~") want = raw.lowercase()
            else {
                val r = cell(c.type, raw, ctx)
                if (r.second != null) return error("where: ${c.name}: ${r.second}")
                want = r.first
            }
            // A date with no time compares by day, so Day=today holds for a stamp at 12:30 today.
            val byDay = c.type == "date" && want is String && want.length == 10
            tests.add { row ->
                var v = row[c.name]
                if (v == null) op == "!="
                else {
                    if (byDay) v = js(v).take(10)
                    if (op == "~") js(v).lowercase().contains(want as String)
                    else {
                        val d = cmp(v, want)
                        when (op) {
                            "=" -> d == 0
                            "!=" -> d != 0
                            ">" -> d > 0
                            "<" -> d < 0
                            ">=" -> d >= 0
                            else -> d <= 0
                        }
                    }
                }
            }
        }
        var rows: List<Map<String, Any?>> = t.order.map { k -> LinkedHashMap<String, Any?>(t.rows.getValue(k)).also { it["key"] = k } }
        rows = rows.filter { r -> tests.all { it(r) } }

        // Aggregates: group=Col and sum/avg/min/max=Col|Col, +count.
        var keyed = true
        val aggs = AGGS.flatMap { a -> asList(props[a]).map { a to it } }
        val group = props["group"]
        val cols: List<Col>
        if (aggs.isNotEmpty() || truthy(props["count"]) || "group" in props && group != null) {
            keyed = false
            val hasGroup = group != null && group != ""
            val g = if (hasGroup) colOf(group) else null
            if (hasGroup && g == null) return error("group: no column \"${js(group)}\"")
            // (col, from, aggregate)
            val out = ArrayList<Triple<Col, String?, String?>>()
            if (g != null) out.add(Triple(g, g.name, null))
            val used = out.map { it.first.name.lowercase() }.toMutableSet()
            for ((a, n) in aggs) {
                val c = colOf(n) ?: return error("$a: no column \"$n\"")
                if (c.type != "number" && (a == "sum" || a == "avg")) return error("$a: ${c.name} is not a number column")
                val label = if (c.name.lowercase() in used) "$a ${c.name}" else c.name
                used.add(label.lowercase())
                out.add(Triple(Col(label, c.type, c.unit), c.name, a))
            }
            if (truthy(props["count"])) out.add(Triple(Col("Count", "number"), null, "count"))
            val groups = LinkedHashMap<String, MutableList<Map<String, Any?>>>()
            for (r in rows) {
                val gk = if (g != null) Json.write(r[g.name]) else ""
                groups.getOrPut(gk) { ArrayList() }.add(r)
            }
            if (g == null && groups.isEmpty()) groups[""] = ArrayList()
            val aggRows = ArrayList<Map<String, Any?>>()
            for (lst in groups.values) {
                val row = LinkedHashMap<String, Any?>()
                for ((c, from, a) in out) {
                    row[c.name] = when (a) {
                        null -> lst[0][from!!]
                        "count" -> lst.size.toDouble()
                        else -> {
                            val vs = lst.mapNotNull { it[from!!] }
                            when {
                                vs.isEmpty() -> if (a == "sum") 0.0 else null
                                a == "sum" -> round6(vs.fold(0.0) { s, x -> s + (x as Double) })
                                a == "avg" -> round6(vs.fold(0.0) { s, x -> s + (x as Double) } / vs.size)
                                else -> {
                                    var best = vs[0]
                                    for (v in vs.drop(1)) if (if (a == "min") cmp(v, best) < 0 else cmp(v, best) > 0) best = v
                                    best
                                }
                            }
                        }
                    }
                }
                aggRows.add(row)
            }
            rows = aggRows
            cols = out.map { it.first }
        } else {
            val pick = asList(props["cols"])
            if (pick.isNotEmpty()) {
                val found = pick.map { colOf(it) }
                val bad = pick.indices.firstOrNull { found[it] == null }
                if (bad != null) return error("cols: no column \"${pick[bad]}\"")
                cols = found.map { it!! }
            } else cols = t.cols
        }

        // sort=Col|-Col: a minus sorts that column high to low. Empty cells go last.
        val sorts = ArrayList<Pair<String, Boolean>>()
        for (s in asList(props["sort"])) {
            val desc = s.startsWith("-")
            val n = if (desc) s.substring(1) else s
            val c = (if (keyed) colOf(n) else cols.firstOrNull { it.name.lowercase() == n.lowercase() })
                ?: return error("sort: no column \"$n\"")
            sorts.add(c.name to desc)
        }
        if (sorts.isNotEmpty()) {
            rows = rows.sortedWith { x, y ->
                var res = 0
                for ((n, desc) in sorts) {
                    val a = x[n]
                    val b = y[n]
                    if (a == null || b == null) {
                        if (a == null && b == null) continue
                        res = if (a == null) 1 else -1
                        break
                    }
                    val d = cmp(a, b)
                    if (d != 0) { res = if (desc) -d else d; break }
                }
                res
            }
        }
        val count = rows.size
        val lim0 = props["limit"]
        val n: Double? = when (lim0) {
            null, "", is Boolean, is List<*> -> null
            is Double -> lim0
            else -> js(lim0).trim().toDoubleOrNull()
        }
        val lim = if (n == null || !n.isFinite()) LIMITS.limit.toDouble() else Math.floor(n)
        rows = rows.take(maxOf(0.0, minOf(LIMITS.maxLimit.toDouble(), lim)).toInt())
        return linkedMapOf(
            "cols" to cols.map { it.toMap() },
            "rows" to rows.map { r -> cols.map { r[it.name] } },
            "keys" to rows.map { if (keyed) it["key"] else null },
            "count" to count.toDouble(),
        )
    }

    // Replays ops (anything the parser gives; only `table` and `put` count)
    // onto a store. Returns the store and the refused writes: [{line, message}].
    fun replay(store0: Store, ops: List<Map<String, Any?>>, ctx: Map<String, Any?> = emptyMap()): Pair<Store, List<Map<String, Any?>>> {
        var store = store0
        val errors = ArrayList<Map<String, Any?>>()
        for (op in ops) {
            if (op["op"] != "table" && op["op"] != "put") continue
            val r = write(store, op, ctx)
            if (r.error != null) errors.add(mapOf("line" to op["line"], "message" to r.error))
            store = r.store
        }
        return store to errors
    }
}

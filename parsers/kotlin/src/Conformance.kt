// YL conformance runner for the Kotlin parser.
//   parsers/kotlin/run.sh [path/to/spec/conformance]
// Reads the shared vectors in spec/conformance (no copies). Exits 1 on any
// failure. Same checks as spec/conformance/run.mjs; see its README.md.
package yuilines

import java.io.File
import kotlin.system.exitProcess

// Parser ops minus `line` and an error's `message`.
fun normalizeOps(ops: List<Op>): List<Map<String, Any?>> = ops.map { o -> o.filterKeys { it != "line" && it != "message" } }

// Deep equality with JSON semantics: key order does not matter, numbers by value.
fun same(a: Any?, b: Any?): Boolean = when {
    a is Number && b is Number -> a.toDouble() == b.toDouble()
    a is Map<*, *> && b is Map<*, *> -> a.keys == b.keys && a.keys.all { same(a[it], b[it]) }
    a is List<*> && b is List<*> -> a.size == b.size && a.indices.all { same(a[it], b[it]) }
    else -> a == b
}

private fun byChar(input: String, known: Map<String, String>): List<Map<String, Any?>> {
    val s = StreamParser(known)
    val out = ArrayList<Op>()
    var i = 0
    while (i < input.length) { // one code point per chunk, like JS for...of
        val n = Character.charCount(input.codePointAt(i))
        out.addAll(s.push(input.substring(i, i + n)))
        i += n
    }
    out.addAll(s.flush())
    return normalizeOps(out)
}

@Suppress("UNCHECKED_CAST")
private fun check(v: Map<String, Any?>): List<Pair<String, Any?>> {
    val fails = ArrayList<Pair<String, Any?>>()
    val input = v["input"] as String
    val expected = v["expected"] as List<Map<String, Any?>>
    // `known`: ids that last from earlier replies (YL.md section 5), id -> preset.
    val known = (v["known"] as Map<String, Any?>?)?.mapValues { it.value as String } ?: emptyMap()
    val got = normalizeOps(parse(input, known))
    if (!same(got, expected)) fails.add("parse" to got)
    val streamed = byChar(input, known)
    if (!same(streamed, expected)) fails.add("stream (1 char per chunk)" to streamed)
    val chunks = v["chunks"] as List<String>?
    if (chunks != null) {
        val s = StreamParser(known)
        val emits = chunks.map { normalizeOps(s.push(it)) }.toMutableList()
        emits.add(normalizeOps(s.flush()))
        if (!same(emits, v["emits"])) fails.add("stream (chunks)" to emits)
    }
    if (v["stage"] != null) {
        val style = v["style"] as Map<String, Any?>? ?: emptyMap()
        val staged = parse(input, known).filter { onStage(it, style) }.map { it["id"] }
        if (!same(staged, v["stage"])) fails.add("stage (ids that open on the stage)" to staged)
    }
    if (v["pages"] != null) {
        val pages = parse(input, known).filter { it["op"] == "add" }.map { pageOf(it["screen"] as String?).toDouble() }
        if (!same(pages, v["pages"])) fails.add("pages (page of each add)" to pages)
    }
    if (v["rows"] != null) {
        val rows = timelineRows(parse(input, known))
        val got = mapOf("rows" to rows.map { mapOf("id" to it.first, "kind" to it.second) },
            "mark" to markAt(rows.map { it.second }).toDouble())
        if (!same(got, v["rows"])) fails.add("rows (timeline rows and the now marker)" to got)
    }
    if (v["talk"] != null) {
        val on = talking(parse(input, known)).map { it.toDouble() }
        if (!same(on, v["talk"])) fails.add("talk (pages with the composer on)" to on)
    }
    if (v.containsKey("doing")) {
        val d = doingOf(parse(input, known))
        if (!same(d, v["doing"])) fails.add("doing (the working row after the input)" to d)
    }
    val typed = v["typed"] as Map<String, Any?>?
    if (typed != null) {
        val screen = typed["screen"] as String
        val words = typed["words"] as String
        val made = typedBody(screen, words)
        if (made != typed["body"]) fails.add("typed (body for words typed on the screen)" to made)
        val read = readTyped(typed["body"] as String)
        val want = if (pageOf(screen) == 1) null else mapOf("screen" to screen, "words" to words)
        if (!same(read, want)) fails.add("typed (read back)" to read)
    }
    val route = v["route"] as Map<String, Any?>?
    if (route != null) {
        // A flow's route (FLOWS.md): the path the answers take, the first
        // open question, and the event at submit. Uses the input's first flow.
        val patch = parse(input, known).find { it["op"] == "patch" }
        val g = resolve("flow", patch?.get("props") as Map<String, Any?>? ?: emptyMap())
        val answers = route["answers"] as Map<String, Any?>? ?: emptyMap()
        val got = flowPath(g, answers)
        if (!same(got, mapOf("path" to route["path"], "open" to route["open"]))) fails.add("route (path, open)" to got)
        val ev = flowEvent(g, answers)
        if (!same(ev, route["event"])) fails.add("route (event)" to ev)
    }
    val tv = v["tables"] as Map<String, Any?>?
    if (tv != null) {
        // Agent tables (TABLES.md): replay the input's `table create` and `put`
        // lines onto an empty store (dates resolve against `today`), then run
        // every query add against the store as the whole input left it.
        val ops = parse(input, known)
        val ctx = mapOf("today" to tv["today"], "now" to tv["now"])
        val (store, errors) = Tables.replay(Tables.emptyStore(), ops, ctx)
        val failed = errors.map { it["line"] }
        if (!same(failed, tv["failed"] ?: emptyList<Any?>())) fails.add("tables (write lines the store refused)" to failed)
        // A query that cannot run gives {"error": true}: the wording is up to each store.
        val results = ops.filter { it["op"] == "add" && it["preset"] == "query" }
            .map { Tables.query(store, resolve("query", it["props"] as Map<String, Any?>), ctx) }
            .map { if ("error" in it) mapOf("error" to true) else it }
        if (!same(results, tv["results"] ?: emptyList<Any?>())) fails.add("tables (query results)" to results)
    }
    val hasError = expected.any { it["op"] == "error" }
    if (hasError != (v["error"] == true)) fails.add("vector: `error` flag does not match expected" to v["error"])
    return fails
}

@Suppress("UNCHECKED_CAST")
fun main(args: Array<String>) {
    val dir = File(args.getOrNull(0) ?: "spec/conformance")
    val files = (dir.listFiles() ?: emptyArray()).map { it.name }.filter { Regex("\\d\\d-.*\\.json").matches(it) }.sorted()
    if (files.isEmpty()) { System.err.println("no vectors in ${dir.path}"); exitProcess(2) }
    var pass = 0
    var fail = 0
    for (f in files) {
        val vectors = (Json.parse(File(dir, f).readText()) as Map<String, Any?>)["vectors"] as List<Map<String, Any?>>
        var ok = 0
        for (v in vectors) {
            val fails = try { check(v) } catch (e: Throwable) { listOf("crash" to e.toString()) }
            if (fails.isEmpty()) { ok++; continue }
            fail++
            println("FAIL $f :: ${v["name"]}")
            println("  input:    ${Json.write(v["input"])}")
            println("  expected: ${Json.write(if (v["chunks"] != null) v["emits"] else v["expected"])}")
            for ((how, got) in fails) println("  $how: ${Json.write(got)}")
        }
        pass += ok
        println("${if (ok == vectors.size) "ok  " else "FAIL"} ${f.padEnd(34)} $ok/${vectors.size}")
    }
    println("\n$pass passed, $fail failed, ${pass + fail} vectors in ${files.size} files")
    exitProcess(if (fail > 0) 1 else 0)
}

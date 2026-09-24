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

private fun byChar(input: String): List<Map<String, Any?>> {
    val s = StreamParser()
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
    val got = normalizeOps(parse(input))
    if (!same(got, expected)) fails.add("parse" to got)
    val streamed = byChar(input)
    if (!same(streamed, expected)) fails.add("stream (1 char per chunk)" to streamed)
    val chunks = v["chunks"] as List<String>?
    if (chunks != null) {
        val s = StreamParser()
        val emits = chunks.map { normalizeOps(s.push(it)) }.toMutableList()
        emits.add(normalizeOps(s.flush()))
        if (!same(emits, v["emits"])) fails.add("stream (chunks)" to emits)
    }
    if (v["stage"] != null) {
        val style = v["style"] as Map<String, Any?>? ?: emptyMap()
        val staged = parse(input).filter { onStage(it, style) }.map { it["id"] }
        if (!same(staged, v["stage"])) fails.add("stage (ids that open on the stage)" to staged)
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

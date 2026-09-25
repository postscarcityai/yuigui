// Yui Lines (YL) v0 parser for Kotlin/JVM. Spec: spec/YL.md
// Conformance: spec/conformance (parsers/kotlin/run.sh)
// A line-for-line port of the JS reference, site/lib/yl/yl.mjs.
// Kotlin stdlib only.
//
// One line in, one op out. An op is a Map<String, Any?> with the same keys
// as the JS reference: op, screen, preset, id, props, target, name, in,
// message, line. Numbers are Double, lists are List, objects are Map.
// `props` holds only what the line actually said. Defaults live in resolve().
package yuilines

typealias Op = Map<String, Any?>
private typealias Obj = LinkedHashMap<String, Any?>

val PRESETS = listOf(
    "timer", "ask", "choose", "pick", "slide", "form",
    "list", "table", "card", "image", "camera", "mic",
    "gallery", "video", "compare", "storyboard",
    "chart", "stat", "math", "step", "calc",
    "deck", "page", "plan", "project", "narrate",
    "timeline", "done", "now", "next",
    "game",
)

// Not presets, but valid line heads.
val CORE = listOf("say", "custom", "save", "show", "forget", "clear", "end", "theme", "close", "talk")

// Groups: a group head collects the lines that follow it on the same screen,
// as long as each one is a member preset. Anything else ends the group, and
// so does `end`. Comments, blank lines and error lines do not.
val GROUPS = mapOf(
    "deck" to listOf("page", "ask", "choose", "pick"),
    "plan" to listOf("page", "ask", "choose", "pick", "slide", "form", "mic", "camera"),
    "narrate" to listOf("page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"),
    "timeline" to listOf("done", "now", "next"),
)

val CHART_TYPES = listOf("line", "bar", "area", "scatter", "pie", "donut")
val FIELD_TYPES = setOf("text", "long", "voice", "number", "email", "phone", "date", "time", "yes", "photo", "url")

// The stage is a full-screen layer over the chat (YL.md section 5).
// These presets open there unless they say +inline.
val STAGE = listOf("timer", "camera", "mic", "deck", "plan", "game")

// ---------- JS compatibility ----------
// The reference is JavaScript: \d and \w are ASCII, \s is the JS whitespace set.

private const val WS = "\t\n\u000B\u000C\r    -     　﻿"
private const val S = "[$WS]"
private const val NS = "[^$WS]"
private const val DOT = "[^\n\r  ]" // JS "." without the s flag

private fun isWs(c: Char) = c in "\t\n\u000B\u000C\r       　﻿" || c in ' '..' '
private fun trim(s: String) = s.trim { isWs(it) }
private fun rx(p: String, ignoreCase: Boolean = false) = if (ignoreCase) Regex(p, RegexOption.IGNORE_CASE) else Regex(p)
private fun Regex.full(s: String) = matchEntire(s)
private fun Regex.test(s: String) = matchEntire(s) != null
private fun MatchResult.g(i: Int): String? = groups[i]?.value

// JS String(v) for the values props can hold.
private fun jsStr(v: Any?): String = when (v) {
    is Double -> Json.number(v)
    else -> v.toString()
}

// JS ToNumber, for the comparisons in isWorkout.
private fun toNumber(v: Any?): Double = when (v) {
    null -> 0.0
    is Boolean -> if (v) 1.0 else 0.0
    is Double -> v
    is List<*> -> if (v.isEmpty()) 0.0 else if (v.size == 1) toNumber(jsStr(v[0])) else Double.NaN
    else -> trim(v.toString()).let { if (it.isEmpty()) 0.0 else it.toDoubleOrNull() ?: Double.NaN }
}

private val IDENT = rx("[a-z_][\\w-]*", true)

// ---------- tokenizer ----------

// A run of non-space characters in which double-quoted segments may contain spaces.
//   raw     the exact source text
//   text    the text with quotes removed
//   quoted  true when the whole token was one quoted string
//   parts   segments split on "|" outside quotes (null when there is no "|")
//   key     set when the token is key=value (key must be an identifier)
//   value   the unquoted text after "=" (String), or its parts (List<String>)
//   vquoted per value part, true when that part held a quoted string
class Token(val raw: String, val text: String, val quoted: Boolean, var parts: List<String>?) {
    var key: String? = null
    var value: Any? = null
    var vquoted: List<Boolean> = emptyList()
    override fun toString() = "Token($raw)"
}

fun tokenize(line: String): List<Token> {
    val tokens = ArrayList<Token>()
    var i = 0
    val n = line.length
    while (i < n) {
        while (i < n && isWs(line[i])) i++
        if (i >= n) break
        // Comment: a "#" that starts a token and is followed by space or EOL.
        if (line[i] == '#' && (i + 1 >= n || isWs(line[i + 1]))) break
        val start = i
        val segs = arrayListOf(StringBuilder())
        val segQ = arrayListOf(false) // per segment: held a quoted string
        var anyQuote = false
        var wholeQuoted = line[i] == '"'
        var eqAt = -1 // index into segs[0] where "=" appeared, outside quotes
        while (i < n && !isWs(line[i])) {
            val c = line[i]
            if (c == '"') {
                anyQuote = true
                segQ[segQ.size - 1] = true
                i++
                while (i < n && line[i] != '"') {
                    if (line[i] == '\\' && i + 1 < n) { segs.last().append(line[i + 1]); i += 2; continue }
                    segs.last().append(line[i++])
                }
                i++ // closing quote (or EOL for an unterminated string)
                if (i < n && !isWs(line[i])) wholeQuoted = false
                continue
            }
            if (c == '|') { segs.add(StringBuilder()); segQ.add(false); wholeQuoted = false; i++; continue }
            if (c == '=' && eqAt < 0 && segs.size == 1 && !anyQuote && IDENT.test(segs[0].toString())) eqAt = segs[0].length
            segs.last().append(c)
            i++
        }
        val raw = line.substring(start, minOf(i, n))
        val ss = segs.map { it.toString() }
        val t = Token(raw, ss.joinToString("|"), wholeQuoted && ss.size == 1, if (ss.size > 1) ss else null)
        if (eqAt >= 0) {
            t.key = ss[0].substring(0, eqAt)
            val vparts = listOf(ss[0].substring(eqAt + 1)) + ss.drop(1)
            t.value = if (vparts.size > 1) vparts else vparts[0]
            t.vquoted = segQ.toList()
            t.parts = null
        }
        tokens.add(t)
    }
    return tokens
}

// ---------- value helpers ----------

private val NUM = rx("-?\\d+(\\.\\d+)?")
private val RANGE = rx("(-?\\d+(?:\\.\\d+)?)-(-?\\d+(?:\\.\\d+)?)")
private const val DUR = "(\\d+(?::\\d{1,2})?(?:\\.\\d+)?[smh]?)"
private val TIMESPEC = rx("$DUR(?:/$DUR)?(?:x(\\d+))?")
private val SECONDS = rx("(\\d+)(?::(\\d{1,2}))?(\\.\\d+)?([smh]?)")

fun seconds(s: Any?): Double? {
    if (s == null) return null
    val m = SECONDS.full(jsStr(s)) ?: return null
    if (m.g(2) != null) return m.g(1)!!.toDouble() * 60 + m.g(2)!!.toDouble()
    val v = (m.g(1)!! + (m.g(3) ?: "")).toDouble()
    return when (m.g(4)) { "m" -> v * 60; "h" -> v * 3600; else -> v }
}

private fun coerce(v: Any?): Any? = when (v) {
    is List<*> -> v.map { coerce(it) }
    is String -> when {
        NUM.test(v) -> v.toDouble()
        v == "on" || v == "true" -> true
        v == "off" || v == "false" -> false
        else -> v
    }
    else -> v
}

// Keys whose values are never typed: a quiz answer is compared with option
// text, so answer=4 and answer=on stay "4" and "on".
private val TEXT_KEYS = setOf("answer")
private val FLAG = rx("\\+[a-z][\\w-]*", true)

private class Split(val kv: Obj, val flags: Obj, val pos: List<Token>)

// Splits tokens into key/values, +flags and positionals.
private fun split(tokens: List<Token>): Split {
    val kv = Obj()
    val flags = Obj()
    val pos = ArrayList<Token>()
    for (t in tokens) {
        val key = t.key
        if (key != null && key in TEXT_KEYS) kv[key] = t.value
        else if (key != null) {
            val v = t.value
            kv[key] = if (v is List<*>) v.mapIndexed { i, x -> if (t.vquoted[i]) x else coerce(x) }
            else if (t.vquoted[0]) v else coerce(v)
        } else if (!t.quoted && t.parts == null && FLAG.test(t.raw)) flags[t.raw.substring(1)] = true
        else pos.add(t)
    }
    return Split(kv, flags, pos)
}

private fun joinText(toks: List<Token>) = toks.joinToString(" ") { it.text }

// Media: a URL is a token starting http://, https://, / or data:.
private val URL_RE = rx("^(https?://|/|data:)")
private fun isURL(s: String) = URL_RE.containsMatchIn(s)

// A URL with an optional caption after the first "|".
private fun mediaToken(t: Token): Pair<String, String>? {
    val segs = t.parts ?: listOf(t.text)
    if (!isURL(segs[0])) return null
    val i = segs[0].indexOf('|')
    if (i > 0) return segs[0].substring(0, i) to segs[0].substring(i + 1)
    return segs[0] to (if (segs.size > 1) segs.drop(1).joinToString("|") else "")
}

// Positionals of a media set: URLs become items, any other text is the title.
private fun mediaSet(pos: List<Token>, itemsKey: String, capsKey: String): Obj {
    val o = Obj()
    val items = ArrayList<String>()
    val caps = ArrayList<String>()
    val title = ArrayList<Token>()
    for (t in pos) {
        val m = mediaToken(t)
        if (m != null) { items.add(m.first); caps.add(m.second) } else title.add(t)
    }
    if (title.isNotEmpty()) o["title"] = joinText(title)
    if (items.isNotEmpty()) o[itemsKey] = items
    if (caps.any { it.isNotEmpty() }) o[capsKey] = caps
    return o
}

private fun clean(o: Obj): Obj {
    o.entries.removeIf { it.value == null || (it.value is List<*> && (it.value as List<*>).isEmpty()) }
    return o
}

// ---------- presets ----------
// Each takes positionals and returns explicit props. Key/values and flags are
// merged on top by parseArgs, so any prop can also be set as key=value.

private fun timer(pos: List<Token>): Obj {
    val o = Obj()
    val rest = ArrayList<Token>()
    for (t in pos) {
        val m = if (!t.quoted && "work" !in o) TIMESPEC.full(t.text) else null
        if (m != null) {
            o["work"] = seconds(m.g(1))
            if (!m.g(2).isNullOrEmpty()) o["rest"] = seconds(m.g(2))
            if (!m.g(3).isNullOrEmpty()) o["rounds"] = m.g(3)!!.toDouble()
        } else rest.add(t)
    }
    if (rest.isNotEmpty()) o["label"] = joinText(rest)
    return o
}

private fun ask(pos: List<Token>): Obj {
    val o = Obj()
    val q = ArrayList<Token>()
    for (t in pos) {
        if (t.parts != null && "options" !in o) o["options"] = t.parts else q.add(t)
    }
    // Loose options: with no options token, two or more quoted tokens at the
    // end, after at least one question token, are the options.
    if ("options" !in o) {
        var k = q.size
        while (k > 1 && q[k - 1].quoted) k--
        if (q.size - k >= 2) {
            o["options"] = q.subList(k, q.size).map { it.text }
            while (q.size > k) q.removeAt(q.size - 1)
        }
    }
    if (q.isNotEmpty()) o["q"] = joinText(q)
    return o
}

private fun slide(pos: List<Token>): Obj {
    val o = Obj()
    val label = ArrayList<Token>()
    for (t in pos) {
        val m = if (!t.quoted && "min" !in o) RANGE.full(t.text) else null
        val parts = t.parts
        if (m != null) { o["min"] = m.g(1)!!.toDouble(); o["max"] = m.g(2)!!.toDouble() }
        else if (parts != null && parts.size == 2 && (o["lo"] as String?).isNullOrEmpty()) { o["lo"] = parts[0]; o["hi"] = parts[1] }
        else label.add(t)
    }
    if (label.isNotEmpty()) o["label"] = joinText(label)
    return o
}

private fun form(pos: List<Token>): Obj {
    val fields = ArrayList<Obj>()
    val title = ArrayList<Token>()
    for (t in pos) {
        val f = field(t)
        if (f != null) fields.add(f) else title.add(t)
    }
    val o = Obj()
    o["fields"] = fields
    if (title.isNotEmpty()) o["title"] = joinText(title)
    return o
}

private fun list(pos: List<Token>): Obj {
    val o = Obj()
    val items = ArrayList<String>()
    o["items"] = items
    for (t in pos) {
        if ("title" !in o && items.isEmpty() && !t.quoted && t.parts == null) { o["title"] = t.text; continue }
        val parts = t.parts
        if (parts != null) items.addAll(parts) else items.add(t.text)
    }
    return o
}

private fun table(pos: List<Token>): Obj {
    val o = Obj()
    val rows = ArrayList<List<Any?>>()
    o["rows"] = rows
    for (t in pos) {
        if ("name" !in o && "cols" !in o && t.parts == null && !t.quoted) { o["name"] = t.text; continue }
        val cells = t.parts ?: if ('|' in t.text) t.text.split("|") else listOf(t.text)
        if ("cols" !in o) o["cols"] = cells else rows.add(cells.map { coerce(it) })
    }
    return o
}

private fun card(pos: List<Token>): Obj {
    val o = Obj()
    if (pos.isNotEmpty()) o["title"] = pos[0].text
    if (pos.size > 1) o["body"] = joinText(pos.drop(1))
    return o
}

// done / now / next text... [https://link]: the first bare https token is url.
private fun row(pos: List<Token>): Obj {
    val o = Obj()
    val text = ArrayList<Token>()
    for (t in pos) {
        if (o["url"] == null && t.parts == null && !t.quoted && t.text.startsWith("https://")) o["url"] = t.text else text.add(t)
    }
    if (text.isNotEmpty()) o["text"] = joinText(text)
    return o
}

private val GAME_WORD = rx("[A-Za-z][A-Za-z0-9_-]*")
// Game kinds this renderer can play. Any other kind still parses.
val GAMES = listOf("tictactoe", "snake", "memory")

// game KIND [title...]: the first bare word is the kind, wherever it sits.
private fun game(pos: List<Token>): Obj {
    val o = Obj()
    val text = ArrayList<Token>()
    for (t in pos) {
        if (o["kind"] == null && t.parts == null && !t.quoted && GAME_WORD.test(t.text)) o["kind"] = t.text else text.add(t)
    }
    if (text.isNotEmpty()) o["title"] = joinText(text)
    return o
}

private fun image(pos: List<Token>): Obj {
    val o = Obj()
    val cap = ArrayList<Token>()
    for (t in pos) {
        if (o["src"] == null && isURL(t.text)) o["src"] = t.text else cap.add(t)
    }
    if (cap.isNotEmpty()) o[if (o["src"] != null) "caption" else "prompt"] = joinText(cap)
    return o
}

private fun camera(pos: List<Token>): Obj {
    val o = Obj()
    val q = ArrayList<Token>()
    for (t in pos) {
        if (!t.quoted && (t.text == "front" || t.text == "back")) o["facing"] = t.text else q.add(t)
    }
    if (q.isNotEmpty()) o["prompt"] = joinText(q)
    return o
}

private fun titled(key: String, pos: List<Token>): Obj = Obj().also { if (pos.isNotEmpty()) it[key] = joinText(pos) }

private fun compare(pos: List<Token>): Obj {
    val o = Obj()
    val title = ArrayList<Token>()
    for (t in pos) {
        if ("after" !in o && t.parts == null && isURL(t.text)) o[if ("before" !in o) "before" else "after"] = t.text
        else title.add(t)
    }
    if (title.isNotEmpty()) o["title"] = joinText(title)
    return o
}

// chart [type] [title...]: the first bare chart type is the type.
private fun chart(pos: List<Token>): Obj {
    val o = Obj()
    val title = ArrayList<Token>()
    for (t in pos) {
        if ("type" !in o && !t.quoted && t.parts == null && t.text in CHART_TYPES) o["type"] = t.text else title.add(t)
    }
    if (title.isNotEmpty()) o["title"] = joinText(title)
    return o
}

// stat VALUE [label...]: the first quantity is the value and its unit.
private fun stat(pos: List<Token>): Obj {
    val o = Obj()
    val label = ArrayList<Token>()
    for (t in pos) {
        val q = if ("value" !in o && !t.quoted && t.parts == null) quantity(t.text) else null
        if (q != null) { o["value"] = q["value"]; if (q["unit"] != null) o["unit"] = q["unit"] } else label.add(t)
    }
    if ("value" !in o && label.isNotEmpty()) o["value"] = label.removeAt(0).text
    if (label.isNotEmpty()) o["label"] = joinText(label)
    return o
}

// step and page: the first URL is img. page: first text token the title, the rest the body.
private fun step(pos: List<Token>): Obj {
    val o = Obj()
    val text = ArrayList<Token>()
    for (t in pos) if ("img" !in o && t.parts == null && isURL(t.text)) o["img"] = t.text else text.add(t)
    if (text.isNotEmpty()) o["text"] = joinText(text)
    return o
}

private fun page(pos: List<Token>): Obj {
    val o = Obj()
    val text = ArrayList<Token>()
    for (t in pos) if ("img" !in o && t.parts == null && isURL(t.text)) o["img"] = t.text else text.add(t)
    if (text.isNotEmpty()) o["title"] = text[0].text
    if (text.size > 1) o["body"] = joinText(text.drop(1))
    return o
}

private fun preset(name: String, pos: List<Token>): Obj = when (name) {
    "timer" -> timer(pos)
    "ask", "choose", "pick" -> ask(pos)
    "slide" -> slide(pos)
    "form" -> form(pos)
    "list" -> list(pos)
    "table" -> table(pos)
    "card", "project" -> card(pos)
    "image", "video" -> image(pos)
    "camera" -> camera(pos)
    "mic" -> titled("prompt", pos)
    "say" -> Obj().also { it["text"] = joinText(pos) }
    "theme" -> titled("name", pos)
    "gallery" -> mediaSet(pos, "items", "caps")
    "compare" -> compare(pos)
    "storyboard" -> mediaSet(pos, "frames", "notes")
    "chart" -> chart(pos)
    "stat" -> stat(pos)
    "step" -> step(pos)
    "calc", "deck", "plan", "narrate", "timeline" -> titled("title", pos)
    "done", "now", "next" -> row(pos)
    "game" -> game(pos)
    "page" -> page(pos)
    else -> Obj()
}

// Quantity: a number with an optional unit stuck to it. 72.5kg, 12%, $40.
private val QTY = rx("([$€£¥])?(-?\\d+(?:\\.\\d+)?(?:[eE]-?\\d+)?)$S*([^\\d$WS.,+\\-|=]$NS*)?")

fun quantity(s: Any?): Map<String, Any?>? {
    if (s is Double) return Obj().also { it["value"] = s }
    val m = QTY.full(jsStr(s)) ?: return null
    if (m.g(1) != null && m.g(3) != null) return null
    val q = Obj()
    q["value"] = m.g(2)!!.toDouble()
    (m.g(1) ?: m.g(3))?.let { q["unit"] = it }
    return q
}

// calc variable: min-max[@value][unit] is a slider, a quantity is a constant.
private val VAR_RANGE = rx("(-?\\d+(?:\\.\\d+)?)-(-?\\d+(?:\\.\\d+)?)(?:@(-?\\d+(?:\\.\\d+)?))?$S*([^\\d$WS]$NS*)?")

fun calcVar(v: Any?): Map<String, Any?>? {
    if (v is Double) return Obj().also { it["value"] = v }
    if (v !is String) return null
    val r = VAR_RANGE.full(trim(v))
    if (r != null) {
        val min = r.g(1)!!.toDouble()
        val max = r.g(2)!!.toDouble()
        val o = Obj()
        o["min"] = min
        o["max"] = max
        o["value"] = r.g(3)?.toDouble() ?: ((min + max) / 2)
        r.g(4)?.let { o["unit"] = it }
        return o
    }
    return quantity(trim(v))
}

private val CALC_PROPS = setOf("title", "f", "plot", "unit", "digits")

// A y value with an error: 12.5±0.4 or 12.5+-0.4.
private val PM = rx("(-?\\d+(?:\\.\\d+)?)(?:±|\\+-)(\\d+(?:\\.\\d+)?)")

// Props that are always lists. A plain value is split on "|".
private val LISTS = mapOf(
    "gallery" to listOf("items", "caps"),
    "storyboard" to listOf("frames", "notes"),
    "compare" to listOf("notes", "labels"),
    "chart" to listOf("names", "color"),
    "table" to listOf("units"),
    "page" to listOf("points"),
    "project" to listOf("facts", "next"),
    "pick" to listOf("answer"),
    "game" to listOf("items"),
)

private fun asList(v: Any?): List<String> = (if (v is List<*>) v else jsStr(v).split("|")).map { jsStr(it) }

// Highlight boxes: hl=x,y,w,h|x,y,w,h in percent. Bad boxes are dropped.
private fun boxes(v: Any?): List<List<Double>> {
    val out = ArrayList<List<Double>>()
    for (b in if (v is List<*>) v else jsStr(v).split("|")) {
        val n = jsStr(b).split(",").map { trim(it) }
        if (n.size == 4 && n.all { NUM.test(it) }) out.add(n.map { it.toDouble() })
    }
    return out
}

// Tic-tac-toe cells: always a list of numbers; a part that is not a number is dropped.
private fun cellList(v: Any?): List<Double> =
    (if (v is List<*>) v else listOf(v)).mapNotNull { c ->
        when {
            c is Double -> c
            c is String && NUM.test(c) -> c.toDouble()
            else -> null
        }
    }

private fun normalize(preset: String, o: Obj): Obj {
    for (k in LISTS[preset] ?: emptyList()) if (k in o && o[k] != true) o[k] = asList(o[k])
    if (preset == "compare" && "hl" in o) o["hl"] = boxes(o["hl"])
    if (preset == "game") for (k in listOf("x", "o")) if (k in o) o[k] = cellList(o[k])
    if (preset == "chart") chartSeries(o)
    if (preset == "stat" && "spark" in o && o["spark"] !is List<*>) o["spark"] = listOf(o["spark"])
    if (preset == "step" && "time" in o) o["time"] = seconds(o["time"]) ?: o["time"]
    if (preset == "calc") {
        for (k in o.keys.toList()) {
            if (k in CALC_PROPS) continue
            calcVar(o[k])?.let { o[k] = it }
        }
    }
    return o
}

private val YERR = rx("(y|err)(\\d*)")

// y, y2 ... are lists; 12.5±0.4 becomes 12.5 with its error in err, err2 ...
private fun chartSeries(o: Obj) {
    if ("x" in o && o["x"] !is List<*>) o["x"] = listOf(o["x"])
    for (k in o.keys.toList()) {
        val m = YERR.full(k) ?: continue
        val list = o[k] as? List<*> ?: listOf(o[k])
        if (m.g(1) == "err") { o[k] = list; continue }
        val errs = ArrayList<Double>()
        o[k] = list.map { v ->
            val pm = if (v is String) PM.full(v) else null
            if (pm == null) { errs.add(0.0); v } else { errs.add(pm.g(2)!!.toDouble()); pm.g(1)!!.toDouble() }
        }
        val ek = "err${m.g(2)}"
        if (errs.any { it != 0.0 } && ek !in o) o[ek] = errs
    }
}

// Raw-TeX presets. math: the rest of the line is TeX, verbatim, after any
// leading caption= / size= props. step: a lone "$" token starts the TeX part.
private val MATH_PROP = rx("^(caption|size)=(\"(?:[^\"\\\\]|\\\\$DOT)*\"|$NS*)(?:$S+|\\z)")
private val UNESCAPE = rx("\\\\($DOT)")
private val ONE_QUOTED = rx("\"[^\"]*\"")
private val STEP_TEX = rx("(^|$S)\\$($S|\\z)")

private fun unescape(s: String) = UNESCAPE.replace(s) { it.groupValues[1] }

private fun mathArgs(rest: String): Obj {
    val o = Obj()
    var r = trim(rest)
    while (true) {
        val m = MATH_PROP.find(r) ?: break
        val v = m.groupValues[2]
        o[m.groupValues[1]] = if (v.startsWith("\"")) unescape(v.substring(1, v.length - 1)) else v
        r = r.substring(m.range.last + 1)
    }
    r = trim(r)
    if (ONE_QUOTED.test(r)) r = r.substring(1, r.length - 1)
    if (r.isNotEmpty()) o["tex"] = r
    return o
}

private fun stepArgs(rest: String): Obj {
    val m = STEP_TEX.find(rest)
    val head = if (m != null) rest.substring(0, m.range.first) else rest
    val o = parseArgs("step", tokenize(head))
    if (m != null) {
        val tex = trim(rest.substring(m.range.last + 1))
        if (tex.isNotEmpty()) o["tex"] = tex
    }
    return o
}

private fun rawArgs(preset: String, rest: String) = if (preset == "math") mathArgs(rest) else stepArgs(rest)
private val RAW = setOf("math", "step")

// Form field token: key:type, "Label":type, optional trailing "!" = required.
private val FIELD = rx("(?:\"((?:[^\"\\\\]|\\\\$DOT)*)\"|([a-z_][\\w-]*))(?::($DOT+?))?(!)?", true)
private val EDGE_QUOTES = rx("^\"|\"$")
private val SLUG = rx("[^a-z0-9]+")

private fun slug(s: String) = SLUG.replace(s.lowercase(), "_").removePrefix("_").removeSuffix("_")

private fun field(t: Token): Obj? {
    if (t.quoted) return null // a quoted token alone is the form title
    val m = FIELD.full(t.raw) ?: return null
    val label = m.g(1)?.let { unescape(it) }
    val key = m.g(2) ?: slug(label!!)
    val type = m.g(3)
    if (type == null && label != null) return null // "Title" without a type
    val f = Obj()
    f["key"] = key
    if (!label.isNullOrEmpty()) f["label"] = label
    if (!type.isNullOrEmpty()) {
        val r = RANGE.full(type)
        if (r != null) { f["type"] = "range"; f["min"] = r.g(1)!!.toDouble(); f["max"] = r.g(2)!!.toDouble() }
        else if ('|' in type) { f["type"] = "choice"; f["options"] = type.split("|").map { EDGE_QUOTES.replace(it, "") } }
        else f["type"] = type
    }
    if (m.g(4) != null) f["required"] = true
    return f
}

fun parseArgs(preset: String, tokens: List<Token>): LinkedHashMap<String, Any?> {
    val sp = split(tokens)
    val o = preset(preset, sp.pos)
    o.putAll(sp.flags)
    o.putAll(sp.kv)
    return clean(normalize(preset, o))
}

// ---------- line parser ----------

private val ROUTE = rx("^>([\\w-]+)(?:$S+|\\z)")
private val COMMENT = rx("^#($S|\\z)")
private val CUSTOM = rx("custom(?:@([\\w-]+))?$S+($DOT*)")
private val PATCH_AT = rx("([a-z]+)@([\\w-]+)")
private val HEAD = rx("([a-z]+)(?:@([\\w-]+))?")

private fun op(vararg kv: Pair<String, Any?>): Op = linkedMapOf(*kv)

// Stateful: remembers the focused screen and which preset each id belongs to,
// so "~hiit rounds=10" knows to parse its args as a timer.
class Parser {
    private var screen = "1"
    private val ids = HashMap<String, String>() // id -> preset
    private var auto = 0
    private val open = ArrayList<Triple<String, String, String>>() // open groups: (id, preset, screen)

    // Group bookkeeping for one parsed op. Errors (and null) leave groups open.
    private fun group(o: Op?): Op? {
        if (o == null || o["op"] == "error" || o["op"] == "theme") return o
        if (o["op"] == "close") { open.clear(); return o }
        if (o["op"] == "end") {
            if (open.isEmpty()) return op("op" to "error", "screen" to o["screen"], "message" to "end: no open deck, plan, narrate or timeline", "line" to o["line"])
            val g = open.removeAt(open.size - 1)
            return LinkedHashMap(o).also { it["target"] = g.first }
        }
        fun joins(g: Triple<String, String, String>) = o["op"] == "add" && o["screen"] == g.third && o["preset"] in GROUPS.getValue(g.second)
        while (open.isNotEmpty() && !joins(open.last())) open.removeAt(open.size - 1)
        val out = if (open.isNotEmpty()) op(
            "op" to o["op"], "screen" to o["screen"], "preset" to o["preset"], "id" to o["id"],
            "in" to open.last().first, "props" to o["props"], "line" to o["line"],
        ) else o
        val p = o["preset"]
        if (o["op"] == "add" && p is String && p in GROUPS) open.add(Triple(o["id"] as String, p, o["screen"] as String))
        return out
    }

    fun line(src: String): Op? = group(parseLine(src))

    private fun parseLine(src: String): Op? {
        val line = src.removeSuffix("\r")
        var body = trim(line)
        if (body.isEmpty() || COMMENT.containsMatchIn(body)) return null

        var screen = this.screen
        val route = ROUTE.find(body)
        if (route != null) {
            // `chat` is screen 1; a bare ">chat" closes the stage.
            val name = route.groupValues[1]
            screen = if (name == "chat") "1" else name
            body = body.substring(route.range.last + 1)
            if (body.isEmpty() || COMMENT.containsMatchIn(body)) {
                this.screen = screen
                return if (name == "chat") op("op" to "close", "screen" to "full", "line" to line)
                else op("op" to "focus", "screen" to screen, "line" to line)
            }
        }

        // custom {json}: the rest of the line is JSON, not YL tokens.
        val cm = CUSTOM.full(body)
        if (cm != null) {
            val spec = try {
                Json.parse(cm.groupValues[2])
            } catch (e: Json.ParseError) {
                return op("op" to "error", "screen" to screen, "message" to "custom: bad JSON (${e.message})", "line" to line)
            } catch (e: StackOverflowError) {
                return op("op" to "error", "screen" to screen, "message" to "custom: bad JSON (too deep)", "line" to line)
            }
            val id = cm.g(1) ?: "c${++auto}"
            ids[id] = "custom"
            return op("op" to "add", "screen" to screen, "preset" to "custom", "id" to id, "props" to op("spec" to spec), "line" to line)
        }

        val tokens = tokenize(body).toMutableList()
        if (tokens.isEmpty()) return null
        val head = tokens.removeAt(0).raw
        fun err(msg: String) = op("op" to "error", "screen" to screen, "message" to msg, "line" to line)

        if (head.startsWith("~")) {
            var target = head.substring(1)
            // ~preset@id: the id when this reply made it, else the preset name.
            val pm = PATCH_AT.full(target)
            if (pm != null) {
                val (p, id) = pm.destructured
                if (p !in PRESETS && p != "say" && p != "custom") return err("patch: unknown preset \"$p\"")
                val known = ids[id]
                if (known != null && known != p) return err("patch: \"$id\" is a $known, not a $p")
                target = if (known != null) id else p
            }
            val preset = if (target in PRESETS || target == "say") target else ids[target]
                ?: return err("patch: nothing called \"$target\"")
            if (preset == "custom") return err("patch: custom blocks are replaced, not patched")
            val props = if (preset in RAW) rawArgs(preset, body.substring(head.length)) else parseArgs(preset, tokens)
            return op("op" to "patch", "screen" to screen, "target" to target, "props" to props, "line" to line)
        }

        when (head) {
            "save", "show", "forget" -> {
                // The name is the rest of the line: `save leg day` is "leg day".
                val name = tokens.map { it.text }.filter { it.isNotEmpty() }.joinToString(" ")
                if (name.isEmpty()) return err("$head: needs a name")
                return op("op" to head, "screen" to screen, "name" to name, "line" to line)
            }
            "clear" -> return op("op" to "clear", "screen" to screen, "line" to line)
            "end" -> return op("op" to "end", "screen" to screen, "line" to line)
            "close" -> {
                if (tokens.isNotEmpty()) return err("close: takes nothing else")
                this.screen = "1"
                return op("op" to "close", "screen" to "full", "line" to line)
            }
            "theme" -> return op("op" to "theme", "screen" to screen, "props" to parseArgs("theme", tokens), "line" to line)
            "talk" -> {
                // `talk` or `talk on` turns the composer on for this page, `talk off` takes it away.
                val word = if (tokens.isEmpty()) "on" else if (tokens.size == 1) tokens[0].text else null
                if (word != "on" && word != "off") return err("talk: takes nothing, on or off")
                return op("op" to "talk", "screen" to screen, "props" to linkedMapOf<String, Any?>("on" to (word == "on")), "line" to line)
            }
        }

        val hm = HEAD.full(head)
        if (hm == null || !(hm.groupValues[1] in PRESETS || hm.groupValues[1] == "say")) return err("unknown preset \"$head\"")
        val preset = hm.groupValues[1]
        val id = hm.g(2) ?: "n${++auto}"
        ids[id] = preset
        val props = if (preset in RAW) rawArgs(preset, body.substring(head.length)) else parseArgs(preset, tokens)
        return op("op" to "add", "screen" to screen, "preset" to preset, "id" to id, "props" to props, "line" to line)
    }
}

// Parse a whole document at once.
fun parse(text: String): List<Op> {
    val p = Parser()
    return text.split("\n").mapNotNull { p.line(it) }
}

// Streaming: feed chunks as they arrive, get ops for every completed line.
// Lines render the moment their newline lands; flush() finishes the tail.
class StreamParser {
    private val buf = StringBuilder()
    private val p = Parser()

    fun push(chunk: String): List<Op> {
        buf.append(chunk)
        val out = ArrayList<Op>()
        while (true) {
            val nl = buf.indexOf("\n")
            if (nl < 0) break
            val op = p.line(buf.substring(0, nl))
            buf.delete(0, nl + 1)
            if (op != null) out.add(op)
        }
        return out
    }

    fun flush(): List<Op> {
        val rest = buf.toString()
        buf.setLength(0)
        val op = if (trim(rest).isNotEmpty()) p.line(rest) else null
        return listOfNotNull(op)
    }
}

// ---------- the stage ----------

// A timer with rounds or rest. Workouts always open on the stage.
fun isWorkout(preset: String?, props: Map<String, Any?> = emptyMap()): Boolean =
    preset == "timer" && props["up"] != true &&
        (toNumber(props["rounds"] ?: 1.0) > 1 || toNumber(props["rest"] ?: 0.0) > 0)

// The page a screen lives on (YL.md section 5, Pages): 2 and 3 are pages
// beside the chat; every other screen renders in the chat, page 1.
const val MAX_PAGE = 12

fun pageOf(screen: String?): Int {
    val n = screen?.toIntOrNull() ?: return 1
    return if (n.toString() == screen && n in 2..MAX_PAGE) n else 1
}

// Chat with a screen (spec section 5, Pages): the pages whose composer is on
// after these ops, in number order. `talk` turns it on, `talk off` and `clear`
// take it away; only pages 2 to 12 have one to turn on.
fun talking(ops: List<Op>): List<Int> {
    val on = sortedSetOf<Int>()
    for (o in ops) {
        val n = pageOf(o["screen"] as String?)
        if (n == 1) continue
        if (o["op"] == "talk" && (o["props"] as Map<*, *>)["on"] == true) on.add(n)
        else if (o["op"] == "clear" || o["op"] == "talk") on.remove(n)
    }
    return on.toList()
}

// What the person typed on a page, as the agent reads it (spec section 7):
// a `[yui] screen=2` line, then the words. Anywhere else the words as they are.
fun typedBody(screen: String, words: String): String =
    if (pageOf(screen) == 1) words else "[yui] screen=$screen\n$words"

private val TYPED = Regex("""^\[yui] screen=(\S+)\r?\n""")

// The other way: screen and words for a message typed on a page, else null.
fun readTyped(body: String): Map<String, Any?>? {
    val m = TYPED.find(body) ?: return null
    if (pageOf(m.groupValues[1]) == 1) return null
    return mapOf("screen" to m.groupValues[1], "words" to body.substring(m.range.last + 1))
}

// Whether an add op opens on the stage. `style` is the agent's style profile
// (theme style: screen=chat|full, gallery=...).
fun onStage(op: Op?, style: Map<String, Any?> = emptyMap()): Boolean {
    if (op == null || op["op"] != "add") return false
    if (op["screen"] == "full") return true
    @Suppress("UNCHECKED_CAST")
    val p = op["props"] as? Map<String, Any?> ?: emptyMap()
    if (isWorkout(op["preset"] as String?, p)) return true
    if (pageOf(op["screen"] as String?) != 1) return false
    if (p["inline"] == true) return false
    if (style["screen"] == "chat") return false
    if (style["screen"] == "full") return true
    if (op["preset"] in STAGE) return true
    return op["preset"] == "gallery" && (p["layout"] ?: style["gallery"]) == "row3d"
}

// ---------- defaults ----------

private val DEFAULTS: Map<String, Map<String, Any?>> = mapOf(
    "timer" to mapOf("work" to 60.0, "rest" to 0.0, "rounds" to 1.0, "label" to "", "up" to false, "auto" to false, "sound" to true),
    "ask" to mapOf("q" to "Continue?", "options" to listOf("Yes", "No")),
    "choose" to mapOf("q" to "", "options" to emptyList<String>(), "other" to false),
    "pick" to mapOf("q" to "", "options" to emptyList<String>(), "other" to false, "submit" to "Done"),
    "form" to mapOf("title" to "", "fields" to emptyList<Any>(), "submit" to "Submit"),
    "list" to mapOf("title" to "", "items" to emptyList<String>(), "check" to false, "num" to false),
    "table" to mapOf("name" to "", "cols" to null, "rows" to emptyList<Any>(), "units" to emptyList<String>(), "sort" to false),
    "card" to mapOf("title" to "", "body" to ""),
    "image" to mapOf("fit" to "cover", "edit" to false),
    "camera" to mapOf("prompt" to "Take a photo", "facing" to "back", "scan" to false),
    "mic" to mapOf("prompt" to "Tap and talk", "auto" to false),
    "gallery" to mapOf("title" to "", "items" to emptyList<String>(), "caps" to emptyList<String>(), "layout" to "row", "pick" to false, "submit" to "Done"),
    "video" to mapOf("loop" to false, "auto" to false, "mute" to false),
    "compare" to mapOf("title" to "", "mode" to "slider", "labels" to listOf("Before", "After"), "notes" to emptyList<String>(), "hl" to emptyList<Any>(), "pick" to false),
    "storyboard" to mapOf("title" to "", "frames" to emptyList<String>(), "notes" to emptyList<String>(), "reorder" to false, "comment" to true),
    "chart" to mapOf("type" to "line", "title" to "", "x" to emptyList<Any>(), "names" to emptyList<String>(), "unit" to "", "stack" to false),
    "stat" to mapOf("label" to "", "unit" to "", "good" to "up"),
    "math" to mapOf("tex" to "", "size" to "md"),
    "step" to mapOf("text" to "", "all" to false),
    "calc" to mapOf("title" to "", "digits" to 3.0),
    "deck" to mapOf("title" to "", "layout" to "slides", "full" to false, "notes" to false),
    "page" to mapOf("title" to "", "body" to "", "points" to emptyList<String>(), "notes" to ""),
    "plan" to mapOf("title" to "", "submit" to "Send", "review" to true),
    "narrate" to mapOf("title" to "", "voice" to "agent", "rate" to 1.0, "auto" to false, "captions" to true),
    "timeline" to mapOf("title" to "", "mark" to "Now", "fold" to 5.0),
    "done" to mapOf("text" to ""), "now" to mapOf("text" to ""), "next" to mapOf("text" to ""),
    "game" to mapOf("title" to "", "you" to "x", "first" to "you", "speed" to 2.0, "size" to 15.0, "pairs" to 6.0, "items" to emptyList<String>()),
)

// Explicit props over the preset's defaults.
fun resolve(preset: String, props: Map<String, Any?>): Map<String, Any?> {
    val r = Obj()
    when (preset) {
        "slide" -> {
            r.putAll(mapOf("label" to "", "min" to 1.0, "max" to 5.0, "step" to 1.0))
            r.putAll(props)
            if ("value" !in r) r["value"] = Math.floor((toNumber(r["min"]) + toNumber(r["max"])) / 2 + 0.5)
        }
        "project" -> {
            r.putAll(mapOf("title" to "", "body" to "", "facts" to emptyList<String>(), "next" to emptyList<String>(), "status" to ""))
            r.putAll(props)
            r["cta"] = props["cta"] ?: if (props["open"] != null && props["open"] != false && props["open"] != "" && props["open"] != 0.0) "Open" else ""
        }
        "game" -> {
            // Cells outside 1-9 are ignored, and a cell both marks claim is x's.
            fun cells(v: Any?): List<Double> = (v as? List<*> ?: emptyList<Any?>())
                .mapNotNull { it as? Double }.filter { it == Math.floor(it) && it in 1.0..9.0 }.distinct()
            r.putAll(DEFAULTS["game"]!!)
            r.putAll(props)
            r["kind"] = jsStr(props["kind"] ?: "").lowercase()
            val x = cells(props["x"])
            r["x"] = x
            r["o"] = cells(props["o"]).filter { it !in x }
        }
        else -> { r.putAll(DEFAULTS[preset] ?: emptyMap()); r.putAll(props) }
    }
    return r
}

package yuilines

// Minimal strict JSON (RFC 8259, as JS JSON.parse reads it) so the parser
// needs nothing beyond the Kotlin stdlib. Objects are LinkedHashMap,
// arrays List, numbers Double, plus String, Boolean and null.
object Json {
    class ParseError(message: String) : Exception(message)

    fun parse(text: String): Any? {
        val r = Reader(text)
        r.ws()
        val v = r.value()
        r.ws()
        if (r.i < text.length) throw r.err("unexpected \"${text[r.i]}\"")
        return v
    }

    fun write(v: Any?): String = StringBuilder().also { write(v, it) }.toString()

    private fun write(v: Any?, sb: StringBuilder) {
        when (v) {
            null -> sb.append("null")
            is Boolean -> sb.append(v)
            is Number -> sb.append(number(v.toDouble()))
            is String -> string(v, sb)
            is Map<*, *> -> {
                sb.append('{')
                var first = true
                for ((k, x) in v) {
                    if (!first) sb.append(',')
                    first = false
                    string(k.toString(), sb)
                    sb.append(':')
                    write(x, sb)
                }
                sb.append('}')
            }
            is List<*> -> {
                sb.append('[')
                v.forEachIndexed { i, x -> if (i > 0) sb.append(','); write(x, sb) }
                sb.append(']')
            }
            else -> string(v.toString(), sb)
        }
    }

    // JS number formatting for the common cases: 40 not 40.0.
    fun number(d: Double): String =
        if (d == Math.floor(d) && !d.isInfinite() && Math.abs(d) < 1e21) d.toLong().toString() else d.toString()

    private fun string(s: String, sb: StringBuilder) {
        sb.append('"')
        for (c in s) {
            when {
                c == '"' -> sb.append("\\\"")
                c == '\\' -> sb.append("\\\\")
                c == '\n' -> sb.append("\\n")
                c == '\r' -> sb.append("\\r")
                c == '\t' -> sb.append("\\t")
                c < ' ' -> sb.append(String.format("\\u%04x", c.code))
                else -> sb.append(c)
            }
        }
        sb.append('"')
    }

    private class Reader(val s: String) {
        var i = 0

        fun err(m: String) = ParseError("$m at position $i")

        fun ws() {
            while (i < s.length && (s[i] == ' ' || s[i] == '\t' || s[i] == '\n' || s[i] == '\r')) i++
        }

        fun value(): Any? {
            if (i >= s.length) throw err("unexpected end")
            return when (s[i]) {
                '{' -> obj()
                '[' -> arr()
                '"' -> str()
                't' -> lit("true", true)
                'f' -> lit("false", false)
                'n' -> lit("null", null)
                else -> num()
            }
        }

        fun lit(word: String, v: Any?): Any? {
            if (!s.startsWith(word, i)) throw err("unexpected token")
            i += word.length
            return v
        }

        fun expect(c: Char) {
            if (i >= s.length || s[i] != c) throw err("expected \"$c\"")
            i++
        }

        fun obj(): Map<String, Any?> {
            i++
            val m = LinkedHashMap<String, Any?>()
            ws()
            if (i < s.length && s[i] == '}') { i++; return m }
            while (true) {
                ws()
                if (i >= s.length || s[i] != '"') throw err("expected a key")
                val k = str()
                ws(); expect(':'); ws()
                m[k] = value()
                ws()
                if (i < s.length && s[i] == ',') { i++; continue }
                expect('}')
                return m
            }
        }

        fun arr(): List<Any?> {
            i++
            val out = ArrayList<Any?>()
            ws()
            if (i < s.length && s[i] == ']') { i++; return out }
            while (true) {
                ws()
                out.add(value())
                ws()
                if (i < s.length && s[i] == ',') { i++; continue }
                expect(']')
                return out
            }
        }

        fun str(): String {
            i++
            val sb = StringBuilder()
            while (true) {
                if (i >= s.length) throw err("unterminated string")
                val c = s[i++]
                when {
                    c == '"' -> return sb.toString()
                    c < ' ' -> throw err("control character in string")
                    c == '\\' -> {
                        if (i >= s.length) throw err("unterminated string")
                        when (val e = s[i++]) {
                            '"', '\\', '/' -> sb.append(e)
                            'b' -> sb.append('\b')
                            'f' -> sb.append('\u000C')
                            'n' -> sb.append('\n')
                            'r' -> sb.append('\r')
                            't' -> sb.append('\t')
                            'u' -> {
                                if (i + 4 > s.length) throw err("bad \\u escape")
                                val h = s.substring(i, i + 4)
                                if (!h.all { it in '0'..'9' || it in 'a'..'f' || it in 'A'..'F' }) throw err("bad \\u escape")
                                sb.append(h.toInt(16).toChar())
                                i += 4
                            }
                            else -> throw err("bad escape")
                        }
                    }
                    else -> sb.append(c)
                }
            }
        }

        fun num(): Double {
            val m = NUMBER.find(s, i)
            if (m == null || m.range.first != i) throw err("unexpected \"${s[i]}\"")
            i = m.range.last + 1
            return m.value.toDouble()
        }
    }

    private val NUMBER = Regex("-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?")
}

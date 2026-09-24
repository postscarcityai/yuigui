# Yui Lines for Kotlin

A Yui Lines parser for Kotlin on the JVM (Android later). Kotlin stdlib only, including a small strict JSON reader for `custom` lines. It is a port of the JS reference (`site/lib/yl/yl.mjs`) and passes every vector in `spec/conformance/`.

```kotlin
import yuilines.*
val ops = parse("timer 40/20x8 Tabata\nask Ready? Yes|Not yet")
println(ops[0]["props"])                  // {work=40.0, rest=20.0, rounds=8.0, label=Tabata}
val s = StreamParser(); s.push("card Hi th"); val more = s.push("ere\n") + s.flush()  // one op per finished line
println(resolve(more[0]["preset"] as String, more[0]["props"] as Map<String, Any?>))  // props over the preset's defaults
```

Ops are `Map<String, Any?>` with the same keys as the JS parser. Numbers are `Double`, lists are `List`, objects are `Map`. `onStage(op, style)` says whether an add opens on the full-screen stage.

The sources are in `src/`: `YuiLines.kt` (the parser), `Json.kt`, `Conformance.kt` (the runner). Build and run the vectors (needs `kotlinc` and a JDK; on a Mac, `brew install kotlin`):

```sh
parsers/kotlin/run.sh
```

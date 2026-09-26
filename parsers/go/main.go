package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
)

type Operation map[string]interface{}

func normalize(ops []Operation) []Operation {
	out := make([]Operation, len(ops))
	for i, op := range ops {
		out[i] = cleanOp(op)
	}
	return out
}

func jsonEq(a, b interface{}) bool {
	aj, _ := json.Marshal(a)
	bj, _ := json.Marshal(b)
	return string(aj) == string(bj)
}

func byChar(input string, known map[string]string) []Operation {
	s := NewStreamParser(known)
	var out []Operation
	for _, ch := range input {
		out = append(out, s.Push(string(ch))...)
	}
	out = append(out, s.Flush()...)
	return normalize(out)
}

func toKnownMap(v interface{}) map[string]string {
	known := map[string]string{}
	if m, ok := v.(map[string]interface{}); ok {
		for k, val := range m {
			if s, ok := val.(string); ok {
				known[k] = s
			}
		}
	}
	return known
}

func check(v map[string]interface{}) [][2]interface{} {
	var fails [][2]interface{}

	known := toKnownMap(v["known"])
	input, _ := v["input"].(string)
	expected, _ := v["expected"].([]interface{})

	parsedOps := parse(input, known)
	got := normalize(parsedOps)
	if !jsonEq(got, expected) {
		fails = append(fails, [2]interface{}{"parse", got})
	}

	streamed := byChar(input, known)
	if !jsonEq(streamed, expected) {
		fails = append(fails, [2]interface{}{"stream (1 char per chunk)", streamed})
	}

	if chunksRaw, ok := v["chunks"].([]interface{}); ok {
		s := NewStreamParser(known)
		var emits []interface{}
		for _, c := range chunksRaw {
			cs, _ := c.(string)
			emits = append(emits, normalize(s.Push(cs)))
		}
		emits = append(emits, normalize(s.Flush()))
		if !jsonEq(emits, v["emits"]) {
			fails = append(fails, [2]interface{}{"stream (chunks)", emits})
		}
	}

	if stageWant, ok := v["stage"].([]interface{}); ok {
		style := map[string]interface{}{}
		if sv, ok := v["style"].(map[string]interface{}); ok {
			style = sv
		}
		var staged []interface{}
		for _, o := range parsedOps {
			if onStage(o, style) {
				staged = append(staged, o["id"])
			}
		}
		if !jsonEq(orEmpty(staged), orEmpty(stageWant)) {
			fails = append(fails, [2]interface{}{"stage (ids that open on the stage)", staged})
		}
	}

	if pagesWant, ok := v["pages"].([]interface{}); ok {
		var pages []interface{}
		for _, o := range parsedOps {
			if o["op"] == "add" {
				scr, _ := o["screen"].(string)
				pages = append(pages, float64(pageOf(scr)))
			}
		}
		if !jsonEq(orEmpty(pages), orEmpty(pagesWant)) {
			fails = append(fails, [2]interface{}{"pages (page of each add)", pages})
		}
	}

	if talkWant, ok := v["talk"].([]interface{}); ok {
		on := talking(parsedOps)
		onIface := make([]interface{}, len(on))
		for i, n := range on {
			onIface[i] = float64(n)
		}
		if !jsonEq(onIface, talkWant) {
			fails = append(fails, [2]interface{}{"talk (pages with the composer on)", onIface})
		}
	}

	if menuWant, ok := v["menu"].(map[string]interface{}); ok {
		m := menuOf(parse(input, nil))
		if !jsonEq(m, menuWant) {
			fails = append(fails, [2]interface{}{"menu (the drawer's items after the input)", m})
		}
	}

	if rowsWant, ok := v["rows"].(map[string]interface{}); ok {
		st := newMiniState()
		for _, o := range parsedOps {
			st.apply(o)
		}
		var rows []*stateComp
		for _, list := range st.screens {
			for _, c := range list {
				if contains(ROWS, c.preset) {
					rows = append(rows, c)
				}
			}
		}
		sort.Slice(rows, func(i, j int) bool { return rows[i].seq < rows[j].seq })
		rowsOut := make([]interface{}, len(rows))
		kinds := make([]string, len(rows))
		for i, r := range rows {
			rowsOut[i] = map[string]interface{}{"id": r.id, "kind": r.preset}
			kinds[i] = r.preset
		}
		gotRows := map[string]interface{}{"rows": rowsOut, "mark": float64(markAt(kinds))}
		if !jsonEq(gotRows, rowsWant) {
			fails = append(fails, [2]interface{}{"rows (timeline rows and the now marker)", gotRows})
		}
	}

	if typedRaw, ok := v["typed"].(map[string]interface{}); ok {
		screen, _ := typedRaw["screen"].(string)
		words, _ := typedRaw["words"].(string)
		bodyWant, _ := typedRaw["body"].(string)
		made := typedBody(screen, words)
		if made != bodyWant {
			fails = append(fails, [2]interface{}{"typed (body for words typed on the screen)", made})
		}
		scr, w, ok2 := readTyped(bodyWant)
		var want interface{}
		if pageOf(screen) != 1 {
			want = map[string]interface{}{"screen": screen, "words": words}
		}
		var read interface{}
		if ok2 {
			read = map[string]interface{}{"screen": scr, "words": w}
		}
		if !jsonEq(read, want) {
			fails = append(fails, [2]interface{}{"typed (read back)", read})
		}
	}

	if attachRaw, ok := v["attach"].(map[string]interface{}); ok {
		item, _ := attachRaw["item"].(map[string]interface{})
		words, _ := attachRaw["words"].(string)
		bodyWant, _ := attachRaw["body"].(string)
		section, _ := item["section"].(string)
		id, _ := item["id"].(string)
		rev, _ := item["rev"].(string)
		made := attachBody(section, id, rev, words)
		if made != bodyWant {
			fails = append(fails, [2]interface{}{"attach (body for words about an item)", made})
		}
		s2, id2, rev2, w2, ok2 := readAttach(bodyWant)
		var want interface{}
		if made != words {
			want = map[string]interface{}{"section": section, "id": id, "rev": rev, "words": words}
		}
		var read interface{}
		if ok2 {
			read = map[string]interface{}{"section": s2, "id": id2, "rev": rev2, "words": w2}
		}
		if !jsonEq(read, want) {
			fails = append(fails, [2]interface{}{"attach (read back)", read})
		}
	}

	if tablesRaw, ok := v["tables"].(map[string]interface{}); ok {
		ctx := storeCtx{}
		if s, ok := tablesRaw["today"].(string); ok {
			ctx.today = s
		}
		if s, ok := tablesRaw["now"].(string); ok {
			ctx.now = s
		}
		store, errs := replay(emptyStore(), parsedOps, ctx)
		var failedLines []interface{}
		for _, e := range errs {
			failedLines = append(failedLines, e.line)
		}
		wantFailed, _ := tablesRaw["failed"].([]interface{})
		if !jsonEq(orEmpty(failedLines), orEmpty(wantFailed)) {
			fails = append(fails, [2]interface{}{"tables (write lines the store refused)", failedLines})
		}
		var results []interface{}
		for _, o := range parsedOps {
			if o["op"] == "add" && o["preset"] == "query" {
				props, _ := o["props"].(map[string]interface{})
				resolved := resolveQuery(props)
				r := queryResult(store, resolved, ctx)
				if _, isErr := r["error"]; isErr {
					r = map[string]interface{}{"error": true}
				}
				results = append(results, r)
			}
		}
		wantResults, _ := tablesRaw["results"].([]interface{})
		if !jsonEq(orEmpty(results), orEmpty(wantResults)) {
			fails = append(fails, [2]interface{}{"tables (query results)", results})
		}
	}

	if lookWant, hasLook := v["look"]; hasLook {
		var lastTheme Operation
		for _, o := range parsedOps {
			if o["op"] == "theme" {
				if props, ok := o["props"].(map[string]interface{}); ok {
					if props["scope"] == "app" {
						lastTheme = o
					}
				}
			}
		}
		var moved interface{}
		var under []interface{}
		if lastTheme != nil {
			props, _ := lastTheme["props"].(map[string]interface{})
			look := appLook(props)
			moved = map[string]interface{}{
				"light": adjustedFor(look, "light"),
				"dark":  adjustedFor(look, "dark"),
			}
			if look.name != "yui" {
				for _, mp := range []struct {
					mode string
					pal  paletteOut
				}{{"light", look.light}, {"dark", look.dark}} {
					for _, c := range lookChecks(mp.pal) {
						if !c.ok {
							under = append(under, fmt.Sprintf("%s: %s %v", mp.mode, c.what, c.ratio))
						}
					}
				}
			}
		}
		if !jsonEq(moved, lookWant) {
			fails = append(fails, [2]interface{}{"look (colors the guard moved)", moved})
		}
		if len(under) > 0 {
			fails = append(fails, [2]interface{}{"look (pairs under AA)", under})
		}
	}

	hasError := false
	for _, e := range expected {
		if em, ok := e.(map[string]interface{}); ok && em["op"] == "error" {
			hasError = true
			break
		}
	}
	wantError, _ := v["error"].(bool)
	if hasError != wantError {
		fails = append(fails, [2]interface{}{"vector: `error` flag does not match expected", v["error"]})
	}

	return fails
}

func orEmpty(v []interface{}) []interface{} {
	if v == nil {
		return []interface{}{}
	}
	return v
}

func resolveQuery(props map[string]interface{}) map[string]interface{} {
	out := map[string]interface{}{"table": "", "as": "table", "title": "", "where": []interface{}{}, "sort": []interface{}{}}
	for k, v := range props {
		out[k] = v
	}
	return out
}

func dump(x interface{}) string {
	b, _ := json.Marshal(x)
	return string(b)
}

func checkSafe(v map[string]interface{}) (fails [][2]interface{}) {
	defer func() {
		if r := recover(); r != nil {
			fails = [][2]interface{}{{"crash", fmt.Sprintf("panic: %v", r)}}
		}
	}()
	return check(v)
}

func main() {
	flag.Parse()
	args := flag.Args()

	d := "../../spec/conformance"
	if len(args) > 0 {
		d = args[0]
	}

	entries, err := os.ReadDir(d)
	if err != nil {
		fmt.Fprintf(os.Stderr, "cannot read %s: %v\n", d, err)
		os.Exit(2)
	}

	var files []string
	re := regexp.MustCompile(`^\d\d-.*\.json$`)
	for _, f := range entries {
		if re.MatchString(f.Name()) {
			files = append(files, f.Name())
		}
	}
	sort.Strings(files)

	passed, failed := 0, 0

	for _, f := range files {
		data, err := os.ReadFile(filepath.Join(d, f))
		if err != nil {
			fmt.Fprintf(os.Stderr, "cannot read %s: %v\n", f, err)
			continue
		}
		var fileData map[string]interface{}
		if err := json.Unmarshal(data, &fileData); err != nil {
			fmt.Fprintf(os.Stderr, "cannot parse %s: %v\n", f, err)
			continue
		}
		vectors, _ := fileData["vectors"].([]interface{})
		ok := 0

		for _, vRaw := range vectors {
			vectorMap, _ := vRaw.(map[string]interface{})
			fails := checkSafe(vectorMap)
			if len(fails) == 0 {
				ok++
				continue
			}
			failed++
			name, _ := vectorMap["name"].(string)
			fmt.Printf("FAIL %s :: %s\n", f, name)
			fmt.Printf("  input:    %s\n", dump(vectorMap["input"]))
			if _, hasChunks := vectorMap["chunks"]; hasChunks {
				fmt.Printf("  expected: %s\n", dump(vectorMap["emits"]))
			} else {
				fmt.Printf("  expected: %s\n", dump(vectorMap["expected"]))
			}
			for _, fail := range fails {
				fmt.Printf("  %s: %s\n", fail[0], dump(fail[1]))
			}
		}

		passed += ok
		status := "FAIL"
		if ok == len(vectors) {
			status = "ok  "
		}
		fmt.Printf("%s %-34s %d/%d\n", status, f, ok, len(vectors))
	}

	fmt.Printf("\n%d passed, %d failed, %d vectors in %d files\n", passed, failed, passed+failed, len(files))

	if failed > 0 {
		os.Exit(1)
	}
}

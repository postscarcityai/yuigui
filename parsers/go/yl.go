// Yui Lines (YL) v0 parser. Spec: spec/YL.md
// Port of site/lib/yl/yl.mjs. Pure, dependency free.
package main

import (
	"encoding/json"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

var PRESETS = []string{
	"timer", "ask", "choose", "pick", "slide", "form",
	"list", "table", "card", "image", "camera", "mic",
	"gallery", "video", "compare", "storyboard",
	"chart", "stat", "math", "step", "calc",
	"deck", "page", "plan", "project", "narrate",
	"timeline", "done", "now", "next",
	"sketch", "row", "after",
	"shapes", "shape",
	"game", "flow",
	"query",
}

var GROUPS = map[string][]string{
	"deck":     {"page", "ask", "choose", "pick", "sketch"},
	"plan":     {"page", "ask", "choose", "pick", "slide", "form", "mic", "camera", "sketch"},
	"narrate":  {"page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"},
	"timeline": {"done", "now", "next"},
	"sketch":   {"row", "after"},
	"shapes":   {"shape"},
}

var ROWS = []string{"done", "now", "next"}

func markAt(rows []string) int {
	for i, r := range rows {
		if r != "done" {
			return i
		}
	}
	return len(rows)
}

var identPattern = regexp.MustCompile(`^[a-zA-Z_][\w-]*$`)
var numPattern = regexp.MustCompile(`^-?\d+(\.\d+)?$`)

// ---------- tokenizer ----------

type Token struct {
	Raw     string
	Text    string
	Quoted  bool
	Parts   []string // nil when there is no "|"
	HasKey  bool
	Key     string
	Value   interface{} // string, or []string when it has "|"
	VQuoted []bool
}

func isSpace(r rune) bool {
	return r == ' ' || r == '\t' || r == '\n' || r == '\r' || r == '\v' || r == '\f'
}

func tokenize(line string) []Token {
	rs := []rune(line)
	var tokens []Token
	i := 0
	n := len(rs)

	for i < n {
		for i < n && isSpace(rs[i]) {
			i++
		}
		if i >= n {
			break
		}
		if rs[i] == '#' && (i+1 >= n || isSpace(rs[i+1])) {
			break
		}
		start := i
		segs := []string{""}
		segQ := []bool{false}
		anyQuote := false
		wholeQuoted := rs[i] == '"'
		for i < n && !isSpace(rs[i]) {
			c := rs[i]
			if c == '"' {
				anyQuote = true
				segQ[len(segQ)-1] = true
				i++
				for i < n && rs[i] != '"' {
					if rs[i] == '\\' && i+1 < n {
						segs[len(segs)-1] += string(rs[i+1])
						i += 2
						continue
					}
					segs[len(segs)-1] += string(rs[i])
					i++
				}
				i++ // closing quote (or EOL for unterminated)
				if i < n && !isSpace(rs[i]) {
					wholeQuoted = false
				}
				continue
			}
			if c == '|' {
				segs = append(segs, "")
				segQ = append(segQ, false)
				wholeQuoted = false
				i++
				continue
			}
			if c == '=' && !anyQuote && len(segs) == 1 && identPattern.MatchString(segs[0]) {
				// mark eq below via separate loop; handled after building raw
			}
			segs[len(segs)-1] += string(c)
			i++
		}
		raw := string(rs[start:i])
		text := strings.Join(segs, "|")
		t := Token{
			Raw:    raw,
			Text:   text,
			Quoted: wholeQuoted && len(segs) == 1,
		}
		if len(segs) > 1 {
			t.Parts = segs
		}
		// Detect key=value: "=" outside quotes, in the first segment, where the
		// part before "=" is an identifier. Re-scan seg[0] for the first bare '='.
		if !anyQuote || true {
			eqAt := findBareEquals(segs[0])
			if eqAt >= 0 && identPattern.MatchString(segs[0][:eqAt]) {
				t.HasKey = true
				t.Key = segs[0][:eqAt]
				first := segs[0][eqAt+1:]
				if len(segs) > 1 {
					vparts := append([]string{first}, segs[1:]...)
					t.Value = vparts
				} else {
					t.Value = first
				}
				t.VQuoted = segQ
				t.Parts = nil
			}
		}
		tokens = append(tokens, t)
	}
	return tokens
}

// findBareEquals finds the index of the first "=" in s. Since quoted content
// never contains a literal "=" split marker in our segment model (quotes are
// consumed whole into the segment text), any "=" in seg[0] before any "|" is
// a candidate; JS only takes the first "=" reached with no quote seen yet in
// that segment, and only when the whole prefix is an identifier.
func findBareEquals(s string) int {
	return strings.IndexByte(s, '=')
}

// ---------- value helpers ----------

func coerce(v string) interface{} {
	if numPattern.MatchString(v) {
		f, _ := strconv.ParseFloat(v, 64)
		return f
	}
	if v == "on" || v == "true" {
		return true
	}
	if v == "off" || v == "false" {
		return false
	}
	return v
}

var secondsRe = regexp.MustCompile(`^(\d+)(?::(\d{1,2}))?(\.\d+)?([smh]?)$`)

func seconds(s string) (float64, bool) {
	m := secondsRe.FindStringSubmatch(s)
	if m == nil {
		return 0, false
	}
	if m[2] != "" {
		m1, _ := strconv.ParseFloat(m[1], 64)
		m2, _ := strconv.ParseFloat(m[2], 64)
		return m1*60 + m2, true
	}
	v, _ := strconv.ParseFloat(m[1]+m[3], 64)
	switch m[4] {
	case "m":
		return v * 60, true
	case "h":
		return v * 3600, true
	default:
		return v, true
	}
}

// TEXT_KEYS: values never typed.
var textKeys = map[string]bool{"answer": true}

var flagRe = regexp.MustCompile(`^\+[a-zA-Z][\w-]*$`)

func split(tokens []Token) (map[string]interface{}, map[string]bool, []Token) {
	kv := map[string]interface{}{}
	flags := map[string]bool{}
	var pos []Token
	for _, t := range tokens {
		if t.HasKey {
			if textKeys[t.Key] {
				if arr, ok := t.Value.([]string); ok {
					vals := make([]interface{}, len(arr))
					for i, v := range arr {
						vals[i] = v
					}
					kv[t.Key] = vals
				} else {
					kv[t.Key] = t.Value
				}
			} else {
				kv[t.Key] = coerceKeyed(t)
			}
		} else if !t.Quoted && t.Parts == nil && flagRe.MatchString(t.Raw) {
			flags[t.Raw[1:]] = true
		} else {
			pos = append(pos, t)
		}
	}
	return kv, flags, pos
}

func coerceKeyed(t Token) interface{} {
	if arr, ok := t.Value.([]string); ok {
		out := make([]interface{}, len(arr))
		for i, v := range arr {
			if i < len(t.VQuoted) && t.VQuoted[i] {
				out[i] = v
			} else {
				out[i] = coerce(v)
			}
		}
		return out
	}
	str, _ := t.Value.(string)
	if len(t.VQuoted) > 0 && t.VQuoted[0] {
		return str
	}
	return coerce(str)
}

func joinText(toks []Token) string {
	parts := make([]string, len(toks))
	for i, t := range toks {
		parts[i] = t.Text
	}
	return strings.Join(parts, " ")
}

var urlRe = regexp.MustCompile(`^(https?://|/|data:)`)

func isURL(s string) bool { return urlRe.MatchString(s) }

type mediaItem struct {
	src     string
	caption string
}

func mediaToken(t Token) *mediaItem {
	segs := t.Parts
	if segs == nil {
		segs = []string{t.Text}
	}
	if !isURL(segs[0]) {
		return nil
	}
	i := strings.IndexByte(segs[0], '|')
	if i > 0 {
		return &mediaItem{src: segs[0][:i], caption: segs[0][i+1:]}
	}
	cap := ""
	if len(segs) > 1 {
		cap = strings.Join(segs[1:], "|")
	}
	return &mediaItem{src: segs[0], caption: cap}
}

func mediaSet(pos []Token, itemsKey, capsKey string) map[string]interface{} {
	o := map[string]interface{}{}
	var items []interface{}
	var caps []interface{}
	var title []Token
	anyCap := false
	for _, t := range pos {
		if m := mediaToken(t); m != nil {
			items = append(items, m.src)
			caps = append(caps, m.caption)
			if m.caption != "" {
				anyCap = true
			}
		} else {
			title = append(title, t)
		}
	}
	if len(title) > 0 {
		o["title"] = joinText(title)
	}
	if len(items) > 0 {
		o[itemsKey] = items
	}
	if anyCap {
		o[capsKey] = caps
	}
	return o
}

func clean(o map[string]interface{}) map[string]interface{} {
	for k, v := range o {
		if v == nil {
			delete(o, k)
			continue
		}
		if arr, ok := v.([]interface{}); ok && len(arr) == 0 {
			delete(o, k)
		}
	}
	return o
}

// ---------- presets ----------

var timespecRe = regexp.MustCompile(`^(\d+(?::\d{1,2})?(?:\.\d+)?[smh]?)(?:/(\d+(?::\d{1,2})?(?:\.\d+)?[smh]?))?(?:x(\d+))?$`)

func pTimer(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var rest []Token
	haveWork := false
	for _, t := range pos {
		if !haveWork && !t.Quoted {
			if m := timespecRe.FindStringSubmatch(t.Text); m != nil {
				if w, ok := seconds(m[1]); ok {
					o["work"] = w
					haveWork = true
					if m[2] != "" {
						if r, ok := seconds(m[2]); ok {
							o["rest"] = r
						}
					}
					if m[3] != "" {
						n, _ := strconv.ParseFloat(m[3], 64)
						o["rounds"] = n
					}
					continue
				}
			}
		}
		rest = append(rest, t)
	}
	if len(rest) > 0 {
		o["label"] = joinText(rest)
	}
	return o
}

func pAsk(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var q []Token
	for _, t := range pos {
		if o["options"] == nil && t.Parts != nil {
			opts := make([]interface{}, len(t.Parts))
			for i, s := range t.Parts {
				opts[i] = s
			}
			o["options"] = opts
		} else {
			q = append(q, t)
		}
	}
	if o["options"] == nil {
		k := len(q)
		for k > 1 && q[k-1].Quoted {
			k--
		}
		if len(q)-k >= 2 {
			var opts []interface{}
			for _, t := range q[k:] {
				opts = append(opts, t.Text)
			}
			o["options"] = opts
			q = q[:k]
		}
	}
	if len(q) > 0 {
		o["q"] = joinText(q)
	}
	return o
}

var rangeRe = regexp.MustCompile(`^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$`)

func pSlide(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var label []Token
	haveMin := false
	haveLo := false
	for _, t := range pos {
		if !haveMin && !t.Quoted {
			if m := rangeRe.FindStringSubmatch(t.Text); m != nil {
				minv, _ := strconv.ParseFloat(m[1], 64)
				maxv, _ := strconv.ParseFloat(m[2], 64)
				o["min"] = minv
				o["max"] = maxv
				haveMin = true
				continue
			}
		}
		if !haveLo && t.Parts != nil && len(t.Parts) == 2 {
			o["lo"] = t.Parts[0]
			o["hi"] = t.Parts[1]
			haveLo = true
			continue
		}
		label = append(label, t)
	}
	if len(label) > 0 {
		o["label"] = joinText(label)
	}
	return o
}

var fieldRe = regexp.MustCompile(`^(?:"((?:[^"\\]|\\.)*)"|([a-zA-Z_][\w-]*))(?::(.+?))?(!)?$`)
var escRe = regexp.MustCompile(`\\(.)`)

func slugify(s string) string {
	s = strings.ToLower(s)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "_")
	return strings.Trim(s, "_")
}

func field(t Token) map[string]interface{} {
	if t.Quoted {
		return nil
	}
	m := fieldRe.FindStringSubmatch(t.Raw)
	if m == nil {
		return nil
	}
	var label string
	hasLabel := m[1] != ""
	if hasLabel {
		label = escRe.ReplaceAllString(m[1], "$1")
	} else if strings.HasPrefix(t.Raw, `""`) {
		hasLabel = true
		label = ""
	}
	key := m[2]
	if key == "" && hasLabel {
		key = slugify(label)
	}
	typ := m[3]
	if typ == "" && hasLabel && m[4] == "" && !strings.Contains(t.Raw, ":") {
		return nil // "Title" without a type
	}
	f := map[string]interface{}{"key": key}
	if hasLabel {
		f["label"] = label
	}
	if typ != "" {
		if r := rangeRe.FindStringSubmatch(typ); r != nil {
			f["type"] = "range"
			minv, _ := strconv.ParseFloat(r[1], 64)
			maxv, _ := strconv.ParseFloat(r[2], 64)
			f["min"] = minv
			f["max"] = maxv
		} else if strings.Contains(typ, "|") {
			f["type"] = "choice"
			parts := strings.Split(typ, "|")
			opts := make([]interface{}, len(parts))
			for i, p := range parts {
				opts[i] = strings.Trim(p, `"`)
			}
			f["options"] = opts
		} else {
			f["type"] = typ
		}
	}
	if m[4] == "!" {
		f["required"] = true
	}
	return f
}

func pForm(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var fields []interface{}
	var title []Token
	for _, t := range pos {
		if f := field(t); f != nil {
			fields = append(fields, f)
		} else {
			title = append(title, t)
		}
	}
	o["fields"] = fields
	if len(title) > 0 {
		o["title"] = joinText(title)
	}
	return o
}

func pList(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var items []interface{}
	titleSet := false
	for _, t := range pos {
		if !titleSet && len(items) == 0 && !t.Quoted && t.Parts == nil {
			o["title"] = t.Text
			titleSet = true
			continue
		}
		if t.Parts != nil {
			for _, p := range t.Parts {
				items = append(items, p)
			}
		} else {
			items = append(items, t.Text)
		}
	}
	o["items"] = items
	return o
}

func pTable(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var rows []interface{}
	nameSet := false
	var cols []interface{}
	for _, t := range pos {
		if !nameSet && cols == nil && t.Parts == nil && !t.Quoted {
			o["name"] = t.Text
			nameSet = true
			continue
		}
		var cells []string
		if t.Parts != nil {
			cells = t.Parts
		} else if strings.Contains(t.Text, "|") {
			cells = strings.Split(t.Text, "|")
		} else {
			cells = []string{t.Text}
		}
		if cols == nil {
			cols = make([]interface{}, len(cells))
			for i, c := range cells {
				cols[i] = c
			}
		} else {
			row := make([]interface{}, len(cells))
			for i, c := range cells {
				row[i] = coerce(c)
			}
			rows = append(rows, row)
		}
	}
	if cols != nil {
		o["cols"] = cols
	}
	o["rows"] = rows
	return o
}

func pCard(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	if len(pos) > 0 {
		o["title"] = pos[0].Text
	}
	if len(pos) > 1 {
		o["body"] = joinText(pos[1:])
	}
	return o
}

func pImage(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var cap []Token
	srcSet := false
	for _, t := range pos {
		if !srcSet && isURL(t.Text) {
			o["src"] = t.Text
			srcSet = true
		} else {
			cap = append(cap, t)
		}
	}
	if len(cap) > 0 {
		if srcSet {
			o["caption"] = joinText(cap)
		} else {
			o["prompt"] = joinText(cap)
		}
	}
	return o
}

func pCamera(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var q []Token
	for _, t := range pos {
		if !t.Quoted && (t.Text == "front" || t.Text == "back") {
			o["facing"] = t.Text
		} else {
			q = append(q, t)
		}
	}
	if len(q) > 0 {
		o["prompt"] = joinText(q)
	}
	return o
}

func pMic(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	if len(pos) > 0 {
		o["prompt"] = joinText(pos)
	}
	return o
}

func pSay(pos []Token) map[string]interface{} {
	return map[string]interface{}{"text": joinText(pos)}
}

var chartTypes = []string{"line", "bar", "area", "scatter", "pie", "donut"}
var queryViews = []string{"table", "list", "chart", "stat", "send"}

func contains(arr []string, s string) bool {
	for _, v := range arr {
		if v == s {
			return true
		}
	}
	return false
}

func bareToken(t *Token) bool {
	return t != nil && !t.Quoted && t.Parts == nil
}

func pQuery(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var rest []Token
	tableSet := false
	for i := 0; i < len(pos); i++ {
		t := pos[i]
		if !tableSet && bareToken(&t) {
			o["table"] = t.Text
			tableSet = true
			continue
		}
		var next *Token
		if i+1 < len(pos) {
			next = &pos[i+1]
		}
		if bareToken(&t) && t.Text == "as" && bareToken(next) && contains(queryViews, next.Text) {
			o["as"] = next.Text
			i++
			if next.Text == "chart" {
				var next2 *Token
				if i+1 < len(pos) {
					next2 = &pos[i+1]
				}
				if bareToken(next2) && contains(chartTypes, next2.Text) {
					o["type"] = next2.Text
					i++
				}
			}
			continue
		}
		rest = append(rest, t)
	}
	if len(rest) > 0 {
		o["title"] = joinText(rest)
	}
	return o
}

func pTheme(pos []Token) map[string]interface{} {
	if len(pos) > 0 {
		return map[string]interface{}{"name": joinText(pos)}
	}
	return map[string]interface{}{}
}

func pGallery(pos []Token) map[string]interface{} { return mediaSet(pos, "items", "caps") }
func pVideo(pos []Token) map[string]interface{}   { return pImage(pos) }

func pCompare(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var title []Token
	beforeSet, afterSet := false, false
	for _, t := range pos {
		if !afterSet && t.Parts == nil && isURL(t.Text) {
			if !beforeSet {
				o["before"] = t.Text
				beforeSet = true
			} else {
				o["after"] = t.Text
				afterSet = true
			}
		} else {
			title = append(title, t)
		}
	}
	if len(title) > 0 {
		o["title"] = joinText(title)
	}
	return o
}

func pStoryboard(pos []Token) map[string]interface{} { return mediaSet(pos, "frames", "notes") }

func pChart(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var title []Token
	typeSet := false
	for _, t := range pos {
		if !typeSet && !t.Quoted && t.Parts == nil && contains(chartTypes, t.Text) {
			o["type"] = t.Text
			typeSet = true
		} else {
			title = append(title, t)
		}
	}
	if len(title) > 0 {
		o["title"] = joinText(title)
	}
	return o
}

var qtyRe = regexp.MustCompile(`^([$€£¥])?(-?\d+(?:\.\d+)?(?:[eE]-?\d+)?)\s*([^\d\s.,+\-|=][^\s]*)?$`)

type qtyResult struct {
	value float64
	unit  string
}

func quantity(s string) *qtyResult {
	m := qtyRe.FindStringSubmatch(s)
	if m == nil {
		return nil
	}
	if m[1] != "" && m[3] != "" {
		return nil
	}
	v, _ := strconv.ParseFloat(m[2], 64)
	q := &qtyResult{value: v}
	if m[1] != "" {
		q.unit = m[1]
	} else if m[3] != "" {
		q.unit = m[3]
	}
	return q
}

func pStat(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var label []Token
	valueSet := false
	for _, t := range pos {
		if !valueSet && !t.Quoted && t.Parts == nil {
			if q := quantity(t.Text); q != nil {
				o["value"] = q.value
				if q.unit != "" {
					o["unit"] = q.unit
				}
				valueSet = true
				continue
			}
		}
		label = append(label, t)
	}
	if !valueSet && len(label) > 0 {
		o["value"] = label[0].Text
		label = label[1:]
	}
	if len(label) > 0 {
		o["label"] = joinText(label)
	}
	return o
}

func pStep(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var text []Token
	imgSet := false
	for _, t := range pos {
		if !imgSet && t.Parts == nil && isURL(t.Text) {
			o["img"] = t.Text
			imgSet = true
		} else {
			text = append(text, t)
		}
	}
	if len(text) > 0 {
		o["text"] = joinText(text)
	}
	return o
}

func pCalc(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	if len(pos) > 0 {
		o["title"] = joinText(pos)
	}
	return o
}

func pPage(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var text []Token
	imgSet := false
	for _, t := range pos {
		if !imgSet && t.Parts == nil && isURL(t.Text) {
			o["img"] = t.Text
			imgSet = true
		} else {
			text = append(text, t)
		}
	}
	if len(text) > 0 {
		o["title"] = text[0].Text
	}
	if len(text) > 1 {
		o["body"] = joinText(text[1:])
	}
	return o
}

var httpsRe = regexp.MustCompile(`^https://`)

func pDone(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var text []Token
	urlSet := false
	for _, t := range pos {
		if !urlSet && t.Parts == nil && !t.Quoted && httpsRe.MatchString(t.Text) {
			o["url"] = t.Text
			urlSet = true
		} else {
			text = append(text, t)
		}
	}
	if len(text) > 0 {
		o["text"] = joinText(text)
	}
	return o
}

func pRow(pos []Token) map[string]interface{} {
	if len(pos) > 0 {
		return map[string]interface{}{"text": joinText(pos)}
	}
	return map[string]interface{}{}
}

func pAfter(pos []Token) map[string]interface{} {
	if len(pos) > 0 {
		return map[string]interface{}{"label": joinText(pos)}
	}
	return map[string]interface{}{}
}

var gameWordRe = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_-]*$`)

func pShape(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var text []Token
	kindSet := false
	for _, t := range pos {
		if !kindSet && t.Parts == nil && !t.Quoted && gameWordRe.MatchString(t.Text) {
			o["kind"] = t.Text
			kindSet = true
		} else {
			text = append(text, t)
		}
	}
	if len(text) > 0 {
		o["label"] = joinText(text)
	}
	return o
}

func pGame(pos []Token) map[string]interface{} {
	o := map[string]interface{}{}
	var text []Token
	kindSet := false
	for _, t := range pos {
		if !kindSet && t.Parts == nil && !t.Quoted && gameWordRe.MatchString(t.Text) {
			o["kind"] = t.Text
			kindSet = true
		} else {
			text = append(text, t)
		}
	}
	if len(text) > 0 {
		o["title"] = joinText(text)
	}
	return o
}

func presetArgFn(preset string) func([]Token) map[string]interface{} {
	switch preset {
	case "timer":
		return pTimer
	case "ask", "choose", "pick":
		return pAsk
	case "slide":
		return pSlide
	case "form":
		return pForm
	case "list":
		return pList
	case "table":
		return pTable
	case "card", "project":
		return pCard
	case "image":
		return pImage
	case "camera":
		return pCamera
	case "mic":
		return pMic
	case "say":
		return pSay
	case "query":
		return pQuery
	case "theme":
		return pTheme
	case "gallery":
		return pGallery
	case "video":
		return pVideo
	case "compare":
		return pCompare
	case "storyboard":
		return pStoryboard
	case "chart":
		return pChart
	case "stat":
		return pStat
	case "step":
		return pStep
	case "calc", "deck", "plan", "flow", "narrate", "timeline", "shapes":
		return pCalc
	case "page":
		return pPage
	case "done", "now", "next":
		return pDone
	case "sketch":
		return pCalc
	case "row":
		return pRow
	case "after":
		return pAfter
	case "shape":
		return pShape
	case "game":
		return pGame
	}
	return nil
}

// ---------- normalize ----------

var listProps = map[string][]string{
	"gallery":    {"items", "caps"},
	"storyboard": {"frames", "notes"},
	"compare":    {"notes", "labels"},
	"chart":      {"names", "color"},
	"table":      {"units"},
	"query":      {"where", "sort", "cols", "y", "sum", "avg", "min", "max", "names", "color"},
	"page":       {"points"},
	"project":    {"facts", "next"},
	"pick":       {"answer"},
	"game":       {"items"},
	"shape":      {"pts"},
}

func asList(v interface{}) []interface{} {
	switch x := v.(type) {
	case []string:
		out := make([]interface{}, len(x))
		for i, e := range x {
			out[i] = e
		}
		return out
	case []interface{}:
		out := make([]interface{}, len(x))
		for i, e := range x {
			if s, ok := e.(string); ok {
				out[i] = s
			} else {
				out[i] = toStr(e)
			}
		}
		return out
	case string:
		parts := strings.Split(x, "|")
		out := make([]interface{}, len(parts))
		for i, p := range parts {
			out[i] = p
		}
		return out
	default:
		return []interface{}{toStr(v)}
	}
}

func toStr(v interface{}) string {
	switch x := v.(type) {
	case string:
		return x
	case bool:
		if x {
			return "true"
		}
		return "false"
	case float64:
		return strconv.FormatFloat(x, 'g', -1, 64)
	default:
		b, _ := json.Marshal(v)
		return string(b)
	}
}

var pmRe = regexp.MustCompile(`^(-?\d+(?:\.\d+)?)(?:±|\+-)(\d+(?:\.\d+)?)$`)

func chartSeries(o map[string]interface{}) {
	if x, ok := o["x"]; ok {
		if _, isArr := x.([]interface{}); !isArr {
			o["x"] = []interface{}{x}
		}
	}
	yRe := regexp.MustCompile(`^(y|err)(\d*)$`)
	keys := make([]string, 0, len(o))
	for k := range o {
		keys = append(keys, k)
	}
	for _, k := range keys {
		m := yRe.FindStringSubmatch(k)
		if m == nil {
			continue
		}
		var list []interface{}
		if arr, ok := o[k].([]interface{}); ok {
			list = arr
		} else {
			list = []interface{}{o[k]}
		}
		if m[1] == "err" {
			o[k] = list
			continue
		}
		var errs []interface{}
		anyErr := false
		newList := make([]interface{}, len(list))
		for i, v := range list {
			if s, ok := v.(string); ok {
				if pm := pmRe.FindStringSubmatch(s); pm != nil {
					e, _ := strconv.ParseFloat(pm[2], 64)
					errs = append(errs, e)
					if e != 0 {
						anyErr = true
					}
					nv, _ := strconv.ParseFloat(pm[1], 64)
					newList[i] = nv
					continue
				}
			}
			errs = append(errs, float64(0))
			newList[i] = v
		}
		o[k] = newList
		ek := "err" + m[2]
		if anyErr {
			if _, exists := o[ek]; !exists {
				o[ek] = errs
			}
		}
	}
}

func boxes(v interface{}) []interface{} {
	var raw []string
	switch x := v.(type) {
	case []interface{}:
		for _, e := range x {
			raw = append(raw, toStr(e))
		}
	default:
		raw = strings.Split(toStr(v), "|")
	}
	var out []interface{}
	for _, b := range raw {
		parts := strings.Split(b, ",")
		if len(parts) != 4 {
			continue
		}
		ok := true
		nums := make([]interface{}, 4)
		for i, p := range parts {
			p = strings.TrimSpace(p)
			if !numPattern.MatchString(p) {
				ok = false
				break
			}
			f, _ := strconv.ParseFloat(p, 64)
			nums[i] = f
		}
		if ok {
			out = append(out, nums)
		}
	}
	return out
}

func cellList(v interface{}) []interface{} {
	var raw []interface{}
	if arr, ok := v.([]interface{}); ok {
		raw = arr
	} else {
		raw = []interface{}{v}
	}
	var out []interface{}
	for _, c := range raw {
		switch x := c.(type) {
		case float64:
			out = append(out, x)
		case string:
			if numPattern.MatchString(x) {
				f, _ := strconv.ParseFloat(x, 64)
				out = append(out, f)
			}
		}
	}
	return out
}

var calcPropsSet = map[string]bool{"title": true, "f": true, "plot": true, "unit": true, "digits": true}
var varRangeRe = regexp.MustCompile(`^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)(?:@(-?\d+(?:\.\d+)?))?\s*([^\d\s][^\s]*)?$`)

func calcVar(v interface{}) map[string]interface{} {
	if f, ok := v.(float64); ok {
		return map[string]interface{}{"value": f}
	}
	s, ok := v.(string)
	if !ok {
		return nil
	}
	s = strings.TrimSpace(s)
	if r := varRangeRe.FindStringSubmatch(s); r != nil {
		minv, _ := strconv.ParseFloat(r[1], 64)
		maxv, _ := strconv.ParseFloat(r[2], 64)
		o := map[string]interface{}{"min": minv, "max": maxv}
		if r[3] != "" {
			val, _ := strconv.ParseFloat(r[3], 64)
			o["value"] = val
		} else {
			o["value"] = (minv + maxv) / 2
		}
		if r[4] != "" {
			o["unit"] = r[4]
		}
		return o
	}
	if q := quantity(s); q != nil {
		o := map[string]interface{}{"value": q.value}
		if q.unit != "" {
			o["unit"] = q.unit
		}
		return o
	}
	return nil
}

func normalizeOp(preset string, o map[string]interface{}) map[string]interface{} {
	for _, k := range listProps[preset] {
		if v, ok := o[k]; ok && v != true {
			o[k] = asList(v)
		}
	}
	if preset == "compare" {
		if v, ok := o["hl"]; ok {
			o["hl"] = boxes(v)
		}
	}
	if preset == "game" {
		for _, k := range []string{"x", "o"} {
			if v, ok := o[k]; ok {
				o[k] = cellList(v)
			}
		}
	}
	if preset == "chart" {
		chartSeries(o)
	}
	if preset == "stat" {
		if v, ok := o["spark"]; ok {
			if _, isArr := v.([]interface{}); !isArr {
				o["spark"] = []interface{}{v}
			}
		}
	}
	if preset == "step" {
		if v, ok := o["time"]; ok {
			if s, ok := v.(string); ok {
				if sec, ok := seconds(s); ok {
					o["time"] = sec
				}
			}
		}
	}
	if preset == "calc" {
		for k, v := range o {
			if calcPropsSet[k] {
				continue
			}
			if cv := calcVar(v); cv != nil {
				o[k] = cv
			}
		}
	}
	return o
}

// ---------- math/step raw args ----------

var mathPropRe = regexp.MustCompile(`^(caption|size)=("(?:[^"\\]|\\.)*"|\S*)(?:\s+|$)`)

func mathArgs(rest string) map[string]interface{} {
	o := map[string]interface{}{}
	r := strings.TrimSpace(rest)
	for {
		m := mathPropRe.FindStringSubmatch(r)
		if m == nil {
			break
		}
		val := m[2]
		if strings.HasPrefix(val, `"`) {
			val = escRe.ReplaceAllString(strings.Trim(val, `"`), "$1")
		}
		o[m[1]] = val
		r = r[len(m[0]):]
	}
	r = strings.TrimSpace(r)
	if len(r) >= 2 && strings.HasPrefix(r, `"`) && strings.HasSuffix(r, `"`) {
		r = r[1 : len(r)-1]
	}
	if r != "" {
		o["tex"] = r
	}
	return o
}

var dollarRe = regexp.MustCompile(`(^|\s)\$(\s|$)`)

func stepArgs(p *Parser, rest string) map[string]interface{} {
	loc := dollarRe.FindStringIndex(rest)
	head := rest
	if loc != nil {
		head = rest[:loc[0]]
	}
	o := p.parseArgs("step", tokenize(head))
	if loc != nil {
		tex := strings.TrimSpace(rest[loc[1]:])
		if tex != "" {
			o["tex"] = tex
		}
	}
	return o
}

var rawPresets = map[string]bool{"math": true, "step": true}

// ---------- Parser ----------

type groupEntry struct {
	id     string
	preset string
	screen string
}

type Parser struct {
	screen string
	ids    map[string]string
	auto   int
	open   []groupEntry
}

func NewParser(known map[string]string) *Parser {
	ids := map[string]string{}
	for k, v := range known {
		ids[k] = v
	}
	return &Parser{screen: "1", ids: ids}
}

func (p *Parser) parseArgs(preset string, tokens []Token) map[string]interface{} {
	kv, flags, pos := split(tokens)
	var base map[string]interface{}
	if fn := presetArgFn(preset); fn != nil {
		base = fn(pos)
	} else {
		base = map[string]interface{}{}
	}
	merged := map[string]interface{}{}
	for k, v := range base {
		merged[k] = v
	}
	for k := range flags {
		merged[k] = true
	}
	for k, v := range kv {
		merged[k] = v
	}
	return clean(normalizeOp(preset, merged))
}

func (p *Parser) rawArgs(preset, rest string) map[string]interface{} {
	if preset == "math" {
		return mathArgs(rest)
	}
	return stepArgs(p, rest)
}

// group(): bookkeeping for one parsed op.
func (p *Parser) group(op Operation) Operation {
	if op == nil {
		return op
	}
	opv, _ := op["op"].(string)
	if opv == "error" || opv == "theme" || opv == "menu" || opv == "table" || opv == "put" {
		return op
	}
	if opv == "close" {
		p.open = nil
		return op
	}
	if opv == "end" {
		if len(p.open) == 0 {
			return Operation{"op": "error", "screen": op["screen"], "message": "end: no open deck, plan, narrate, timeline or sketch", "line": op["line"]}
		}
		g := p.open[len(p.open)-1]
		p.open = p.open[:len(p.open)-1]
		op["target"] = g.id
		return op
	}
	joins := func(g groupEntry) bool {
		if opv != "add" {
			return false
		}
		if op["screen"] != g.screen {
			return false
		}
		preset, _ := op["preset"].(string)
		return contains(GROUPS[g.preset], preset)
	}
	for len(p.open) > 0 && !joins(p.open[len(p.open)-1]) {
		p.open = p.open[:len(p.open)-1]
	}
	var out Operation
	if len(p.open) > 0 {
		g := p.open[len(p.open)-1]
		out = Operation{"op": op["op"], "screen": op["screen"], "preset": op["preset"], "id": op["id"], "in": g.id, "props": op["props"], "line": op["line"]}
	} else {
		out = op
	}
	if opv == "add" {
		if preset, _ := op["preset"].(string); preset != "" {
			if _, isGroup := GROUPS[preset]; isGroup {
				scr, _ := op["screen"].(string)
				idv, _ := op["id"].(string)
				p.open = append(p.open, groupEntry{id: idv, preset: preset, screen: scr})
			}
		}
	}
	return out
}

func (p *Parser) line(src string) Operation {
	return p.group(p.parseLine(src))
}

var blankOrCommentRe = regexp.MustCompile(`^#(\s|$)`)
var routeRe = regexp.MustCompile(`^>([\w-]+)(?:\s+|$)`)
var customRe = regexp.MustCompile(`^custom(?:@([\w-]+))?\s+(.*)$`)
var patchIdRe = regexp.MustCompile(`^([a-zA-Z]+)@([\w-]+)$`)
var headRe = regexp.MustCompile(`^([a-zA-Z]+)(?:@([\w-]+))?$`)

func (p *Parser) parseLine(src string) Operation {
	line := strings.TrimRight(src, "\r")
	body := strings.TrimSpace(line)
	if body == "" || blankOrCommentRe.MatchString(body) {
		return nil
	}

	screen := p.screen
	if m := routeRe.FindStringSubmatch(body); m != nil {
		if m[1] == "chat" {
			screen = "1"
		} else {
			screen = m[1]
		}
		body = strings.TrimLeft(body[len(m[0]):], " \t")
		if body == "" || blankOrCommentRe.MatchString(body) {
			p.screen = screen
			if m[1] == "chat" {
				return Operation{"op": "close", "screen": "full", "line": line}
			}
			return Operation{"op": "focus", "screen": screen, "line": line}
		}
	}

	if m := customRe.FindStringSubmatch(body); m != nil {
		var spec interface{}
		if err := json.Unmarshal([]byte(m[2]), &spec); err != nil {
			return Operation{"op": "error", "screen": screen, "message": "custom: bad JSON (" + err.Error() + ")", "line": line}
		}
		id := m[1]
		if id == "" {
			p.auto++
			id = "c" + strconv.Itoa(p.auto)
		}
		p.ids[id] = "custom"
		return Operation{"op": "add", "screen": screen, "preset": "custom", "id": id, "props": map[string]interface{}{"spec": spec}, "line": line}
	}

	tokens := tokenize(body)
	if len(tokens) == 0 {
		return nil
	}
	head := tokens[0].Raw
	tokens = tokens[1:]

	if strings.HasPrefix(head, "~") {
		target := head[1:]
		if pm := patchIdRe.FindStringSubmatch(target); pm != nil {
			if !contains(PRESETS, pm[1]) && pm[1] != "say" && pm[1] != "custom" {
				return Operation{"op": "error", "screen": screen, "message": `patch: unknown preset "` + pm[1] + `"`, "line": line}
			}
			known, hasKnown := p.ids[pm[2]]
			if hasKnown && known != pm[1] {
				return Operation{"op": "error", "screen": screen, "message": `patch: "` + pm[2] + `" is a ` + known + `, not a ` + pm[1], "line": line}
			}
			if hasKnown {
				target = pm[2]
			} else {
				target = pm[1]
			}
		}
		var preset string
		if contains(PRESETS, target) || target == "say" {
			preset = target
		} else {
			preset = p.ids[target]
		}
		if preset == "" {
			return Operation{"op": "error", "screen": screen, "message": `patch: nothing called "` + target + `"`, "line": line}
		}
		if preset == "custom" {
			return Operation{"op": "error", "screen": screen, "message": "patch: custom blocks are replaced, not patched", "line": line}
		}
		var props map[string]interface{}
		if rawPresets[preset] {
			props = p.rawArgs(preset, body[len(head):])
		} else {
			props = p.parseArgs(preset, tokens)
		}
		if contains(ROWS, preset) {
			if kind, ok := props["kind"]; ok {
				kindStr, _ := kind.(string)
				if !contains(ROWS, kindStr) {
					return Operation{"op": "error", "screen": screen, "message": "patch: kind= is done, now or next", "line": line}
				}
				if !contains(ROWS, target) {
					p.ids[target] = kindStr
				}
			}
		}
		return Operation{"op": "patch", "screen": screen, "target": target, "props": props, "line": line}
	}

	if head == "save" || head == "show" || head == "forget" {
		var parts []string
		for _, t := range tokens {
			if t.Text != "" {
				parts = append(parts, t.Text)
			}
		}
		name := strings.Join(parts, " ")
		if name == "" {
			return Operation{"op": "error", "screen": screen, "message": head + ": needs a name", "line": line}
		}
		return Operation{"op": head, "screen": screen, "name": name, "line": line}
	}
	if head == "menu" {
		return p.menuLine(screen, tokens, line)
	}
	if head == "clear" {
		return Operation{"op": "clear", "screen": screen, "line": line}
	}
	if head == "end" {
		return Operation{"op": "end", "screen": screen, "line": line}
	}
	if head == "close" {
		if len(tokens) > 0 {
			return Operation{"op": "error", "screen": screen, "message": "close: takes nothing else", "line": line}
		}
		p.screen = "1"
		return Operation{"op": "close", "screen": "full", "line": line}
	}
	if head == "theme" {
		if len(tokens) > 0 && !tokens[0].HasKey && !tokens[0].Quoted && tokens[0].Parts == nil && tokens[0].Text == "app" {
			return p.appTheme(screen, tokens[1:], line)
		}
		return Operation{"op": "theme", "screen": screen, "props": p.parseArgs("theme", tokens), "line": line}
	}
	if head == "talk" {
		var word string
		ok := true
		if len(tokens) == 0 {
			word = "on"
		} else if len(tokens) == 1 {
			word = tokens[0].Text
		} else {
			ok = false
		}
		if !ok || (word != "on" && word != "off") {
			return Operation{"op": "error", "screen": screen, "message": "talk: takes nothing, on or off", "line": line}
		}
		return Operation{"op": "talk", "screen": screen, "props": map[string]interface{}{"on": word == "on"}, "line": line}
	}
	if head == "put" {
		return p.putLine(screen, tokens, line)
	}
	if m := regexp.MustCompile(`^table(@|$)`).FindStringSubmatch(head); m != nil {
		if len(tokens) > 0 && !tokens[0].Quoted && !tokens[0].HasKey && tokens[0].Raw == "create" {
			if head != "table" {
				return Operation{"op": "error", "screen": screen, "message": "table create: takes no @id", "line": line}
			}
			return p.tableCreate(screen, tokens[1:], line)
		}
	}

	hm := headRe.FindStringSubmatch(head)
	if hm == nil || !(contains(PRESETS, hm[1]) || hm[1] == "say") {
		return Operation{"op": "error", "screen": screen, "message": `unknown preset "` + head + `"`, "line": line}
	}
	preset := hm[1]
	id := hm[2]
	if id == "" {
		p.auto++
		id = "n" + strconv.Itoa(p.auto)
	}
	p.ids[id] = preset
	var props map[string]interface{}
	if rawPresets[preset] {
		props = p.rawArgs(preset, body[len(head):])
	} else {
		props = p.parseArgs(preset, tokens)
	}
	return Operation{"op": "add", "screen": screen, "preset": preset, "id": id, "props": props, "line": line}
}

// ---------- menu ----------

var menuBuckets = []string{"review", "backlog", "shortcut"}
var menuKeys = []string{"sub", "say", "show", "url"}

const menuMax = 20
const menuLabel = 60

func menuID(label string) string {
	s := strings.ToLower(label)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		return "item"
	}
	return s
}

func (p *Parser) menuLine(screen string, tokens []Token, line string) Operation {
	bad := func(msg string) Operation {
		return Operation{"op": "error", "screen": screen, "message": msg, "line": line}
	}
	if len(tokens) == 0 {
		return bad("menu: needs review, backlog, shortcut or done")
	}
	hm := headRe.FindStringSubmatch(tokens[0].Raw)
	if hm == nil || !(contains(menuBuckets, hm[1]) || (hm[1] == "done" && hm[2] == "")) {
		return bad(`menu: "` + tokens[0].Raw + `" is not review, backlog, shortcut or done`)
	}
	rest := tokens[1:]
	if hm[1] == "done" {
		var parts []string
		for _, t := range rest {
			if t.Text != "" {
				parts = append(parts, t.Text)
			}
		}
		name := strings.Join(parts, " ")
		if name == "" {
			return bad("menu done: needs an id")
		}
		id := name
		if !regexp.MustCompile(`^[\w-]+$`).MatchString(name) {
			id = menuID(name)
		}
		return Operation{"op": "menu", "screen": screen, "id": id, "props": map[string]interface{}{"done": true}, "line": line}
	}
	props := map[string]interface{}{"bucket": hm[1]}
	var words []string
	for _, t := range rest {
		if t.HasKey {
			if contains(menuKeys, t.Key) {
				if arr, ok := t.Value.([]string); ok {
					props[t.Key] = strings.Join(arr, "|")
				} else {
					props[t.Key], _ = t.Value.(string)
				}
			}
		} else if !(!t.Quoted && t.Parts == nil && flagRe.MatchString(t.Raw)) {
			words = append(words, t.Text)
		}
	}
	label := strings.TrimSpace(strings.Join(words, " "))
	if label == "" {
		return bad("menu: needs a label")
	}
	id := ""
	if hm[2] != "" {
		id = hm[2]
	} else {
		id = menuID(label)
	}
	out := map[string]interface{}{"bucket": props["bucket"], "label": label}
	for k, v := range props {
		if k != "bucket" {
			out[k] = v
		}
	}
	return Operation{"op": "menu", "screen": screen, "id": id, "props": out, "line": line}
}

func menuOf(ops []Operation) map[string]interface{} {
	buckets := map[string][]map[string]interface{}{"review": {}, "backlog": {}, "shortcut": {}}
	for _, o := range ops {
		if o["op"] != "menu" {
			continue
		}
		id, _ := o["id"].(string)
		for _, b := range menuBuckets {
			var filtered []map[string]interface{}
			for _, it := range buckets[b] {
				if it["id"] != id {
					filtered = append(filtered, it)
				}
			}
			buckets[b] = filtered
		}
		props, _ := o["props"].(map[string]interface{})
		if props["done"] == true {
			continue
		}
		bucket, _ := props["bucket"].(string)
		label, _ := props["label"].(string)
		chars := []rune(label)
		cut := label
		if len(chars) > menuLabel {
			cut = strings.TrimRight(string(chars[:menuLabel-1]), " ") + "…"
		}
		item := map[string]interface{}{"id": id, "label": cut}
		for k, v := range props {
			if k != "bucket" && k != "label" {
				item[k] = v
			}
		}
		items := append([]map[string]interface{}{item}, buckets[bucket]...)
		if len(items) > menuMax {
			items = items[:menuMax]
		}
		buckets[bucket] = items
	}
	out := map[string]interface{}{}
	for _, b := range menuBuckets {
		arr := make([]interface{}, len(buckets[b]))
		for i, it := range buckets[b] {
			arr[i] = it
		}
		out[b] = arr
	}
	return out
}

// ---------- theme app ----------

var hexRe = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

func (p *Parser) appTheme(screen string, tokens []Token, line string) Operation {
	bad := func(msg string) Operation {
		return Operation{"op": "error", "screen": screen, "message": "theme app: " + msg, "line": line}
	}
	props := map[string]interface{}{"scope": "app"}
	var words []string
	styleKeys := []string{"screen", "gallery", "chart", "buttons"}
	appKeys := []string{"accent", "bg", "radius", "font", "weight", "motion"}
	for _, t := range tokens {
		if t.HasKey {
			var v string
			if arr, ok := t.Value.([]string); ok {
				v = strings.Join(arr, "|")
			} else {
				v, _ = t.Value.(string)
			}
			if contains(styleKeys, t.Key) {
				return bad(t.Key + "= is one agent's style, not the app's")
			}
			if !contains(appKeys, t.Key) {
				return bad("unknown key " + t.Key + "=")
			}
			if !appKeyValid(t.Key, v) {
				return bad(t.Key + "=" + v + " is not a value the app takes")
			}
			props[t.Key] = v
		} else if !t.Quoted && t.Parts == nil && flagRe.MatchString(t.Raw) {
			return bad(t.Raw + " is not a flag here; the person always sees a preview first")
		} else {
			words = append(words, t.Text)
		}
	}
	if len(words) > 1 {
		return bad(`one set name, not "` + strings.Join(words, " ") + `"`)
	}
	if len(words) == 1 {
		name := words[0]
		if name == "reset" {
			if len(props) > 1 {
				return bad("reset takes nothing else")
			}
		} else if !contains(setNames, name) {
			return bad("no set named " + name)
		}
		props["name"] = name
	}
	if len(props) == 1 {
		return bad("needs a set name, reset or keys")
	}
	return Operation{"op": "theme", "screen": screen, "props": props, "line": line}
}

var setNames = []string{
	"yui", "candy", "berry", "cherry", "coral", "sunset", "peach", "autumn",
	"honey", "lemon", "lime", "matcha", "forest", "mint", "teal", "sky",
	"ocean", "midnight", "lavender", "grape", "slate", "mono", "wizard",
	"coach", "zen", "studio", "night", "counsel",
}
var paperNames = []string{"cream", "paper", "white", "mist", "sand", "blush"}
var radii = []string{"round", "soft", "square"}
var fonts = []string{"rounded", "default", "serif", "mono"}
var weights = []string{"regular", "bold", "heavy"}
var motions = []string{"bouncy", "calm", "snappy"}

func appKeyValid(key, v string) bool {
	switch key {
	case "accent":
		return hexRe.MatchString(v) || contains(setNames, v)
	case "bg":
		return hexRe.MatchString(v) || contains(paperNames, v)
	case "radius":
		return contains(radii, v)
	case "font":
		return contains(fonts, v)
	case "weight":
		return contains(weights, v)
	case "motion":
		return contains(motions, v)
	}
	return false
}

// ---------- agent tables (parse-level only; no store replay) ----------

var tableNameRe = regexp.MustCompile(`^[a-zA-Z][\w-]*$`)
var colDefRe = regexp.MustCompile(`^([a-zA-Z_][\w-]*):([a-z]+)(?::(\S+))?$`)
var tableTypes = []string{"text", "number", "date", "bool"}

func (p *Parser) tableCreate(screen string, tokens []Token, line string) Operation {
	bad := func(msg string) Operation {
		return Operation{"op": "error", "screen": screen, "message": "table create: " + msg, "line": line}
	}
	if len(tokens) == 0 {
		return bad("needs a name, then col:type ...")
	}
	nameTok := tokens[0]
	rest := tokens[1:]
	if nameTok.Quoted || nameTok.Parts != nil || nameTok.HasKey || !tableNameRe.MatchString(nameTok.Raw) {
		return bad("needs a name, then col:type ...")
	}
	if len(rest) == 0 {
		return bad("needs at least one col:type")
	}
	var cols []interface{}
	for _, t := range rest {
		if t.Quoted || t.HasKey {
			return bad(`"` + t.Raw + `" is not col:type`)
		}
		m := colDefRe.FindStringSubmatch(t.Raw)
		if m == nil {
			return bad(`"` + t.Raw + `" is not col:type`)
		}
		if !contains(tableTypes, m[2]) {
			return bad(`"` + m[2] + `" is not text, number, date or bool`)
		}
		if m[3] != "" && m[2] != "number" {
			return bad(`only number columns take a unit ("` + t.Raw + `")`)
		}
		col := map[string]interface{}{"name": m[1], "type": m[2]}
		if m[3] != "" {
			col["unit"] = m[3]
		}
		cols = append(cols, col)
	}
	return Operation{"op": "table", "screen": screen, "name": nameTok.Raw, "cols": cols, "line": line}
}

func (p *Parser) putLine(screen string, tokens []Token, line string) Operation {
	kv, flags, pos := split(tokens)
	bad := func(msg string) Operation {
		return Operation{"op": "error", "screen": screen, "message": "put: " + msg, "line": line}
	}
	if len(pos) == 0 {
		return bad("needs a table name")
	}
	tableTok := pos[0]
	if tableTok.Quoted || tableTok.Parts != nil || !tableNameRe.MatchString(tableTok.Raw) {
		return bad("needs a table name")
	}
	var keyTok *Token
	if len(pos) > 1 {
		keyTok = &pos[1]
	}
	if len(pos) > 2 {
		return bad("one key, then col=value ...")
	}
	if keyTok != nil && keyTok.Parts != nil {
		return bad("a key has no |")
	}
	del := flags["delete"]
	delete(flags, "delete")
	values := map[string]interface{}{}
	for k := range flags {
		values[k] = true
	}
	for k, v := range kv {
		values[k] = v
	}
	out := Operation{"op": "put", "screen": screen, "table": tableTok.Raw}
	if keyTok != nil {
		out["key"] = keyTok.Text
	}
	if del {
		if keyTok == nil {
			return bad("+delete needs a key")
		}
		if len(values) > 0 {
			return bad("+delete takes no values")
		}
		out["values"] = map[string]interface{}{}
		out["delete"] = true
		out["line"] = line
		return out
	}
	if len(values) == 0 {
		return bad("needs at least one col=value")
	}
	out["values"] = values
	out["line"] = line
	return out
}

// ---------- top level parse ----------

func parse(text string, known map[string]string) []Operation {
	p := NewParser(known)
	var ops []Operation
	for _, l := range strings.Split(text, "\n") {
		if op := p.line(l); op != nil {
			ops = append(ops, op)
		}
	}
	return ops
}

func cleanOp(op Operation) Operation {
	out := Operation{}
	for k, v := range op {
		if k != "line" && k != "message" {
			out[k] = v
		}
	}
	return out
}

// StreamParser: feed chunks, get ops for each completed line.
type StreamParser struct {
	buf string
	p   *Parser
}

func NewStreamParser(known map[string]string) *StreamParser {
	return &StreamParser{p: NewParser(known)}
}

func (s *StreamParser) Push(chunk string) []Operation {
	s.buf += chunk
	var out []Operation
	for {
		idx := strings.IndexByte(s.buf, '\n')
		if idx < 0 {
			break
		}
		lineSrc := s.buf[:idx]
		s.buf = s.buf[idx+1:]
		if op := s.p.line(lineSrc); op != nil {
			out = append(out, op)
		}
	}
	return out
}

func (s *StreamParser) Flush() []Operation {
	rest := s.buf
	s.buf = ""
	var out []Operation
	if strings.TrimSpace(rest) != "" {
		if op := s.p.line(rest); op != nil {
			out = append(out, op)
		}
	}
	return out
}

// ---------- pages / stage ----------

const maxPage = 12

func pageOf(screen string) int {
	n, err := strconv.Atoi(screen)
	if err != nil {
		return 1
	}
	if strconv.Itoa(n) != screen {
		return 1
	}
	if n >= 2 && n <= maxPage {
		return n
	}
	return 1
}

var stagePresets = []string{"timer", "camera", "mic", "deck", "plan", "game", "flow"}

func isWorkout(preset string, props map[string]interface{}) bool {
	if preset != "timer" {
		return false
	}
	if up, ok := props["up"].(bool); ok && up {
		return false
	}
	rounds := 1.0
	if r, ok := props["rounds"].(float64); ok {
		rounds = r
	}
	rest := 0.0
	if r, ok := props["rest"].(float64); ok {
		rest = r
	}
	return rounds > 1 || rest > 0
}

func onStage(op Operation, style map[string]interface{}) bool {
	if op == nil || op["op"] != "add" {
		return false
	}
	scr, _ := op["screen"].(string)
	if scr == "full" {
		return true
	}
	props, _ := op["props"].(map[string]interface{})
	if props == nil {
		props = map[string]interface{}{}
	}
	preset, _ := op["preset"].(string)
	if isWorkout(preset, props) {
		return true
	}
	if pageOf(scr) != 1 {
		return false
	}
	if inline, ok := props["inline"].(bool); ok && inline {
		return false
	}
	if s, ok := style["screen"].(string); ok {
		if s == "chat" {
			return false
		}
		if s == "full" {
			return true
		}
	}
	if contains(stagePresets, preset) {
		return true
	}
	if preset == "gallery" {
		layout, ok := props["layout"].(string)
		if !ok {
			layout, _ = style["gallery"].(string)
		}
		return layout == "row3d"
	}
	return false
}

func talking(ops []Operation) []int {
	on := map[int]bool{}
	for _, o := range ops {
		scr, _ := o["screen"].(string)
		n := pageOf(scr)
		if n == 1 {
			continue
		}
		opv, _ := o["op"].(string)
		if opv == "talk" {
			props, _ := o["props"].(map[string]interface{})
			if on2, ok := props["on"].(bool); ok && on2 {
				on[n] = true
			} else {
				delete(on, n)
			}
		} else if opv == "clear" {
			delete(on, n)
		}
	}
	var out []int
	for k := range on {
		out = append(out, k)
	}
	sort.Ints(out)
	return out
}

// ---------- typed / attach ----------

func typedBody(screen string, words string) string {
	if pageOf(screen) == 1 {
		return words
	}
	return "[yui] screen=" + screen + "\n" + words
}

var readTypedRe = regexp.MustCompile(`^\[yui\] screen=(\S+)\r?\n`)

func readTyped(body string) (screen, words string, ok bool) {
	m := readTypedRe.FindStringSubmatchIndex(body)
	if m == nil {
		return "", "", false
	}
	scr := body[m[2]:m[3]]
	if pageOf(scr) == 1 {
		return "", "", false
	}
	return scr, body[m[1]:], true
}

var attachSectionRe = regexp.MustCompile(`^[a-z]{1,20}$`)
var attachIDRe = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$`)
var attachRevRe = regexp.MustCompile(`^[A-Za-z0-9]{1,64}$`)

func attachBody(section, id, rev, words string) string {
	if !attachSectionRe.MatchString(section) || !attachIDRe.MatchString(id) || strings.Contains(id, "..") || !attachRevRe.MatchString(rev) {
		return words
	}
	return "[yui] attach section=" + section + " id=" + id + " rev=" + rev + "\n" + words
}

var readAttachRe = regexp.MustCompile(`^\[yui\] attach section=(\S+) id=(\S+) rev=(\S+)\r?\n`)

func readAttach(body string) (section, id, rev, words string, ok bool) {
	m := readAttachRe.FindStringSubmatchIndex(body)
	if m == nil {
		return "", "", "", "", false
	}
	section = body[m[2]:m[3]]
	id = body[m[4]:m[5]]
	rev = body[m[6]:m[7]]
	words = body[m[1]:]
	if attachBody(section, id, rev, "") == "" {
		return "", "", "", "", false
	}
	return section, id, rev, words, true
}

// ---------- minimal state reduction (rows check only) ----------

type stateComp struct {
	id     string
	preset string
	props  map[string]interface{}
	seq    int
}

type miniState struct {
	screens map[string][]*stateComp
	seq     int
}

func newMiniState() *miniState {
	return &miniState{screens: map[string][]*stateComp{"1": {}}}
}

func (s *miniState) apply(op Operation) {
	opv, _ := op["op"].(string)
	scr, _ := op["screen"].(string)
	switch opv {
	case "add":
		s.seq++
		id, _ := op["id"].(string)
		preset, _ := op["preset"].(string)
		props, _ := op["props"].(map[string]interface{})
		s.screens[scr] = append(s.screens[scr], &stateComp{id: id, preset: preset, props: props, seq: s.seq})
	case "patch":
		target, _ := op["target"].(string)
		props, _ := op["props"].(map[string]interface{})
		var hit *stateComp
		for _, list := range s.screens {
			for _, c := range list {
				if c.id == target || c.preset == target {
					if hit == nil || c.seq > hit.seq {
						hit = c
					}
				}
			}
		}
		if hit != nil {
			if kind, ok := props["kind"].(string); ok && contains(ROWS, hit.preset) && contains(ROWS, kind) {
				hit.preset = kind
			}
			for k, v := range props {
				if k == "kind" {
					continue
				}
				if hit.props == nil {
					hit.props = map[string]interface{}{}
				}
				hit.props[k] = v
			}
		}
	case "clear":
		s.screens[scr] = nil
	}
}

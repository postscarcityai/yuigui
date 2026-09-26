package main

import (
	"regexp"
	"strconv"
	"strings"
	"unicode"
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

var CORE = []string{"say", "custom", "save", "show", "forget", "clear", "end", "theme", "close", "talk", "menu", "put"}

var GROUPS = map[string][]string{
	"deck":     {"page", "ask", "choose", "pick", "sketch"},
	"plan":     {"page", "ask", "choose", "pick", "slide", "form", "mic", "camera", "sketch"},
	"narrate":  {"page", "compare", "image", "video", "card", "stat", "chart", "math", "storyboard", "gallery", "deck"},
	"timeline": {"done", "now", "next"},
	"sketch":   {"row", "after"},
	"shapes":   {"shape"},
}

var ROWS = []string{"done", "now", "next"}

type Token struct {
	Raw      string        `json:"raw"`
	Text     string        `json:"text"`
	Quoted   bool          `json:"quoted"`
	Parts    []string      `json:"parts"`
	Key      string        `json:"key"`
	Value    interface{}   `json:"value"`
	VQuoted  []bool        `json:"vquoted"`
}

type Operation map[string]interface{}

var identPattern = regexp.MustCompile(`^[a-z_][\w-]*$`)
var numPattern = regexp.MustCompile(`^-?\d+(\.\d+)?$`)

func tokenize(line string) []Token {
	var tokens []Token
	i := 0
	n := len(line)

	for i < n {
		for i < n && unicode.IsSpace(rune(line[i])) {
			i++
		}
		if i >= n {
			break
		}

		if line[i] == '#' && (i+1 >= n || unicode.IsSpace(rune(line[i+1]))) {
			break
		}

		start := i
		segs := []string{""}
		segQ := []bool{false}
		anyQuote := false
		wholeQuoted := i < n && line[i] == '"'
		eqAt := -1

		for i < n && !unicode.IsSpace(rune(line[i])) {
			c := line[i]

			if c == '"' {
				anyQuote = true
				segQ[len(segQ)-1] = true
				i++
				for i < n && line[i] != '"' {
					if line[i] == '\\' && i+1 < n {
						segs[len(segs)-1] += string(line[i+1])
						i += 2
						continue
					}
					segs[len(segs)-1] += string(line[i])
					i++
				}
				i++
				if i < n && !unicode.IsSpace(rune(line[i])) {
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

			if c == '=' && eqAt < 0 && len(segs) == 1 && !anyQuote && identPattern.MatchString(segs[0]) {
				eqAt = len(segs[0])
			}

			segs[len(segs)-1] += string(c)
			i++
		}

		raw := line[start:i]
		text := strings.Join(segs, "|")
		t := Token{
			Raw:    raw,
			Text:   text,
			Quoted: wholeQuoted && len(segs) == 1,
		}

		if len(segs) > 1 {
			t.Parts = segs
		}

		if eqAt >= 0 {
			t.Key = segs[0][:eqAt]
			first := segs[0][eqAt+1:]
			vparts := []string{first}
			vparts = append(vparts, segs[1:]...)
			if len(vparts) > 1 {
				t.Value = vparts
			} else {
				t.Value = first
			}
			t.VQuoted = segQ
			t.Parts = nil
		}

		tokens = append(tokens, t)
	}

	return tokens
}

func coerce(v string) interface{} {
	if numPattern.MatchString(v) {
		f, _ := strconv.ParseFloat(v, 64)
		if f == float64(int64(f)) {
			return int64(f)
		}
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

func seconds(s string) interface{} {
	matched := regexp.MustCompile(`^(\d+)(?::(\d{1,2}))?(\.\d+)?([smh]?)$`).FindStringSubmatch(s)
	if matched == nil {
		return nil
	}

	m1, _ := strconv.Atoi(matched[1])
	if matched[2] != "" {
		m2, _ := strconv.Atoi(matched[2])
		return m1*60 + m2
	}

	v, _ := strconv.ParseFloat(matched[1]+strings.TrimPrefix(matched[3], "."), 64)
	switch matched[4] {
	case "m":
		return int64(v * 60)
	case "h":
		return int64(v * 3600)
	default:
		if strings.Contains(matched[3], ".") {
			return v
		}
		return int64(v)
	}
}

func split(tokens []Token) (map[string]interface{}, map[string]bool, []Token) {
	kv := make(map[string]interface{})
	flags := make(map[string]bool)
	var pos []Token

	for _, t := range tokens {
		if t.Key != "" {
			if t.Key == "answer" {
				kv[t.Key] = t.Value
			} else {
				if arr, ok := t.Value.([]string); ok {
					vals := make([]interface{}, len(arr))
					for i, val := range arr {
						if i < len(t.VQuoted) && t.VQuoted[i] {
							vals[i] = val
						} else {
							vals[i] = coerce(val)
						}
					}
					kv[t.Key] = vals
				} else if str, ok := t.Value.(string); ok {
					if len(t.VQuoted) > 0 && t.VQuoted[0] {
						kv[t.Key] = str
					} else {
						kv[t.Key] = coerce(str)
					}
				}
			}
		} else if !t.Quoted && t.Parts == nil && regexp.MustCompile(`^\+[a-z][\w-]*$`).MatchString(t.Raw) {
			flags[t.Raw[1:]] = true
		} else {
			pos = append(pos, t)
		}
	}

	return kv, flags, pos
}

func contains(arr []string, s string) bool {
	for _, v := range arr {
		if v == s {
			return true
		}
	}
	return false
}

type Parser struct {
	screen   string
	ids      map[string]string
	auto     int
	open     []map[string]interface{}
	flowHead map[string]interface{}
	flow     map[string]interface{}
}

func NewParser(known map[string]string) *Parser {
	ids := make(map[string]string)
	if known != nil {
		for k, v := range known {
			ids[k] = v
		}
	}
	return &Parser{
		screen: "1",
		ids:    ids,
		auto:   0,
		open:   []map[string]interface{}{},
	}
}

func (p *Parser) flowLine(src string) Operation {
	return nil
}

func (p *Parser) line(src string) Operation {
	if p.flow != nil {
		return p.flowLine(src)
	}
	if p.flowHead != nil {
		t := strings.TrimSpace(src)
		if t == "" || regexp.MustCompile(`^#(\s|$)`).MatchString(t) {
			return nil
		}
		if strings.HasPrefix(t, "%%") {
			p.flowHead["pre"] = append(p.flowHead["pre"].([]string), strings.TrimRight(src, "\r"))
			return nil
		}
		p.flowHead = nil
	}

	op := p.group(p.parseLine(src))
	if op != nil && op["op"] == "add" && op["preset"] == "flow" {
		p.flowHead = map[string]interface{}{
			"id":     op["id"],
			"screen": op["screen"],
			"pre":    []string{},
		}
	}
	return op
}

func (p *Parser) group(op Operation) Operation {
	if op == nil || op["op"] == "error" || op["op"] == "theme" || op["op"] == "menu" || op["op"] == "table" || op["op"] == "put" {
		return op
	}

	if op["op"] == "close" {
		p.open = []map[string]interface{}{}
		return op
	}

	if op["op"] == "end" {
		if len(p.open) == 0 {
			return Operation{
				"op":      "error",
				"screen":  op["screen"],
				"message": "end: no open deck, plan, narrate, timeline or sketch",
				"line":    op["line"],
			}
		}
		g := p.open[len(p.open)-1]
		p.open = p.open[:len(p.open)-1]
		op["target"] = g["id"]
		return op
	}

	for len(p.open) > 0 {
		g := p.open[len(p.open)-1]
		if op["op"] != "add" || op["screen"] != g["screen"] {
			p.open = p.open[:len(p.open)-1]
			continue
		}
		preset := op["preset"].(string)
		if !contains(GROUPS[g["preset"].(string)], preset) {
			p.open = p.open[:len(p.open)-1]
			continue
		}
		break
	}

	if len(p.open) > 0 {
		g := p.open[len(p.open)-1]
		op["in"] = g["id"]
	}

	if op["op"] == "add" && contains(append([]string{}, mapKeys(GROUPS)...), op["preset"].(string)) {
		p.open = append(p.open, map[string]interface{}{
			"id":     op["id"],
			"preset": op["preset"],
			"screen": op["screen"],
		})
	}

	return op
}

func mapKeys(m map[string][]string) []string {
	var keys []string
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

func (p *Parser) parseLine(src string) Operation {
	line := strings.TrimRight(src, "\r")
	body := strings.TrimSpace(line)

	if body == "" || regexp.MustCompile(`^#(\s|$)`).MatchString(body) {
		return nil
	}

	screen := p.screen
	route := regexp.MustCompile(`^>([\w-]+)(?:\s+|$)`).FindStringSubmatch(body)
	if route != nil {
		if route[1] == "chat" {
			screen = "1"
		} else {
			screen = route[1]
		}
		body = strings.TrimLeft(body[len(route[0]):], " ")
		if body == "" || regexp.MustCompile(`^#(\s|$)`).MatchString(body) {
			p.screen = screen
			if route[1] == "chat" {
				return Operation{
					"op":     "close",
					"screen": "full",
					"line":   line,
				}
			}
			return Operation{
				"op":     "focus",
				"screen": screen,
				"line":   line,
			}
		}
	}

	tokens := tokenize(body)
	if len(tokens) == 0 {
		return nil
	}

	head := tokens[0].Raw
	tokens = tokens[1:]

	if strings.HasPrefix(head, "~") {
		target := head[1:]
		preset := p.ids[target]
		if preset == "" {
			preset = target
		}
		if preset == "" {
			return Operation{
				"op":      "error",
				"screen":  screen,
				"message": "patch: nothing called \"" + target + "\"",
				"line":    line,
			}
		}
		if preset == "custom" {
			return Operation{
				"op":      "error",
				"screen":  screen,
				"message": "patch: custom blocks are replaced, not patched",
				"line":    line,
			}
		}

		props := p.parseArgs(preset, tokens)
		return Operation{
			"op":     "patch",
			"screen": screen,
			"target": target,
			"props":  props,
			"line":   line,
		}
	}

	if head == "save" || head == "show" || head == "forget" {
		name := ""
		for _, t := range tokens {
			if t.Text != "" {
				if name != "" {
					name += " "
				}
				name += t.Text
			}
		}
		if name == "" {
			return Operation{
				"op":      "error",
				"screen":  screen,
				"message": head + ": needs a name",
				"line":    line,
			}
		}
		return Operation{
			"op":     head,
			"screen": screen,
			"name":   name,
			"line":   line,
		}
	}

	if head == "clear" {
		return Operation{
			"op":     "clear",
			"screen": screen,
			"line":   line,
		}
	}

	if head == "end" {
		return Operation{
			"op":     "end",
			"screen": screen,
			"line":   line,
		}
	}

	if head == "close" {
		p.screen = "1"
		return Operation{
			"op":     "close",
			"screen": "full",
			"line":   line,
		}
	}

	hm := regexp.MustCompile(`^([a-z]+)(?:@([\w-]+))?$`).FindStringSubmatch(head)
	if hm == nil || (!contains(PRESETS, hm[1]) && hm[1] != "say") {
		return Operation{
			"op":      "error",
			"screen":  screen,
			"message": "unknown preset \"" + head + "\"",
			"line":    line,
		}
	}

	preset := hm[1]
	id := hm[2]
	if id == "" {
		p.auto++
		id = "n" + strconv.Itoa(p.auto)
	}
	p.ids[id] = preset

	props := p.parseArgs(preset, tokens)
	return Operation{
		"op":     "add",
		"screen": screen,
		"preset": preset,
		"id":     id,
		"props":  props,
		"line":   line,
	}
}

func joinText(tokens []Token) string {
	var parts []string
	for _, t := range tokens {
		if t.Text != "" {
			parts = append(parts, t.Text)
		}
	}
	return strings.Join(parts, " ")
}

func parseTimer(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	timespecPattern := regexp.MustCompile(`^(\d+(?::\d{1,2})?(?:\.\d+)?[smh]?)(?:/(\d+(?::\d{1,2})?(?:\.\d+)?[smh]?))?(?:x(\d+))?$`)
	var rest []Token

	for _, t := range pos {
		if result["work"] == nil && !t.Quoted {
			m := timespecPattern.FindStringSubmatch(t.Text)
			if m != nil {
				result["work"] = seconds(m[1])
				if m[2] != "" {
					result["rest"] = seconds(m[2])
				}
				if m[3] != "" {
					rounds, _ := strconv.Atoi(m[3])
					result["rounds"] = rounds
				}
				continue
			}
		}
		rest = append(rest, t)
	}

	if len(rest) > 0 {
		result["label"] = joinText(rest)
	}

	return result
}

func parseAsk(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	var q []Token

	for _, t := range pos {
		if result["options"] == nil && t.Parts != nil {
			result["options"] = t.Parts
		} else {
			q = append(q, t)
		}
	}

	if result["options"] == nil && len(q) >= 3 {
		k := len(q)
		for k > 1 && q[k-1].Quoted {
			k--
		}
		if len(q)-k >= 2 {
			opts := make([]string, len(q)-k)
			for i := k; i < len(q); i++ {
				opts[i-k] = q[i].Text
			}
			result["options"] = opts
			q = q[:k]
		}
	}

	if len(q) > 0 {
		result["q"] = joinText(q)
	}

	return result
}

func parseSay(pos []Token) map[string]interface{} {
	return map[string]interface{}{
		"text": joinText(pos),
	}
}

func parseCard(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	if len(pos) > 0 {
		result["title"] = pos[0].Text
	}
	if len(pos) > 1 {
		result["body"] = joinText(pos[1:])
	}
	return result
}

func parseImage(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	var cap []Token
	urlPattern := regexp.MustCompile(`^(https?://|/|data:)`)

	for _, t := range pos {
		if result["src"] == nil && urlPattern.MatchString(t.Text) {
			result["src"] = t.Text
		} else {
			cap = append(cap, t)
		}
	}

	if len(cap) > 0 {
		if result["src"] != nil {
			result["caption"] = joinText(cap)
		} else {
			result["prompt"] = joinText(cap)
		}
	}

	return result
}

func parseCamera(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	var q []Token

	for _, t := range pos {
		if !t.Quoted && (t.Text == "front" || t.Text == "back") && result["facing"] == nil {
			result["facing"] = t.Text
		} else {
			q = append(q, t)
		}
	}

	if len(q) > 0 {
		result["prompt"] = joinText(q)
	}

	return result
}

func parseMic(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	if len(pos) > 0 {
		result["prompt"] = joinText(pos)
	}
	return result
}

func parseList(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	var items []interface{}

	for _, t := range pos {
		items_slice := items
		if result["title"] == nil && len(items_slice) == 0 && !t.Quoted && t.Parts == nil {
			result["title"] = t.Text
			continue
		}
		if t.Parts != nil {
			for _, part := range t.Parts {
				items = append(items, part)
			}
		} else {
			items = append(items, t.Text)
		}
	}

	result["items"] = items
	return result
}

func parseSlide(pos []Token) map[string]interface{} {
	result := make(map[string]interface{})
	rangePattern := regexp.MustCompile(`^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$`)
	var label []Token

	for _, t := range pos {
		if result["min"] == nil && !t.Quoted && rangePattern.MatchString(t.Text) {
			m := rangePattern.FindStringSubmatch(t.Text)
			minVal, _ := strconv.ParseFloat(m[1], 64)
			maxVal, _ := strconv.ParseFloat(m[2], 64)
			if minVal == float64(int64(minVal)) {
				result["min"] = int64(minVal)
			} else {
				result["min"] = minVal
			}
			if maxVal == float64(int64(maxVal)) {
				result["max"] = int64(maxVal)
			} else {
				result["max"] = maxVal
			}
		} else if t.Parts != nil && t.Parts[0] != "" && t.Parts[1] != "" && result["lo"] == nil {
			result["lo"] = t.Parts[0]
			result["hi"] = t.Parts[1]
		} else {
			label = append(label, t)
		}
	}

	if len(label) > 0 {
		result["label"] = joinText(label)
	}

	return result
}

func (p *Parser) parseArgs(preset string, tokens []Token) map[string]interface{} {
	kv, flags, pos := split(tokens)

	var base map[string]interface{}

	switch preset {
	case "timer":
		base = parseTimer(pos)
	case "ask", "choose", "pick":
		base = parseAsk(pos)
	case "say":
		base = parseSay(pos)
	case "card", "project":
		base = parseCard(pos)
	case "image", "video":
		base = parseImage(pos)
	case "camera":
		base = parseCamera(pos)
	case "mic":
		base = parseMic(pos)
	case "list":
		base = parseList(pos)
	case "slide":
		base = parseSlide(pos)
	default:
		base = make(map[string]interface{})
	}

	result := make(map[string]interface{})
	for k, v := range base {
		result[k] = v
	}
	for k, v := range flags {
		result[k] = v
	}
	for k, v := range kv {
		result[k] = v
	}

	return result
}

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
	result := make(Operation)
	for k, v := range op {
		if k != "line" && k != "message" {
			result[k] = v
		}
	}
	return result
}

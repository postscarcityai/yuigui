// Agent tables (spec/TABLES.md). Port of site/lib/yl/tables.mjs.
package main

import (
	"encoding/json"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

var tableTypesList = []string{"text", "number", "date", "bool"}

const (
	limitTables   = 20
	limitCols     = 12
	limitRows     = 5000
	limitText     = 1000
	limitKey      = 64
	limitName     = 32
	limitLimit    = 50
	limitMaxLimit = 500
)

var storeNameRe = regexp.MustCompile(`^[A-Za-z][\w-]*$`)
var storeColRe = regexp.MustCompile(`^[A-Za-z_][\w-]*$`)
var storeNumberRe = regexp.MustCompile(`^-?\d+(\.\d+)?$`)
var storeDayRe = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
var storeStampRe = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$`)
var storeRelRe = regexp.MustCompile(`^(?i)today(?:([+-])(\d{1,4}))?$`)

type Column struct {
	Name string
	Type string
	Unit string
}

type Table struct {
	Name  string
	Cols  []Column
	Rows  map[string]map[string]interface{}
	Order []string
	Next  int
}

func (t *Table) copy() *Table {
	cols := make([]Column, len(t.Cols))
	copy(cols, t.Cols)
	rows := map[string]map[string]interface{}{}
	for k, v := range t.Rows {
		row := map[string]interface{}{}
		for k2, v2 := range v {
			row[k2] = v2
		}
		rows[k] = row
	}
	order := make([]string, len(t.Order))
	copy(order, t.Order)
	return &Table{Name: t.Name, Cols: cols, Rows: rows, Order: order, Next: t.Next}
}

type Store struct {
	Tables map[string]*Table
}

func emptyStore() *Store { return &Store{Tables: map[string]*Table{}} }

func (s *Store) copy() *Store {
	out := &Store{Tables: map[string]*Table{}}
	for k, v := range s.Tables {
		out.Tables[k] = v
	}
	return out
}

type storeCtx struct {
	today string
	now   string
}

func localToday() string { return time.Now().Format("2006-01-02") }
func localNow() string   { return time.Now().Format("2006-01-02T15:04") }

func shiftDay(day string, n int) string {
	t, err := time.Parse("2006-01-02", day)
	if err != nil {
		return day
	}
	return t.AddDate(0, 0, n).Format("2006-01-02")
}

func realDate(s string) bool {
	if len(s) < 10 {
		return false
	}
	t, err := time.Parse("2006-01-02", s[:10])
	if err != nil {
		return false
	}
	return t.Format("2006-01-02") == s[:10]
}

// cell converts one value into a column's type. Returns (value, errMsg).
func cellValue(typ string, v interface{}, ctx storeCtx) (interface{}, string) {
	if v == nil {
		return nil, ""
	}
	if s, ok := v.(string); ok && s == "" {
		return nil, ""
	}
	if arr, ok := v.([]interface{}); ok {
		parts := make([]string, len(arr))
		for i, e := range arr {
			parts[i] = toStr(e)
		}
		v = strings.Join(parts, "|")
	}
	switch typ {
	case "text":
		s := toStr(v)
		if len(s) > limitText {
			return nil, "text over " + strconv.Itoa(limitText) + " characters"
		}
		return s, ""
	case "number":
		if f, ok := v.(float64); ok {
			return f, ""
		}
		if s, ok := v.(string); ok && storeNumberRe.MatchString(strings.TrimSpace(s)) {
			f, _ := strconv.ParseFloat(strings.TrimSpace(s), 64)
			return f, ""
		}
		return nil, `"` + toStr(v) + `" is not a number`
	case "date":
		s := strings.TrimSpace(toStr(v))
		today := ctx.today
		if today == "" {
			today = localToday()
		}
		if rel := storeRelRe.FindStringSubmatch(s); rel != nil {
			if rel[1] != "" {
				n, _ := strconv.Atoi(rel[2])
				if rel[1] == "-" {
					n = -n
				}
				return shiftDay(today, n), ""
			}
			return today, ""
		}
		if strings.ToLower(s) == "now" {
			now := ctx.now
			if now == "" {
				now = localNow()
			}
			return now, ""
		}
		if (storeDayRe.MatchString(s) || storeStampRe.MatchString(s)) && realDate(s) {
			return s, ""
		}
		return nil, `"` + s + `" is not a date (YYYY-MM-DD, today, today-7, now)`
	case "bool":
		if b, ok := v.(bool); ok {
			return b, ""
		}
		s := strings.ToLower(toStr(v))
		if s == "on" || s == "true" || s == "yes" || s == "1" {
			return true, ""
		}
		if s == "off" || s == "false" || s == "no" || s == "0" {
			return false, ""
		}
		return nil, `"` + toStr(v) + `" is not on or off`
	}
	return nil, "unknown type " + typ
}

func opCols(op Operation) []Column {
	raw, _ := op["cols"].([]interface{})
	out := make([]Column, len(raw))
	for i, c := range raw {
		cm, _ := c.(map[string]interface{})
		name, _ := cm["name"].(string)
		typ, _ := cm["type"].(string)
		unit, _ := cm["unit"].(string)
		out[i] = Column{Name: name, Type: typ, Unit: unit}
	}
	return out
}

func storeCreate(store *Store, op Operation, ctx storeCtx) (*Store, string) {
	name, _ := op["name"].(string)
	cols := opCols(op)
	if !storeNameRe.MatchString(name) || len(name) > limitName {
		return store, `table: bad name "` + name + `"`
	}
	if len(cols) == 0 {
		return store, "table create: needs at least one col:type"
	}
	if len(cols) > limitCols {
		return store, "table create: " + strconv.Itoa(limitCols) + " columns at most"
	}
	seen := map[string]bool{}
	for _, c := range cols {
		if !storeColRe.MatchString(c.Name) {
			return store, `table create: bad column "` + c.Name + `"`
		}
		if strings.ToLower(c.Name) == "key" {
			return store, "table create: key is the row key, not a column"
		}
		if seen[strings.ToLower(c.Name)] {
			return store, `table create: column "` + c.Name + `" twice`
		}
		if !contains(tableTypesList, c.Type) {
			return store, `table create: "` + c.Type + `" is not text, number, date or bool`
		}
		seen[strings.ToLower(c.Name)] = true
	}
	old := store.Tables[name]
	if old == nil && len(store.Tables) >= limitTables {
		return store, "table: " + strconv.Itoa(limitTables) + " tables per agent at most"
	}
	next := store.copy()
	if old == nil {
		next.Tables[name] = &Table{Name: name, Cols: cols, Rows: map[string]map[string]interface{}{}, Order: []string{}, Next: 1}
		return next, ""
	}
	t := old.copy()
	prev := map[string]Column{}
	for _, c := range old.Cols {
		prev[c.Name] = c
	}
	for _, key := range t.Order {
		row := old.Rows[key]
		nrow := map[string]interface{}{}
		for _, c := range cols {
			was, ok := prev[c.Name]
			if !ok {
				continue
			}
			v, exists := row[c.Name]
			if !exists || v == nil {
				continue
			}
			var val interface{}
			if was.Type == c.Type {
				val = v
			} else {
				cv, errMsg := cellValue(c.Type, v, ctx)
				if errMsg != "" || cv == nil {
					continue
				}
				val = cv
			}
			nrow[c.Name] = val
		}
		t.Rows[key] = nrow
	}
	t.Cols = cols
	next.Tables[name] = t
	return next, ""
}

func storePut(store *Store, op Operation, ctx storeCtx) (*Store, string) {
	tableName, _ := op["table"].(string)
	t0 := store.Tables[tableName]
	if t0 == nil {
		return store, `put: no table "` + tableName + `"`
	}
	keyRaw, hasKey := op["key"]
	var keyStr string
	if hasKey {
		keyStr = toStr(keyRaw)
		if len(keyStr) == 0 || len(keyStr) > limitKey {
			return store, "put: a key is 1 to " + strconv.Itoa(limitKey) + " characters"
		}
	}
	t := t0.copy()
	if del, _ := op["delete"].(bool); del {
		if !hasKey {
			return store, "put +delete: needs a key"
		}
		if _, ok := t.Rows[keyStr]; !ok {
			return store, ""
		}
		delete(t.Rows, keyStr)
		var order []string
		for _, k := range t.Order {
			if k != keyStr {
				order = append(order, k)
			}
		}
		t.Order = order
		next := store.copy()
		next.Tables[tableName] = t
		return next, ""
	}
	byName := map[string]Column{}
	for _, c := range t.Cols {
		byName[strings.ToLower(c.Name)] = c
	}
	values, _ := op["values"].(map[string]interface{})
	vals := map[string]interface{}{}
	for k, v := range values {
		c, ok := byName[strings.ToLower(k)]
		if !ok {
			return store, `put: ` + tableName + ` has no column "` + k + `"`
		}
		cv, errMsg := cellValue(c.Type, v, ctx)
		if errMsg != "" {
			return store, "put: " + c.Name + ": " + errMsg
		}
		vals[c.Name] = cv
	}
	key := keyStr
	if !hasKey {
		for {
			key = "r" + strconv.Itoa(t.Next)
			t.Next++
			if _, exists := t.Rows[key]; !exists {
				break
			}
		}
	}
	_, had := t.Rows[key]
	if !had && len(t.Order) >= limitRows {
		return store, "put: " + tableName + " is full (" + strconv.Itoa(limitRows) + " rows)"
	}
	row := map[string]interface{}{}
	if had {
		for k, v := range t.Rows[key] {
			row[k] = v
		}
	}
	for k, v := range vals {
		if v == nil {
			delete(row, k)
		} else {
			row[k] = v
		}
	}
	t.Rows[key] = row
	if !had {
		t.Order = append(t.Order, key)
	}
	next := store.copy()
	next.Tables[tableName] = t
	return next, ""
}

func storeWrite(store *Store, op Operation, ctx storeCtx) (*Store, string) {
	switch op["op"] {
	case "table":
		return storeCreate(store, op, ctx)
	case "put":
		return storePut(store, op, ctx)
	}
	return store, ""
}

type replayError struct {
	line    string
	message string
}

func replay(store *Store, ops []Operation, ctx storeCtx) (*Store, []replayError) {
	var errs []replayError
	for _, op := range ops {
		if op["op"] != "table" && op["op"] != "put" {
			continue
		}
		next, errMsg := storeWrite(store, op, ctx)
		if errMsg != "" {
			line, _ := op["line"].(string)
			errs = append(errs, replayError{line: line, message: errMsg})
		}
		store = next
	}
	return store, errs
}

// ---------- query ----------

var clauseRe = regexp.MustCompile(`^([A-Za-z_][\w-]*)\s*(>=|<=|!=|=|>|<|~)\s*(.*)$`)
var aggNames = []string{"sum", "avg", "min", "max"}

func cmpVal(a, b interface{}) int {
	if a == nil && b == nil {
		return 0
	}
	if a == nil {
		return 1
	}
	if b == nil {
		return -1
	}
	if af, ok := a.(float64); ok {
		if bf, ok := b.(float64); ok {
			if af < bf {
				return -1
			} else if af > bf {
				return 1
			}
			return 0
		}
	}
	if ab, ok := a.(bool); ok {
		if bb, ok := b.(bool); ok {
			ai, bi := 0, 0
			if ab {
				ai = 1
			}
			if bb {
				bi = 1
			}
			return ai - bi
		}
	}
	as, bs := strings.ToLower(toStr(a)), strings.ToLower(toStr(b))
	return strings.Compare(as, bs)
}

func queryAsList(v interface{}) []string {
	if v == nil {
		return nil
	}
	if _, ok := v.(bool); ok {
		return nil
	}
	var arr []interface{}
	if a, ok := v.([]interface{}); ok {
		arr = a
	} else {
		arr = []interface{}{v}
	}
	var out []string
	for _, e := range arr {
		s := toStr(e)
		if s != "" {
			out = append(out, s)
		}
	}
	return out
}

func queryResult(store *Store, props map[string]interface{}, ctx storeCtx) map[string]interface{} {
	name, _ := props["table"].(string)
	t := store.Tables[name]
	if t == nil {
		return map[string]interface{}{"missing": name}
	}
	colOf := func(n string) *Column {
		if strings.ToLower(n) == "key" {
			return &Column{Name: "key", Type: "text"}
		}
		for i := range t.Cols {
			if strings.ToLower(t.Cols[i].Name) == strings.ToLower(n) {
				return &t.Cols[i]
			}
		}
		return nil
	}

	type test func(row map[string]interface{}) bool
	var tests []test
	for _, w := range queryAsList(props["where"]) {
		m := clauseRe.FindStringSubmatch(w)
		if m == nil {
			return map[string]interface{}{"error": `where: cannot read "` + w + `"`}
		}
		c := colOf(m[1])
		if c == nil {
			return map[string]interface{}{"error": `where: no column "` + m[1] + `"`}
		}
		op := m[2]
		raw := strings.TrimSpace(m[3])
		cname := c.Name
		if raw == "" {
			if op != "=" && op != "!=" {
				return map[string]interface{}{"error": `where: "` + w + `" needs a value`}
			}
			wantEq := op == "="
			tests = append(tests, func(row map[string]interface{}) bool {
				return (row[cname] == nil) == wantEq
			})
			continue
		}
		var want interface{}
		if op == "~" {
			want = strings.ToLower(raw)
		} else {
			cv, errMsg := cellValue(c.Type, raw, ctx)
			if errMsg != "" {
				return map[string]interface{}{"error": "where: " + c.Name + ": " + errMsg}
			}
			want = cv
		}
		byDay := c.Type == "date"
		if s, ok := want.(string); !ok || len(s) != 10 {
			byDay = false
		}
		opCopy := op
		tests = append(tests, func(row map[string]interface{}) bool {
			v := row[cname]
			if v == nil {
				return opCopy == "!="
			}
			if byDay {
				s := toStr(v)
				if len(s) > 10 {
					s = s[:10]
				}
				v = s
			}
			if opCopy == "~" {
				return strings.Contains(strings.ToLower(toStr(v)), want.(string))
			}
			d := cmpVal(v, want)
			switch opCopy {
			case "=":
				return d == 0
			case "!=":
				return d != 0
			case ">":
				return d > 0
			case "<":
				return d < 0
			case ">=":
				return d >= 0
			default:
				return d <= 0
			}
		})
	}

	type rowRec struct {
		key string
		row map[string]interface{}
	}
	var rows []rowRec
	for _, k := range t.Order {
		r := map[string]interface{}{"key": k}
		for kk, vv := range t.Rows[k] {
			r[kk] = vv
		}
		ok := true
		for _, f := range tests {
			if !f(r) {
				ok = false
				break
			}
		}
		if ok {
			rows = append(rows, rowRec{key: k, row: r})
		}
	}

	var cols []Column
	keyed := true

	type aggSpec struct {
		agg string
		n   string
	}
	var aggs []aggSpec
	for _, a := range aggNames {
		for _, n := range queryAsList(props[a]) {
			aggs = append(aggs, aggSpec{agg: a, n: n})
		}
	}
	_, hasCount := props["count"]
	countTrue, _ := props["count"].(bool)
	groupVal, hasGroup := props["group"]
	groupStr, _ := groupVal.(string)

	if len(aggs) > 0 || (hasCount && countTrue) || (hasGroup && groupStr != "") {
		keyed = false
		var g *Column
		if hasGroup && groupStr != "" {
			g = colOf(groupStr)
			if g == nil {
				return map[string]interface{}{"error": `group: no column "` + groupStr + `"`}
			}
		}
		type outCol struct {
			Column
			from string
			agg  string // "" none, "count", or aggName
		}
		var out []outCol
		used := map[string]bool{}
		if g != nil {
			out = append(out, outCol{Column: *g, from: g.Name, agg: ""})
			used[strings.ToLower(g.Name)] = true
		}
		for _, a := range aggs {
			c := colOf(a.n)
			if c == nil {
				return map[string]interface{}{"error": a.agg + `: no column "` + a.n + `"`}
			}
			if c.Type != "number" && (a.agg == "sum" || a.agg == "avg") {
				return map[string]interface{}{"error": a.agg + ": " + c.Name + " is not a number column"}
			}
			label := c.Name
			if used[strings.ToLower(c.Name)] {
				label = a.agg + " " + c.Name
			}
			used[strings.ToLower(label)] = true
			out = append(out, outCol{Column: Column{Name: label, Type: c.Type, Unit: c.Unit}, from: c.Name, agg: a.agg})
		}
		if countTrue {
			out = append(out, outCol{Column: Column{Name: "Count", Type: "number"}, from: "", agg: "count"})
		}
		groups := map[string][]map[string]interface{}{}
		var groupOrder []string
		for _, r := range rows {
			gk := ""
			if g != nil {
				b, _ := json.Marshal(r.row[g.Name])
				gk = string(b)
			}
			if _, ok := groups[gk]; !ok {
				groupOrder = append(groupOrder, gk)
			}
			groups[gk] = append(groups[gk], r.row)
		}
		if g == nil && len(groups) == 0 {
			groups[""] = []map[string]interface{}{}
			groupOrder = []string{""}
		}
		var outRows []map[string]interface{}
		for _, gk := range groupOrder {
			list := groups[gk]
			row := map[string]interface{}{}
			for _, c := range out {
				switch c.agg {
				case "":
					if len(list) > 0 {
						row[c.Name] = list[0][c.from]
					} else {
						row[c.Name] = nil
					}
				case "count":
					row[c.Name] = float64(len(list))
				default:
					var vs []float64
					var vsAny []interface{}
					for _, r := range list {
						v := r[c.from]
						if v == nil {
							continue
						}
						vsAny = append(vsAny, v)
						if f, ok := v.(float64); ok {
							vs = append(vs, f)
						}
					}
					if len(vsAny) == 0 {
						if c.agg == "sum" {
							row[c.Name] = float64(0)
						} else {
							row[c.Name] = nil
						}
					} else if c.agg == "sum" {
						sum := 0.0
						for _, v := range vs {
							sum += v
						}
						row[c.Name] = round6(sum)
					} else if c.agg == "avg" {
						sum := 0.0
						for _, v := range vs {
							sum += v
						}
						row[c.Name] = round6(sum / float64(len(vs)))
					} else {
						best := vsAny[0]
						for _, v := range vsAny[1:] {
							d := cmpVal(v, best)
							if (c.agg == "min" && d < 0) || (c.agg == "max" && d > 0) {
								best = v
							}
						}
						row[c.Name] = best
					}
				}
			}
			outRows = append(outRows, row)
		}
		cols = make([]Column, len(out))
		for i, c := range out {
			cols[i] = c.Column
		}
		rows = make([]rowRec, len(outRows))
		for i, r := range outRows {
			rows[i] = rowRec{key: "", row: r}
		}
	} else {
		pick := queryAsList(props["cols"])
		if len(pick) > 0 {
			cols = make([]Column, len(pick))
			for i, n := range pick {
				c := colOf(n)
				if c == nil {
					return map[string]interface{}{"error": `cols: no column "` + n + `"`}
				}
				cols[i] = *c
			}
		} else {
			cols = make([]Column, len(t.Cols))
			copy(cols, t.Cols)
		}
	}

	type sortSpec struct {
		name string
		desc bool
	}
	var sorts []sortSpec
	for _, s := range queryAsList(props["sort"]) {
		desc := strings.HasPrefix(s, "-")
		n := s
		if desc {
			n = s[1:]
		}
		var c *Column
		if keyed {
			c = colOf(n)
		} else {
			for i := range cols {
				if strings.ToLower(cols[i].Name) == strings.ToLower(n) {
					c = &cols[i]
					break
				}
			}
		}
		if c == nil {
			return map[string]interface{}{"error": `sort: no column "` + n + `"`}
		}
		sorts = append(sorts, sortSpec{name: c.Name, desc: desc})
	}
	if len(sorts) > 0 {
		idx := make([]int, len(rows))
		for i := range rows {
			idx[i] = i
		}
		sort.SliceStable(idx, func(ii, jj int) bool {
			x, y := rows[idx[ii]], rows[idx[jj]]
			for _, s := range sorts {
				a, b := x.row[s.name], y.row[s.name]
				if a == nil && b == nil {
					continue
				}
				if a == nil {
					return false
				}
				if b == nil {
					return true
				}
				d := cmpVal(a, b)
				if d != 0 {
					if s.desc {
						return d > 0
					}
					return d < 0
				}
			}
			return false
		})
		newRows := make([]rowRec, len(rows))
		for i, ix := range idx {
			newRows[i] = rows[ix]
		}
		rows = newRows
	}

	count := len(rows)
	lim := limitLimit
	if lv, ok := props["limit"]; ok {
		var f float64
		got := false
		switch x := lv.(type) {
		case float64:
			f = x
			got = true
		case string:
			if x != "" {
				if parsed, err := strconv.ParseFloat(x, 64); err == nil {
					f = parsed
					got = true
				}
			}
		}
		if got {
			lim = int(f)
		}
	}
	if lim > limitMaxLimit {
		lim = limitMaxLimit
	}
	if lim < 0 {
		lim = 0
	}
	if lim < len(rows) {
		rows = rows[:lim]
	}

	outRows := make([]interface{}, len(rows))
	keys := make([]interface{}, len(rows))
	for i, r := range rows {
		vals := make([]interface{}, len(cols))
		for j, c := range cols {
			v, ok := r.row[c.Name]
			if !ok {
				v = nil
			}
			vals[j] = v
		}
		outRows[i] = vals
		if keyed {
			keys[i] = r.key
		} else {
			keys[i] = nil
		}
	}
	colsOut := make([]interface{}, len(cols))
	for i, c := range cols {
		cm := map[string]interface{}{"name": c.Name, "type": c.Type}
		if c.Unit != "" {
			cm["unit"] = c.Unit
		}
		colsOut[i] = cm
	}
	return map[string]interface{}{"cols": colsOut, "rows": outRows, "keys": keys, "count": float64(count)}
}

func round6(f float64) float64 {
	return float64(int64(f*1e6+sign(f)*0.5)) / 1e6
}

func sign(f float64) float64 {
	if f < 0 {
		return -1
	}
	return 1
}

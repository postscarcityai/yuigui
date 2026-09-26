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

func normalize(ops []Operation) []Operation {
	result := make([]Operation, len(ops))
	for i, op := range ops {
		result[i] = cleanOp(op)
	}
	return result
}

func deepEqual(a, b interface{}) bool {
	aJSON, _ := json.Marshal(a)
	bJSON, _ := json.Marshal(b)
	return string(aJSON) == string(bJSON)
}

func check(v map[string]interface{}) [][]interface{} {
	var fails [][]interface{}

	known := make(map[string]string)
	if k, ok := v["known"].(map[string]interface{}); ok {
		for key, val := range k {
			if str, ok := val.(string); ok {
				known[key] = str
			}
		}
	}

	input, _ := v["input"].(string)
	expected, _ := v["expected"].([]interface{})

	got := normalize(parse(input, known))
	gotJSON, _ := json.Marshal(got)
	expectedJSON, _ := json.Marshal(expected)

	if string(gotJSON) != string(expectedJSON) {
		fails = append(fails, []interface{}{"parse", got})
	}

	if v["error"] != nil {
		hasError := false
		for _, op := range got {
			if opType, ok := op["op"].(string); ok && opType == "error" {
				hasError = true
				break
			}
		}
		expectedError := v["error"] == true
		if hasError != expectedError {
			fails = append(fails, []interface{}{"vector: `error` flag does not match expected", v["error"]})
		}
	}

	return fails
}

func dump(x interface{}) string {
	b, _ := json.Marshal(x)
	return string(b)
}

func checkWithRecover(v map[string]interface{}) [][]interface{} {
	defer func() {
		if r := recover(); r != nil {
			fmt.Fprintf(os.Stderr, "panic: %v\n", r)
		}
	}()
	return check(v)
}

func main() {
	flag.Parse()
	args := flag.Args()

	defaultDir := "../../spec/conformance"
	d := defaultDir
	if len(args) > 0 {
		d = args[0]
	}

	files, _ := os.ReadDir(d)
	var jsonFiles []string
	for _, f := range files {
		if m, _ := regexp.MatchString(`\d\d-.*\.json`, f.Name()); m {
			jsonFiles = append(jsonFiles, f.Name())
		}
	}
	sort.Strings(jsonFiles)

	passed := 0
	failed := 0

	for _, f := range jsonFiles {
		data, _ := os.ReadFile(filepath.Join(d, f))
		var fileData map[string]interface{}
		json.Unmarshal(data, &fileData)

		vectors := fileData["vectors"].([]interface{})
		ok := 0

		for _, v := range vectors {
			vectorMap := v.(map[string]interface{})
			fails := checkWithRecover(vectorMap)

			if len(fails) == 0 {
				ok++
				continue
			}

			failed++
			name := vectorMap["name"].(string)
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

	fmt.Printf("\n%d passed, %d failed, %d vectors in %d files\n",
		passed, failed, passed+failed, len(jsonFiles))

	if failed > 0 {
		os.Exit(1)
	}
}

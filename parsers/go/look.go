// Looks: the YL theme sets and the contrast guard. Port of site/lib/yl/look.mjs.
package main

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
)

type setRecipe struct {
	accent, bg, radius, font, weight, motion string
}

var setsData = map[string]setRecipe{
	"yui":      {accent: "#FF7E8A", bg: "#FFF9F0", radius: "yui"},
	"candy":    {accent: "#FF5FAE", bg: "#FFF1F7", radius: "round"},
	"berry":    {accent: "#B8336A", bg: "#FCF2F6", radius: "soft", weight: "bold"},
	"cherry":   {accent: "#D7263D", bg: "#FFF3F3", radius: "round", motion: "snappy"},
	"coral":    {accent: "#FF6F7D", bg: "#FFF6F4", radius: "round"},
	"sunset":   {accent: "#F2663A", bg: "#FFF4EC", radius: "soft", motion: "snappy"},
	"peach":    {accent: "#FF9466", bg: "#FFF7F1", radius: "round"},
	"autumn":   {accent: "#C8642B", bg: "#F7F0E6", radius: "soft", font: "serif", weight: "bold", motion: "calm"},
	"honey":    {accent: "#D98E04", bg: "#FFF8EC", radius: "round", motion: "calm"},
	"lemon":    {accent: "#E5B800", bg: "#FFFBEA", radius: "round"},
	"lime":     {accent: "#8CC63F", bg: "#F7FBEF", radius: "round", motion: "snappy"},
	"matcha":   {accent: "#7FA650", bg: "#F6F8EF", radius: "round", motion: "calm"},
	"forest":   {accent: "#2F7D4F", bg: "#F2F6F1", radius: "soft", font: "default", weight: "bold", motion: "calm"},
	"mint":     {accent: "#2FB58C", bg: "#F0FAF6", radius: "round"},
	"teal":     {accent: "#0E9AA7", bg: "#EFF9FA", radius: "soft"},
	"sky":      {accent: "#4AA8F0", bg: "#F2F8FF", radius: "round"},
	"ocean":    {accent: "#1E86C8", bg: "#F1F7FC", radius: "soft", font: "default", weight: "bold", motion: "calm"},
	"midnight": {accent: "#5B6CFF", bg: "#F1F2FF", radius: "soft", font: "default", weight: "bold", motion: "snappy"},
	"lavender": {accent: "#9B87F5", bg: "#F7F4FF", radius: "round"},
	"grape":    {accent: "#8E44C8", bg: "#F8F2FD", radius: "round", weight: "bold"},
	"slate":    {accent: "#56657F", bg: "#F3F5F8", radius: "soft", font: "default", weight: "bold", motion: "calm"},
	"mono":     {accent: "#4A4A4A", bg: "#FFFFFF", radius: "square", font: "default", weight: "bold", motion: "snappy"},
	"wizard":   {accent: "#7B5CFF", bg: "#F6F4FF", radius: "soft", font: "serif", weight: "bold", motion: "calm"},
	"coach":    {accent: "#FF5A36", bg: "#FFF6F2", radius: "square", font: "default", weight: "heavy", motion: "snappy"},
	"zen":      {accent: "#4E9A6B", bg: "#F5F8F2", radius: "round", font: "serif", weight: "regular", motion: "calm"},
	"studio":   {accent: "#2F7BFF", bg: "#F3F7FF", radius: "round", font: "rounded", weight: "heavy", motion: "bouncy"},
	"night":    {accent: "#8A7CF0", bg: "#F7F5FF", radius: "round", font: "serif", weight: "bold", motion: "calm"},
	"counsel":  {accent: "#1F3A68", bg: "#FAF8F3", radius: "square", font: "serif", weight: "bold", motion: "calm"},
}

var papersData = map[string]string{
	"cream": "#FFF9F0", "paper": "#FBFAF7", "white": "#FFFFFF",
	"mist": "#F3F6FA", "sand": "#F7F0E6", "blush": "#FFF1F3",
}

const guardText = 4.6
const guardControl = 3.1
const aaText = 4.5
const aaControl = 3.0

type rgbColor struct{ r, g, b float64 }

var rgbHexRe = regexp.MustCompile(`(?i)^#?([0-9a-f]{6})$`)

func parseRGB(s string) (rgbColor, bool) {
	m := rgbHexRe.FindStringSubmatch(s)
	if m == nil {
		return rgbColor{}, false
	}
	v, _ := strconv.ParseInt(m[1], 16, 64)
	return rgbColor{
		r: float64((v>>16)&255) / 255,
		g: float64((v>>8)&255) / 255,
		b: float64(v&255) / 255,
	}, true
}

func fromHSL(h, s, l float64) rgbColor {
	c := (1 - math.Abs(2*l-1)) * s
	hp := math.Mod(math.Mod(h, 360)+360, 360) / 60
	x := c * (1 - math.Abs(math.Mod(hp, 2)-1))
	var r, g, b float64
	switch {
	case hp < 1:
		r, g, b = c, x, 0
	case hp < 2:
		r, g, b = x, c, 0
	case hp < 3:
		r, g, b = 0, c, x
	case hp < 4:
		r, g, b = 0, x, c
	case hp < 5:
		r, g, b = x, 0, c
	default:
		r, g, b = c, 0, x
	}
	m := l - c/2
	return rgbColor{r: r + m, g: g + m, b: b + m}
}

func hexOf(c rgbColor) string {
	p := func(v float64) string {
		v = math.Min(1, math.Max(0, v))
		return fmt.Sprintf("%02X", int(math.Round(v*255)))
	}
	return "#" + p(c.r) + p(c.g) + p(c.b)
}

type hslT struct{ h, s, l float64 }

func toHSL(c rgbColor) hslT {
	mx := math.Max(c.r, math.Max(c.g, c.b))
	mn := math.Min(c.r, math.Min(c.g, c.b))
	l := (mx + mn) / 2
	if mx == mn {
		return hslT{0, 0, l}
	}
	d := mx - mn
	var s float64
	if l > 0.5 {
		s = d / (2 - mx - mn)
	} else {
		s = d / (mx + mn)
	}
	var h float64
	switch mx {
	case c.r:
		h = (c.g - c.b) / d
		if c.g < c.b {
			h += 6
		}
	case c.g:
		h = (c.b-c.r)/d + 2
	default:
		h = (c.r-c.g)/d + 4
	}
	return hslT{h: h * 60, s: s, l: l}
}

func luminance(c rgbColor) float64 {
	lin := func(v float64) float64 {
		if v <= 0.03928 {
			return v / 12.92
		}
		return math.Pow((v+0.055)/1.055, 2.4)
	}
	return 0.2126*lin(c.r) + 0.7152*lin(c.g) + 0.0722*lin(c.b)
}

func contrastC(a, b rgbColor) float64 {
	x, y := luminance(a), luminance(b)
	return (math.Max(x, y) + 0.05) / (math.Min(x, y) + 0.05)
}

var whiteColor = rgbColor{1, 1, 1}

func withL(c rgbColor, l float64) rgbColor {
	x := toHSL(c)
	return fromHSL(x.h, x.s, math.Min(1, math.Max(0, l)))
}

func darkenC(c rgbColor, ok func(rgbColor) bool) rgbColor {
	l := toHSL(c).l
	for !ok(c) && l > 0 {
		l -= 0.01
		c = withL(c, l)
	}
	return c
}

func lightenC(c rgbColor, ok func(rgbColor) bool) rgbColor {
	l := toHSL(c).l
	for !ok(c) && l < 1 {
		l += 0.01
		c = withL(c, l)
	}
	return c
}

func movedAway(c, bg rgbColor, min float64) rgbColor {
	if luminance(bg) > 0.18 {
		return darkenC(c, func(x rgbColor) bool { return contrastC(x, bg) >= min })
	}
	return lightenC(c, func(x rgbColor) bool { return contrastC(x, bg) >= min })
}

func readableC(c rgbColor, bgs []rgbColor, min float64) rgbColor {
	ok := func(x rgbColor) bool {
		for _, b := range bgs {
			if contrastC(x, b) < min {
				return false
			}
		}
		return true
	}
	if ok(c) {
		return c
	}
	sum := 0.0
	for _, b := range bgs {
		sum += luminance(b)
	}
	avg := sum / float64(len(bgs))
	if avg > 0.18 {
		return darkenC(c, ok)
	}
	return lightenC(c, ok)
}

func betterC(opts []rgbColor, bg rgbColor) rgbColor {
	best := opts[0]
	for _, o := range opts[1:] {
		if contrastC(o, bg) > contrastC(best, bg) {
			best = o
		}
	}
	return best
}

type paletteOut struct {
	background, surface, ink, inkSoft, outline string
	accent, onAccent, userBubble, userInk      string
	agentBubble, agentInk                      string
}

type lookResult struct {
	name           string
	light, dark    paletteOut
	radius, font   string
	weight, motion string
	adjustedLight  []string
	adjustedDark   []string
}

func compileLook(r setRecipe, name string) lookResult {
	accent, ok := parseRGB(r.accent)
	if !ok {
		accent, _ = parseRGB("#FF7E8A")
	}
	hs := toHSL(accent)
	h, sat := hs.h, hs.s
	paper, ok := parseRGB(r.bg)
	if !ok {
		paper = fromHSL(h, 0.7, 0.975)
	}
	if toHSL(paper).l < 0.93 {
		paper = withL(paper, 0.93)
	}
	var adjustedLight, adjustedDark []string

	palette := func(dark bool) paletteOut {
		var bg rgbColor
		if dark {
			bg = fromHSL(h, math.Min(0.32, sat), 0.13)
		} else {
			bg = paper
		}
		var surface rgbColor
		if dark {
			surface = fromHSL(h, math.Min(0.26, sat), 0.19)
		} else {
			surface = fromHSL(h, 0.5, 0.995)
		}
		var outline rgbColor
		if dark {
			outline = fromHSL(h, math.Min(0.22, sat), 0.28)
		} else {
			outline = fromHSL(h, math.Min(0.45, sat), 0.9)
		}
		darkInk := fromHSL(h, math.Min(0.3, sat), 0.15)
		var inkBase rgbColor
		if dark {
			inkBase = fromHSL(h, math.Min(0.35, sat), 0.95)
		} else {
			inkBase = fromHSL(h, math.Min(0.22, sat), 0.22)
		}
		ink := readableC(inkBase, []rgbColor{bg, surface}, guardText)
		var inkSoftBase rgbColor
		if dark {
			inkSoftBase = fromHSL(h, 0.14, 0.7)
		} else {
			inkSoftBase = fromHSL(h, 0.1, 0.46)
		}
		inkSoft := readableC(inkSoftBase, []rgbColor{bg, surface}, guardText)

		acc := movedAway(accent, bg, guardControl)
		onAccent := betterC([]rgbColor{whiteColor, darkInk}, acc)
		if contrastC(onAccent, acc) < guardText {
			if dark {
				acc = lightenC(acc, func(x rgbColor) bool { return contrastC(darkInk, x) >= guardText })
			} else {
				acc = darkenC(acc, func(x rgbColor) bool { return contrastC(whiteColor, x) >= guardText })
			}
			onAccent = betterC([]rgbColor{whiteColor, darkInk}, acc)
		}
		if hexOf(acc) != hexOf(accent) {
			if dark {
				adjustedDark = append(adjustedDark, "accent")
			} else {
				adjustedLight = append(adjustedLight, "accent")
			}
		}
		var userBubble rgbColor
		if dark {
			userBubble = fromHSL(h, math.Max(0.45, math.Min(0.8, sat)), 0.72)
		} else {
			userBubble = fromHSL(h, math.Max(0.5, math.Min(0.9, sat)), 0.86)
		}
		userInk := readableC(darkInk, []rgbColor{userBubble}, guardText)
		var agentBubble rgbColor
		if dark {
			agentBubble = fromHSL(h, math.Min(0.24, sat), 0.22)
		} else {
			agentBubble = surface
		}
		agentInk := readableC(ink, []rgbColor{agentBubble}, guardText)

		return paletteOut{
			background: hexOf(bg), surface: hexOf(surface), ink: hexOf(ink), inkSoft: hexOf(inkSoft), outline: hexOf(outline),
			accent: hexOf(acc), onAccent: hexOf(onAccent), userBubble: hexOf(userBubble), userInk: hexOf(userInk),
			agentBubble: hexOf(agentBubble), agentInk: hexOf(agentInk),
		}
	}

	light := palette(false)
	dark := palette(true)

	radius := "soft"
	if contains(radii, r.radius) || r.radius == "yui" {
		radius = r.radius
	}
	font := "rounded"
	if contains(fonts, r.font) {
		font = r.font
	}
	weight := "heavy"
	if contains(weights, r.weight) {
		weight = r.weight
	}
	motion := "bouncy"
	if contains(motions, r.motion) {
		motion = r.motion
	}

	return lookResult{
		name: name, light: light, dark: dark,
		radius: radius, font: font, weight: weight, motion: motion,
		adjustedLight: adjustedLight, adjustedDark: adjustedDark,
	}
}

// appLook computes the look a `theme app` line's props ask for.
func appLook(props map[string]interface{}) lookResult {
	name, _ := props["name"].(string)
	if name == "reset" {
		return yuiLook()
	}
	var r setRecipe
	if name != "" {
		r = setsData[name]
	} else {
		r = setsData["yui"]
	}
	if accent, ok := props["accent"].(string); ok && accent != "" {
		if set, isSet := setsData[accent]; isSet {
			r.accent = set.accent
		} else {
			r.accent = accent
		}
	}
	if bg, ok := props["bg"].(string); ok && bg != "" {
		if paper, isPaper := papersData[bg]; isPaper {
			r.bg = paper
		} else {
			r.bg = bg
		}
	}
	if v, ok := props["radius"].(string); ok && v != "" {
		r.radius = v
	}
	if v, ok := props["font"].(string); ok && v != "" {
		r.font = v
	}
	if v, ok := props["weight"].(string); ok && v != "" {
		r.weight = v
	}
	if v, ok := props["motion"].(string); ok && v != "" {
		r.motion = v
	}
	if r.radius == "yui" && name == "" {
		r.radius = "soft"
	}
	label := name
	if label == "" {
		label = "custom"
	}
	return compileLook(r, label)
}

func yuiLook() lookResult {
	return lookResult{
		name: "yui",
		light: paletteOut{
			background: "#FFF9F0", surface: "#FFFFFF", ink: "#3A3340", inkSoft: "#6E6478", outline: "#F0E4D6",
			accent: "#FF7E8A", onAccent: "#3A3340", userBubble: "#FFA8B0", userInk: "#3A3340",
			agentBubble: "#FFFFFF", agentInk: "#3A3340",
		},
		dark: paletteOut{
			background: "#231D33", surface: "#2F2842", ink: "#F6EEF7", inkSoft: "#A99FB8", outline: "#3D3452",
			accent: "#FF7E8A", onAccent: "#2A2238", userBubble: "#F28D97", userInk: "#2A2238",
			agentBubble: "#352D4A", agentInk: "#F6EEF7",
		},
		radius: "yui", font: "rounded", weight: "heavy", motion: "bouncy",
	}
}

type contrastCheck struct {
	what  string
	ratio float64
	min   float64
	ok    bool
}

func lookChecks(p paletteOut) []contrastCheck {
	hx := func(s string) rgbColor { c, _ := parseRGB(s); return c }
	pairs := []struct {
		what   string
		fg, bg string
		min    float64
	}{
		{"ink on background", p.ink, p.background, aaText},
		{"ink on surface", p.ink, p.surface, aaText},
		{"soft ink on background", p.inkSoft, p.background, aaText},
		{"accent on background", p.accent, p.background, aaControl},
		{"text on accent", p.onAccent, p.accent, aaText},
		{"your bubble", p.userInk, p.userBubble, aaText},
		{"agent bubble", p.agentInk, p.agentBubble, aaText},
	}
	out := make([]contrastCheck, len(pairs))
	for i, pr := range pairs {
		ratio := contrastC(hx(pr.fg), hx(pr.bg))
		out[i] = contrastCheck{
			what:  pr.what,
			ratio: math.Round(ratio*10) / 10,
			min:   pr.min,
			ok:    ratio >= pr.min,
		}
	}
	return out
}

func adjustedFor(l lookResult, mode string) []string {
	if mode == "dark" {
		if l.adjustedDark == nil {
			return []string{}
		}
		return l.adjustedDark
	}
	if l.adjustedLight == nil {
		return []string{}
	}
	return l.adjustedLight
}

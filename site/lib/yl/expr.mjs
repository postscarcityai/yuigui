// Tiny, safe math expression engine for the YL `calc` preset. Spec: YL.md, calc.
// No eval. Grammar:
//   expr   := term (("+" | "-") term)*
//   term   := unary (("*" | "/") unary)*
//   unary  := "-" unary | power
//   power  := atom ("^" unary)?          right associative: 2^3^2 = 2^9
//   atom   := number | name | name "(" expr ("," expr)* ")" | "(" expr ")"
// Numbers: 3, 0.5, .5, 6.02e23. Names: [A-Za-z_][A-Za-z0-9_]*.
// Functions: sin cos tan asin acos atan sqrt abs exp ln log (base 10) min max
// floor ceil round. Constants: pi, e (a variable of the same name wins).

const FNS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: Math.log10,
  min: Math.min, max: Math.max, floor: Math.floor, ceil: Math.ceil, round: Math.round,
};
const CONSTS = { pi: Math.PI, e: Math.E };

function lex(src) {
  const out = [];
  const re = /\s*(?:(\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+(?:[eE][-+]?\d+)?)|([A-Za-z_]\w*)|(\*\*|[-+*/^(),]))/y;
  let i = 0;
  while (i < src.length) {
    if (/^\s*$/.test(src.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) throw new Error(`unexpected "${src.slice(i).trim()[0]}"`);
    if (m[1]) out.push({ t: "num", v: Number(m[1]) });
    else if (m[2]) out.push({ t: "name", v: m[2] });
    else out.push({ t: "op", v: m[3] === "**" ? "^" : m[3] });
    i = re.lastIndex;
  }
  return out;
}

// Returns an AST: {n: number} | {v: name} | {op, a, b} | {neg} | {fn, args}.
export function parseExpr(src) {
  const toks = lex(src);
  let k = 0;
  const peek = () => toks[k];
  const eat = (v) => { if (peek() && peek().v === v) { k++; return true; } return false; };
  const expect = (v) => { if (!eat(v)) throw new Error(`expected "${v}"`); };
  function expr() {
    let a = term();
    for (;;) { const o = peek(); if (o && o.t === "op" && (o.v === "+" || o.v === "-")) { k++; a = { op: o.v, a, b: term() }; } else return a; }
  }
  function term() {
    let a = unary();
    for (;;) { const o = peek(); if (o && o.t === "op" && (o.v === "*" || o.v === "/")) { k++; a = { op: o.v, a, b: unary() }; } else return a; }
  }
  function unary() { return eat("-") ? { neg: unary() } : eat("+") ? unary() : power(); }
  function power() { const a = atom(); return eat("^") ? { op: "^", a, b: unary() } : a; }
  function atom() {
    const t = toks[k++];
    if (!t) throw new Error("unexpected end");
    if (t.t === "num") return { n: t.v };
    if (t.t === "name") {
      if (eat("(")) {
        if (!FNS[t.v]) throw new Error(`unknown function "${t.v}"`);
        const args = [expr()];
        while (eat(",")) args.push(expr());
        expect(")");
        return { fn: t.v, args };
      }
      return { v: t.v };
    }
    if (t.v === "(") { const e = expr(); expect(")"); return { paren: e }; }
    throw new Error(`unexpected "${t.v}"`);
  }
  const ast = expr();
  if (k < toks.length) throw new Error(`unexpected "${toks[k].v}"`);
  return ast;
}

export function evalExpr(ast, vars) {
  const ev = (n) => {
    if (n.n !== undefined) return n.n;
    if (n.v !== undefined) {
      if (vars[n.v] !== undefined) return vars[n.v];
      if (CONSTS[n.v] !== undefined) return CONSTS[n.v];
      throw new Error(`no value for "${n.v}"`);
    }
    if (n.paren) return ev(n.paren);
    if (n.neg) return -ev(n.neg);
    if (n.fn) return FNS[n.fn](...n.args.map(ev));
    const a = ev(n.a), b = ev(n.b);
    return n.op === "+" ? a + b : n.op === "-" ? a - b : n.op === "*" ? a * b : n.op === "/" ? a / b : a ** b;
  };
  return ev(ast);
}

export function names(ast, out = new Set()) {
  if (ast.v !== undefined) out.add(ast.v);
  for (const c of [ast.a, ast.b, ast.neg, ast.paren, ...(ast.args || [])]) if (c) names(c, out);
  return out;
}

// Splits "R = v^2 * sin(2*a) / g" into { out: "R", expr: "v^2 * sin(2*a) / g" }.
export function splitFormula(f) {
  const m = String(f).match(/^\s*([A-Za-z_]\w*)\s*=(.*)$/);
  return m ? { out: m[1], expr: m[2] } : { out: "", expr: String(f) };
}

// TeX for display: fractions for "/", superscripts for "^", \sqrt, \sin ...
const GREEK = new Set(["alpha", "beta", "gamma", "delta", "theta", "lambda", "mu", "sigma", "omega", "phi", "rho", "tau", "pi"]);
const nameTeX = (s) => {
  if (GREEK.has(s)) return `\\${s}`;
  // v_0, N0 and x_max all get a subscript.
  const m = s.match(/^([A-Za-z]+?)(?:_(\w+)|(\d+))$/);
  if (m) return `${nameTeX(m[1])}_{${m[2] || m[3]}}`;
  return s.length > 1 ? `\\mathit{${s}}` : s;
};
export function toTeX(ast) {
  const t = (n, parent) => {
    if (n.n !== undefined) return String(n.n);
    if (n.v !== undefined) return nameTeX(n.v);
    if (n.paren) return n.paren.op === "/" ? t(n.paren) : `\\left(${t(n.paren)}\\right)`;
    if (n.neg) return `-${t(n.neg, "neg")}`;
    if (n.fn) {
      const args = n.args.map((a) => t(a));
      if (n.fn === "sqrt") return `\\sqrt{${args[0]}}`;
      if (n.fn === "abs") return `\\left|${args[0]}\\right|`;
      // e^x reads best, unless the exponent holds a fraction too small to read.
      if (n.fn === "exp" && args.length === 1 && !args[0].includes("\\frac")) return `e^{${args[0]}}`;
      const known = ["sin", "cos", "tan", "exp", "ln", "log", "min", "max"].includes(n.fn);
      return `${known ? `\\${n.fn}` : `\\operatorname{${n.fn}}`}\\left(${args.join(", ")}\\right)`;
    }
    // A fraction bar and a superscript already group, so drop their parens.
    const bare = (x) => (x.paren ? x.paren : x);
    if (n.op === "/") return `\\frac{${t(bare(n.a))}}{${t(bare(n.b))}}`;
    if (n.op === "^") return `${n.a.n !== undefined || n.a.v !== undefined || n.a.paren ? t(n.a, "^") : `\\left(${t(n.a)}\\right)`}^{${t(bare(n.b))}}`;
    if (n.op === "*") {
      // Juxtapose (2a, v^2 \sin ...) unless the right side starts with a digit.
      const a = t(n.a, "*"), b = t(n.b, "*");
      if (/^[\d.-]/.test(b)) return `${a} \\cdot ${b}`;
      return n.a.n !== undefined ? `${a}${b}` : `${a}\\,${b}`;
    }
    const s = `${t(n.a)} ${n.op} ${t(n.b)}`;
    return parent === "*" || parent === "^" || parent === "neg" ? `\\left(${s}\\right)` : s;
  };
  return t(ast);
}

"use client";

// game (YUI-59): a small game on the phone, one line. tictactoe is turn-based
// against the agent (a tap is a move event, the agent answers with a patch of
// its own cells), snake and memory run on the phone and send one event at the
// end. Any other kind says it is not in this version.
import { useEffect, useRef, useState } from "react";
import { GAMES } from "../../lib/yl/yl.mjs";

const LINES = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]];
const buzz = (ms) => { try { navigator.vibrate?.(ms); } catch { /* no haptics on this device */ } };

// The winning line for a board, "draw" when it is full, else null.
export function tttWinner(x, o) {
  for (const l of LINES) {
    if (l.every((c) => x.includes(c))) return { mark: "x", line: l };
    if (l.every((c) => o.includes(c))) return { mark: "o", line: l };
  }
  return x.length + o.length >= 9 ? { mark: "draw", line: [] } : null;
}

// The playground's stand-in agent: wins if it can, blocks if it must, else
// the middle, a corner, an edge. Returns the patch line, or null.
export function demoReply(ev) {
  if (ev.preset !== "game" || ev.kind !== "tictactoe" || ev.winner || ev.again || !Array.isArray(ev.x)) return null;
  const me = ev.x.includes(ev.move) ? "o" : "x";
  const mine = me === "o" ? ev.o : ev.x;
  const theirs = me === "o" ? ev.x : ev.o;
  const free = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((c) => !mine.includes(c) && !theirs.includes(c));
  if (!free.length) return null;
  const completes = (cells) => free.find((c) => LINES.some((l) => l.includes(c) && l.filter((k) => k !== c).every((k) => cells.includes(k))));
  const pick = completes(mine) ?? completes(theirs) ?? [5, 1, 3, 7, 9, 2, 4, 6, 8].find((c) => free.includes(c));
  return `~game ${me}=${[...mine, pick].join("|")}`;
}

export function Game({ p, emit }) {
  const kind = p.kind;
  if (!GAMES.includes(kind)) {
    return (
      <div className="yl-block yl-game">
        {p.title ? <div className="yl-q">{p.title}</div> : null}
        <div className="yl-gamenote">{kind ? "This game isn't in this version of Yui." : "No game named on this line."}</div>
      </div>
    );
  }
  const C = { tictactoe: TicTacToe, snake: Snake, memory: Memory }[kind];
  return <C p={p} emit={(v) => emit({ kind, ...v })} />;
}

function TicTacToe({ p, emit }) {
  const you = p.you === "o" ? "o" : "x";
  const them = you === "x" ? "o" : "x";
  // The person's cells live here until the agent echoes them; the agent's
  // come in through patches. After Play again the old props are stale until
  // the next patch changes them.
  const [mine, setMine] = useState([]);
  const [stale, setStale] = useState(null);
  const sig = JSON.stringify([p.x, p.o]);
  useEffect(() => { if (stale && stale !== sig) setStale(null); }, [sig, stale]);
  const fromProps = stale === sig ? { x: [], o: [] } : { x: p.x, o: p.o };
  const merged = { ...fromProps, [you]: [...new Set([...fromProps[you], ...mine])] };
  const x = merged.x;
  const o = merged.o.filter((c) => !x.includes(c));
  const my = you === "x" ? x : o;
  const their = you === "x" ? o : x;
  const win = tttWinner(x, o);
  const myTurn = !win && (p.first === "agent" ? their.length > my.length : my.length === their.length);

  const tap = (c) => {
    if (!myTurn || p.lock || x.includes(c) || o.includes(c)) return;
    buzz(8);
    setMine([...mine, c]);
    const nx = you === "x" ? [...x, c] : x;
    const no = you === "o" ? [...o, c] : o;
    const w = tttWinner(nx, no);
    if (w) buzz(w.mark === you ? [20, 40, 20] : 30);
    emit({ move: c, x: nx, o: no, ...(w ? { winner: w.mark } : {}) });
  };
  const again = () => { setMine([]); setStale(sig); emit({ again: true }); };
  const status = win
    ? win.mark === "draw" ? "Draw." : win.mark === you ? "You win!" : "The agent wins."
    : myTurn ? "Your turn" : "Their move…";

  return (
    <div className={`yl-block yl-game ttt ${p.lock ? "locked" : ""}`}>
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      <div className={`yl-gamestatus ${win ? "over" : ""}`} aria-live="polite">{status}</div>
      <div className="yl-ttt" role="grid" aria-label="Tic-tac-toe board">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => {
          const m = x.includes(c) ? "x" : o.includes(c) ? "o" : "";
          const hot = win?.line.includes(c);
          return (
            <button key={c} className={`yl-tttcell ${m} ${hot ? "hot" : ""}`} disabled={!!m || !myTurn || !!p.lock}
              aria-label={m ? `Cell ${c}, ${m.toUpperCase()}` : `Cell ${c}, empty`} onClick={() => tap(c)}>
              {m ? <span>{m === "x" ? "✕" : "◯"}</span> : null}
            </button>
          );
        })}
      </div>
      {win ? <button className="bigbtn p acc full" onClick={again}>Play again</button> : null}
    </div>
  );
}

const SPEED_MS = [220, 220, 165, 125, 95, 70];
const clampInt = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };

function Snake({ p, emit }) {
  const size = clampInt(p.size, 10, 20, 15);
  const speed = clampInt(p.speed, 1, 5, 2);
  const start = () => {
    const m = Math.floor(size / 2);
    return { snake: [[m, m], [m - 1, m], [m - 2, m]], dir: [1, 0], next: [1, 0], food: [Math.min(size - 2, m + 4), m], score: 0 };
  };
  const [g, setG] = useState(start);
  const [phase, setPhase] = useState("ready"); // ready | play | over
  const [best, setBest] = useState(Number(p.best) || 0);
  const gs = useRef(g);
  gs.current = g;

  useEffect(() => {
    if (phase !== "play") return undefined;
    const t = setInterval(() => {
      const s = gs.current;
      const dir = s.next[0] === -s.dir[0] && s.next[1] === -s.dir[1] ? s.dir : s.next;
      const head = [s.snake[0][0] + dir[0], s.snake[0][1] + dir[1]];
      const eats = head[0] === s.food[0] && head[1] === s.food[1];
      const body = eats ? s.snake : s.snake.slice(0, -1);
      const out = head[0] < 0 || head[1] < 0 || head[0] >= size || head[1] >= size;
      if (out || body.some(([a, b]) => a === head[0] && b === head[1])) {
        clearInterval(t);
        buzz(60);
        setPhase("over");
        setBest((b) => Math.max(b, s.score));
        emit({ over: true, score: s.score });
        return;
      }
      const snake = [head, ...body];
      let food = s.food;
      if (eats) {
        buzz(12);
        const free = [];
        for (let yy = 0; yy < size; yy++) for (let xx = 0; xx < size; xx++) if (!snake.some(([a, b]) => a === xx && b === yy)) free.push([xx, yy]);
        food = free[Math.floor(Math.random() * free.length)] || s.food;
      }
      setG({ ...s, snake, dir, food, score: s.score + (eats ? 1 : 0) });
    }, SPEED_MS[speed]);
    return () => clearInterval(t);
  }, [phase, size, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const steer = (d) => {
    if (phase === "ready") setPhase("play");
    if (phase === "over") return;
    setG((s) => ({ ...s, next: d }));
  };
  const keys = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  const touch = useRef(null);
  const cells = new Map(g.snake.map(([a, b], i) => [`${a},${b}`, i === 0 ? "head" : "body"]));
  cells.set(`${g.food[0]},${g.food[1]}`, "food");

  return (
    <div className="yl-block yl-game snake">
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      <div className="yl-gamestatus" aria-live="polite">
        <span>Score {g.score}</span>{best ? <span className="yl-gamebest">Best {best}</span> : null}
      </div>
      <div className="yl-snake" tabIndex={0} role="application" aria-label="Snake board. Arrow keys or swipe to steer."
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        onKeyDown={(e) => { if (keys[e.key]) { e.preventDefault(); steer(keys[e.key]); } }}
        onPointerDown={(e) => { touch.current = [e.clientX, e.clientY]; }}
        onPointerUp={(e) => {
          if (!touch.current) return;
          const dx = e.clientX - touch.current[0], dy = e.clientY - touch.current[1];
          touch.current = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
          steer(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
        }}>
        {Array.from({ length: size * size }, (_, i) => <i key={i} className={cells.get(`${i % size},${Math.floor(i / size)}`) || ""} />)}
        {phase !== "play" ? (
          <div className="yl-snakeover">
            {phase === "over" ? <b>Game over · {g.score}</b> : null}
            <button className="bigbtn p acc" onClick={() => { setG(start()); setPhase("play"); }}>{phase === "over" ? "Play again" : "Start"}</button>
          </div>
        ) : null}
      </div>
      <div className="yl-pad">
        <button aria-label="Up" onClick={() => steer([0, -1])}>▲</button>
        <button aria-label="Left" onClick={() => steer([-1, 0])}>◀</button>
        <button aria-label="Down" onClick={() => steer([0, 1])}>▼</button>
        <button aria-label="Right" onClick={() => steer([1, 0])}>▶</button>
      </div>
    </div>
  );
}

const FACES = ["🍎", "🍋", "🍇", "🍓", "🍒", "🥝", "🍑", "🍍", "🥥", "🍉", "🫐", "🍌"];
function deal(p) {
  const n = clampInt(p.pairs, 2, 12, 6);
  const faces = (p.items.length ? p.items : FACES).slice(0, n);
  const deck = [...faces, ...faces].map((f, i) => ({ f, k: i }));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}

function Memory({ p, emit }) {
  const [deck, setDeck] = useState(() => deal(p));
  const [up, setUp] = useState([]);       // indexes face up, not yet matched
  const [got, setGot] = useState([]);     // matched indexes
  const [moves, setMoves] = useState(0);
  const t0 = useRef(null);
  const [secs, setSecs] = useState(null);
  const done = got.length === deck.length;

  const flip = (i) => {
    if (done || up.length === 2 || up.includes(i) || got.includes(i)) return;
    if (t0.current === null) t0.current = Date.now();
    buzz(6);
    const u = [...up, i];
    setUp(u);
    if (u.length < 2) return;
    const m = moves + 1;
    setMoves(m);
    if (deck[u[0]].f === deck[u[1]].f) {
      const g = [...got, ...u];
      setTimeout(() => {
        setGot(g); setUp([]); buzz(15);
        if (g.length === deck.length) {
          const s = Math.round((Date.now() - t0.current) / 1000);
          setSecs(s);
          emit({ over: true, moves: m, seconds: s });
        }
      }, 250);
    } else {
      setTimeout(() => setUp([]), 800);
    }
  };
  const again = () => { setDeck(deal(p)); setUp([]); setGot([]); setMoves(0); setSecs(null); t0.current = null; };
  const cols = deck.length <= 12 ? 4 : deck.length <= 20 ? 5 : 6;

  return (
    <div className="yl-block yl-game memory">
      {p.title ? <div className="yl-q">{p.title}</div> : null}
      <div className="yl-gamestatus" aria-live="polite">
        {done ? `All ${deck.length / 2} pairs in ${moves} moves, ${secs}s.` : `Moves ${moves}`}
      </div>
      <div className="yl-memory" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {deck.map((c, i) => {
          const shown = up.includes(i) || got.includes(i);
          return (
            <button key={c.k} className={`yl-memcard ${shown ? "up" : ""} ${got.includes(i) ? "got" : ""}`}
              aria-label={shown ? c.f : "Hidden card"} onClick={() => flip(i)}>
              <span className="back" aria-hidden="true" />
              <span className={`face ${[...c.f].length > 2 ? "word" : ""}`}>{c.f}</span>
            </button>
          );
        })}
      </div>
      {done ? <button className="bigbtn p acc full" onClick={again}>Play again</button> : null}
    </div>
  );
}

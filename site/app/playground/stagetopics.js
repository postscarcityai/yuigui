"use client";

// One thought per full screen (feedback APOmDkahSl2ApP7vrgIC820, Chris Oct 5): the stage piled up ~30
// pages from answers that had nothing to do with each other. Three ways to fix it, drawn as phones:
// A the stage holds the newest answer, B one stage per topic, C a new chat per topic.
// Hand-drawn mocks with made-up rows (examples), no events leave the page.

import "./stagetopics.css";

export const STAGETOPICS_VIEWS = [
  ["now", "Now"],
  ["a", "A: Newest only"],
  ["b", "B: Topic stages"],
  ["c", "C: Chat per topic"],
];

const TOPICS = [
  { k: "ship", t: "Build 160 is live", n: 4 },
  { k: "bar", t: "Group chats bar", n: 3 },
  { k: "board", t: "Board update", n: 5 },
  { k: "push", t: "Push cards", n: 4 },
];

function Segs({ n, at, gaps = [] }) {
  return (
    <div className="stp-segs" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className={`${i <= at ? "on" : ""} ${gaps.includes(i) ? "gap" : ""}`} />
      ))}
    </div>
  );
}

function Bar({ title, dot }) {
  return (
    <div className="stp-bar">
      <span className="stp-pill"><b>U</b>{title}{dot ? <i /> : null}</span>
      <span className="stp-round">chat</span>
    </div>
  );
}

function Page({ title, body }) {
  return (
    <div className="stp-page">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function Note({ tone, children }) {
  return <div className={`stp-note ${tone || ""}`}>{children}</div>;
}

function Now() {
  return (
    <div className="stp-wrap">
      <Bar title="Urza's Yui" dot />
      <Segs n={29} at={17} />
      <div className="stp-cap">I told you what to do</div>
      <Page title="2 · unslotted" body="Group chats in Yui had a bare text box. Now they get the same bar as a one-on-one chat." />
      <Note tone="bad">29 pages. Build news, board status, push cards, a lane update: none relate. Every agent message after your last words lands on one stage.</Note>
    </div>
  );
}

function A() {
  return (
    <div className="stp-wrap">
      <Bar title="Urza's Yui" />
      <Segs n={3} at={0} />
      <Page title="Group chats get the bar" body="Same bar as a one-on-one chat: + photos, T type, big mic. Start with @ to ask one agent." />
      <div className="stp-strip">
        <span className="stp-label">Earlier</span>
        <button>Build 160 is live</button>
        <button>Board update</button>
        <button>Push cards</button>
      </div>
      <Note tone="good">The stage holds only the newest answer. Older answers fold into chips under it. A tap on a chip brings that answer back on the stage.</Note>
      <ul className="stp-cons">
        <li><b>+</b> Small change. Nothing changes on the server.</li>
        <li><b>−</b> Chips pile up too, on a busy day.</li>
      </ul>
    </div>
  );
}

function B() {
  const gaps = [3, 6, 11];
  return (
    <div className="stp-wrap">
      <Bar title="Urza's Yui" />
      <div className="stp-topics">
        {TOPICS.map((t, i) => <span key={t.k} className={i === 1 ? "on" : ""}>{t.t}</span>)}
      </div>
      <Segs n={16} at={5} gaps={gaps} />
      <Page title="Group chats get the bar" body="Same bar as a one-on-one chat: + photos, T type, big mic." />
      <Note tone="good">One stage per topic. Dashes group by topic, with a gap between. Swipe down to the next topic, up to the last.</Note>
      <ul className="stp-cons">
        <li><b>+</b> Nothing is lost. Every answer keeps its place.</li>
        <li><b>−</b> The app must guess what is one topic. Wrong guesses split a story.</li>
      </ul>
    </div>
  );
}

function C() {
  return (
    <div className="stp-wrap">
      <Bar title="Urza's Yui" />
      <Segs n={3} at={1} />
      <Page title="Group chats get the bar" body="Same bar as a one-on-one chat: + photos, T type, big mic." />
      <div className="stp-chats">
        <div className="stp-chat on"><b>Group chats bar</b><span>now</span></div>
        <div className="stp-chat"><b>Build 160 is live</b><span>9:02</span></div>
        <div className="stp-chat"><b>Board update</b><span>8:30</span></div>
        <div className="stp-chat"><b>Push cards</b><span>Mon</span></div>
      </div>
      <Note tone="good">The agent starts a new chat when the topic changes. Each chat is its own Hermes session. Memory is shared, the thread is not.</Note>
      <ul className="stp-cons">
        <li><b>+</b> Clean: the stage and the record both hold one topic.</li>
        <li><b>−</b> The agent has to judge topics. A new session forgets the thread, keeps memory.</li>
      </ul>
    </div>
  );
}

export function StageTopicsDemo({ view }) {
  return (
    <div className="stp-app">
      {view === "a" ? <A /> : view === "b" ? <B /> : view === "c" ? <C /> : <Now />}
    </div>
  );
}

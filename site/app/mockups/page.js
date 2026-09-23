export const metadata = { title: "Mockups | Yui" };

function Mic() {
  return (
    <div className="mic">
      <svg viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" /></svg>
    </div>
  );
}

function Phone({ children }) {
  return (
    <div className="phone"><div className="screen"><div className="notch" /><div className="sbar" />{children}</div></div>
  );
}

function Header({ name, status, color, initial }) {
  return (
    <div className="ahead">
      <div className="avatar" style={{ background: color }}>{initial}</div>
      <div><div className="nm">{name}</div><div className="st">{status}</div></div>
    </div>
  );
}

function ChatMock() {
  return (
    <Phone>
      <Header name="Urza" status="online | chief of staff" color="linear-gradient(135deg,#8b7cff,#4fd1c5)" initial="U" />
      <div className="msgs">
        <div className="b out">Book the client call for Thursday</div>
        <div className="b in">Thursday works. Which slot?</div>
        <div className="chips">
          <span className="chip">3:00 pm</span>
          <span className="chip on">4:00 pm</span>
          <span className="chip">Type your own</span>
        </div>
        <div className="b out">4:00 pm</div>
        <div className="b in">Done. Should I send the invite now?</div>
        <div className="bigbtns">
          <div className="bigbtn p" style={{ background: "var(--accent)", height: 44 }}>Yes, send</div>
          <div className="bigbtn s" style={{ height: 44 }}>Not yet</div>
        </div>
      </div>
      <div className="compose"><div className="in">Message Urza</div><Mic /></div>
    </Phone>
  );
}

function TimerMock() {
  return (
    <Phone>
      <Header name="Arnold" status="training | intervals 40/20 x 8" color="var(--arnold)" initial="A" />
      <div className="timer">
        <div className="lbl" style={{ color: "var(--arnold)" }}>Round 5 of 8</div>
        <div className="ring"><div className="innr"><div className="t">0:26</div><div className="ph">WORK</div></div></div>
        <div className="rounds">{[1,2,3,4,5,6,7,8].map((r) => <span key={r} className={r < 5 ? "d" : ""} />)}</div>
        <div className="b in" style={{ alignSelf: "center", textAlign: "center" }}>Push. Rest is 20 seconds away.</div>
        <div className="bigbtns">
          <div className="bigbtn s">Pause</div>
          <div className="bigbtn p">Skip rest</div>
        </div>
      </div>
      <div className="compose"><div className="in">Tell Arnold</div><Mic /></div>
    </Phone>
  );
}

function OnboardingMock() {
  return (
    <Phone>
      <div className="ob">
        <div className="progressdots"><span /><span className="on" /><span /><span /></div>
        <div className="lbl">Welcome to Yui</div>
        <div className="q">Nice to meet you, Chris. A couple of quick ones.</div>
        <div>
          <div className="lbl" style={{ marginBottom: 6 }}>Your name</div>
          <div className="field">Chris</div>
        </div>
        <div>
          <div className="lbl">How much do you know about AI?</div>
          <div className="slider"><div className="fill" /><div className="knob" /></div>
          <div className="slabels"><span>Brand new</span><span>I run agents</span></div>
        </div>
        <div>
          <div className="lbl" style={{ marginBottom: 8 }}>What do you want help with? Pick any.</div>
          <div className="chips">
            <span className="chip on">Workouts</span>
            <span className="chip on">Nutrition</span>
            <span className="chip">Calendar</span>
            <span className="chip on">Clients</span>
            <span className="chip">Email</span>
            <span className="chip">Type your own</span>
          </div>
        </div>
        <div className="bigbtn p" style={{ background: "var(--accent)", marginTop: "auto", height: 46, flex: "none" }}>Continue</div>
      </div>
      <div className="compose"><div className="in">Or just tell me</div><Mic /></div>
    </Phone>
  );
}

export default function Mockups() {
  return (
    <>
      <div className="eyebrow">Mockups | static, early</div>
      <h1>Three screens.</h1>
      <p className="lede">
        What the agent could render with the component kit. Chat is home. Arnold builds a timer on request.
        New users get an interview that is itself generated UI.
      </p>
      <div className="phones">
        <div className="phonebox"><ChatMock /><div className="cap"><b>Chat</b>. Questions come back as buttons, with a type-your-own escape hatch.</div></div>
        <div className="phonebox"><TimerMock /><div className="cap"><b>Arnold&apos;s interval timer</b>. &quot;Intervals of 40/20 x 8&quot; becomes this screen, in Arnold&apos;s colors.</div></div>
        <div className="phonebox"><OnboardingMock /><div className="cap"><b>Onboarding interview</b>. Name field, AI-level slider, multi-select goals, mic button.</div></div>
      </div>
    </>
  );
}

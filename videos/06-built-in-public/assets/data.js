window.DATA = {
 "facts": {
  "commits": 618,
  "builds": 35,
  "shiplog": 233,
  "firstBuild": {
   "build": 4,
   "date": "2026-09-23"
  },
  "newest": {
   "build": 176,
   "version": "0.3.2",
   "date": "2026-09-26"
  },
  "timelineTotals": {
   "app": 177,
   "site": 441,
   "builds": 34,
   "shipped": 228,
   "screenshots": 499
  }
 },
 "board": {
  "backlog": {
   "title": "Backlog",
   "count": 36,
   "cards": [
    {
     "key": "YUI-37",
     "title": "A starter agent for people with no agent",
     "waiting": true
    },
    {
     "key": "YUI-40",
     "title": "Widgets and Siri",
     "summary": "Agents outside the app",
     "waiting": true
    },
    {
     "key": "YUI-46",
     "title": "Android",
     "summary": "Decision and a Compose prototype",
     "waiting": true
    },
    {
     "key": "YUI-47",
     "title": "Apple Watch",
     "summary": "Timer and quick answers on the wrist"
    },
    {
     "key": "OSS-8",
     "title": "A Yui Lines parser in Go",
     "agentReady": true
    }
   ]
  },
  "next": {
   "title": "Up next",
   "count": 3,
   "cards": [
    {
     "key": "YUI-29",
     "title": "A stranger does the whole path",
     "mvp": true
    },
    {
     "key": "YUI-116",
     "step": "Step 4",
     "title": "Tuner + metronome in the app"
    },
    {
     "key": "YUI-116",
     "step": "Step 5",
     "title": "Recording, export, MIDI and Ableton Link"
    }
   ]
  },
  "building": {
   "title": "Building",
   "count": 11,
   "cards": [
    {
     "key": "INT-8",
     "title": "ChatGPT adapter through the Yui MCP server",
     "summary": "Yui screens in ChatGPT too"
    },
    {
     "key": "YUI-37",
     "step": "Step 2",
     "title": "The hosted starter agent on Cloudflare"
    },
    {
     "key": "YUI-116",
     "step": "Step 3",
     "title": "Keys + chords in the app",
     "summary": "Keys and chords you can play in the app",
     "waiting": true
    },
    {
     "key": "YUI-119",
     "step": "Step 1",
     "title": "Full screen first, the chat is the record",
     "summary": "Spec + playground mock",
     "waiting": true
    }
   ]
  },
  "shipped": {
   "title": "Shipped (last 30 days)",
   "count": 210,
   "cards": [
    {
     "key": "YUI-63",
     "step": "Step 2",
     "title": "The working row shows what the agent is doing, with a bar",
     "summary": "It says what it is doing",
     "shipped": "2026-09-26"
    },
    {
     "key": "YUI-107",
     "title": "Speed rows send once",
     "summary": "Speed numbers are stored once",
     "shipped": "2026-09-26"
    },
    {
     "key": "YUI-14",
     "title": "Voice in, text out, smooth and fast",
     "summary": "Talk to your agents hands-free, read the answers",
     "shipped": "2026-09-26"
    },
    {
     "key": "YUI-104",
     "title": "Shapes that move",
     "shipped": "2026-09-26"
    }
   ]
  }
 },
 "note": {
  "title": "What you were typing stays put",
  "quote": "I was writing in the text box and then a new answer came in and took over the screen with a full screen. But then when I came back my query was lost.",
  "date": "2026-09-26",
  "shots": [
   "assets/img/fb-ak9fnezu-3-back.webp",
   "assets/img/fb-ak9fnezu-4-relaunch.webp"
  ]
 },
 "builds": [
  {
   "build": 176,
   "date": "2026-09-26",
   "changes": [
    {
     "text": "Hold to reply, no more swipe: the sideways drag always pages"
    },
    {
     "text": "DrawerTests pass again: the About card's id no longer covers its button"
    },
    {
     "text": "A quiet dot on the menu button, no count; it goes the moment nothing waits"
    },
    {
     "text": "It says what it is doing",
     "key": "YUI-63"
    },
    {
     "text": "Agents make their own flows: variants",
     "key": "FLOW-1"
    },
    {
     "text": "The working row says what the agent is doing (YUI-63 step 2, app half)"
    },
    {
     "text": "Speed numbers are stored once",
     "key": "YUI-107"
    },
    {
     "text": "yui_library: agents find ready-made screens and flows over MCP; guide v28 (FLOW-2 step 2)"
    },
    {
     "text": "Outside agents draw like the app",
     "key": "INT-3"
    },
    {
     "text": "Flow variants reach the copies (FLOW-1 step 3, yuigui cbf1e7a)"
    },
    {
     "text": "Music vectors wait for the app half (YUI-116 step 1)"
    },
    {
     "text": "yui-mcp reads and draws the music presets (YUI-116 step 1, yuigui 5414ba3)"
    },
    {
     "text": "Working row says how long this agent usually takes"
    },
    {
     "text": "Swift parser reads the six music presets; 37-music.json passes (YUI-116 step 2)"
    },
    {
     "text": "YuiSound, and loop and drums that play (YUI-116 step 2)"
    },
    {
     "text": "Yui 0.3.2: ship main to TestFlight"
    }
   ]
  },
  {
   "build": 160,
   "date": "2026-09-26",
   "changes": [
    {
     "text": "Half-typed words stay: each agent's thread keeps its own draft"
    },
    {
     "text": "Channel guide v25 bundled: a lesson is one screen"
    },
    {
     "text": "A lesson is one deck",
     "key": "YUI-113"
    },
    {
     "text": "An answered war room ask leaves at once: the plugin redraws the war room after a tap"
    },
    {
     "text": "Yui 0.3.1: ship main to TestFlight"
    }
   ]
  },
  {
   "build": 155,
   "date": "2026-09-26",
   "changes": [
    {
     "text": "Channel guide v24 (YUI-111): a timeline row moves on by patch, kind=done|now|next"
    },
    {
     "text": "Yui holds less in memory, and a test checks it before every release",
     "key": "YUI-100"
    },
    {
     "text": "A full screen takes the keyboard down with it; closing it leaves it down"
    },
    {
     "text": "Voice in, text out (YUI-14): SpeechAnalyzer, hands-free, talk or type per agent"
    },
    {
     "text": "Talk to your agents hands-free, read the answers",
     "key": "YUI-14"
    },
    {
     "text": "CI: hands-off guard diffs the PR head, not the merge commit"
    },
    {
     "text": "A plan's question sits in the middle of the screen, no card inside the page"
    }
   ]
  }
 ],
 "strip": [
  {
   "src": "assets/img/strip00.webp",
   "w": 294,
   "h": 640,
   "title": "Yui gets a face",
   "card": "YUI-2",
   "day": "Wed, Sep 23",
   "totals": {
    "app": 5,
    "site": 14,
    "builds": 1,
    "shipped": 11
   },
   "n": 3
  },
  {
   "src": "assets/img/strip01.webp",
   "w": 294,
   "h": 640,
   "title": "Yui drops the cat",
   "card": "YUI-9",
   "day": "Wed, Sep 23",
   "totals": {
    "app": 10,
    "site": 21,
    "builds": 4,
    "shipped": 15
   },
   "n": 6
  },
  {
   "src": "assets/img/strip02.webp",
   "w": 294,
   "h": 640,
   "title": "Every agent has its own look",
   "card": "YUI-20",
   "day": "Thu, Sep 24",
   "totals": {
    "app": 19,
    "site": 48,
    "builds": 10,
    "shipped": 35
   },
   "n": 16
  },
  {
   "src": "assets/img/strip03.webp",
   "w": 294,
   "h": 640,
   "title": "Every preset, native on iPhone",
   "card": "YUI-19",
   "day": "Thu, Sep 24",
   "totals": {
    "app": 27,
    "site": 62,
    "builds": 16,
    "shipped": 40
   },
   "n": 20
  },
  {
   "src": "assets/img/strip04.webp",
   "w": 353,
   "h": 640,
   "title": "The site menu works on a phone",
   "card": "SITE-8",
   "day": "Thu, Sep 24",
   "totals": {
    "app": 35,
    "site": 80,
    "builds": 21,
    "shipped": 49
   },
   "n": 27
  },
  {
   "src": "assets/img/strip05.webp",
   "w": 296,
   "h": 640,
   "title": "The site catches up with the app",
   "card": "SITE-11",
   "day": "Thu, Sep 24",
   "totals": {
    "app": 41,
    "site": 90,
    "builds": 21,
    "shipped": 56
   },
   "n": 31
  },
  {
   "src": "assets/img/strip06.webp",
   "w": 294,
   "h": 640,
   "title": "Save a screen, bring it back with two tokens: every agent gets a shelf",
   "card": "YUI-32",
   "day": "Thu, Sep 24",
   "totals": {
    "app": 49,
    "site": 115,
    "builds": 21,
    "shipped": 71
   },
   "n": 44
  },
  {
   "src": "assets/img/strip07.webp",
   "w": 296,
   "h": 640,
   "title": "Get started, the specs and Privacy, checked for strangers",
   "card": "SITE-23",
   "day": "Thu, Sep 24",
   "totals": {
    "app": 57,
    "site": 139,
    "builds": 21,
    "shipped": 84
   },
   "n": 55
  },
  {
   "src": "assets/img/strip08.webp",
   "w": 294,
   "h": 640,
   "title": "Build 57: every fix you sent is on your phone",
   "card": "YUI-52",
   "day": "Thu, Sep 24",
   "totals": {
    "app": 60,
    "site": 154,
    "builds": 22,
    "shipped": 90
   },
   "n": 60
  },
  {
   "src": "assets/img/strip09.webp",
   "w": 294,
   "h": 640,
   "title": "Build 64: hold to talk, with a waveform and a trash can",
   "card": null,
   "day": "Fri, Sep 25",
   "totals": {
    "app": 64,
    "site": 164,
    "builds": 23,
    "shipped": 95
   },
   "n": 64
  },
  {
   "src": "assets/img/strip10.webp",
   "w": 294,
   "h": 640,
   "title": "Drag the war room queue into your own order",
   "card": "YUI-66",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 70,
    "site": 180,
    "builds": 24,
    "shipped": 101
   },
   "n": 70
  },
  {
   "src": "assets/img/strip11.webp",
   "w": 294,
   "h": 640,
   "title": "Reply to one message",
   "card": "YUI-68",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 73,
    "site": 190,
    "builds": 24,
    "shipped": 107
   },
   "n": 75
  },
  {
   "src": "assets/img/strip12.webp",
   "w": 294,
   "h": 640,
   "title": "@ another agent from any thread",
   "card": "YUI-44",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 78,
    "site": 204,
    "builds": 25,
    "shipped": 112
   },
   "n": 80
  },
  {
   "src": "assets/img/strip13.webp",
   "w": 294,
   "h": 640,
   "title": "No more text bombs",
   "card": "YUI-79",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 86,
    "site": 223,
    "builds": 26,
    "shipped": 120
   },
   "n": 87
  },
  {
   "src": "assets/img/strip14.webp",
   "w": 294,
   "h": 640,
   "title": "Chat with a screen",
   "card": "YUI-62",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 100,
    "site": 250,
    "builds": 28,
    "shipped": 132
   },
   "n": 92
  },
  {
   "src": "assets/img/strip15.webp",
   "w": 294,
   "h": 640,
   "title": "Asks sit with what they ask about",
   "card": "Feedback",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 108,
    "site": 268,
    "builds": 28,
    "shipped": 142
   },
   "n": 99
  },
  {
   "src": "assets/img/strip16.webp",
   "w": 294,
   "h": 640,
   "title": "Screens your Yui can't draw yet turn into words",
   "card": "YUI-87",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 116,
    "site": 284,
    "builds": 28,
    "shipped": 150
   },
   "n": 104
  },
  {
   "src": "assets/img/strip17.webp",
   "w": 363,
   "h": 640,
   "title": "Connect your tools: the plan, and a flow you can try",
   "card": "YUI-39",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 120,
    "site": 296,
    "builds": 28,
    "shipped": 156
   },
   "n": 109
  },
  {
   "src": "assets/img/strip18.webp",
   "w": 294,
   "h": 640,
   "title": "Share an agent with a client, and take it back",
   "card": "YUI-95",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 126,
    "site": 306,
    "builds": 29,
    "shipped": 162
   },
   "n": 114
  },
  {
   "src": "assets/img/strip19.webp",
   "w": 330,
   "h": 640,
   "title": "Meal photo to macros, in the playground",
   "card": "YUI-35",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 128,
    "site": 313,
    "builds": 29,
    "shipped": 166
   },
   "n": 118
  },
  {
   "src": "assets/img/strip20.webp",
   "w": 294,
   "h": 640,
   "title": "Typing keeps up, even on a long thread",
   "card": "YUI-99",
   "day": "Fri, Sep 25",
   "totals": {
    "app": 134,
    "site": 326,
    "builds": 29,
    "shipped": 172
   },
   "n": 123
  },
  {
   "src": "assets/img/strip21.webp",
   "w": 363,
   "h": 640,
   "title": "Agent controls, designed: change what your agent is made of",
   "card": "YUI-70",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 139,
    "site": 337,
    "builds": 31,
    "shipped": 176
   },
   "n": 127
  },
  {
   "src": "assets/img/strip22.webp",
   "w": 364,
   "h": 640,
   "title": "A timeline row can move without resending the page",
   "card": "YUI-111",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 141,
    "site": 347,
    "builds": 31,
    "shipped": 181
   },
   "n": 132
  },
  {
   "src": "assets/img/strip23.webp",
   "w": 374,
   "h": 640,
   "title": "Every agent can put a picture on a page",
   "card": "YUI-85",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 147,
    "site": 359,
    "builds": 31,
    "shipped": 186
   },
   "n": 135
  },
  {
   "src": "assets/img/strip24.webp",
   "w": 354,
   "h": 640,
   "title": "A starter agent, planned and priced",
   "card": "YUI-37",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 154,
    "site": 378,
    "builds": 32,
    "shipped": 192
   },
   "n": 139
  },
  {
   "src": "assets/img/strip25.webp",
   "w": 320,
   "h": 640,
   "title": "The model on the phone, planned",
   "card": "YUI-41",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 155,
    "site": 384,
    "builds": 33,
    "shipped": 196
   },
   "n": 143
  },
  {
   "src": "assets/img/strip26.webp",
   "w": 309,
   "h": 640,
   "title": "A key vault, planned",
   "card": "YUI-34",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 157,
    "site": 393,
    "builds": 33,
    "shipped": 201
   },
   "n": 148
  },
  {
   "src": "assets/img/strip27.webp",
   "w": 309,
   "h": 640,
   "title": "Sync, decided: not in v1",
   "card": "YUI-36",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 159,
    "site": 400,
    "builds": 33,
    "shipped": 206
   },
   "n": 151
  },
  {
   "src": "assets/img/strip28.webp",
   "w": 294,
   "h": 640,
   "title": "Get Yui shows the app and every way in",
   "card": "SITE-46",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 163,
    "site": 410,
    "builds": 34,
    "shipped": 211
   },
   "n": 156
  },
  {
   "src": "assets/img/strip29.webp",
   "w": 330,
   "h": 640,
   "title": "Music on the site: See it, and a Thought",
   "card": "SITE-51",
   "day": "Sat, Sep 26",
   "totals": {
    "app": 173,
    "site": 438,
    "builds": 34,
    "shipped": 226
   },
   "n": 169
  }
 ],
 "frames": 171,
 "oss8": {
  "key": "OSS-8",
  "title": "A Yui Lines parser in Go",
  "size": "M",
  "goal": "A Yui Lines parser in Go at parsers/go, a line by line port of site/lib/yl/yl.mjs with no dependencies outside the standard library, plus a runner that reads spec/conformance/*.json.",
  "done": [
   "parsers/go/run.sh passes every vector in spec/conformance/ (the js- files are JavaScript only and may be skipped, as the other ports do).",
   "spec/conformance/run-all.sh has a Go line and prints its pass count.",
   "parsers/README.md lists Go with its run command.",
   "go vet is clean and go.mod has no requires."
  ],
  "test": [
   "parsers/go/run.sh spec/conformance",
   "spec/conformance/run-all.sh"
  ],
  "status": "claimed",
  "claim": {
   "pr": "https://github.com/postscarcityai/yuigui/pull/1",
   "since": "2026-09-26",
   "active": "2026-09-26"
  }
 }
};

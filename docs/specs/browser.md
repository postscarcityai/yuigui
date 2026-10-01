# Feature: Yui on the web
Who it is for: anyone who uses Yui on an iPhone and also sits at a computer, and people who want to try Yui before they have the app.
The moment: at a desk, an agent sends a screen, and the person answers it in a tab instead of picking up the phone.
What the screen shows: the agent list, then a thread drawn exactly like the phone draws it: the same Yui Lines presets, the stage as a full-window layer, pages 2 to 12, reactions, the drawer, settings. The spec: https://www.yuigui.com/developers/browser
Done when: everything the iPhone app does has a twin in the browser (same, or a web way, or "Open on your iPhone" with the reason), an agent's reply shows in the tab, and a tap in the tab reaches the agent as the same `[yui] ...` line the phone sends.

Status: building, by us. Chris picked it on 2026-10-01 ("Let's bring Yui to the web!"): one to one feature parity with the iPhone app, Sign in with Apple in the browser, take as long as it needs. The scope is no longer a build-to-earn contributor card: the old card YUI-71 is replaced by the epic YUI-240 to YUI-250, and the first pull request this page used to describe (YUI-109, the thread offline) is folded into YUI-242.

## Where the plan lives

- The map of every app feature, its web twin and its story: [web-parity.md](web-parity.md).
- The spec, with the URL (`www.yuigui.com/web`), the session model, the translation table and the security rules: https://www.yuigui.com/developers/browser (spec/BROWSER.md in this repo).
- The stories, in order: YUI-240 the map, YUI-241 Sign in with Apple, YUI-242 the thread live, YUI-243 the stage, YUI-244 the composer, YUI-245 agents, YUI-246 every preset, YUI-247 settings and account, YUI-248 notifications, YUI-249 one Yui across phone and web, YUI-250 ships. They are cards on the board: https://www.yuigui.com/board
- The roadmap line: https://www.yuigui.com/roadmap, "Next after the MVP", first in line.

## Can I help?

Not as a pull request on the web client for now: it is built by the maintainers, one story at a time, and a pull request that overlaps a running story would collide with it. What helps:

- Try `/web` once a story lands and say what feels wrong. A change in how a preset looks or behaves in a browser is a good spec: copy [TEMPLATE.md](TEMPLATE.md).
- A row in the parity map that is wrong, or an app feature it misses, is a pull request against [web-parity.md](web-parity.md) with the Swift file that proves it.
- Build to earn still applies to other platforms: https://www.yuigui.com/earn

Rules: CONTRIBUTING.md in the hub repo. Plain words in the UI, no em dashes, no developer tooling in what a person sees.

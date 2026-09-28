# Yui

Meet Yui, a generative user interface. Your agent draws the screen instead of replying in walls of text: a timer, a form, a quick choice. You chat like normal, and when a button or a timer would work better than text, the agent puts one on the screen. Your taps go straight back to it. Native on iPhone, Hermes first.

It is not another chatbot. Yui brings no brain of its own. You bring the agent (Hermes first, others later), and Yui gives it a face, a voice and a screen it can draw on.

This repo is the hub: the public roadmap, the progress log, the Yui Lines spec and the site at [yuigui.com](https://www.yuigui.com). The iOS app and the Hermes plugin live in [postscarcityai/yui](https://github.com/postscarcityai/yui), and every other platform has a repo of its own ([Every Yui](#every-yui)).

<p>
  <img src="docs/img/app-chat.png" width="260" alt="Yui chat screen on iPhone">
  <img src="docs/img/app-agents.png" width="260" alt="Yui agents screen on iPhone">
</p>

## Yui Lines

The agent never writes UI code or a JSON tree. It sends one short line per component, and the app renders a prebuilt preset the moment the line arrives:

```
timer 40/20x8 Tabata
ask "Log this set?"
choose "What are we training?" Push|Pull|Legs +other
```

Try it in the [playground](https://www.yuigui.com/playground): edit a line and watch the phone update, or press Stream to see it render as a model types.

![Yui Lines playground](docs/img/playground.png)

Against the leanest possible JSON, Yui Lines saves about a third of the tokens. Against JSON the way models usually write it, the saving is 2.6x to 3.9x. Numbers and method: [spec/BENCHMARK.md](spec/BENCHMARK.md).

## What is in here

| Path | What it is |
| --- | --- |
| `spec/YL.md` | Yui Lines grammar, v0 |
| `spec/conformance/` | Test vectors every Yui Lines parser must pass |
| `spec/CHANNEL.md` | The short guide an agent gets on every Yui turn |
| `spec/AGENTS.md` | How agents are registered and paired with the app |
| `spec/BENCHMARK.md` | Token counts, Yui Lines vs JSON |
| `site/` | yuigui.com (Next.js). Reference parser in `site/lib/yl/yl.mjs` |
| `bench/` | Parser tests and the token benchmark |
| `ROADMAP.md` | Phases, from hub site to App Store |
| `docs/business/` | Business plan and revenue notes, in the open |
| `docs/thoughts/` | Thoughts, Yui's blog at /thoughts: releases, whys and open calls |
| `pitch/` | The original pitch recording, transcript and summary |
| `brand/` | Logo files |

## Every Yui

Every platform has its own repo on [postscarcityai](https://github.com/postscarcityai), so whoever builds it, a person or an agent, has a place to push. Each one keeps the same contract: it speaks Yui Lines and passes the vectors in `spec/conformance/`, a tap sends the same line the iPhone sends, and a screen the device cannot draw says "Open on your iPhone" (or phone) instead of breaking. The first pull request for each is a card on [/contribute](https://www.yuigui.com/contribute).

| Platform | Repo | Built with | Start here |
| --- | --- | --- | --- |
| iPhone and iPad | [yui](https://github.com/postscarcityai/yui) | SwiftUI | The app on TestFlight today, the Hermes plugin, the backend |
| Mac | [yui-macos](https://github.com/postscarcityai/yui-macos) | SwiftUI for macOS | YUI-110 |
| Apple Watch | [yui-watch](https://github.com/postscarcityai/yui-watch) | SwiftUI for watchOS | YUI-175 |
| Apple Vision Pro | [yui-visionos](https://github.com/postscarcityai/yui-visionos) | SwiftUI for visionOS | Card YUI-178, no first pull request yet |
| Apple TV | [yui-tvos](https://github.com/postscarcityai/yui-tvos) | SwiftUI for tvOS | Card YUI-179, no first pull request yet |
| Android phones and tablets | [yui-android](https://github.com/postscarcityai/yui-android) | Kotlin and Jetpack Compose | YUI-173 |
| Wear OS | [yui-wearos](https://github.com/postscarcityai/yui-wearos) | Kotlin and Compose for Wear OS | YUI-174 |
| Windows and Linux | [yui-desktop](https://github.com/postscarcityai/yui-desktop) | Tauri 2 and the web renderer | YUI-176 |
| Omarchy | [yui-omarchy](https://github.com/postscarcityai/yui-omarchy) | Rust in the terminal, in your Omarchy theme | YUI-177 |
| Browser | [yui-web](https://github.com/postscarcityai/yui-web) | The web renderer, live on the relay | YUI-109, built here at `/web` first |

The list the site and the board export read is `site/lib/platforms.mjs`.

## Run it

You need Node 20 or newer.

```sh
# the site
cd site
npm install
npm run sync      # copies ROADMAP.md, spec/YL.md and the benchmark into site/content
npm run dev       # http://localhost:3000

# parser tests and the token benchmark
cd bench
npm install
npm test
npm run bench
```

## Connect an agent

Yui talks to Hermes through a platform plugin. Install it into a Hermes profile and that profile shows up as its own thread in the app, with the same memory it has on Telegram. Setup steps are in the app repo: [postscarcityai/yui](https://github.com/postscarcityai/yui#connect-hermes).

Other agent frameworks can speak the same protocol. Start with `spec/CHANNEL.md` and `spec/AGENTS.md`.

## Built in public

Every change that ships adds a line to the [progress log](https://www.yuigui.com/progress), and a weekly update goes out on Fridays. How that works: [BUILD-IN-PUBLIC.md](BUILD-IN-PUBLIC.md).

## Contributing

Issues and pull requests are welcome. A new Yui Lines parser in another language is one of the most useful things you could build. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). Found a security problem? Please read [SECURITY.md](SECURITY.md) first.

## License

[Apache-2.0](LICENSE). Copyright 2026 PostScarcity AI.

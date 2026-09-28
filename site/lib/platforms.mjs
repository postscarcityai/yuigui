// Every Yui and where it is built (Chris, Sep 27: "if someone wants to start building the desktop, watch,
// android, or any other copy, they have a place to push it to"). One repo per platform on postscarcityai.
// Read by /contribute, /developers, /developers/community and scripts/export-board.mjs (a card's `repo:`
// must be one of these). The same table is in README.md and in every platform repo's README.
// `card` is the open first pull request, if there is one; `story` the board card for the platform.

const GH = "https://github.com/postscarcityai";

export const PLATFORMS = [
  { repo: "yui", name: "iPhone and iPad", stack: "SwiftUI", note: "The app on TestFlight today, the Hermes plugin and the backend." },
  { repo: "yui-macos", name: "Mac", stack: "SwiftUI for macOS", card: "YUI-110", story: "YUI-58" },
  { repo: "yui-watch", name: "Apple Watch", stack: "SwiftUI for watchOS", card: "YUI-175", story: "YUI-47" },
  { repo: "yui-visionos", name: "Apple Vision Pro", stack: "SwiftUI for visionOS", story: "YUI-178" },
  { repo: "yui-tvos", name: "Apple TV", stack: "SwiftUI for tvOS", story: "YUI-179" },
  { repo: "yui-android", name: "Android phones and tablets", stack: "Kotlin and Jetpack Compose", card: "YUI-173", story: "YUI-46" },
  { repo: "yui-wearos", name: "Wear OS", stack: "Kotlin and Compose for Wear OS", card: "YUI-174" },
  { repo: "yui-desktop", name: "Windows and Linux", stack: "Tauri 2 and the web renderer", card: "YUI-176" },
  { repo: "yui-omarchy", name: "Omarchy", stack: "Rust in the terminal, in your Omarchy theme", card: "YUI-177" },
  { repo: "yui-web", name: "Browser", stack: "The web renderer, live on the relay", card: "YUI-109", note: "The first pull request is built here in the hub, at /web; the live app after it goes in yui-web." },
].map((p) => ({ ...p, url: `${GH}/${p.repo}` }));

// Every repo a card may name, by the short name a card's agent-ready block uses.
export const REPOS = { yuigui: `${GH}/yuigui`, ...Object.fromEntries(PLATFORMS.map((p) => [p.repo, p.url])) };

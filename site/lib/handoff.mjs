// Hand this to your agent (SITE-77): the page as plain markdown an agent can follow, served at
// /md/<page path> (app/md/[...path]/route.js) and copied by the Copy page button (AgentBox).
// A spec page gives its spec word for word; the others get a short setup text written from the same
// data the page draws (lib/start-paths.mjs, lib/routines.mjs, the share items).
import { DRAWINGS, COMING } from "./draw-examples.mjs";
import { specDocs } from "./spec.mjs";
import { SITE } from "./share-code.mjs";
import { MCP_URL, HERMES, PATHS } from "./start-paths.mjs";
import { PROMPT } from "./routines.mjs";
import { shareItems, shareUrl, cleanYL } from "./share.mjs";
import { MEMBERS, inNext, NEXT_LABEL } from "./crew-page.mjs";
import { COSTS, FIELDS, howItWorks, proposals } from "./proposals.mjs";

const md = (href) => `${SITE}/md${href}`;
const head = (title, href) => `# ${title}\n\nSource: ${SITE}${href}\nThe same page for agents, as markdown: ${md(href)}\n`;

function start() {
  const other = PATHS.map((p) => [
    `### ${p.title}`,
    p.body,
    "```",
    p.cmd,
    "```",
    `Full steps: ${md(p.href.split("#")[0])}`,
  ].join("\n")).join("\n\n");
  return `${head("Connect your agent to Yui", "/start")}
You are an AI agent, and your person wants you in Yui: an iPhone app where you answer with screens (buttons, forms, timers, cards) instead of paragraphs. Set yourself up with the steps for the kind of agent you are. Your person only does the phone part.

## Your person does this on the iPhone (iOS 26)
1. Install Yui from TestFlight: https://www.yuigui.com/start (listed as Yui Gui), then sign in with Apple.
2. Tap Add your first agent (or Add agent), name it, then Get a pairing code. The 6-digit code works once, for 10 minutes.
Ask them for the code when you reach the pair step. Every 123456 below is that code.

## Hermes (the main path)
On the machine that runs Hermes. On a named profile, put \`-p <profile>\` right after \`hermes\` in every command.
No Hermes yet: \`${HERMES.install}\`
Run this one command. It installs the plugin, pairs with the code, and restarts the gateway:
\`${HERMES.one}\`
No gateway service yet: \`hermes gateway install\` first, or \`hermes gateway run\` in the foreground.

Check with \`hermes yui status\`. The app flips to connected on its own; your person taps Say hi.
"invalid_or_expired_code" means the code ran out or was used: ask for a fresh one.

## Claude or ChatGPT in a chat app
You cannot add yourself. Tell your person to add a custom connector with this URL, then tap Allow in Yui when it asks:
${MCP_URL}
Claude: Settings > Connectors. ChatGPT: developer mode at chatgpt.com/plugins. Details: ${md("/developers/mcp")}

## Every other way in
${other}

## After pairing
Every turn on the Yui channel carries the channel guide, which tells you how to answer with screens: ${md("/channel")}
The screen language itself, Yui Lines: ${md("/yl")}
`;
}

function developers() {
  const specs = specDocs().map((d) => `- [${d.label}](${md(d.href)}): ${d.blurb}`).join("\n");
  return `${head("Yui for developers", "/developers")}
Yui is an open source iPhone app where AI agents answer with native screens instead of paragraphs. An agent sends Yui Lines, one short line per element, and the app draws a prebuilt preset. The agent keeps running where it already runs.

- Connect an agent: ${md("/start")}
- Every screen preset and saved flow, with ready-to-send lines: ${SITE}/library.json, or search by intent: ${SITE}/api/library?q=client+intake
- Hub repo (spec, conformance tests, site): https://github.com/postscarcityai/yuigui
- App repo (the iPhone app and the Hermes plugin): https://github.com/postscarcityai/yui

## Specs, each as markdown
${specs}
`;
}

function draw() {
  const one = (d) => `## ${d.title}\n${d.what}\nParts: ${d.parts}.\nSend these lines in a reply on the Yui channel and it draws on your person's phone:\n\`\`\`\n${d.yl}\n\`\`\``;
  return `${head("Everything Yui can draw", "/developers/draw")}
Your agent sends a few lines of Yui Lines and the phone draws them in the agent's colors. Each part below has the lines that draw it. The language: ${md("/yl")}

${DRAWINGS.map(one).join("\n\n")}

## Not drawn yet
${COMING.map((c) => `- ${c.title}: ${c.what}`).join("\n")}
`;
}

function playground() {
  return `${head("Yui playground", "/playground")}
The playground draws Yui Lines in the browser, the same way the iPhone app does. One line is one screen element; the app renders a prebuilt preset, so you never write UI code.

Try these, one per reply or several together:
\`\`\`
timer 40/20x8 Tabata
ask "Log this set?"
choose "What are we training?" Push|Pull|Legs +other
list Today "Squat 5x5" "Bench 5x5" "Row 5x5" +check
chart line "Weight" x=Mon|Tue|Wed|Thu y=180|179|178.5|178 unit=lb
\`\`\`

To show your person a screen you wrote, send them ${SITE}/playground?yl=<code>, where <code> is the lines compressed with raw deflate and written as base64url (no padding).
The whole language: ${md("/yl")}
Every preset with ready-to-send lines: ${SITE}/library.json
To draw screens on their phone for real, connect to Yui: ${md("/start")}
`;
}

function contribute() {
  return `${head("Lend your agent to Yui", "/contribute")}
Yui@home: spend spare AI tokens building Yui, an open source app. Pick one card off the agent-ready backlog, build it, open a pull request. A person reviews every pull request.

- The backlog, for agents: ${SITE}/contribute/backlog.json
- The rules: https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md

## Do this
${PROMPT}
`;
}

function shared(it) {
  const yl = cleanYL(it.yl);
  const body = [
    head(it.title, shareUrl(it.id)),
    it.what || "One screen from Yui.",
  ];
  if (it.planned) body.push("\nPlanned, not built: the app does not draw this yet. The web draws it at the link above.");
  if (yl) {
    body.push(
      `\nThe Yui Lines that draw it. Send them in a reply on the Yui channel and this screen draws on your person's phone:\n\`\`\`\n${yl}\n\`\`\``,
      `Change the words to fit what your person needs. The language: ${md("/yl")}`,
    );
  }
  body.push(`Not in Yui yet? Setup: ${md("/start")}`);
  return body.join("\n") + "\n";
}

function crew() {
  const tools = (m) => m.tools.map((t) => `- ${t.t}${inNext(t.card) ? ` (${NEXT_LABEL.toLowerCase()})` : ""}`).join("\n");
  const one = (m) => [
    `## ${m.name}, ${m.role.toLowerCase()}`,
    m.line,
    tools(m),
    `The demo, in Yui Lines. Send it in a reply on the Yui channel and it draws on your person's phone:\n\`\`\`\n${m.yl}\n\`\`\``,
    m.share ? `Full demo: ${SITE}${shareUrl(m.share)}` : null,
  ].filter(Boolean).join("\n\n");
  return `${head("Meet the crew", "/crew")}
Yui plus five starter agents, each in their own colors, each answering with screens instead of paragraphs. Tell your person which one fits what they asked, in one line.

${MEMBERS.map(one).join("\n\n")}

Get Yui on the iPhone: ${md("/start")}
`;
}

// Proposals (SITE-87): the list with the system, and each proposal whole.
function proposalList() {
  const one = (p) => `- [${p.id} ${p.title}](${md(`/proposals/${p.slug}`)}): ${p.summary} Status: ${p.status}. Cost ${p.cost}.`;
  return `${head("Proposals", "/proposals")}
Big ideas for Yui, shown as working mockups before any app code. Chris decides; votes inform.

${proposals().map(one).join("\n")}

${howItWorks()}`;
}

function proposal(p) {
  const secs = FIELDS.filter(([k]) => k !== "call").map(([k, h]) => `## ${h}\n\n${p.sections[k]}`).join("\n\n");
  return `${head(`${p.id}: ${p.title}`, `/proposals/${p.slug}`)}
${p.summary}

Status: ${p.status}. Date: ${p.date}. Cost: ${p.cost}, ${COSTS[p.cost].toLowerCase()}. Would become: ${p.becomes}.
Yui's call: ${p.sections.call}

The first screen, in Yui Lines. Send it in a reply on the Yui channel and it draws on your person's phone:
\`\`\`
${p.hero}
\`\`\`

${secs}

How proposals are weighed: ${md("/proposals")}
`;
}

function spec(d) {
  return `<!-- Source: ${SITE}${d.href}, spec/${d.slug.toUpperCase()}.md in https://github.com/postscarcityai/yuigui -->\n\n${d.md}`;
}

// { "/start": () => markdown, ... } for every page that has a Copy page button.
function pages() {
  const out = { "/start": start, "/developers": developers, "/developers/draw": draw, "/playground": playground, "/contribute": contribute, "/crew": crew, "/proposals": proposalList };
  for (const p of proposals()) out[`/proposals/${p.slug}`] = () => proposal(p);
  for (const d of specDocs()) out[d.href] = () => spec(d);
  for (const it of shareItems()) out[shareUrl(it.id)] = () => shared(it);
  return out;
}

export const mdHrefs = () => Object.keys(pages());
export const pageMd = (href) => pages()[href]?.() ?? null;

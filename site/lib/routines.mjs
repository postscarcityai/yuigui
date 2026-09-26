// Yui@home weekly routines (OSS-6 step 2): one copy-paste prompt per platform, drawn on /contribute
// and copied word for word into CONTRIBUTING-AGENTS.md ("Run it every week"). bench/test.mjs checks
// the two match, so change a prompt here and paste it there in the same commit.
// Each platform's setup was checked against its own docs on CHECKED; the links are in `docs`.
// None of them documents forking a repo you don't own and opening the pull request upstream, so the
// hosted routines work in the contributor's own fork and hand back a one-click link when they can't.

export const CHECKED = "2026-09-26";
const BACKLOG = "https://www.yuigui.com/contribute/backlog.json";
const RULES = "https://github.com/postscarcityai/yuigui/blob/main/CONTRIBUTING-AGENTS.md";

// The claim step differs: a hosted routine works in your fork; a CLI with gh forks and opens the pull request itself.
const FORK = `4. Otherwise pick ONE open card whose repo is one you have my fork of (<you>/yuigui or <you>/yui). Push a branch named yui-home/<KEY> to my fork. If you can open a pull request to the card's repo, open it right away as a draft titled "[KEY] <card title>": that is the claim. If you can't, end the run with this link so I can open it: https://github.com/postscarcityai/<repo>/compare/main...<you>:yui-home/<KEY>`;
const GH = `4. Otherwise pick ONE open card. Fork its repo (gh repo fork postscarcityai/<repo> --clone), push a branch named yui-home/<KEY>, and open a draft pull request right away (gh pr create --draft --repo postscarcityai/<repo> --title "[KEY] <card title>"): that is the claim.`;

function prompt(claim, budget) {
  return `Yui@home weekly run: build at most ONE card for Yui, the open source app at yuigui.com.
1. Read ${BACKLOG}. If no card has "status": "open", stop here and say "Nothing open this week."
2. Read the rules: ${RULES}
3. If I already have an open pull request titled [KEY] on postscarcityai/yuigui or postscarcityai/yui, finish that one instead of taking a new card.
${claim}
5. Build only what the card says. Run every command in its "test" list until all pass.
6. Hand in: mark the pull request ready, tick each "done" line, paste the test output, and say which agent made it.
Budget: one card per run. ${budget} If the tests still fail then, push what you have, leave the pull request as a draft with a note saying what is left, and stop.
Never touch secrets, CI (.github/), signing or release scripts, or site/content/. No new dependency without a note in the pull request.`;
}

export const ROUTINES = [
  {
    key: "claude",
    name: "Claude",
    feature: "Routines in Claude Code",
    setup: "Fork the repo first. Then claude.ai/code/routines, New routine, pick your fork, paste this, choose Weekly. Or type /schedule in the Claude Code CLI.",
    cap: "Runs count against your plan's usage, and each account has a daily cap on routine runs. Pick a start time that is not exactly on the hour.",
    docs: ["https://code.claude.com/docs/en/routines"],
    prompt: prompt(FORK, "Stop after about 40 minutes of work."),
  },
  {
    key: "codex",
    name: "ChatGPT Codex",
    feature: "Scheduled tasks in Codex",
    setup: "Fork the repo and connect your fork in Codex's GitHub settings. Then Scheduled in the Codex sidebar, a new task on your fork, paste this, set it to weekly. Run it on the web so it does not need your computer on.",
    cap: "Uses your ChatGPT plan's Codex limits (a rolling 5-hour window, plus weekly limits). Cloud tasks use the allowance faster.",
    docs: ["https://learn.chatgpt.com/docs/automations?surface=web", "https://learn.chatgpt.com/docs/cloud"],
    prompt: prompt(FORK, "Stop after about 40 minutes of work."),
  },
  {
    key: "jules",
    name: "Google Jules",
    feature: "Scheduled tasks in Jules",
    setup: "Fork the repo and install the Jules GitHub app on your fork. In Jules, open the Planning menu, pick Scheduled Task, paste this, and set it to weekly. Gemini CLI has no schedule of its own: use the GitHub Actions recipe below.",
    cap: "Jules counts tasks per day (15 on the free plan). One weekly run is one task.",
    docs: ["https://jules.google/docs/scheduled-tasks/", "https://jules.google/docs/usage-limits/"],
    prompt: prompt(FORK, "Stop after about 40 minutes of work."),
  },
  {
    key: "cursor",
    name: "Cursor",
    feature: "Automations for Cursor cloud agents",
    setup: "Fork the repo and give the Cursor GitHub app access to your fork. Then cursor.com/automations, a new automation on your fork, paste this, and a weekly schedule (cron 17 9 * * 1 is Mondays).",
    cap: "Cloud agents bill at API pricing. Cursor asks you for a spend limit the first time: set it low, a few dollars a week is plenty.",
    docs: ["https://cursor.com/docs/cloud-agent/automations", "https://cursor.com/docs/integrations/github"],
    prompt: prompt(FORK, "Stop after about 40 minutes of work."),
  },
  {
    key: "copilot",
    name: "GitHub Copilot",
    feature: "Copilot cloud agent",
    setup: "Copilot automations don't run in public repositories, and your fork is public. So start it by hand: open an issue in your fork with this prompt as the body and assign it to Copilot. For a weekly run, use the GitHub Actions recipe below.",
    cap: "Each run uses your Actions minutes and Copilot credits, and a session stops at 59 minutes.",
    docs: ["https://docs.github.com/en/copilot/concepts/agents/cloud-agent/about-automations", "https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent"],
    prompt: prompt(FORK, "Stop after about 40 minutes of work."),
  },
  {
    key: "any",
    name: "Any agent, or GitHub Actions",
    feature: "Any CLI agent with the GitHub CLI (gh), on a cron or a weekly GitHub Actions schedule",
    setup: "Works with Claude Code, Codex, Gemini CLI, the Cursor CLI or any agent that can run gh. Run it from cron on your machine, or from the workflow below in a repo of your own. The keys are yours and stay in your repo's secrets; we never see them.",
    cap: "Cap it twice: the agent's own limit (claude -p --max-budget-usd 3, for example) and the job's timeout-minutes.",
    docs: ["https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows", "https://cli.github.com/manual/gh_repo_fork", "https://cli.github.com/manual/gh_pr_create", "https://code.claude.com/docs/en/cli-reference"],
    prompt: prompt(GH, "Stop after about 40 minutes of work."),
  },
];

// The weekly GitHub Actions job for the "any agent" routine. It lives in the contributor's own repo,
// next to a yui-home.md holding the prompt above. Claude Code shown; swap the last line for another CLI.
export const WORKFLOW = `# .github/workflows/yui-home.yml, in a repo of your own
name: yui-home
on:
  schedule: [{ cron: "17 9 * * 1" }] # Mondays, 09:17 UTC
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @anthropic-ai/claude-code
      - env:
          GH_TOKEN: \${{ secrets.YUI_HOME_GH_TOKEN }} # your token: fork and open pull requests
          ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          gh auth setup-git
          git config --global user.name "$(gh api user -q .login)"
          git config --global user.email "$(gh api user -q .id)+$(gh api user -q .login)@users.noreply.github.com"
          claude -p "$(cat yui-home.md)" --max-budget-usd 3 --dangerously-skip-permissions`;

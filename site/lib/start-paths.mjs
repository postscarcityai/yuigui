// Every way into Yui for /start (SITE-46) and its agent copy at /md/start (SITE-77).
// The commands are the real install paths; keep them in step with the app repo's
// hermes-plugin/yui (after-install.md, connector.py), adapters/ and the spec pages they link.

export const MCP_URL = "https://txuibjxyfpalzvpneqgp.supabase.co/functions/v1/yui-mcp";

// The Hermes path (YUI-23): one command that installs, pairs and restarts, like the app's pairing sheet (YUI-229).
export const HERMES = {
  install: "curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash",
  plugin: "hermes plugins install postscarcityai/yui/hermes-plugin/yui --enable",
  pair: "hermes yui pair 123456",
  restart: "hermes gateway restart",
};
HERMES.one = `${HERMES.plugin} && ${HERMES.pair} && ${HERMES.restart}`;

// Not on Hermes? One block per path, each with its one command or URL and its spec page.
export const PATHS = [
  {
    id: "openclaw",
    title: "OpenClaw",
    body: "Install the Yui channel plugin, pair it with the code from the app (`openclaw yui pair`), turn the channel on and restart the gateway. Needs OpenClaw 2026.6.11 or later.",
    cmd: "git clone https://github.com/postscarcityai/yui && openclaw plugins install ./yui/adapters/openclaw",
    href: "/developers/openclaw",
    link: "OpenClaw setup",
  },
  {
    id: "webhook",
    title: "Any agent that answers an HTTP POST",
    body: "The webhook bridge (Python or Node, no dependencies) runs on your machine. Pair it with the code, then point it at your agent's URL. From `adapters/webhook` in the app repo:",
    cmd: "python3 python/yui_webhook.py pair 123456 --ref my-agent",
    href: "/developers/webhook",
    link: "Webhook bridge",
  },
  {
    id: "claude-chatgpt",
    title: "Claude and ChatGPT",
    body: "Add Yui as a custom connector with this URL (Claude: Settings > Connectors; ChatGPT: developer mode at chatgpt.com/plugins). It signs in through yuigui.com/connect and you tap Allow in the app. Your chat stays where it is; the screens land on your phone.",
    cmd: MCP_URL,
    label: "the Yui MCP URL",
    href: "/developers/mcp#claude",
    link: "Claude and ChatGPT steps",
  },
  {
    id: "claude-code",
    title: "Claude Code or Cursor",
    body: "Claude Code adds the server, then `claude mcp get yui` and `claude mcp login yui`, and you approve it in Yui. Cursor, or any client that takes a URL and a header, uses a token you get from a pairing code.",
    cmd: `claude mcp add --transport http yui ${MCP_URL}`,
    href: "/developers/mcp#claude-code",
    link: "MCP server",
  },
  {
    id: "a2a",
    title: "An A2A agent",
    body: "Any agent with an Agent Card (ADK, LangGraph, CrewAI, Microsoft Agent Framework) pairs by its URL. The agent needs no Yui code. Node 22.18 or newer, from `adapters/a2a` in the app repo, then `node yui-a2a.ts run`:",
    cmd: "node yui-a2a.ts pair 123456 --card https://your-agent.example.com",
    href: "/developers/a2a",
    link: "A2A bridge",
  },
  {
    id: "own-model",
    title: "A model on your own machine",
    body: "Ollama by default; LM Studio, vLLM and llama.cpp by name, or any OpenAI-style URL. Node 22.18 or newer, from `adapters/openai-compat` in the app repo, then `node yui-openai.ts run`:",
    cmd: "node yui-openai.ts pair 123456 --model qwen2.5:7b",
    href: "/developers/models",
    link: "Model bridge",
  },
];

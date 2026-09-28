// Hand this to your agent (SITE-77): one box on every page a visitor can act on. Copy link copies the
// page's address, Copy page copies it as markdown an agent can follow (/md<path>, lib/handoff.mjs).
// The buttons are ShareBar's; this adds the one line of how. Top right on a wide screen, full width on a phone.
import ShareBar from "./ShareBar";

export const HOW = "Give this link to your agent. It reads the page and sets itself up.";

const LINES = {
  hermes: <><strong>Hermes:</strong> it installs the Yui plugin and pairs with the code from the app.</>,
  connector: <><strong>Claude or ChatGPT:</strong> add Yui as a connector with the MCP URL on this page.</>,
};

export default function AgentBox({ path, title, how = HOW, paths = [], embed }) {
  return (
    <aside className="agent-box" aria-labelledby="agent-box-h">
      <p className="agent-box-h" id="agent-box-h">Hand this to your agent</p>
      <p>{how}</p>
      {paths.length ? <ul>{paths.map((k) => <li key={k}>{LINES[k]}</li>)}</ul> : null}
      <ShareBar path={path} title={title} md={`/md${path}`} embed={embed} label="Hand this to your agent" />
    </aside>
  );
}

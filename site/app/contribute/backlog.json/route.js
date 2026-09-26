// The agent-ready backlog (OSS-6) as JSON, for agents. content/backlog.json is written by
// scripts/export-board.mjs from the kanban board; the board stays the one source of truth.
import backlog from "../../../content/backlog.json";

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(backlog, null, 2) + "\n", {
    headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" },
  });
}

// The demo host for Controls: filled in by the Controls story below.
export function demoControlHost() {
  return { handle: async (agentId, req) => ({ v: 1, req: req.req, ok: false, error: "failed", message: "This host does not share its settings yet." }) };
}
